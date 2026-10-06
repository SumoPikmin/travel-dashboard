# Roadmap — feature to-do list

Ideas discussed but not built yet. Move items to "Done" (with the commit) when they ship.

## Next up

### 🤖 LLM trip advisor for "Where to go"
Use an LLM to recommend **where to go in a given month** from the user's wishlist
and the season data, instead of the current plain in-season filter.

**Today (for comparison):** `where-to-go.js` only filters — an item is shown when the
month is in its best months / event months. No ranking, no weighting, no reasons.

**Inputs to send** (all already in the app):
- The selected month (and optionally trip length, budget, home airport)
- Wishlist: ★ want countries (+ 🎯 next / 🗓️ long-term priority), want wonders, want calendar events
- Season data: country best months (`seasons-data.js`), wonder best months (`wonders.js`),
  event dates and peak months (`calendar-data.js`)
- Context: countries / wonders already visited, past trips (to avoid repeats)

**Expected output:** a short ranked list (e.g. top 3–5 destinations) with
- why it fits that month (season, events, peak nature)
- which wishlist wonders and events can be combined in one trip
- caveats (monsoon edge, crowds, heat, festival price surge)
- returned as structured JSON so the panel can render cards and map pins

**Technical notes:**
- The site is static (GitHub Pages) — an API key must **never** be shipped in the
  front-end. Needs a small server-side proxy (e.g. Cloudflare Worker or a
  Supabase Edge Function, which would also host cloud sync) that holds the key.
- Use the Claude API; choose the model at implementation time (balance cost/latency).
- Send only the minimal data needed; no personal info beyond the wishlist.
- Cache answers per month + wishlist hash to keep costs low; add a "Refresh" button.
- Keep the current rule-based filter as the offline / no-key fallback.
- Ground the model in the app's data (pass it in the prompt) so it doesn't invent
  dates; show dates from `calendar-data.js`, not from the model.

### 📊 Rule-based ranking for "Where to go" (quick win before the LLM)
Score each match: in season +1, peak month +1, wonder/event in that country that month
+1 each, 🎯 Next up +1 — and sort results by score.

### ☁️ Cloud sync (Supabase, email login link)
Progress follows you across devices instead of Save/Load Progress files.
Needs the user to create a free Supabase project. Also the natural home for the LLM proxy.

## Backlog

- **Calendar year view** — 12-column timeline (rows = events, bars = season, darker = peak) on the right side.
- **"Next up" card on Home** — countdown to the next 3 starred events.
- **Calendar events as stickers** in Collection.
- **Verify `seasons-data.js`** with sources, like the calendar research (currently general knowledge).
- **Scheduled monthly calendar refresh** — an automated task that runs the update from
  `docs/calendar-maintenance.md` and opens a pull request for review.
- **More bucket lists** for the "coming soon" badges: European capitals, UNESCO sites,
  national parks, Seven Summits, distance per trip (Around the World / To the Moon).
- **Better phone layout** — bottom tabs, map as its own tab.

## Done

| Feature | Commit |
|---|---|
| Where to go (rule-based filter), Calendar, wonders map, dark mode, new icon | `b6774f2` |
| Stickers & Badges, 5-tab navigation | `2cc6633` |
| Curated wonders list, icons, bottle tag | `c4292a1` |
