/**
 * where-to-go.js — "Where can I go in…?" (Explore → Where to go)
 *
 * Pick a month and see what on your wishlist is in season then:
 *   - countries marked "want" whose best months include it (seasons-data.js)
 *   - wonders marked "want" whose best months include it (wonders.js `best`)
 *   - calendar events marked "want" that happen that month (calendar-data.js)
 * Each country card also lists that month's events and wonders in that
 * country. Matching countries are highlighted on the map, with emoji pins
 * for the wonders and events. The month strip shows how many wishlist items
 * are in season each month, so the best month stands out.
 *
 * Depends on: stats.js (ALL_COUNTRIES, getStateByName, getCountryPriority),
 *             wonders.js, calendar-data.js, seasons-data.js, map.js
 */

(function () {

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                  'August', 'September', 'October', 'November', 'December'];
  const MON    = MONTHS.map(m => m.slice(0, 3));

  const now       = new Date();
  const thisMonth = now.getMonth() + 1;
  let month  = thisMonth;
  let built  = false;
  let active = false;

  // ── Data ────────────────────────────────────────────────────────────────────

  const seasons   = () => window.COUNTRY_SEASONS || {};
  const lands     = s => (s || '').split(',').map(x => x.trim()).filter(Boolean);
  const wonderSt  = n => (window.wonderStates || {})[n] || 'neutral';
  const eventSt   = id => (window.calendarStates || {})[id] || 'neutral';

  function wantCountries() {
    if (typeof ALL_COUNTRIES === 'undefined' || typeof getStateByName !== 'function') return [];
    return ALL_COUNTRIES.filter(c => getStateByName(c) === 'want');
  }

  function wishlist(m) {
    const countries = wantCountries();
    const wonders   = (window.WONDERS_ALL || []).filter(w => wonderSt(w.name) === 'want');
    const events    = (window.CALENDAR_EVENTS || []).filter(e => eventSt(e.id) === 'want');
    return {
      countries, wonders, events,
      countriesIn:  countries.filter(c => (seasons()[c] || []).includes(m)),
      countriesOut: countries.filter(c => !(seasons()[c] || []).includes(m)),
      wondersIn:    wonders.filter(w => (w.best || []).includes(m)),
      wondersOut:   wonders.filter(w => !(w.best || []).includes(m)),
      eventsIn:     events.filter(e => e.months.includes(m)),
      eventsOut:    events.filter(e => !e.months.includes(m))
    };
  }

  const matchCount = m => { const w = wishlist(m); return w.countriesIn.length + w.wondersIn.length + w.eventsIn.length; };

  // "Mar–May, Sep–Oct" — runs may wrap around New Year ("Nov–Mar")
  function monthRanges(ms) {
    if (!ms || !ms.length) return 'no season info';
    const set = new Set(ms);
    if (set.size === 12) return 'all year';
    let gap = 1;
    while (set.has(gap)) gap++;                 // a month outside the season
    const runs = [];
    let run = null;
    for (let i = 1; i <= 12; i++) {             // walk the year starting after the gap
      const m = ((gap - 1 + i) % 12) + 1;
      if (set.has(m)) { if (run) run[1] = m; else run = [m, m]; }
      else if (run)   { runs.push(run); run = null; }
    }
    if (run) runs.push(run);
    return runs.sort((x, y) => x[0] - y[0]).map(([a, b]) => a === b ? MON[a - 1] : `${MON[a - 1]}–${MON[b - 1]}`).join(', ');
  }

  function seasonBar(ms) {
    const set = new Set(ms || []);
    return `<span class="wtg-bar" aria-hidden="true">${MON.map((n, i) =>
      `<i class="${set.has(i + 1) ? 'on' : ''} ${i + 1 === month ? 'now' : ''}" title="${n}"></i>`).join('')}</span>`;
  }

  // ── Panel ───────────────────────────────────────────────────────────────────

  function build(container) {
    container.innerHTML = `
      <div class="collection-header">
        <span class="card-eyebrow">Plan ahead</span>
        <h2>Where can I go in…</h2>
        <p class="collection-intro">Your ★ want countries, wonders and events that are in season. The number under each month shows how many match.</p>
      </div>

      <div class="cal-month-nav">
        <button class="cal-arrow" data-step="-1" aria-label="Previous month">‹</button>
        <div class="cal-month-title" id="wtgMonthTitle"></div>
        <button class="cal-arrow" data-step="1" aria-label="Next month">›</button>
      </div>
      <div class="cal-months" id="wtgMonths" role="tablist" aria-label="Month"></div>

      <p class="wonders-summary" id="wtgSummary"></p>
      <div id="wtgResults"></div>`;

    container.querySelectorAll('.cal-arrow').forEach(btn =>
      btn.addEventListener('click', () => setMonth(((month - 1 + Number(btn.dataset.step) + 12) % 12) + 1)));
  }

  function setMonth(m) { month = m; render(); }

  function renderMonths() {
    const year = now.getFullYear() + (month < thisMonth ? 1 : 0);
    document.getElementById('wtgMonthTitle').innerHTML = `${MONTHS[month - 1]} <span>${year}</span>`;

    const counts = MON.map((_, i) => matchCount(i + 1));
    const best   = Math.max(...counts);
    const strip  = document.getElementById('wtgMonths');
    strip.innerHTML = MON.map((name, i) => {
      const m = i + 1;
      return `<button class="cal-month ${m === month ? 'active' : ''} ${m === thisMonth ? 'is-now' : ''} ${best > 0 && counts[i] === best ? 'wtg-best' : ''}"
                data-month="${m}" role="tab" aria-selected="${m === month}"
                title="${MONTHS[i]}: ${counts[i]} wishlist matches${best > 0 && counts[i] === best ? ' (best month)' : ''}">
                <span>${name[0]}</span><small>${counts[i]}</small></button>`;
    }).join('');
    strip.querySelectorAll('.cal-month').forEach(btn =>
      btn.addEventListener('click', () => setMonth(Number(btn.dataset.month))));
  }

  function chip(icon, text, cls = '') {
    return `<span class="wtg-chip ${cls}">${icon} ${text}</span>`;
  }

  function countryCard(c) {
    const prio   = typeof getCountryPriority === 'function' ? getCountryPriority(c) : null;
    const events = (window.CALENDAR_EVENTS || []).filter(e => lands(e.land).includes(c) && e.months.includes(month));
    const wonders = (window.WONDERS_ALL || []).filter(w =>
      lands(w.land).includes(c) && wonderSt(w.name) !== 'been' && (w.best || []).includes(month));
    const extras = [
      ...events.map(e => chip(e.icon, e.name, eventSt(e.id) === 'want' ? 'wtg-chip-want' : '')),
      ...wonders.map(w => chip(w.icon || '🏛️', w.name, wonderSt(w.name) === 'want' ? 'wtg-chip-want' : ''))
    ];
    return `
      <li class="wtg-card" data-country="${c}">
        <div class="wtg-card-head">
          <span class="wtg-name">${c}</span>
          ${prio === 'next' ? chip('🎯', 'Next up', 'wtg-chip-prio') : prio === 'longterm' ? chip('🗓️', 'Long term', 'wtg-chip-prio') : ''}
        </div>
        <div class="wtg-season">${seasonBar(seasons()[c])}<span>Best: ${monthRanges(seasons()[c])}</span></div>
        ${extras.length ? `<div class="wtg-chips">${extras.join('')}</div>` : ''}
      </li>`;
  }

  function itemCard(icon, name, sub, months, cls = '') {
    return `
      <li class="wtg-card ${cls}">
        <div class="wtg-card-head"><span class="wtg-icon">${icon}</span><span class="wtg-name">${name}</span></div>
        <div class="wtg-sub">${sub}</div>
        <div class="wtg-season">${seasonBar(months)}<span>${cls === 'wtg-event' ? 'Happens' : 'Best'}: ${monthRanges(months)}</span></div>
      </li>`;
  }

  function section(title, items) {
    return items.length ? `<h3 class="wtg-section">${title} <span>${items.length}</span></h3><ul class="wtg-list">${items.join('')}</ul>` : '';
  }

  function nextEventDate(e) {
    const today = now.toISOString().slice(0, 10);
    const d = (e.dates || []).find(x => x.to >= today && Number(x.from.slice(5, 7)) <= month && Number(x.to.slice(5, 7)) >= month)
           || (e.dates || []).find(x => x.to >= today);
    if (!d) return e.place;
    const f = x => { const [y, m, dd] = x.split('-').map(Number); return `${dd} ${MON[m - 1]} ${y}`; };
    return `${e.place} · 📅 ${d.from === d.to ? f(d.from) : f(d.from) + ' – ' + f(d.to)}`;
  }

  function renderResults() {
    const w = wishlist(month);
    const summary = document.getElementById('wtgSummary');
    const results = document.getElementById('wtgResults');
    const total   = w.countries.length + w.wonders.length + w.events.length;

    if (!total) {
      summary.innerHTML = '';
      results.innerHTML = `
        <div class="card card-muted wtg-empty">
          <strong>Your wishlist is empty</strong>
          <ul>
            <li>🌍 Mark countries as <em>want to go</em> on the map (Home) or in Countries</li>
            <li>🏛️ Star wonders in Explore → Wonders</li>
            <li>🗓️ Star festivals and nature events in Explore → Calendar</li>
          </ul>
          <p>Then come back here to see which month suits them best.</p>
        </div>`;
      return;
    }

    const n = w.countriesIn.length + w.wondersIn.length + w.eventsIn.length;
    summary.innerHTML = `<strong>${n} of ${total} wishlist items</strong> are in season in ${MONTHS[month - 1]}`;

    const outItems = [
      ...w.countriesOut.map(c => `<li>🌍 ${c} <span>best ${monthRanges(seasons()[c])}</span></li>`),
      ...w.wondersOut.map(x => `<li>${x.icon || '🏛️'} ${x.name} <span>best ${monthRanges(x.best)}</span></li>`),
      ...w.eventsOut.map(e => `<li>${e.icon} ${e.name} <span>${monthRanges(e.months)}</span></li>`)
    ];

    results.innerHTML =
      section('🌍 Countries in season', w.countriesIn.map(countryCard)) +
      section('🏛️ Wonders in season', w.wondersIn.map(x => itemCard(x.icon || '🏛️', x.name, x.land, x.best, 'wtg-wonder'))) +
      section('🗓️ Events this month', w.eventsIn.map(e => itemCard(e.icon, e.name, nextEventDate(e), e.months, 'wtg-event'))) +
      (n === 0 ? `<p class="wonders-empty">Nothing on your wishlist is in season in ${MONTHS[month - 1]} — try the highlighted month in the strip.</p>` : '') +
      (outItems.length ? `
        <details class="wtg-out">
          <summary>⏳ Not ideal in ${MONTHS[month - 1]} (${outItems.length})</summary>
          <ul>${outItems.join('')}</ul>
        </details>` : '');

    results.querySelectorAll('.wtg-card[data-country]').forEach(card => {
      card.addEventListener('mouseenter', () => highlightCountry(card.dataset.country, true));
      card.addEventListener('mouseleave', () => highlightCountry(card.dataset.country, false));
    });
  }

  function render() {
    if (!built) return;
    renderMonths();
    renderResults();
    renderMap();
  }

  // ── Map overlay ─────────────────────────────────────────────────────────────

  const anchorCache = {};
  function anchorFor(country) {
    if (country in anchorCache) return anchorCache[country];
    const M = window.TravelMap;
    const f = window.nameIndex && window.nameIndex[country.toLowerCase()];
    let lonLat = null;
    if (f && f.geometry) {
      let target = f;
      if (f.geometry.type === 'MultiPolygon') {
        let bestArea = -1;
        f.geometry.coordinates.forEach(poly => {
          const g = { type: 'Feature', geometry: { type: 'Polygon', coordinates: poly } };
          const a = d3.geoArea(g);
          if (a > bestArea) { bestArea = a; target = g; }
        });
      }
      lonLat = d3.geoCentroid(target);
    }
    anchorCache[country] = lonLat && M ? M.projection(lonLat) : null;
    return anchorCache[country];
  }

  function layer() {
    const M = window.TravelMap;
    if (!M) return null;
    let l = M.svg.select('g.wtg-pins');
    if (l.empty()) {
      l = M.svg.append('g').attr('class', 'wtg-pins');
      M.zoom.on('zoom.wheretogo', ({ transform }) => { if (active) position(transform); });
    }
    return l;
  }

  function position(transform) {
    const M = window.TravelMap;
    const t = transform || d3.zoomTransform(M.svg.node());
    M.svg.selectAll('g.wtg-pin').attr('transform', d => {
      const [x, y] = t.apply(d.xy);
      return `translate(${x},${y})`;
    });
  }

  function renderMap() {
    const M = window.TravelMap;
    const l = layer();
    if (!M || !l) return;
    l.selectAll('*').remove();

    if (!active) {
      M.svg.classed('cal-mode', false);
      M.svg.selectAll('path.country').classed('cal-hit', false).classed('wtg-hot', false);
      return;
    }

    const w   = wishlist(month);
    const hit = new Set(w.countriesIn);
    w.wondersIn.forEach(x => lands(x.land).forEach(c => hit.add(c)));
    w.eventsIn.forEach(e => lands(e.land).forEach(c => hit.add(c)));

    M.svg.classed('cal-mode', true);
    M.svg.selectAll('path.country').classed('cal-hit', d => hit.has(d.properties.displayName));

    const pins = [
      ...w.wondersIn.filter(x => x.ll).map(x => ({ key: 'w:' + x.name, icon: x.icon || '🏛️', title: x.name, xy: M.projection([x.ll[1], x.ll[0]]) })),
      ...w.eventsIn.flatMap(e => lands(e.land).map(c => ({ key: 'e:' + e.id + c, icon: e.icon, title: `${e.name} (${c})`, xy: anchorFor(c) })))
    ].filter(p => p.xy);

    const g = l.selectAll('g.wtg-pin').data(pins, d => d.key).enter().append('g').attr('class', 'wtg-pin');
    g.append('circle').attr('class', 'cal-pin-bg').attr('r', 14);
    g.append('text').attr('class', 'cal-pin-icon').attr('text-anchor', 'middle').attr('dy', '0.35em').text(d => d.icon);
    g.append('title').text(d => d.title);
    position();
  }

  function highlightCountry(country, on) {
    const M = window.TravelMap;
    if (!M) return;
    M.svg.selectAll('path.country').classed('wtg-hot', d => on && d.properties.displayName === country);
  }

  // ── Public ──────────────────────────────────────────────────────────────────

  window.initWhereToGo = function () {
    const container = document.getElementById('whereToGoContent');
    if (!container) return;
    if (!built) { build(container); built = true; }
    active = true;
    render();
  };

  window.leaveWhereToGo = function () {
    if (!active) return;
    active = false;
    renderMap();
  };

})();
