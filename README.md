# 🌍 Travel Dashboard

A personal, browser-based travel tracking app built with vanilla JavaScript, D3.js and TopoJSON. Track countries you've visited, want to visit, and wonders of the world — all saved locally in your browser.

---

## Project Structure

```
travel-dashboard/
├── index.html          # Main HTML file
├── style.css           # All styles
├── map.js              # Interactive world map logic (D3.js)
├── stats.js            # Statistics tab logic
├── wonders.js          # Wonders of the World tab logic
└── data/
    ├── countries-110m.json   # TopoJSON world map data
    └── favicon.png           # App icon
```

---

## Features

### 🗺️ Home — Interactive World Map
- Click any country to cycle its status: Neutral → Been → Want to go → Neutral
- Hover over countries to see the country name, flag, current status, and any wonders located there
- Zoom with mouse wheel, pan by dragging
- Search for countries by name with autocomplete
- Small countries not visible on the map (e.g. Singapore, Monaco, Liechtenstein, Vatican City) can still be found and marked via the search bar
- Progress is saved automatically to localStorage on every click
- Export progress as a JSON file and re-import it on another device

### 📊 Stats — Statistics Tab
- Worldwide progress circle showing percentage of countries visited
- Per-continent breakdown with individual circles for Europe, Asia, Africa, Americas and Oceania
- Full alphabetical country list with collapsible letter sections
- Filter countries by status: All, Been, Want, Neutral

### 🏛️ Wonders — Wonders of the World Tab
- Toggle between Natural Wonders and Cultural Sites
- Mark each wonder as Been, Want to go, or Neutral
- Filter by status
- Progress saved automatically to localStorage separately from country data

---

## Getting Started

Because the app fetches `data/countries-110m.json` via the Fetch API, it must be served over HTTP — it will not work when opened directly as a `file://` URL due to browser CORS restrictions.

### Option 1 — VS Code Live Server (recommended)
1. Install the **Live Server** extension by Ritwick Dey
2. Right-click `index.html` → **Open with Live Server**
3. The app opens at `http://127.0.0.1:5500`

### Option 2 — Python
```bash
python -m http.server 8080
# Open http://localhost:8080
```

### Option 3 — Node.js
```bash
npx serve .
# Open http://localhost:3000
```

---

## Map Data

The world map uses the `countries-110m.json` file in the `data/` folder, which is a TopoJSON file at 110m resolution from the [world-atlas](https://github.com/topojson/world-atlas) package.

If the file is missing, download it:
```bash
curl -o data/countries-110m.json https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json
```

---

## Data Persistence

All progress is saved to the browser's `localStorage` under two keys:

| Key | Contents |
|-----|----------|
| `travel_map_states_v1` | Country statuses (been / want) |
| `wonders_states_v1` | Wonder statuses (been / want) |

To sync across devices, use the **Save Progress** button to export a JSON file and **Load Progress** to import it on another device.

---

## Dependencies

All loaded via CDN — no install required.

| Library | Version | Purpose |
|---------|---------|---------|
| [D3.js](https://d3js.org/) | 7.8.5 | Map rendering, zoom, pan |
| [TopoJSON Client](https://github.com/topojson/topojson-client) | 3.1.0 | Parsing world map data |

---

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Requires JavaScript enabled.
