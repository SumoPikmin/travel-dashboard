/**
 * calendar.js — Calendar page (Explore → Calendar)
 *
 * "When to go": pick a month, see the festivals and nature events happening
 * then as cards in the panel, and as emoji pins on the map (countries with an
 * event are highlighted, the rest dimmed). Each event can be marked been /
 * want like a wonder; clicking the active ✓ or ★ again resets it.
 *
 * Depends on: calendar-data.js (CALENDAR_EVENTS), map.js (TravelMap, nameIndex)
 * State:      localStorage 'calendar_states_v1' → window.calendarStates
 */

(function () {

  const STORAGE_KEY = 'calendar_states_v1';
  const MONTHS      = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                       'August', 'September', 'October', 'November', 'December'];
  const MON         = MONTHS.map(m => m.slice(0, 3));

  // Map anchors for countries too small for the 110m map (or missing from it)
  const FALLBACK_COORDS = {
    'Tonga':               [-175.2, -21.2],
    'Bahamas':             [-77.4, 25.0],
    'Trinidad and Tobago': [-61.3, 10.5],
    'Taiwan':              [121.0, 23.7]
  };

  try { window.calendarStates = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { window.calendarStates = {}; }

  const now        = new Date();
  const todayIso   = now.toISOString().slice(0, 10);
  const thisMonth  = now.getMonth() + 1;

  let month   = thisMonth;
  let type    = 'all';      // all | festival | nature
  let status  = 'all';      // all | want | been | neutral
  let built   = false;
  let active  = false;      // page visible → map overlay on

  // ── State ───────────────────────────────────────────────────────────────────

  function getState(id) { return window.calendarStates[id] || 'neutral'; }

  function setState(id, s) {
    if (s === 'neutral') delete window.calendarStates[id];
    else window.calendarStates[id] = s;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(window.calendarStates)); } catch {}
    if (window.refreshBadges) window.refreshBadges();
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const events = () => window.CALENDAR_EVENTS || [];
  const lands  = e => (e.land || '').split(',').map(s => s.trim()).filter(Boolean);

  // Year a month refers to: the next time that month comes round (this month counts)
  const yearFor = m => now.getFullYear() + (m < thisMonth ? 1 : 0);

  function fmtDate(iso, withYear) {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${MON[m - 1]}${withYear ? ' ' + y : ''}`;
  }

  function fmtRange(d) {
    if (d.from === d.to) return fmtDate(d.from, true);
    const sameYear = d.from.slice(0, 4) === d.to.slice(0, 4);
    return `${fmtDate(d.from, !sameYear)} – ${fmtDate(d.to, true)}`;
  }

  // Upcoming dates of an event that touch the selected month
  function datesInMonth(e, m) {
    return (e.dates || []).filter(d => {
      if (d.to < todayIso) return false;
      const fromM = Number(d.from.slice(5, 7)), toM = Number(d.to.slice(5, 7));
      const span  = d.from.slice(0, 4) === d.to.slice(0, 4)
        ? (m >= fromM && m <= toM)
        : (m >= fromM || m <= toM);
      return span;
    });
  }

  function whenHtml(e, m) {
    const dates = datesInMonth(e, m);
    if (dates.length) {
      return dates.map(d => `<span class="cal-date">📅 ${fmtRange(d)}${d.label ? ` <em>· ${d.label}</em>` : ''}</span>`).join('');
    }
    if (e.type === 'nature') {
      const peak = (e.peak || []).includes(m);
      return `<span class="cal-season ${peak ? 'cal-peak' : ''}">${peak ? '⭐ Peak season' : '🌿 In season'}
        · ${e.months.map(x => MON[x - 1]).join(' ')}</span>`;
    }
    const next = (e.dates || []).find(d => d.to >= todayIso);
    return `<span class="cal-season">🗓️ ${next ? 'Next: ' + fmtRange(next) : 'Dates not announced yet'}</span>`;
  }

  // Sort: dated events in this month by date, then peak nature, then the rest
  function sortKey(e, m) {
    const d = datesInMonth(e, m)[0];
    if (d) return '0' + d.from;
    if ((e.peak || []).includes(m)) return '1' + e.name;
    return '2' + e.name;
  }

  function visibleEvents() {
    return events()
      .filter(e => e.months.includes(month))
      .filter(e => type === 'all' || e.type === type)
      .filter(e => status === 'all' || getState(e.id) === status)
      .sort((a, b) => sortKey(a, month).localeCompare(sortKey(b, month)));
  }

  // ── Panel ───────────────────────────────────────────────────────────────────

  function build(container) {
    container.innerHTML = `
      <div class="collection-header">
        <span class="card-eyebrow">When to go</span>
        <h2>Calendar</h2>
        <p class="collection-intro">Festivals and nature spectacles by month. Mark the ones you’ve seen or want to see.</p>
        <p class="cal-updated" id="calUpdated"></p>
      </div>

      <div class="cal-month-nav">
        <button class="cal-arrow" data-step="-1" aria-label="Previous month">‹</button>
        <div class="cal-month-title" id="calMonthTitle"></div>
        <button class="cal-arrow" data-step="1" aria-label="Next month">›</button>
      </div>
      <div class="cal-months" id="calMonths" role="tablist" aria-label="Month"></div>

      <div class="collection-controls">
        <div class="wonders-section-toggle collection-sections" id="calTypes">
          <button class="wonders-seg-btn active" data-type="all">All</button>
          <button class="wonders-seg-btn" data-type="festival">🎉 Festivals</button>
          <button class="wonders-seg-btn" data-type="nature">🌿 Nature</button>
        </div>
        <div class="cl-filters collection-filters" id="calStatus">
          <button class="cl-filter-btn active" data-status="all">All</button>
          <button class="cl-filter-btn" data-status="want">Want</button>
          <button class="cl-filter-btn" data-status="been">Been</button>
          <button class="cl-filter-btn" data-status="neutral">Not marked</button>
        </div>
      </div>

      <p class="wonders-summary" id="calSummary"></p>
      <ul class="cal-list" id="calList"></ul>`;

    container.querySelectorAll('.cal-arrow').forEach(btn =>
      btn.addEventListener('click', () => setMonth(((month - 1 + Number(btn.dataset.step) + 12) % 12) + 1)));

    container.querySelectorAll('#calTypes .wonders-seg-btn').forEach(btn =>
      btn.addEventListener('click', () => {
        container.querySelectorAll('#calTypes .wonders-seg-btn').forEach(b => b.classList.toggle('active', b === btn));
        type = btn.dataset.type;
        render();
      }));

    container.querySelectorAll('#calStatus .cl-filter-btn').forEach(btn =>
      btn.addEventListener('click', () => {
        container.querySelectorAll('#calStatus .cl-filter-btn').forEach(b => b.classList.toggle('active', b === btn));
        status = btn.dataset.status;
        render();
      }));
  }

  function setMonth(m) {
    month = m;
    render();
    const list = document.getElementById('calList');
    if (list) list.scrollTop = 0;
  }

  function renderMonths() {
    const title = document.getElementById('calMonthTitle');
    const strip = document.getElementById('calMonths');
    title.innerHTML = `${MONTHS[month - 1]} <span>${yearFor(month)}</span>`;

    strip.innerHTML = MON.map((name, i) => {
      const m = i + 1;
      const n = events().filter(e => e.months.includes(m) && (type === 'all' || e.type === type)).length;
      return `<button class="cal-month ${m === month ? 'active' : ''} ${m === thisMonth ? 'is-now' : ''}"
                data-month="${m}" role="tab" aria-selected="${m === month}" title="${MONTHS[i]}: ${n} events">
                <span>${name[0]}</span><small>${n}</small></button>`;
    }).join('');

    strip.querySelectorAll('.cal-month').forEach(btn =>
      btn.addEventListener('click', () => setMonth(Number(btn.dataset.month))));
  }

  function cardHtml(e) {
    const s = getState(e.id);
    const tip = [e.rule, e.note ? '💡 ' + e.note : ''].filter(Boolean).join('\n');
    return `
      <li class="cal-card cl-${s} cal-${e.type}" data-id="${e.id}">
        <span class="cal-icon" aria-hidden="true">${e.icon}</span>
        <div class="cal-info">
          <div class="cal-name">${e.name}</div>
          <div class="cal-where">${e.place}${e.land && !e.place.includes(e.land) ? ` · ${e.land}` : ''}</div>
          <div class="cal-when">${whenHtml(e, month)}</div>
          ${e.note ? `<div class="cal-note">💡 ${e.note}</div>` : ''}
          <div class="cal-links">
            ${e.wonder ? `<span class="cal-wonder" title="Linked wonder">🏛️ ${e.wonder}</span>` : ''}
            ${e.recurrence !== 'yearly' ? `<span class="cal-rare">${e.recurrence === 'once' ? 'One-off' : 'Every 12 years'}</span>` : ''}
            <a class="wonders-wiki-link" href="${e.wiki}" target="_blank" rel="noopener noreferrer" title="${tip.replace(/"/g, '&quot;')}">Learn more →</a>
          </div>
        </div>
        <div class="wonders-item-actions">
          <button class="wonders-status-btn ${s === 'been'    ? 'active-been'    : ''}" data-status="been"    title="Been (click again to reset)">✓</button>
          <button class="wonders-status-btn ${s === 'want'    ? 'active-want'    : ''}" data-status="want"    title="Want to go (click again to reset)">★</button>
          <button class="wonders-status-btn ${s === 'neutral' ? 'active-neutral' : ''}" data-status="neutral" title="Not marked">✕</button>
        </div>
      </li>`;
  }

  function renderList() {
    const list    = document.getElementById('calList');
    const summary = document.getElementById('calSummary');
    const shown   = visibleEvents();
    const inMonth = events().filter(e => e.months.includes(month));

    const f = inMonth.filter(e => e.type === 'festival').length;
    const n = inMonth.length - f;
    summary.innerHTML = `<strong>${inMonth.length} events in ${MONTHS[month - 1]}</strong> &nbsp;·&nbsp; 🎉 ${f} festivals &nbsp;·&nbsp; 🌿 ${n} nature`;

    list.innerHTML = shown.length
      ? shown.map(cardHtml).join('')
      : `<li class="wonders-empty">Nothing matches these filters in ${MONTHS[month - 1]}.</li>`;

    list.querySelectorAll('.cal-card').forEach(card => {
      const id = card.dataset.id;
      card.querySelectorAll('.wonders-status-btn').forEach(btn =>
        btn.addEventListener('click', () => {
          const clicked = btn.dataset.status;
          setState(id, clicked !== 'neutral' && clicked === getState(id) ? 'neutral' : clicked);
          render();
        }));
      card.addEventListener('mouseenter', () => highlightPins(id, true));
      card.addEventListener('mouseleave', () => highlightPins(id, false));
    });
  }

  function renderUpdated() {
    const el   = document.getElementById('calUpdated');
    const meta = window.CALENDAR_META || {};
    if (!el || !meta.updated) return;
    const [y, m] = meta.updated.split('-').map(Number);
    const stale  = (Date.now() - Date.parse(meta.updated)) / 864e5 > 45;
    el.classList.toggle('cal-stale', stale);
    el.textContent = `Dates researched ${MONTHS[m - 1]} ${y}` + (stale ? ' — may be out of date' : '');
  }

  function render() {
    if (!built) return;
    renderUpdated();
    renderMonths();
    renderList();
    renderMap();
  }

  // ── Map overlay ─────────────────────────────────────────────────────────────

  const anchorCache = {};

  // Point inside the country's largest polygon (avoids e.g. France's centroid
  // landing in the Atlantic because of French Guiana)
  function anchorFor(country) {
    if (country in anchorCache) return anchorCache[country];
    const M = window.TravelMap;
    let lonLat = FALLBACK_COORDS[country] || null;
    const feature = window.nameIndex && window.nameIndex[country.toLowerCase()];
    if (!lonLat && feature && feature.geometry) {
      const geom = feature.geometry;
      let target = feature;
      if (geom.type === 'MultiPolygon') {
        let best = null, bestArea = -1;
        geom.coordinates.forEach(poly => {
          const f = { type: 'Feature', geometry: { type: 'Polygon', coordinates: poly } };
          const a = d3.geoArea(f);
          if (a > bestArea) { bestArea = a; best = f; }
        });
        target = best;
      }
      lonLat = d3.geoCentroid(target);
    }
    anchorCache[country] = lonLat && M ? M.projection(lonLat) : null;
    return anchorCache[country];
  }

  function pinLayer() {
    const M = window.TravelMap;
    if (!M) return null;
    let layer = M.svg.select('g.cal-pins');
    if (layer.empty()) {
      layer = M.svg.append('g').attr('class', 'cal-pins');
      M.zoom.on('zoom.calendar', ({ transform }) => positionPins(transform));
    }
    return layer;
  }

  function positionPins(transform) {
    const M = window.TravelMap;
    if (!M) return;
    const t = transform || d3.zoomTransform(M.svg.node());
    M.svg.selectAll('g.cal-pin').attr('transform', d => {
      const [x, y] = t.apply(d.xy);
      return `translate(${x},${y})`;
    });
  }

  function renderMap() {
    const M = window.TravelMap;
    if (!M) return;
    const layer = pinLayer();

    if (!active) {
      M.svg.classed('cal-mode', false);
      M.svg.selectAll('path.country').classed('cal-hit', false);
      layer.selectAll('*').remove();
      return;
    }

    // Group visible events by country
    const byCountry = new Map();
    visibleEvents().forEach(e => lands(e).forEach(c => {
      if (!byCountry.has(c)) byCountry.set(c, []);
      byCountry.get(c).push(e);
    }));

    M.svg.classed('cal-mode', true);
    M.svg.selectAll('path.country')
      .classed('cal-hit', d => byCountry.has(d.properties.displayName));

    const pins = [...byCountry.entries()]
      .map(([country, evs]) => ({ country, evs, xy: anchorFor(country) }))
      .filter(p => p.xy);

    const sel = layer.selectAll('g.cal-pin').data(pins, d => d.country);
    sel.exit().remove();

    const enter = sel.enter().append('g').attr('class', 'cal-pin');
    enter.append('circle').attr('class', 'cal-pin-bg').attr('r', 15);
    enter.append('text').attr('class', 'cal-pin-icon').attr('text-anchor', 'middle').attr('dy', '0.35em');
    enter.append('circle').attr('class', 'cal-pin-badge').attr('cx', 12).attr('cy', -12).attr('r', 8);
    enter.append('text').attr('class', 'cal-pin-count').attr('x', 12).attr('y', -12).attr('text-anchor', 'middle').attr('dy', '0.35em');
    enter.append('title');
    enter.on('click', (event, d) => focusCard(d.evs[0].id));

    const all = enter.merge(sel);
    all.select('.cal-pin-icon').text(d => d.evs[0].icon);
    all.select('.cal-pin-badge').style('display', d => d.evs.length > 1 ? null : 'none');
    all.select('.cal-pin-count').text(d => d.evs.length > 1 ? d.evs.length : '');
    all.select('title').text(d => `${d.country}\n` + d.evs.map(e => `${e.icon} ${e.name}`).join('\n'));
    all.attr('data-ids', d => d.evs.map(e => e.id).join(' '));

    positionPins();
  }

  function highlightPins(id, on) {
    const M = window.TravelMap;
    if (!M) return;
    M.svg.selectAll('g.cal-pin')
      .classed('cal-pin-hot', function () { return on && (this.getAttribute('data-ids') || '').split(' ').includes(id); });
  }

  function focusCard(id) {
    const card = document.querySelector(`.cal-card[data-id="${id}"]`);
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.remove('cal-flash');
    void card.offsetWidth;                 // restart the animation
    card.classList.add('cal-flash');
  }

  // Extra lines for the map tooltip while the calendar is open
  window.calendarTooltipHtml = function (countryName) {
    if (!active) return '';
    const evs = visibleEvents().filter(e => lands(e).includes(countryName));
    if (!evs.length) return '';
    return `<div style="margin-top:6px;border-top:1px solid rgba(255,255,255,0.3);padding-top:5px;font-size:12px;">
      <div style="opacity:0.7;margin-bottom:3px;">${MONTHS[month - 1]}</div>
      ${evs.map(e => `<div>${e.icon} ${e.name}</div>`).join('')}
    </div>`;
  };

  // ── Public ──────────────────────────────────────────────────────────────────

  window.initCalendar = function () {
    const container = document.getElementById('calendarContent');
    if (!container) return;
    if (!built) { build(container); built = true; }
    active = true;
    render();
  };

  // Called by index.html when another page opens
  window.leaveCalendar = function () {
    if (!active) return;
    active = false;
    renderMap();
  };

  window.refreshCalendar = function () {
    try { window.calendarStates = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch {}
    render();
  };

})();
