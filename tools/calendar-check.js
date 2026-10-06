#!/usr/bin/env node
/**
 * tools/calendar-check.js — validate calendar-data.js and list what needs updating.
 *
 *   node tools/calendar-check.js
 *
 * Errors (exit code 1): broken data — unknown wonder or country, invalid
 * dates, duplicate ids, months that don't match the dates.
 * Update list: things to research in the monthly update — data older than a
 * month, festivals whose known dates are all in the past or not announced,
 * dated events with nothing in the next 12 months.
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
global.window = {};
global.localStorage = { getItem: () => null, setItem: () => {} };
eval(fs.readFileSync(path.join(ROOT, 'wonders.js'), 'utf8'));
eval(fs.readFileSync(path.join(ROOT, 'calendar-data.js'), 'utf8'));

const EVENTS  = window.CALENDAR_EVENTS;
const META    = window.CALENDAR_META || {};
const WONDERS = new Set(window.WONDERS_ALL.map(w => w.name));
const MAP_SRC = fs.readFileSync(path.join(ROOT, 'map.js'), 'utf8');

const today    = new Date().toISOString().slice(0, 10);
const inAYear  = new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10);
const errors   = [];
const updates  = [];
const ids      = new Set();

// ── Data freshness ────────────────────────────────────────────────────────────
const ageDays = META.updated ? Math.round((Date.now() - Date.parse(META.updated)) / 864e5) : Infinity;
if (ageDays > 31) updates.push(`Data last researched ${META.updated || 'never'} (${ageDays} days ago) — time for the monthly update`);

// ── Per event ─────────────────────────────────────────────────────────────────
for (const e of EVENTS) {
  if (ids.has(e.id)) errors.push(`${e.id}: duplicate id`);
  ids.add(e.id);

  if (e.wonder && !WONDERS.has(e.wonder)) errors.push(`${e.id}: unknown wonder "${e.wonder}"`);
  for (const land of (e.land || '').split(',').map(s => s.trim()).filter(Boolean)) {
    if (!MAP_SRC.includes(`'${land}'`)) errors.push(`${e.id}: country "${land}" not found in map.js`);
  }
  if (!e.months || !e.months.length || e.months.some(m => m < 1 || m > 12)) errors.push(`${e.id}: invalid months`);
  if (!e.wiki) errors.push(`${e.id}: missing wiki link`);

  for (const d of e.dates || []) {
    if (isNaN(Date.parse(d.from)) || isNaN(Date.parse(d.to)) || d.from > d.to) {
      errors.push(`${e.id}: invalid date ${JSON.stringify(d)}`);
      continue;
    }
    const m = Number(d.from.slice(5, 7));
    if (!e.months.includes(m)) errors.push(`${e.id}: date starts in month ${m}, which is missing from months`);
  }

  // What to research next
  const upcoming = (e.dates || []).filter(d => d.to >= today);
  const soon     = upcoming.filter(d => d.from <= inAYear);
  if (e.type === 'festival' && e.recurrence !== 'once') {
    if (!(e.dates || []).length)      updates.push(`${e.id}: no dates yet — check if announced`);
    else if (!upcoming.length)        updates.push(`${e.id}: all dates are in the past — add the next edition`);
    else if (!soon.length)            updates.push(`${e.id}: nothing in the next 12 months`);
  }
  if (e.recurrence === 'once' && (e.dates || []).every(d => d.to < today)) {
    updates.push(`${e.id}: one-off event is over — remove it`);
  }
  if (e.note && /expected|not yet|not announced/i.test(e.note + ' ' + e.rule)) {
    updates.push(`${e.id}: has provisional info — check for official confirmation`);
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
const festivals = EVENTS.filter(e => e.type === 'festival').length;
console.log(`${EVENTS.length} events (${festivals} festivals, ${EVENTS.length - festivals} nature) · data from ${META.updated || '?'}`);

if (updates.length) {
  console.log(`\nTo research in this update (${updates.length}):`);
  updates.forEach(u => console.log('  • ' + u));
} else {
  console.log('\nNothing flagged for updating.');
}

if (errors.length) {
  console.log(`\nERRORS (${errors.length}):`);
  errors.forEach(e => console.log('  ✗ ' + e));
  process.exit(1);
}
console.log('\nNo errors.');
