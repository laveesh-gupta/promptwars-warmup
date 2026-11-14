import type { Dataset, Observation } from './types';
export function sourceLines(text: string) { return text.replace(/\r/g, '').split('\n').map((source, i) => ({ line: i + 1, source })).filter(r => r.source.trim()); }
export function checkSource(text: string) {
  if (!text.trim()) throw new Error('Paste or upload a table first.');
  if (new TextEncoder().encode(text).length > 102400 || sourceLines(text).length > 501) throw new Error('Use at most 100 KB and 500 data rows.');
}
export function cells(line: string): string[] {
  const delimiter = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';
  const result: string[] = []; let cell = '', quoted = false;
  for (let i = 0; i < line.length; i++) { const c = line[i]; if (c === '"') { if (quoted && line[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; } else if (c === delimiter && !quoted) { result.push(cell.trim()); cell = ''; } else cell += c; }
  result.push(cell.trim()); return result;
}
export function normalizeObservation(row: Observation): Observation {
  const flags: string[] = row.unit === 'µg/m³' ? row.flags.filter(f => f.startsWith('Converted')) : [];
  let value = row.value;
  const unit = row.unit.toLowerCase().replace(/μ|µ/g, 'u').replace(/³/g, '3').replace(/\s/g, '');
  if (unit === 'mg/m3') { if (value !== null) value *= 1000; flags.push('Converted mg/m³ × 1,000'); }
  else if (!['ug/m3', 'ug/m^3'].includes(unit)) flags.push('Unresolved unit');
  if (value === null) flags.push('Missing value');
  else if (!Number.isFinite(value) || value < 0) flags.push('Invalid value');
  else if (value > 1000) flags.push('Review unusually high reading');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)$/.test(row.timestamp) || !Number.isFinite(Date.parse(row.timestamp))) flags.push('Unresolved timestamp: use ISO date with offset');
  if (!['PM2.5', 'PM10'].includes(row.pollutant)) flags.push('Unsupported pollutant: PM2.5 or PM10 required');
  if (!row.site.trim()) flags.push('Missing site');
  if (!row.period.trim()) flags.push('Missing averaging period');
  if (/outage|offline|error|fault/i.test(row.source)) flags.push('Sensor flagged offline/error');
  const blocking = flags.filter(f => !f.startsWith('Converted'));
  return { ...row, value, unit: ['ug/m3', 'ug/m^3', 'mg/m3'].includes(unit) ? 'µg/m³' : row.unit, flags, included: row.included && !blocking.length, reason: blocking.join('; ') || row.reason };
}
export function finalizeDataset(dataset: Dataset): Dataset {
  const seen = new Set<string>();
  return { ...dataset, observations: dataset.observations.map(row => {
    const normalized = normalizeObservation(row);
    const key = JSON.stringify([normalized.site.toLowerCase(), normalized.pollutant, normalized.timestamp, normalized.period, normalized.value, normalized.unit]);
    if (seen.has(key)) return { ...normalized, included: false, flags: [...normalized.flags, 'Duplicate observation'], reason: 'Duplicate observation' };
    seen.add(key); return normalized;
  }) };
}
export function parseTable(text: string, label = 'Pasted readings'): Dataset {
  checkSource(text); const lines = sourceLines(text); const header = cells(lines[0].source).map(c => c.toLowerCase());
  const required = ['site', 'pollutant', 'value', 'unit', 'timestamp', 'period'];
  if (!required.every(h => header.includes(h))) throw new Error('For local review, use columns: site, pollutant, value, unit, timestamp, period. Gemini can interpret other headers.');
  const observations = lines.slice(1).filter(r => cells(r.source)[0]?.toLowerCase() !== 'site').map(r => {
    const values = cells(r.source); const get = (name: string) => values[header.indexOf(name)] || '';
    const raw = get('value'); const number = raw.trim() && !/^(NA|null|-)$/i.test(raw) ? Number(raw.replace(',', '.')) : null;
    return { id: `row-${r.line}`, line: r.line, source: r.source, site: get('site'), pollutant: get('pollutant').toUpperCase().replace('PM2.5', 'PM2.5'), value: number !== null && Number.isFinite(number) ? number : null, unit: get('unit'), timestamp: get('timestamp'), period: get('period'), flags: [], included: true, reason: '' };
  });
  return finalizeDataset({ label, observations, notes: ['Original lines are preserved. No expected sampling cadence supplied; coverage is unknown.'] });
}
