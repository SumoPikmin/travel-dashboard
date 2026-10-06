# Calendar data — monthly update

> **Refresh the festival & nature calendar at the start of every month.**
> Festival dates move every year (Easter, lunar calendars, "last Tuesday of
> January"…), many are only announced a few months ahead, and past dates
> must be rolled forward to the next edition.

The data lives in [`calendar-data.js`](../calendar-data.js). The readable overview
[`calendar-research.md`](calendar-research.md) is generated from it.

## Checklist

1. **See what needs work**
   ```bash
   node tools/calendar-check.js
   ```
   It lists festivals whose dates are all in the past, festivals without
   announced dates, provisional information to confirm, finished one-off
   events, and warns when the data is more than a month old.

2. **Research and edit `calendar-data.js`**
   - Add the **next edition's dates** for anything flagged (prefer official
     sites: city/tourism boards, organisers, national parks).
   - Replace "expected" dates with confirmed ones (e.g. Harbin, Boryeong).
   - Remove past one-off events (e.g. the 2027 eclipse after August 2027).
   - Optionally add new events — keep `land` names identical to `map.js`.
   - Add the source URL to `sources`.
   - Set `CALENDAR_META.updated` to today and `nextReview` to the 1st of next month.

3. **Validate** — must end with "No errors":
   ```bash
   node tools/calendar-check.js
   ```

4. **Regenerate the overview**
   ```bash
   node tools/calendar-doc.js
   ```

5. **Bump the service-worker cache** (`CACHE_VERSION` in `sw.js`), commit and push.

## Known items for the next updates

| When | What |
|---|---|
| Nov 2026 | Harbin Ice & Snow World — confirm official 2026/27 opening dates |
| Dec 2026 | Roll Day of the Dead, Diwali, Pushkar, Yi Peng, Christmas markets forward to 2027 |
| Spring 2027 | Synchronous fireflies (Smokies) — park announces the 8 viewing nights + lottery |
| Spring 2027 | Boryeong Mud Festival 2027 dates |
| Every month | Northern-hemisphere festivals for next year start being announced from late summer |
| After Aug 2027 | Remove the 2 Aug 2027 total solar eclipse |

## Update log

| Date | By | Notes |
|---|---|---|
| 2026-10-06 | Initial research | 42 festivals, 31 nature events |
