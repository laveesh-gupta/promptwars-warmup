import { parseTable } from './normalize';
export const SAMPLE_ONE = `site,pollutant,value,unit,timestamp,period,status
School gate,PM2.5,0.086,mg/m3,2026-11-10T08:00+05:30,spot,ok
School gate,PM2.5,94,ug/m3,2026-11-10T09:00+05:30,spot,ok
Residential lane,PM2.5,48,ug/m3,2026-11-10T08:00+05:30,spot,ok
Residential lane,PM2.5,52,ug/m3,2026-11-10T09:00+05:30,spot,ok
Market junction,PM2.5,68,ug/m3,2026-11-10T08:00+05:30,spot,ok
Market junction,PM2.5,72,ug/m3,2026-11-10T09:00+05:30,spot,ok
School gate,PM2.5,94,ug/m3,2026-11-10T09:00+05:30,spot,ok
Residential lane,PM2.5,NA,ug/m3,10/11/26 10:00,spot,missing`;
export const SAMPLE_TWO = `site,pollutant,value,unit,timestamp,period,status
School gate,PM2.5,70,ug/m3,2026-11-11T08:00+05:30,spot,ok
School gate,PM2.5,74,ug/m3,2026-11-11T09:00+05:30,spot,ok
Residential lane,PM2.5,46,ug/m3,2026-11-11T08:00+05:30,spot,ok
Residential lane,PM2.5,NA,ug/m3,2026-11-11T09:00+05:30,spot,offline
Market junction,PM2.5,98,ug/m3,2026-11-11T08:00+05:30,spot,ok
Market junction,PM2.5,110,ug/m3,2026-11-11T09:00+05:30,spot,ok`;
export function sampleDataset(period: number) { return parseTable(period === 1 ? SAMPLE_ONE : SAMPLE_TWO, `Fictional ward · period ${period}`); }
