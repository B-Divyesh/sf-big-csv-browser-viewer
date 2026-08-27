export class CsvStructureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CsvStructureError';
  }
}

type Delimiter = ',' | '\t' | ';' | '|';

const delimiters: Delimiter[] = [',', '\t', ';', '|'];
const quote = 0x22;
const carriageReturn = 0x0d;
const lineFeed = 0x0a;

function hasUtf8Bom(bytes: Uint8Array): boolean {
  return bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
}

function isDelimiter(byte: number): byte is DelimiterCode {
  return byte === 0x2c || byte === 0x09 || byte === 0x3b || byte === 0x7c;
}

type DelimiterCode = 0x2c | 0x09 | 0x3b | 0x7c;

function delimiterByte(delimiter: Delimiter): DelimiterCode {
  return delimiter.charCodeAt(0) as DelimiterCode;
}

/**
 * Pick the most common supported delimiter in the first logical record. The
 * complete file is still validated with that delimiter; this only lets the
 * validator retain DuckDB's automatic CSV/TSV/semicolon/pipe import mode.
 */
async function sniffDelimiter(file: Blob): Promise<Delimiter> {
  const sample = new Uint8Array(await file.slice(0, 64 * 1024).arrayBuffer());
  const counts = new Map<Delimiter, number>(delimiters.map((delimiter) => [delimiter, 0]));
  let inQuotes = false;
  let fieldStart = true;

  for (let index = hasUtf8Bom(sample) ? 3 : 0; index < sample.length; index++) {
    const byte = sample[index]!;
    if (inQuotes) {
      if (byte === quote) {
        if (sample[index + 1] === quote) index++;
        else inQuotes = false;
      }
      continue;
    }
    if (byte === quote && fieldStart) { inQuotes = true; fieldStart = false; continue; }
    if (byte === carriageReturn || byte === lineFeed) break;
    if (isDelimiter(byte)) counts.set(String.fromCharCode(byte) as Delimiter, (counts.get(String.fromCharCode(byte) as Delimiter) ?? 0) + 1);
    fieldStart = isDelimiter(byte);
  }

  return delimiters.reduce((best, delimiter) => (counts.get(delimiter)! > counts.get(best)! ? delimiter : best), ',');
}

/**
 * Reject quote structures that DuckDB can otherwise recover from silently.
 * The scan is byte-streamed so it does not copy a multi-gigabyte source into
 * JavaScript memory before DuckDB's browser file reader opens it.
 */
export async function validateCsvQuotes(file: Blob, delimiter: 'auto' | Delimiter): Promise<void> {
  const activeDelimiter = delimiter === 'auto' ? await sniffDelimiter(file) : delimiter;
  const separator = delimiterByte(activeDelimiter);
  const reader = file.stream().getReader();
  const firstBytes = new Uint8Array(await file.slice(0, 3).arrayBuffer());
  let bomBytesToSkip = hasUtf8Bom(firstBytes) ? 3 : 0;
  let inQuotes = false;
  let justClosedQuote = false;
  let fieldStart = true;
  let row = 1;
  let quoteRow = 1;
  let previousWasCarriageReturn = false;

  const endRecord = () => {
    row++;
    fieldStart = true;
    justClosedQuote = false;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const byte of value) {
      if (bomBytesToSkip) { bomBytesToSkip--; continue; }
      if (byte === lineFeed && previousWasCarriageReturn) { previousWasCarriageReturn = false; continue; }
      previousWasCarriageReturn = byte === carriageReturn;

      if (inQuotes) {
        if (byte === quote) { inQuotes = false; justClosedQuote = true; }
        continue;
      }

      if (justClosedQuote) {
        if (byte === quote) { inQuotes = true; justClosedQuote = false; continue; }
        if (byte === separator) { fieldStart = true; justClosedQuote = false; continue; }
        if (byte === carriageReturn || byte === lineFeed) { endRecord(); continue; }
        throw new CsvStructureError(`Unexpected text after a closing quote on row ${row}.`);
      }

      if (byte === carriageReturn || byte === lineFeed) { endRecord(); continue; }
      if (byte === separator) { fieldStart = true; continue; }
      if (byte === quote) {
        if (!fieldStart) throw new CsvStructureError(`Unexpected quote inside an unquoted field on row ${row}.`);
        inQuotes = true;
        quoteRow = row;
        fieldStart = false;
        continue;
      }
      fieldStart = false;
    }
  }

  if (inQuotes) throw new CsvStructureError(`Unterminated quoted field beginning on row ${quoteRow}.`);
}
