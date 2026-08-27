import { describe, expect, it } from 'vitest';
import { validateCsvQuotes } from './csv-validation';

const csv = (text: string) => new Blob([text], { type: 'text/csv' });

describe('CSV quote validation', () => {
  it('accepts escaped quotes and quoted multiline fields', async () => {
    await expect(validateCsvQuotes(csv('\ufeff"id",note\n1,"He said ""hello""\nand left"\n2,done\n'), 'auto')).resolves.toBeUndefined();
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
