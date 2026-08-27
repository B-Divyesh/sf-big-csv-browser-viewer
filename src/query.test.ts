import { describe, expect, it } from 'vitest';
import { buildDataQuery, buildPivotQuery, filterExpression, isReadOnlySql, quoteIdentifier, quoteLiteral } from './query';

describe('safe SQL builder', () => {
  it('escapes identifiers and values', () => {
    expect(quoteIdentifier('a"b')).toBe('"a""b"');
    expect(quoteLiteral("O'Reilly")).toBe("'O''Reilly'");
  });

  it('builds typed filters and bounds pages', () => {
    expect(filterExpression({ id: 1, column: 'amount', operator: 'gt', value: '10' }, 'DOUBLE')).toContain('TRY_CAST("amount" AS DOUBLE)');
    expect(buildDataQuery([], [], { column: 'name', direction: 'ASC' }, 50, -5)).toBe('SELECT * FROM data ORDER BY "name" ASC NULLS LAST LIMIT 50 OFFSET 0');
  });

  it('escapes pivot keys', () => {
    const sql = buildPivotQuery([], [], 'region', 'status', 'amount', 'SUM', ["won", "O'Reilly"]);
    expect(sql).toContain("'O''Reilly'");
    expect(sql).toContain('AS "O\'Reilly"');
  });

  it('only accepts one read-only statement', () => {
    expect(isReadOnlySql('select * from data')).toBe(true);
    expect(isReadOnlySql('WITH x AS (select 1) select * from x')).toBe(true);
    expect(isReadOnlySql('drop table data')).toBe(false);
    expect(isReadOnlySql('select 1; delete from data')).toBe(false);
  });
});
