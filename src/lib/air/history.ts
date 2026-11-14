import { analyze } from './analyze';
import { array, record, string, validateNarrative, validateSnapshot } from './validation';
import type { Snapshot } from './types';
export const HISTORY_KEY = 'wardair.history.v1';
export function readHistory(input: string): Snapshot[] {
  if (new TextEncoder().encode(input).length > 3000000) throw new Error('History exceeds 3 MB.');
  return array(JSON.parse(input), 8).map(raw => {
    const snapshot = validateSnapshot(raw); const baseline = snapshot.baseline ? { ...snapshot.baseline, metrics: analyze(snapshot.baseline.dataset, snapshot.baseline.context) } : undefined; snapshot.metrics = analyze(snapshot.dataset, snapshot.context, baseline);
    const v = record(raw);
    // Sample prose is trusted only for built-in samples; imported prose gets the same checks as live output.
    snapshot.narrative = validateNarrative(v.narrative, snapshot.metrics.map(m => m.id));
    const statuses = record(v.statuses || {}); const notes = record(v.notes || {});
    for (const action of snapshot.narrative.actions) { const status = statuses[action.id]; snapshot.statuses[action.id] = ['To do','In progress','Done'].includes(String(status)) ? String(status) : 'To do'; snapshot.notes[action.id] = notes[action.id] ? string(notes[action.id],1000) : ''; }
    return snapshot;
  });
}
