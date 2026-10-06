#!/usr/bin/env node
/**
 * tools/calendar-doc.js — regenerate docs/calendar-research.md from calendar-data.js
 *
 *   node tools/calendar-doc.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
global.window = {};
eval(fs.readFileSync(path.join(ROOT, 'calendar-data.js'), 'utf8'));

const E    = window.CALENDAR_EVENTS;
const META = window.CALENDAR_META || {};
const M    = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const fmt   = d => { const [y, m, dd] = d.split('-'); return `${+dd} ${M[+m - 1]} ${y}`; };
const range = d => (d.from === d.to ? fmt(d.from) : `${fmt(d.from)} – ${fmt(d.to)}`) + (d.label ? ` (${d.label})` : '');
const esc   = s => String(s || '').replace(/\|/g, '/');

let out = '# Festival & Nature Calendar — Research\n\n';
out += `_Data last researched **${META.updated || '?'}** · next review **${META.nextReview || '?'}**. ` +
       'Generated from `calendar-data.js` by `tools/calendar-doc.js` — edit the data file, not this document. ' +
       'Monthly update checklist: [calendar-maintenance.md](calendar-maintenance.md)._\n\n';
out += `**${E.filter(e => e.type === 'festival').length} festivals** and **${E.filter(e => e.type === 'nature').length} nature events**. ` +
       'Dates are confirmed upcoming editions; the *Rule* column says how each date moves from year to year.\n\n';

out += '## At a glance — by month\n\n| Month | Festivals | Nature (peak in **bold**) |\n|---|---|---|\n';
for (let m = 1; m <= 12; m++) {
  const fest = E.filter(e => e.type === 'festival' && e.months.includes(m)).map(e => `${e.icon} ${e.name}`);
  const nat  = E.filter(e => e.type === 'nature' && e.months.includes(m))
    .map(e => (e.peak || []).includes(m) ? `**${e.icon} ${e.name}**` : `${e.icon} ${e.name}`);
  out += `| ${M[m - 1]} | ${fest.join(', ')} | ${nat.join(', ')} |\n`;
}

for (const [type, title] of [['festival', 'Festivals'], ['nature', 'Nature']]) {
  out += `\n## ${title}\n\n| | Name | Where | Months | Next dates | Rule | Wonder | Sources |\n|---|---|---|---|---|---|---|---|\n`;
  for (const e of E.filter(x => x.type === type)) {
    const months = e.months.map(m => (e.peak || []).includes(m) ? `**${M[m - 1]}**` : M[m - 1]).join(' ');
    const src    = [e.wiki, ...e.sources].map((u, i) => `[${i ? i : 'wiki'}](${u})`).join(' ');
    out += `| ${e.icon} | **${esc(e.name)}**${e.recurrence !== 'yearly' ? ` _(${e.recurrence})_` : ''} ` +
           `| ${esc(e.place)}${e.land ? ', ' + esc(e.land) : ''} | ${months} ` +
           `| ${e.dates.map(range).join('<br>') || '—'} | ${esc(e.rule)}${e.note ? '<br>💡 ' + esc(e.note) : ''} ` +
           `| ${e.wonder || ''} | ${src} |\n`;
  }
}

fs.writeFileSync(path.join(ROOT, 'docs', 'calendar-research.md'), out);
console.log('Wrote docs/calendar-research.md');
