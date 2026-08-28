import { describe, expect, it } from 'vitest';
import { inspectCsvQuotes, validateCsvQuotes } from './csv-validation';

const csv = (text: string) => new Blob([text], { type: 'text/csv' });

describe('CSV quote validation', () => {
  it('accepts escaped quotes and quoted multiline fields', async () => {
    await expect(validateCsvQuotes(csv('\ufeff"id",note\n1,"He said ""hello""\nand left"\n2,done\n'), 'auto')).resolves.toBeUndefined();
  });

  it('detects LF and CRLF quoted newlines for the compatible DuckDB reader', async () => {
    await expect(inspectCsvQuotes(csv('region,note\nNorth,"first line\nsecond line"\nSouth,plain\n'), 'auto')).resolves.toEqual({ hasQuotedNewline: true });
    await expect(inspectCsvQuotes(csv('region,note\r\nNorth,"first line\r\nsecond line"\r\nSouth,plain\r\n'), 'auto')).resolves.toEqual({ hasQuotedNewline: true });
    await expect(inspectCsvQuotes(csv('region,note\nNorth,"a ""quoted"" note"\nSouth,plain\n'), 'auto')).resolves.toEqual({ hasQuotedNewline: false });
  });

  it('rejects an unterminated quoted field with its opening row', async () => {
    await expect(validateCsvQuotes(csv('id,name\n1,"unclosed\n2,still here\n'), 'auto')).rejects.toMatchObject({
      name: 'CsvStructureError',
      message: 'Unterminated quoted field beginning on row 2.',
    });
  });

  it('rejects inconsistent quote structure instead of repairing it silently', async () => {
    await expect(validateCsvQuotes(csv('id,name\n1,"closed" text\n'), 'auto')).rejects.toMatchObject({
      name: 'CsvStructureError',
      message: 'Unexpected text after a closing quote on row 2.',
    });
  });
});
