/**
 * stickers.js — Stickers tab
 *
 * Honeycomb "sticker book" of all wonders, shown on the right-hand stage
 * (in place of the map) while the controls live in the left panel; styled after the
 * Let's Wander World Explorer bottle: collected wonders in colour, the rest
 * as grey outlines. Clicking a sticker cycles
 *   not visited → been → want → not visited
 * using the same wonder states as the Wonders tab (wonders.js).
 *
 * Depends on: wonders.js (WONDERS_DATA, getWonderState, setWonderState)
 */

(function () {

  const NEXT_STATE  = { neutral: 'been', been: 'want', want: 'neutral' };
  const STATE_LABEL = { neutral: 'Not visited', been: 'Been', want: 'Want to go' };

  const SECTIONS = [
    { key: 'natural',  title: '🌿 Natural Wonders' },
    { key: 'cultural', title: '🏛️ Cultural Sites' }
  ];

  let section = 'all';      // all | natural | cultural
  let filter  = 'all';      // all | been | want | neutral | bottle
  let built   = false;

  // Sticker size follows the board width, not the window
  function hexSize(boardWidth) {
    const width = boardWidth < 420 ? 80 : boardWidth < 760 ? 96 : 108;
    return { w: width, h: Math.round(width * 1.1547), gap: boardWidth < 420 ? 5 : 7 };
  }

  function matches(wonder) {
    const status = getWonderState(wonder.name);
    if (filter === 'bottle') return !!wonder.bottle;
    if (filter === 'all')    return true;
    return status === filter;
  }

  function count(list, pred) { return list.filter(pred).length; }

  // ── Summary chips ───────────────────────────────────────────────────────────

  function renderSummary() {
    const el = document.getElementById('stickersSummary');
    if (!el) return;
    const all    = [...WONDERS_DATA.natural, ...WONDERS_DATA.cultural];
    const been   = w => getWonderState(w.name) === 'been';
    const bottle = all.filter(w => w.bottle);
    el.innerHTML = `
      <div class="collection-stat"><strong>${count(all, been)}</strong><span>of ${all.length} collected</span></div>
      <div class="collection-stat"><strong>${count(WONDERS_DATA.natural, been)}</strong><span>🌿 natural</span></div>
      <div class="collection-stat"><strong>${count(WONDERS_DATA.cultural, been)}</strong><span>🏛️ cultural</span></div>
      <div class="collection-stat"><strong>${count(bottle, been)}/${bottle.length}</strong><span>🍶 bottle</span></div>
      <div class="collection-stat"><strong>${count(all, w => getWonderState(w.name) === 'want')}</strong><span>★ want to go</span></div>`;
  }

  // ── Honeycomb ───────────────────────────────────────────────────────────────

  function renderGrid(grid, wonders, kind, poppedName) {
    grid.innerHTML = '';
    if (wonders.length === 0) {
      grid.style.height = 'auto';
      grid.innerHTML = `<p class="wonders-empty">No stickers match this filter.</p>`;
      return;
    }

    const width  = grid.clientWidth || 440;
    const { w: W, h: H, gap } = hexSize(width);
    const stepX  = W + gap;
    const stepY  = Math.round(H * 0.75 + gap * 0.87);
    const cols   = Math.max(1, Math.floor((width - stepX / 2 + gap) / stepX));
    const rows   = Math.ceil(wonders.length / cols);
    const used   = cols * stepX - gap + (rows > 1 ? stepX / 2 : 0);
    const offset = Math.max(0, (width - used) / 2);

    grid.style.height = `${(rows - 1) * stepY + H}px`;
    grid.style.setProperty('--hex-w', `${W}px`);

    wonders.forEach((wonder, i) => {
      const row    = Math.floor(i / cols);
      const col    = i % cols;
      const status = getWonderState(wonder.name);

      const hex = document.createElement('button');
      hex.type = 'button';
      hex.className = `hex hex-${status} hex-${kind}` +
        (wonder.name === poppedName && status === 'been' ? ' hex-pop' : '');
      hex.style.left   = `${offset + col * stepX + (row % 2) * (stepX / 2)}px`;
      hex.style.top    = `${row * stepY}px`;
      hex.style.width  = `${W}px`;
      hex.style.height = `${H}px`;
      hex.title = `${wonder.name} — ${wonder.land}\n${STATE_LABEL[status]}` +
        `${wonder.bottle ? ' · 🍶 on the bottle' : ''}\nClick: Not visited → Been → Want → Not visited`;
      hex.setAttribute('aria-label', `${wonder.name}, ${STATE_LABEL[status]}`);
      hex.innerHTML = `
        <span class="hex-inner">
          ${status === 'want' ? '<span class="hex-star" aria-hidden="true">★</span>' : ''}
          <span class="hex-icon" aria-hidden="true">${wonder.icon || '📍'}</span>
          <span class="hex-name">${wonder.name}</span>
        </span>`;

      hex.addEventListener('click', () => {
        setWonderState(wonder.name, NEXT_STATE[getWonderState(wonder.name)]);
        renderSummary();
        renderGrid(grid, WONDERS_DATA[kind].filter(matches), kind, wonder.name);
        if (window.updateWonderCircles) window.updateWonderCircles();
      });

      grid.appendChild(hex);
    });
  }

  function renderBoards() {
    const boards = document.getElementById('stickerBoards');
    if (!boards) return;
    const visible = SECTIONS.filter(s => section === 'all' || section === s.key);

    boards.innerHTML = visible.map(s => `
      <section class="collection-board">
        <h3 class="collection-board-title">${s.title}
          <span>${count(WONDERS_DATA[s.key], w => getWonderState(w.name) === 'been')} / ${WONDERS_DATA[s.key].length}</span>
        </h3>
        <div class="hex-grid" data-kind="${s.key}"></div>
      </section>`).join('');

    boards.querySelectorAll('.hex-grid').forEach(grid => {
      const kind = grid.dataset.kind;
      renderGrid(grid, WONDERS_DATA[kind].filter(matches), kind);
    });
  }

  function render() {
    renderSummary();
    renderBoards();
  }

  // ── Build ───────────────────────────────────────────────────────────────────

  function build(container) {
    container.innerHTML = `
      <div class="collection-page">
        <div class="collection-header">
          <span class="card-eyebrow">Sticker book</span>
          <h2>Stickers</h2>
          <p class="collection-intro">Tap a sticker to collect it: not visited → been → want to go → not visited.</p>
        </div>

        <div class="collection-summary" id="stickersSummary"></div>

        <div class="collection-controls">
          <div class="wonders-section-toggle collection-sections">
            <button class="wonders-seg-btn active" data-section="all">All</button>
            <button class="wonders-seg-btn" data-section="natural">🌿 Natural</button>
            <button class="wonders-seg-btn" data-section="cultural">🏛️ Cultural</button>
          </div>
          <div class="cl-filters collection-filters">
            <button class="cl-filter-btn active" data-filter="all">All</button>
            <button class="cl-filter-btn" data-filter="been">Been</button>
            <button class="cl-filter-btn" data-filter="want">Want</button>
            <button class="cl-filter-btn" data-filter="neutral">Not visited</button>
            <button class="cl-filter-btn" data-filter="bottle" title="The 50 Let's Wander World Explorer bottle destinations">🍶 Bottle</button>
          </div>
        </div>

      </div>`;

    container.querySelectorAll('.collection-sections .wonders-seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.collection-sections .wonders-seg-btn').forEach(b => b.classList.toggle('active', b === btn));
        section = btn.dataset.section;
        renderBoards();
      });
    });

    container.querySelectorAll('.collection-filters .cl-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.collection-filters .cl-filter-btn').forEach(b => b.classList.toggle('active', b === btn));
        filter = btn.dataset.filter;
        renderBoards();
      });
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (container.style.display !== 'none') renderBoards();
      }, 120);
    });
  }

  // Called every time the tab opens, so it reflects changes made elsewhere
  window.initStickers = function () {
    const container = document.getElementById('stickersContent');
    if (!container) return;
    if (!built) { build(container); built = true; }
    render();
  };

})();
