/**
 * badges.js — Badges tab
 *
 * Achievement medals computed live from existing data:
 *   - country states (window.states via window.getCountryStatus / window.nameIndex)
 *   - wonder states  (window.wonderStates, window.WONDERS_ALL)
 *   - trips          (window.TripStore)
 *
 * Nothing is stored — badges are re-derived every time the tab renders,
 * so they always match the current data (including after an import).
 *
 * Depends on: stats.js (CONTINENTS), wonders.js, trips.js, map.js
 * Load order: … → stats.js → wonders.js → … → badges.js
 */

(function () {

  // ── Reference lists ─────────────────────────────────────────────────────────

  const SOUTH_AMERICA = [
    'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana',
    'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela'
  ];

  const NORDIC = ['Denmark', 'Finland', 'Iceland', 'Norway', 'Sweden'];

  const ISLAND_NATIONS = [
    'Antigua and Barbuda', 'Bahamas', 'Bahrain', 'Barbados', 'Cabo Verde', 'Comoros', 'Cuba', 'Cyprus',
    'Dominica', 'Dominican Republic', 'Fiji', 'Grenada', 'Haiti', 'Iceland', 'Indonesia', 'Ireland',
    'Jamaica', 'Japan', 'Kiribati', 'Madagascar', 'Maldives', 'Malta', 'Marshall Islands', 'Mauritius',
    'Micronesia', 'Nauru', 'New Zealand', 'Palau', 'Papua New Guinea', 'Philippines',
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa',
    'Sao Tome and Principe', 'Seychelles', 'Singapore', 'Solomon Islands', 'Sri Lanka', 'Taiwan',
    'Timor-Leste', 'Tonga', 'Trinidad and Tobago', 'Tuvalu', 'United Kingdom', 'Vanuatu'
  ];

  // Countries lying entirely or mostly south of the equator
  const SOUTHERN_HEMISPHERE = [
    'Angola', 'Argentina', 'Australia', 'Bolivia', 'Botswana', 'Brazil', 'Burundi', 'Chile', 'Comoros',
    'Democratic Republic of Congo', 'Eswatini', 'Fiji', 'Indonesia', 'Kiribati', 'Lesotho', 'Madagascar',
    'Malawi', 'Mauritius', 'Mozambique', 'Namibia', 'Nauru', 'New Zealand', 'Papua New Guinea',
    'Paraguay', 'Peru', 'Rwanda', 'Samoa', 'Seychelles', 'Solomon Islands', 'South Africa', 'Tanzania',
    'Timor-Leste', 'Tonga', 'Tuvalu', 'Uruguay', 'Vanuatu', 'Zambia', 'Zimbabwe'
  ];

  const NEW7WONDERS = [
    'Great Wall of China', 'Petra', 'Christ the Redeemer', 'Machu Picchu',
    'Chichén Itzá', 'Colosseum', 'Taj Mahal'
  ];

  const TIER_NAMES  = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  const TIER_COLORS = ['#b8763e', '#9aa3ad', '#d4a537', '#4f9fb3'];

  // ── Data context ────────────────────────────────────────────────────────────

  function buildContext() {
    const index = window.nameIndex || {};
    const idToName = {};
    Object.values(index).forEach(f => {
      if (f && f.id !== undefined) idToName[String(f.id)] = (f.properties && f.properties.displayName) || '';
    });

    const visited = new Set();
    Object.keys(window.states || {}).forEach(id => {
      const status = window.getCountryStatus ? window.getCountryStatus(id) : null;
      if (status === 'been' && idToName[id]) visited.add(idToName[id]);
    });

    const wonderBeen = name => (window.wonderStates || {})[name] === 'been';
    const allWonders = window.WONDERS_ALL || [];
    const natural    = (typeof WONDERS_DATA !== 'undefined') ? WONDERS_DATA.natural  : [];
    const cultural   = (typeof WONDERS_DATA !== 'undefined') ? WONDERS_DATA.cultural : [];

    const trips = (window.TripStore && window.TripStore.getTrips()) || [];

    return { visited, idToName, wonderBeen, allWonders, natural, cultural, trips };
  }

  function continentsVisited(ctx) {
    const set = new Set();
    const continents = (typeof CONTINENTS !== 'undefined') ? CONTINENTS : {};
    ctx.visited.forEach(name => {
      Object.entries(continents).forEach(([continent, list]) => {
        if (!list.includes(name)) return;
        if (continent === 'Americas') set.add(SOUTH_AMERICA.includes(name) ? 'South America' : 'North America');
        else set.add(continent);
      });
    });
    if (ctx.wonderBeen('Antarctica')) set.add('Antarctica');
    return set;
  }

  const year = d => String(d || '').slice(0, 4);

  function bestYear(map) {
    let best = { year: null, value: 0 };
    Object.entries(map).forEach(([y, v]) => { if (v > best.value) best = { year: y, value: v }; });
    return best;
  }

  // ── Badge definitions ───────────────────────────────────────────────────────
  // value(ctx) → { value, note? }. Tiered badges use `tiers`, others `target`.

  const BADGES = [
    // Countries & continents
    { cat: 'countries', icon: '🛫', name: 'First Stamp',      desc: 'Mark your first country as visited', target: 1,
      value: c => ({ value: c.visited.size }) },
    { cat: 'countries', icon: '🧭', name: 'Explorer',         desc: 'Visit 10 · 25 · 50 · 100 countries', tiers: [10, 25, 50, 100],
      value: c => ({ value: c.visited.size }) },
    { cat: 'countries', icon: '🌐', name: 'Continental',      desc: 'Visit 3 continents', target: 3,
      value: c => { const s = continentsVisited(c); return { value: s.size, note: [...s].join(', ') }; } },
    { cat: 'countries', icon: '🏅', name: 'All Seven',        desc: 'Set foot on all 7 continents (Antarctica via its wonder)', target: 7,
      value: c => { const s = continentsVisited(c); return { value: s.size, note: [...s].join(', ') }; } },
    { cat: 'countries', icon: '🧊', name: 'Nordic Circle',    desc: 'Visit all 5 Nordic countries', target: 5,
      value: c => ({ value: NORDIC.filter(n => c.visited.has(n)).length }) },
    { cat: 'countries', icon: '🏝️', name: 'Island Hopper',    desc: 'Visit 5 island nations', target: 5,
      value: c => ({ value: ISLAND_NATIONS.filter(n => c.visited.has(n)).length }) },
    { cat: 'countries', icon: '🌏', name: 'Equator Crosser',  desc: 'Visit countries in both hemispheres', target: 2,
      value: c => {
        const names = [...c.visited];
        const south = names.some(n => SOUTHERN_HEMISPHERE.includes(n));
        const north = names.some(n => !SOUTHERN_HEMISPHERE.includes(n));
        return { value: (south ? 1 : 0) + (north ? 1 : 0) };
      } },

    // Wonders
    { cat: 'wonders', icon: '🍶', name: 'Bottle Half Full',   desc: '25 of the 50 World Explorer bottle wonders', target: 25,
      value: c => ({ value: c.allWonders.filter(w => w.bottle && c.wonderBeen(w.name)).length }) },
    { cat: 'wonders', icon: '🏆', name: 'Full Bottle',        desc: 'All 50 World Explorer bottle wonders', target: 50,
      value: c => ({ value: c.allWonders.filter(w => w.bottle && c.wonderBeen(w.name)).length }) },
    { cat: 'wonders', icon: '✨', name: 'New7Wonders',         desc: 'See all 7 New Seven Wonders of the World', target: 7,
      value: c => ({ value: NEW7WONDERS.filter(n => c.wonderBeen(n)).length }) },
    { cat: 'wonders', icon: '🌿', name: 'Wild at Heart',      desc: 'Visit 10 natural wonders', target: 10,
      value: c => ({ value: c.natural.filter(w => c.wonderBeen(w.name)).length }) },
    { cat: 'wonders', icon: '🏺', name: 'Culture Vulture',    desc: 'Visit 10 cultural sites', target: 10,
      value: c => ({ value: c.cultural.filter(w => c.wonderBeen(w.name)).length }) },

    // Trips (year in review)
    { cat: 'trips', icon: '📆', name: 'Globetrotter of the Year', desc: '5 new countries in one calendar year', target: 5,
      value: c => {
        const firstYear = {};
        c.trips.forEach(t => (t.countries || []).forEach(id => {
          const y = year(t.dateFrom);
          if (y && (!firstYear[id] || y < firstYear[id])) firstYear[id] = y;
        }));
        const perYear = {};
        Object.values(firstYear).forEach(y => { perYear[y] = (perYear[y] || 0) + 1; });
        const best = bestYear(perYear);
        return { value: best.value, note: best.year ? `Best year: ${best.year}` : '' };
      } },
    { cat: 'trips', icon: '🧳', name: 'Long Hauler',          desc: '30+ days abroad in one year', target: 30,
      value: c => {
        const perYear = {};
        c.trips.forEach(t => {
          const y = year(t.dateFrom);
          if (y) perYear[y] = (perYear[y] || 0) + window.TripStore.getTripDuration(t);
        });
        const best = bestYear(perYear);
        return { value: best.value, note: best.year ? `Best year: ${best.year}` : '' };
      } },
    { cat: 'trips', icon: '🤝', name: 'Ride or Die',          desc: '5 trips with the same companion', target: 5,
      value: c => {
        const count = {};
        c.trips.forEach(t => (t.companions || []).forEach(p => {
          if (p !== 'solo') count[p] = (count[p] || 0) + 1;
        }));
        const best = bestYear(count);
        return { value: best.value, note: best.year ? `With: ${best.year}` : '' };
      } },
    { cat: 'trips', icon: '🎒', name: 'Solo Spirit',          desc: 'Log your first solo trip', target: 1,
      value: c => ({ value: c.trips.filter(t => (t.companions || []).includes('solo')).length }) },
    { cat: 'trips', icon: '⭐', name: 'Trip of a Lifetime',   desc: 'Rate a trip 5 stars', target: 1,
      value: c => ({ value: c.trips.filter(t => Number(t.mood) === 5).length }) },
    { cat: 'trips', icon: '🍂', name: 'Four Seasons',         desc: 'Travel in spring, summer, autumn and winter', target: 4,
      value: c => {
        const seasons = new Set(c.trips.map(t => {
          const m = Number(String(t.dateFrom || '').slice(5, 7));
          if (!m) return null;
          return [12, 1, 2].includes(m) ? 'winter' : m <= 5 ? 'spring' : m <= 8 ? 'summer' : 'autumn';
        }).filter(Boolean));
        return { value: seasons.size, note: [...seasons].join(', ') };
      } },

    // Coming soon — need new data
    { cat: 'soon', icon: '🇪🇺', name: 'Capital Collector', desc: 'Visit 10 European capitals',            needs: 'a list of capital cities' },
    { cat: 'soon', icon: '🛡️', name: 'UNESCO Hunter',      desc: 'Visit 10 · 50 · 100 World Heritage Sites', needs: 'the UNESCO site list' },
    { cat: 'soon', icon: '🏞️', name: 'Park Ranger',        desc: 'Visit 10 national parks',                needs: 'a national parks list' },
    { cat: 'soon', icon: '⛰️', name: 'Peak Bagger',        desc: 'See the highest peak of every continent', needs: 'a Seven Summits list' },
    { cat: 'soon', icon: '✈️', name: 'Around the World',   desc: 'Travel 40,075 km in total',              needs: 'distance per trip' },
    { cat: 'soon', icon: '🌙', name: 'To the Moon',        desc: 'Travel 384,400 km in total',             needs: 'distance per trip' },
    { cat: 'soon', icon: '🍺', name: 'Festival Fever',     desc: 'Attend 3 festivals like Oktoberfest',    needs: 'the festival calendar' }
  ];

  const SECTIONS = [
    { cat: 'countries', title: '🌍 Countries & continents', short: '🌍 Countries' },
    { cat: 'wonders',   title: '🏛️ Wonders & bucket lists',  short: '🏛️ Wonders' },
    { cat: 'trips',     title: '✈️ Trips & year in review',   short: '✈️ Trips' },
    { cat: 'soon',      title: '🔜 Coming soon',              short: '🔜 Soon' }
  ];

  let section = 'all';      // all | countries | wonders | trips | soon
  let filter  = 'all';      // all | earned | progress | locked
  let built   = false;

  // ── Evaluation ──────────────────────────────────────────────────────────────

  function evaluate(badge, ctx) {
    if (badge.cat === 'soon') return { soon: true };

    let res;
    try { res = badge.value(ctx); } catch (e) { console.warn('[badges]', badge.name, e); res = { value: 0 }; }
    const value = res.value || 0;

    if (badge.tiers) {
      const level  = badge.tiers.filter(t => value >= t).length;          // 0..tiers.length
      const target = badge.tiers[Math.min(level, badge.tiers.length - 1)];
      return {
        value, target, note: res.note,
        earned: level > 0,
        maxed:  level === badge.tiers.length,
        tier:   level > 0 ? level - 1 : null,
        progress: level === badge.tiers.length ? 1 : Math.min(1, value / target)
      };
    }

    return {
      value, target: badge.target, note: res.note,
      earned: value >= badge.target,
      tier: value >= badge.target ? 2 : null,                              // single-level badges are gold
      progress: Math.min(1, value / badge.target)
    };
  }

  // ── Rendering ───────────────────────────────────────────────────────────────

  function medalSVG(result) {
    const r = 40, c = 2 * Math.PI * r;
    const color = result.tier !== null && result.tier !== undefined ? TIER_COLORS[result.tier] : 'var(--ocean-500)';
    const progress = result.soon ? 0 : result.progress;
    return `
      <svg class="medal-ring" viewBox="0 0 92 92" aria-hidden="true">
        <circle cx="46" cy="46" r="${r}" fill="none" stroke="var(--line)" stroke-width="5"></circle>
        <circle cx="46" cy="46" r="${r}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"
          stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - progress)}" transform="rotate(-90 46 46)"></circle>
      </svg>`;
  }

  function badgeHtml(badge, result) {
    const state = result.soon ? 'soon' : result.earned ? 'earned' : 'locked';
    const tierLabel = badge.tiers && result.earned ? TIER_NAMES[result.tier] : '';
    let progressText = '';
    if (result.soon) progressText = `Needs ${badge.needs}`;
    else if (result.maxed) progressText = `${result.value} · maxed out`;
    else if (result.earned && !badge.tiers) progressText = 'Unlocked';
    else progressText = `${Math.min(result.value, result.target)} / ${result.target}`;

    const tierStyle = result.tier !== null && result.tier !== undefined ? `style="--tier:${TIER_COLORS[result.tier]}"` : '';
    const tooltip = [badge.name, badge.desc, result.note].filter(Boolean).join('\n');

    return `
      <div class="medal medal-${state} medal-${badge.cat}" ${tierStyle} title="${tooltip.replace(/"/g, '&quot;')}">
        <div class="medal-disc-wrap">
          ${medalSVG(result)}
          <div class="medal-disc"><span class="medal-icon">${badge.iconAlt || badge.icon}</span></div>
          ${state === 'locked' ? '<span class="medal-lock" aria-hidden="true">🔒</span>' : ''}
        </div>
        ${tierLabel ? `<span class="medal-tier">${tierLabel}</span>` : ''}
        <div class="medal-name">${badge.name}</div>
        <div class="medal-desc">${badge.desc}</div>
        <div class="medal-progress">${progressText}</div>
      </div>`;
  }

  function matchesFilter(result) {
    switch (filter) {
      case 'earned':   return !!result.earned;
      case 'progress': return !result.soon && !result.earned && result.value > 0;
      case 'locked':   return !result.soon && !result.earned && !result.value;
      default:         return true;
    }
  }

  function renderSummary(results) {
    const el = document.getElementById('badgesSummary');
    if (!el) return;
    const live   = results.filter(r => !r.result.soon);
    const earned = rs => rs.filter(r => r.result.earned).length;
    const inCat  = cat => live.filter(r => r.badge.cat === cat);
    el.innerHTML = `
      <div class="collection-stat"><strong>${earned(live)}</strong><span>of ${live.length} earned</span></div>
      <div class="collection-stat"><strong>${earned(inCat('countries'))}/${inCat('countries').length}</strong><span>🌍 countries</span></div>
      <div class="collection-stat"><strong>${earned(inCat('wonders'))}/${inCat('wonders').length}</strong><span>🏛️ wonders</span></div>
      <div class="collection-stat"><strong>${earned(inCat('trips'))}/${inCat('trips').length}</strong><span>✈️ trips</span></div>
      <div class="collection-stat"><strong>${results.length - live.length}</strong><span>🔜 coming soon</span></div>`;

    const next = document.getElementById('badgesNext');
    const closest = live.filter(r => !r.result.earned).sort((a, b) => b.result.progress - a.result.progress)[0];
    if (next) {
      next.innerHTML = closest
        ? `Closest next: <strong>${closest.badge.icon} ${closest.badge.name}</strong> — ${Math.min(closest.result.value, closest.result.target)} / ${closest.result.target}`
        : 'Every available badge earned — impressive!';
    }
  }

  function renderBoards(results) {
    const boards = document.getElementById('badgeBoards');
    if (!boards) return;
    const visible = SECTIONS.filter(sec => section === 'all' || section === sec.cat);

    boards.innerHTML = visible.map(sec => {
      const inSec = results.filter(r => r.badge.cat === sec.cat);
      const shown = inSec.filter(r => matchesFilter(r.result));
      const label = sec.cat === 'soon'
        ? `${inSec.length} planned`
        : `${inSec.filter(r => r.result.earned).length} / ${inSec.length}`;
      return `
        <section class="collection-board">
          <h3 class="collection-board-title">${sec.title} <span>${label}</span></h3>
          ${shown.length
            ? `<div class="medal-grid">${shown.map(r => badgeHtml(r.badge, r.result)).join('')}</div>`
            : `<p class="wonders-empty">No badges match this filter.</p>`}
        </section>`;
    }).join('');
  }

  function build(container) {
    container.innerHTML = `
      <div class="collection-page">
        <div class="collection-header">
          <span class="card-eyebrow">Achievements</span>
          <h2>Badges</h2>
          <p class="collection-intro" id="badgesNext"></p>
        </div>

        <div class="collection-summary" id="badgesSummary"></div>

        <div class="collection-controls">
          <div class="wonders-section-toggle collection-sections">
            <button class="wonders-seg-btn active" data-section="all">All</button>
            ${SECTIONS.map(sec => `<button class="wonders-seg-btn" data-section="${sec.cat}">${sec.short}</button>`).join('')}
          </div>
          <div class="cl-filters collection-filters">
            <button class="cl-filter-btn active" data-filter="all">All</button>
            <button class="cl-filter-btn" data-filter="earned">Earned</button>
            <button class="cl-filter-btn" data-filter="progress">In progress</button>
            <button class="cl-filter-btn" data-filter="locked">Not started</button>
          </div>
        </div>

        <div id="badgeBoards"></div>
      </div>`;

    container.querySelectorAll('.collection-sections .wonders-seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.collection-sections .wonders-seg-btn').forEach(b => b.classList.toggle('active', b === btn));
        section = btn.dataset.section;
        render();
      });
    });

    container.querySelectorAll('.collection-filters .cl-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.collection-filters .cl-filter-btn').forEach(b => b.classList.toggle('active', b === btn));
        filter = btn.dataset.filter;
        render();
      });
    });
  }

  function render() {
    const container = document.getElementById('badgesContent');
    if (!container) return;
    if (!built) { build(container); built = true; }

    const ctx     = buildContext();
    const results = BADGES.map(b => ({ badge: b, result: evaluate(b, ctx) }));
    renderSummary(results);
    renderBoards(results);
  }

  window.initBadges = render;

  // Re-render if the tab is open while data changes elsewhere (e.g. wonders)
  window.refreshBadges = function () {
    const el = document.getElementById('badgesContent');
    if (el && el.style.display !== 'none') render();
  };

  // Exposed for tests / debugging
  window.BadgeEngine = { BADGES, evaluate, buildContext };

})();
