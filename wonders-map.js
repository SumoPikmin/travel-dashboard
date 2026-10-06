/**
 * wonders-map.js — wonders on the map (Explore → Wonders)
 *
 * Shows the wonders you have NOT been to yet, following the Wonders list's
 * section (natural / cultural) and filter (want, bottle, …).
 *
 *   Zoomed out  → one badge per country: number of wonders still to see,
 *                 ring = share of that country's wonders already visited
 *   Zoomed in   → an emoji pin per wonder at its real location, styled like
 *                 the calendar's pins (★ badge = want to go)
 *
 * Clicking a country badge zooms in; clicking a pin scrolls the list to
 * that wonder. Hovering a wonder in the list highlights its pin.
 *
 * Depends on: map.js (TravelMap), wonders.js (getWonderMapItems, ll coords)
 */

(function () {

  const DETAIL_ZOOM = 2.5;      // at or above this zoom level, show individual wonders
  const PIN_R       = 14;       // emoji pin radius in screen pixels (same as calendar pins)
  const RING_R      = 11;
  const SPLIT_KM    = 1200;     // wonders this far from the rest of their country get their own badge

  let active   = false;
  let detailed = null;          // current mode, so zooming only re-renders on a mode change

  const ringArc = d3.arc().innerRadius(RING_R - 2.5).outerRadius(RING_R).startAngle(0);

  const state   = name => (window.wonderStates || {})[name] || 'neutral';
  const country = w => w.land.split(',')[0].trim();

  function layer() {
    const M = window.TravelMap;
    if (!M) return null;
    let l = M.svg.select('g.wonder-pins');
    if (l.empty()) {
      l = M.svg.append('g').attr('class', 'wonder-pins');
      M.zoom.on('zoom.wonders', ({ transform }) => {
        if (!active) return;
        const nowDetailed = transform.k >= DETAIL_ZOOM;
        if (nowDetailed !== detailed) render(); else position(transform);
      });
    }
    return l;
  }

  function position(transform) {
    const M = window.TravelMap;
    const t = transform || d3.zoomTransform(M.svg.node());
    M.svg.selectAll('g.wonder-pin').attr('transform', d => {
      const [x, y] = t.apply(d.xy);
      return `translate(${x},${y})`;
    });
  }

  function render() {
    const M = window.TravelMap;
    const l = layer();
    if (!M || !l) return;
    l.selectAll('*').remove();
    if (!active || !window.getWonderMapItems) return;

    const t = d3.zoomTransform(M.svg.node());
    detailed = t.k >= DETAIL_ZOOM;

    // Only wonders not visited yet
    const items = window.getWonderMapItems().filter(w => w.ll && state(w.name) !== 'been');
    const xyOf  = w => M.projection([w.ll[1], w.ll[0]]);

    if (detailed) {
      // Emoji pins, same look as the calendar's; ★ badge for "want to go"
      const pins = l.selectAll('g.wonder-pin')
        .data(items.map(w => ({ w, xy: xyOf(w) })), d => d.w.name)
        .enter().append('g')
        .attr('class', d => `wonder-pin wonder-emoji wonder-${state(d.w.name)}`)
        .attr('data-name', d => d.w.name)
        .on('click', (event, d) => focusListItem(d.w.name));
      pins.append('circle').attr('class', 'wonder-emoji-bg').attr('r', PIN_R);
      pins.append('text').attr('class', 'wonder-emoji-icon')
        .attr('text-anchor', 'middle').attr('dy', '0.35em')
        .text(d => d.w.icon || '📍');
      const want = pins.filter(d => state(d.w.name) === 'want');
      want.append('circle').attr('class', 'wonder-emoji-badge').attr('cx', 11).attr('cy', -11).attr('r', 7);
      want.append('text').attr('class', 'wonder-emoji-star')
        .attr('x', 11).attr('y', -11).attr('text-anchor', 'middle').attr('dy', '0.35em').text('★');
      pins.append('title').text(d => `${d.w.icon || ''} ${d.w.name}\n${d.w.land}` +
        (state(d.w.name) === 'want' ? '\n★ Want to go' : ''));
    } else {
      // One badge per country: count still to see + ring of what's visited.
      // Far-flung wonders (Gibraltar, Easter Island…) get their own badge so the
      // country's badge isn't averaged into the sea.
      const section = window.getWonderSectionItems ? window.getWonderSectionItems() : items;
      const groups  = [];
      d3.groups(items, country).forEach(([c, ws]) => {
        const clusters = [];
        ws.forEach(w => {
          const near = clusters.find(cl => d3.geoDistance([cl[0].ll[1], cl[0].ll[0]], [w.ll[1], w.ll[0]]) * 6371 < SPLIT_KM);
          if (near) near.push(w); else clusters.push([w]);
        });
        clusters.forEach((cws, i) => {
          // the main badge counts the whole country; outliers count only themselves
          const all     = i === 0 ? section.filter(w => country(w) === c && !clusters.slice(1).some(o => o.some(x => x.name === w.name)))
                                  : cws;
          const visited = all.filter(w => state(w.name) === 'been').length;
          const pts     = cws.map(xyOf);
          groups.push({
            country: c, key: `${c}#${i}`, ws: cws, total: all.length, visited,
            want: cws.some(w => state(w.name) === 'want'),
            xy: [d3.mean(pts, p => p[0]), d3.mean(pts, p => p[1])]
          });
        });
      });

      const pins = l.selectAll('g.wonder-pin')
        .data(groups, d => d.key)
        .enter().append('g')
        .attr('class', d => `wonder-pin wonder-cluster ${d.want ? 'wonder-cluster-want' : ''}`)
        .attr('data-names', d => d.ws.map(w => w.name).join('|'))
        .on('click', (event, d) => zoomTo(d.xy));
      pins.append('circle').attr('class', 'wonder-cluster-bg').attr('r', RING_R);
      pins.append('path').attr('class', 'wonder-cluster-ring')
        .attr('d', d => ringArc({ endAngle: d.total ? 2 * Math.PI * d.visited / d.total : 0 }));
      pins.append('text').attr('class', 'wonder-cluster-count')
        .attr('text-anchor', 'middle').attr('dy', '0.35em')
        .text(d => d.ws.length);
      pins.append('title').text(d =>
        `${d.country} — ${d.ws.length} still to see (${d.visited}/${d.total} visited)\n` +
        d.ws.map(w => `${w.icon || ''} ${w.name}${state(w.name) === 'want' ? ' ★' : ''}`).join('\n') +
        '\nClick to zoom in');
    }

    position(t);
  }

  function zoomTo(xy) {
    const M = window.TravelMap;
    const vb = M.svg.attr('viewBox').split(' ').map(Number);
    const k  = Math.max(DETAIL_ZOOM + 0.5, d3.zoomTransform(M.svg.node()).k);
    const t  = d3.zoomIdentity.translate(vb[2] / 2 - xy[0] * k, vb[3] / 2 - xy[1] * k).scale(k);
    M.svg.transition().duration(600).call(M.zoom.transform, t);
  }

  function focusListItem(name) {
    const li = [...document.querySelectorAll('#wondersList .wonders-item')].find(el => el.dataset.name === name);
    if (!li) return;
    li.scrollIntoView({ behavior: 'smooth', block: 'center' });
    li.classList.remove('cal-flash');
    void li.offsetWidth;
    li.classList.add('cal-flash');
  }

  window.highlightWonderMarker = function (name, on) {
    const M = window.TravelMap;
    if (!M || !active) return;
    M.svg.selectAll('g.wonder-pin').classed('wonder-pin-hot', function () {
      if (!on) return false;
      if (this.getAttribute('data-name') === name) return true;
      return (this.getAttribute('data-names') || '').split('|').includes(name);
    });
  };

  window.showWonderMap  = function () { active = true;  render(); };
  window.leaveWonderMap = function () { if (!active) return; active = false; detailed = null; render(); };
  window.refreshWonderMap = function () { if (active) render(); };

})();
