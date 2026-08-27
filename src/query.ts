export type Operator = 'contains' | 'equals' | 'notEquals' | 'gt' | 'gte' | 'lt' | 'lte' | 'isBlank' | 'isNotBlank';

export interface ColumnInfo {
  name: string;
  type: string;
}

export interface FilterRule {
  id: number;
  column: string;
  operator: Operator;
  value: string;
}

export interface SortRule {
  column: string;
  direction: 'ASC' | 'DESC';
}

export const quoteIdentifier = (value: string): string => `"${value.replaceAll('"', '""')}"`;
export const quoteLiteral = (value: string): string => `'${value.replaceAll("'", "''")}'`;

export function filterExpression(filter: FilterRule, type = 'VARCHAR'): string {
  const column = quoteIdentifier(filter.column);
  const value = quoteLiteral(filter.value);
  const normalizedType = type.toUpperCase();
  const comparable = normalizedType.includes('DATE') || normalizedType.includes('TIME')
    ? `TRY_CAST(${column} AS TIMESTAMP)`
    : normalizedType.match(/INT|DECIMAL|DOUBLE|FLOAT|REAL|NUMERIC/)
      ? `TRY_CAST(${column} AS DOUBLE)`
      : `CAST(${column} AS VARCHAR)`;
  const comparableValue = normalizedType.includes('DATE') || normalizedType.includes('TIME')
    ? `TRY_CAST(${value} AS TIMESTAMP)`
    : normalizedType.match(/INT|DECIMAL|DOUBLE|FLOAT|REAL|NUMERIC/)
      ? `TRY_CAST(${value} AS DOUBLE)`
      : value;

  switch (filter.operator) {
    case 'contains': return `LOWER(CAST(${column} AS VARCHAR)) LIKE '%' || LOWER(${value}) || '%'`;
    case 'equals': return `${comparable} = ${comparableValue}`;
    case 'notEquals': return `${comparable} <> ${comparableValue}`;
    case 'gt': return `${comparable} > ${comparableValue}`;
    case 'gte': return `${comparable} >= ${comparableValue}`;
    case 'lt': return `${comparable} < ${comparableValue}`;
    case 'lte': return `${comparable} <= ${comparableValue}`;
    case 'isBlank': return `(${column} IS NULL OR CAST(${column} AS VARCHAR) = '')`;
    case 'isNotBlank': return `(${column} IS NOT NULL AND CAST(${column} AS VARCHAR) <> '')`;
  }
}

export function whereClause(filters: FilterRule[], columns: ColumnInfo[]): string {
  const active = filters.filter((filter) => filter.column && (filter.value || filter.operator.startsWith('is')));
  if (!active.length) return '';
  const expressions = active.map((filter) => filterExpression(filter, columns.find((column) => column.name === filter.column)?.type));
  return ` WHERE ${expressions.join(' AND ')}`;
}

export function buildDataQuery(filters: FilterRule[], columns: ColumnInfo[], sort: SortRule | null, limit?: number, offset = 0): string {
  const order = sort ? ` ORDER BY ${quoteIdentifier(sort.column)} ${sort.direction} NULLS LAST` : '';
  const range = limit === undefined ? '' : ` LIMIT ${Math.max(0, Math.floor(limit))} OFFSET ${Math.max(0, Math.floor(offset))}`;
  return `SELECT * FROM data${whereClause(filters, columns)}${order}${range}`;
}

export function buildGroupQuery(
  filters: FilterRule[], columns: ColumnInfo[], groupColumn: string, valueColumn: string, aggregate: string,
): string {
  const allowed = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'];
  const fn = allowed.includes(aggregate) ? aggregate : 'COUNT';
  const group = quoteIdentifier(groupColumn);
  const value = fn === 'COUNT' && !valueColumn ? '*' : quoteIdentifier(valueColumn);
  return `SELECT ${group}, ${fn}(${value}) AS ${quoteIdentifier(fn.toLowerCase())} FROM data${whereClause(filters, columns)} GROUP BY ${group} ORDER BY 2 DESC NULLS LAST LIMIT 500`;
}

export function buildPivotQuery(
  filters: FilterRule[], columns: ColumnInfo[], rowColumn: string, pivotColumn: string, valueColumn: string,
  aggregate: string, keys: unknown[],
): string {
  const allowed = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'];
  const fn = allowed.includes(aggregate) ? aggregate : 'COUNT';
  const row = quoteIdentifier(rowColumn);
  const pivot = quoteIdentifier(pivotColumn);
  const value = fn === 'COUNT' && !valueColumn ? '1' : quoteIdentifier(valueColumn);
  const cells = keys.map((key) => {
    const label = String(key ?? '(blank)');
    const condition = key === null ? `${pivot} IS NULL` : `${pivot} = ${quoteLiteral(String(key))}`;
    return `${fn}(CASE WHEN ${condition} THEN ${value} END) AS ${quoteIdentifier(label)}`;
  });
  return `SELECT ${row}${cells.length ? `, ${cells.join(', ')}` : ''} FROM data${whereClause(filters, columns)} GROUP BY ${row} ORDER BY ${row} NULLS LAST LIMIT 500`;
}

export function isReadOnlySql(sql: string): boolean {
  const cleaned = sql.trim().replace(/^--.*$/gm, '').trim().toUpperCase();
  return /^(SELECT|WITH|DESCRIBE|EXPLAIN|SHOW|SUMMARIZE|PIVOT)\b/.test(cleaned) && !/;\s*\S/.test(cleaned);
}
