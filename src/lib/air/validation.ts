import { finalizeDataset } from './normalize';
import type { Context, Dataset, Narrative, Snapshot } from './types';
export function record(value: unknown): Record<string, unknown> { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object.'); return value as Record<string, unknown>; }
export function string(value: unknown, max = 4000): string { if (typeof value !== 'string' || value.length > max) throw new Error('Invalid or oversized text field.'); return value; }
export function array(value: unknown, max: number): unknown[] { if (!Array.isArray(value) || value.length > max) throw new Error('Invalid or oversized collection.'); return value; }
export function validateContext(value: unknown): Context {
  const v = record(value); const locality = string(v.locality, 120).trim(); const timezone = string(v.timezone, 80);
  if (!locality) throw new Error('Enter a locality.');
  try { new Intl.DateTimeFormat('en', { timeZone: timezone }); } catch { throw new Error('Use a valid IANA timezone.'); }
  if (!['Ward officer','Housing society','School'].includes(String(v.role)) || !['English','Hindi','Marathi'].includes(String(v.language)) || !['Simple','Standard'].includes(String(v.level))) throw new Error('Invalid context options.');
  return { locality, timezone, role: v.role as Context['role'], language: v.language as Context['language'], level: v.level as Context['level'] };
}
export function validateDataset(value: unknown): Dataset {
  const v = record(value); const ids = new Set<string>();
  const observations = array(v.observations, 2000).map(raw => {
    const o = record(raw); const id = string(o.id, 80);
    if (!id || ids.has(id)) throw new Error('Observation IDs must be unique.'); ids.add(id);
    if (typeof o.line !== 'number' || !Number.isInteger(o.line) || o.line < 1 || o.line > 501 || (o.value !== null && (typeof o.value !== 'number' || !Number.isFinite(o.value))) || typeof o.included !== 'boolean') throw new Error('Invalid observation fields.');
    return { id, line: o.line, source: string(o.source, 10000), site: string(o.site, 120), pollutant: string(o.pollutant, 30), value: o.value as number | null, unit: string(o.unit, 40), timestamp: string(o.timestamp, 80), period: string(o.period, 80), flags: array(o.flags || [],20).map(f => string(f,200)).filter(f => f.startsWith('Converted')), included: o.included, reason: string(o.reason, 500) };
  });
  return finalizeDataset({ label: string(v.label, 200), observations, notes: array(v.notes, 20).map(n => string(n, 500)) });
}
export function validateNarrative(value: unknown, allowed: string[]): Narrative {
  const v = record(value);
  const refs = (value: unknown) => array(value, 20).map(r => { const id = string(r, 80); if (!allowed.includes(id)) throw new Error('Unknown evidence reference.'); return id; });
  const findings = array(v.findings, 8).map(raw => { const f = record(raw); const evidence = refs(f.evidence); if (!evidence.length) throw new Error('Findings require evidence.'); return { title: string(f.title, 160), detail: string(f.detail, 1500), limitation: string(f.limitation, 1000), evidence }; });
  const actions = array(v.actions, 6).map((raw, i) => { const a = record(raw); return { id: `action-${i + 1}`, title: string(a.title, 160), owner: string(a.owner, 160), rationale: string(a.rationale, 1000), verification: string(a.verification, 1000), horizon: string(a.horizon, 100), evidence: refs(a.evidence) }; });
  if (!actions.length) throw new Error('No actions returned.');
  const result = { summary: string(v.summary, 1500), findings, actions, internal: string(v.internal, 7000), citizen: string(v.citizen, 5000), translated: string(v.translated, 5000) };
  // Numerical observations are rendered only from server-owned metrics, never model prose.
  const prose = [result.summary, result.internal, result.citizen, result.translated, ...findings.flatMap(f => [f.title, f.detail, f.limitation]), ...actions.flatMap(a => [a.title, a.rationale, a.verification])];
  if (prose.some(t => /\p{N}/u.test(t.replace(/PM2\.5|PM10/g, '')))) throw new Error('Numerical claims must use the evidence cards.');
  return result;
}
export function validateSnapshot(value: unknown): Snapshot {
  const v = record(value); if (v.version !== 1 || !['sample','live'].includes(String(v.mode))) throw new Error('Unsupported history version.');
  const context = validateContext(v.context); const dataset = validateDataset(v.dataset);
  // Recompute imported metrics separately; never trust imported arithmetic.
  return { version: 1, id: string(v.id, 100), created: string(v.created, 100), context, dataset, baseline: v.baseline ? { context: validateContext(record(v.baseline).context), dataset: validateDataset(record(v.baseline).dataset) } : undefined, metrics: [], narrative: record(v.narrative) as unknown as Narrative, mode: v.mode as 'sample'|'live', statuses: {}, notes: {} };
}
