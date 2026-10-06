/**
 * calendar-data.js — Festival & nature calendar data (researched October 2026)
 *
 * Exposes window.CALENDAR_EVENTS (used by calendar.js) and window.CALENDAR_META.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ MONTHLY UPDATE — refresh this data at the start of every month.     │
 * │ Dates move every year and many are only announced a few months     │
 * │ ahead. Checklist: docs/calendar-maintenance.md                       │
 * │   1. node tools/calendar-check.js   → lists what needs updating     │
 * │   2. research + edit this file, bump CALENDAR_META.updated          │
 * │   3. node tools/calendar-check.js   → must report no errors         │
 * │   4. node tools/calendar-doc.js     → regenerates the research doc  │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Fields
 *   id          stable key (used for been/want state, like wonder names)
 *   type        'festival' | 'nature'
 *   category    festival: carnival · religious · cultural · music · light · winter · food
 *               nature:   bloom · wildlife · marine · sky · landscape
 *   name, icon, place
 *   land        country names exactly as in map.js (comma separated, like wonders)
 *   months      months (1–12) when it happens / can be seen
 *   peak        best months (nature only, optional)
 *   dates       confirmed upcoming dates [{ from, to, label? }] (ISO yyyy-mm-dd)
 *   rule        how the date is set each year — lets the app explain or compute it
 *   recurrence  'yearly' | 'once' | 'every 12 years'
 *   wonder      matching entry in WONDERS_ALL (optional)
 *   wiki, sources
 *   note        practical tip (optional)
 */

window.CALENDAR_META = {
  updated:    '2026-10-06',   // last time the data was researched
  nextReview: '2026-11-01'    // first of next month
};

window.CALENDAR_EVENTS = [

  // ════════════════════════════════════════════════════════════════════
  //  FESTIVALS
  // ════════════════════════════════════════════════════════════════════

  // ── January ─────────────────────────────────────────────────────────
  { id: 'hogmanay', type: 'festival', category: 'cultural', name: 'Hogmanay', icon: '🎇',
    place: 'Edinburgh', land: 'United Kingdom', months: [12, 1],
    dates: [{ from: '2026-12-30', to: '2027-01-01' }],
    rule: 'Fixed: 30 December – 1 January (torchlight procession, street party, fireworks over the castle)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Hogmanay', sources: [] },

  { id: 'junkanoo', type: 'festival', category: 'carnival', name: 'Junkanoo', icon: '🎉',
    place: 'Nassau', land: 'Bahamas', months: [12, 1],
    dates: [{ from: '2026-12-26', to: '2026-12-26', label: 'Boxing Day parade' },
            { from: '2027-01-01', to: '2027-01-01', label: "New Year's Day parade" }],
    rule: 'Fixed: street parades on 26 December and 1 January, from the early hours of the morning',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Junkanoo', sources: [] },

  { id: 'cape-town-minstrels', type: 'festival', category: 'carnival', name: 'Cape Town Minstrel Carnival', icon: '🎺',
    place: 'Cape Town', land: 'South Africa', months: [1],
    dates: [{ from: '2027-01-02', to: '2027-01-02', label: 'Tweede Nuwe Jaar parade' }],
    rule: 'Fixed: 2 January ("Tweede Nuwe Jaar"), with competitions through January',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Cape_Town_Minstrel_Carnival', sources: [] },

  { id: 'harbin', type: 'festival', category: 'winter', name: 'Harbin Ice & Snow Festival', icon: '❄️',
    place: 'Harbin', land: 'China', months: [12, 1, 2],
    dates: [{ from: '2026-12-20', to: '2027-02-28', label: 'Ice & Snow World (expected)' },
            { from: '2027-01-05', to: '2027-01-05', label: 'Official opening' }],
    rule: 'Official opening 5 January; Ice & Snow World opens around 20 December and runs until the ice melts (late February)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Harbin_International_Ice_and_Snow_Sculpture_Festival',
    sources: ['https://www.chinahighlights.com/harbin/attraction/harbin-international-ice-and-snow-festival.htm'],
    note: 'Expect −20 °C or colder. 2026/27 park dates are expected, not yet officially confirmed.' },

  { id: 'timkat', type: 'festival', category: 'religious', name: 'Timkat (Ethiopian Epiphany)', icon: '💧',
    place: 'Gondar, Lalibela, Addis Ababa', land: 'Ethiopia', months: [1],
    dates: [{ from: '2027-01-18', to: '2027-01-20' }],
    rule: 'Fixed: 19 January (20 January in Ethiopian leap years), celebrated over three days from the 18th',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Timkat',
    sources: ['https://www.responsibletravel.com/holidays/festivals/travel-guide/timkat-festival-ethiopia'],
    note: 'Gondar (Fasilides’ Bath) is the most spectacular spot. UNESCO intangible heritage.' },

  { id: 'up-helly-aa', type: 'festival', category: 'cultural', name: 'Up Helly Aa', icon: '🔥',
    place: 'Lerwick, Shetland', land: 'United Kingdom', months: [1],
    dates: [{ from: '2027-01-26', to: '2027-01-26' }],
    rule: 'Last Tuesday of January: torch-lit procession ending with the burning of a Viking galley',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Up_Helly_Aa',
    sources: ['https://www.uphellyaa.org/up-helly-aa-2027/', 'https://www.shetland.org/visit/events/lerwick-uha'] },

  // ── February ────────────────────────────────────────────────────────
  { id: 'venice-carnival', type: 'festival', category: 'carnival', name: 'Venice Carnival', icon: '🎭',
    place: 'Venice', land: 'Italy', months: [1, 2], wonder: 'Venice',
    dates: [{ from: '2027-01-30', to: '2027-02-09' }],
    rule: 'Movable: ends on Shrove Tuesday (47 days before Easter). Early in 2027 because Easter is 28 March',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Carnival_of_Venice',
    sources: ['https://tripprof.com/en/blog/best-carnivals-2027/'] },

  { id: 'cologne-carnival', type: 'festival', category: 'carnival', name: 'Cologne Carnival', icon: '🤡',
    place: 'Cologne', land: 'Germany', months: [2],
    dates: [{ from: '2027-02-04', to: '2027-02-09', label: 'Street carnival (Rosenmontag parade 8 Feb)' }],
    rule: 'Movable: Weiberfastnacht (Thursday) to Veilchendienstag, the six days before Ash Wednesday',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Cologne_Carnival',
    sources: ['https://www.koeln.de/karneval/wann-ist-karneval/', 'https://www.cologne-tourism.com/carnival'] },

  { id: 'sapporo-snow', type: 'festival', category: 'winter', name: 'Sapporo Snow Festival', icon: '⛄',
    place: 'Sapporo, Hokkaido', land: 'Japan', months: [2],
    dates: [{ from: '2027-02-04', to: '2027-02-11' }],
    rule: 'About one week in early February (Odori, Susukino and Tsudome sites)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Sapporo_Snow_Festival',
    sources: ['https://blog.wego.com/sapporo-snow-festival/'] },

  { id: 'rio-carnival', type: 'festival', category: 'carnival', name: 'Rio Carnival', icon: '💃',
    place: 'Rio de Janeiro', land: 'Brazil', months: [2, 3], wonder: 'Christ the Redeemer',
    dates: [{ from: '2027-02-05', to: '2027-02-13' },
            { from: '2027-02-07', to: '2027-02-09', label: 'Grupo Especial at the Sambadrome' },
            { from: '2027-02-13', to: '2027-02-13', label: 'Champions Parade' }],
    rule: 'Movable: the Friday to Ash Wednesday before Lent (Easter − 47 days), Champions Parade the following Saturday',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Rio_Carnival',
    sources: ['https://riocarnaval.org/carnival-date/date', 'https://riocarnaval.org/samba-parade/samba-parade'] },

  { id: 'quebec-carnival', type: 'festival', category: 'winter', name: 'Québec Winter Carnival', icon: '☃️',
    place: 'Québec City', land: 'Canada', months: [2],
    dates: [{ from: '2027-02-05', to: '2027-02-14' }],
    rule: 'Ten days in early to mid February (ice palace, night parades, canoe race on the St. Lawrence)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Quebec_Winter_Carnival',
    sources: ['https://www.bonjourquebec.com/en/listing/events/carnaval-de-quebec-en-collaboration-avec-loto-quebec/0rgb'] },

  { id: 'barranquilla-carnival', type: 'festival', category: 'carnival', name: 'Barranquilla Carnival', icon: '🥁',
    place: 'Barranquilla', land: 'Colombia', months: [2],
    dates: [{ from: '2027-02-06', to: '2027-02-09' }],
    rule: 'Movable: Saturday to Tuesday before Ash Wednesday; season opens mid-January with the Lectura del Bando',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Barranquilla%27s_Carnival',
    sources: ['https://www.calendarr.com/colombia/carnaval-de-barranquilla/'],
    note: 'UNESCO Masterpiece of the Oral and Intangible Heritage of Humanity.' },

  { id: 'chinese-new-year', type: 'festival', category: 'cultural', name: 'Chinese New Year', icon: '🧧',
    place: 'China, Hong Kong, Taiwan, Singapore', land: 'China', months: [1, 2],
    dates: [{ from: '2027-02-06', to: '2027-02-20', label: 'Year of the Goat, ending with the Lantern Festival' }],
    rule: 'Lunar: second new moon after the winter solstice (21 January – 20 February); lasts 15 days',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Chinese_New_Year',
    sources: ['https://www.chinahighlights.com/travelguide/festivals/chinese-new-year-calendar.htm'],
    note: 'Peak domestic travel in China (Chunyun) — book trains early.' },

  { id: 'trinidad-carnival', type: 'festival', category: 'carnival', name: 'Trinidad Carnival', icon: '🪶',
    place: 'Port of Spain', land: 'Trinidad and Tobago', months: [2],
    dates: [{ from: '2027-02-08', to: '2027-02-09', label: 'Carnival Monday & Tuesday' }],
    rule: 'Movable: Monday and Tuesday before Ash Wednesday; J’ouvert at dawn on Monday',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Trinidad_and_Tobago_Carnival',
    sources: ['https://www.officeholidays.com/holidays/trinidad-and-tobago/trinidad-and-tobago-carnival', 'https://visittrinidad.tt/things-to-do/carnival/'] },

  { id: 'mardi-gras', type: 'festival', category: 'carnival', name: 'Mardi Gras', icon: '⚜️',
    place: 'New Orleans', land: 'United States of America', months: [1, 2, 3],
    dates: [{ from: '2027-01-06', to: '2027-02-09', label: 'Carnival season (parades build up to Fat Tuesday)' },
            { from: '2027-02-09', to: '2027-02-09', label: 'Fat Tuesday' }],
    rule: 'Movable: Fat Tuesday is 47 days before Easter; parade season starts 6 January',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Mardi_Gras_in_New_Orleans',
    sources: ['https://www.farmersalmanac.com/when-is-mardi-gras'] },

  { id: 'pingxi-lanterns', type: 'festival', category: 'light', name: 'Pingxi Sky Lantern Festival', icon: '🏮',
    place: 'Pingxi, New Taipei', land: 'Taiwan', months: [2, 3],
    dates: [{ from: '2027-02-20', to: '2027-02-20' }],
    rule: 'Lunar: Lantern Festival, 15th day of the first lunar month (15 days after Chinese New Year)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Pingxi_Sky_Lantern_Festival',
    sources: ['https://www.chinahighlights.com/travelguide/festivals/chinese-new-year-calendar.htm'] },

  // ── March ───────────────────────────────────────────────────────────
  { id: 'nyepi', type: 'festival', category: 'religious', name: 'Nyepi (Day of Silence)', icon: '🤫',
    place: 'Bali', land: 'Indonesia', months: [3], wonder: 'Bali (Pura Lempuyang)',
    dates: [{ from: '2027-03-07', to: '2027-03-07', label: 'Ogoh-ogoh parades (evening)' },
            { from: '2027-03-08', to: '2027-03-08', label: 'Nyepi — island shuts down for 24 h' }],
    rule: 'Balinese Saka calendar: new year, usually in March; ogoh-ogoh monster parades the night before',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Nyepi',
    sources: ['https://www.officeholidays.com/holidays/indonesia/hari-raya-nyepi'],
    note: 'Airport closes for 24 hours and you must stay in your hotel — plan around it.' },

  { id: 'las-fallas', type: 'festival', category: 'cultural', name: 'Las Fallas', icon: '🎆',
    place: 'Valencia', land: 'Spain', months: [3],
    dates: [{ from: '2027-03-15', to: '2027-03-19', label: 'Main days, ending with La Cremà (burning)' }],
    rule: 'Fixed: 15–19 March; daily mascletà fireworks at 14:00 from 1 March',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Falles',
    sources: ['https://visitvalencia.com/en/events-valencia/festivities/the-fallas/questions-fallas'] },

  { id: 'holi', type: 'festival', category: 'religious', name: 'Holi', icon: '🎨',
    place: 'Mathura & Vrindavan (and all of India)', land: 'India', months: [3],
    dates: [{ from: '2027-03-21', to: '2027-03-22', label: 'Holika Dahan bonfires, then Holi' }],
    rule: 'Lunar: full moon of Phalguna (late February – March)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Holi',
    sources: ['https://www.travelindiasmart.com/festivals-culture/holi-2027-foreign-visitors'],
    note: 'Mathura/Vrindavan celebrate for about a week before the main day.' },

  { id: 'semana-santa-sevilla', type: 'festival', category: 'religious', name: 'Semana Santa', icon: '🕯️',
    place: 'Seville', land: 'Spain', months: [3, 4],
    dates: [{ from: '2027-03-21', to: '2027-03-28', label: 'Palm Sunday to Easter Sunday' }],
    rule: 'Movable: the week before Easter (Easter 2027: 28 March)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Holy_Week_in_Seville',
    sources: ['https://tripprof.com/en/blog/best-carnivals-2027/'] },

  // ── April ───────────────────────────────────────────────────────────
  { id: 'feria-de-abril', type: 'festival', category: 'cultural', name: 'Feria de Abril', icon: '🌹',
    place: 'Seville', land: 'Spain', months: [4, 5],
    dates: [{ from: '2027-04-12', to: '2027-04-12', label: 'Pescaíto dinner & Alumbrado (lighting) at midnight' },
            { from: '2027-04-13', to: '2027-04-18', label: 'Fair days' }],
    rule: 'Movable: about two weeks after Easter, so April or early May',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Seville_Fair',
    sources: ['https://www.civitatis.com/blog/sevilla-planes-feria-abril/', 'https://icalendario.net/fiestas-populares/feria-de-sevilla'],
    note: 'Most casetas (tents) are private — look for the public ones or go with a local.' },

  { id: 'songkran', type: 'festival', category: 'cultural', name: 'Songkran', icon: '💦',
    place: 'Bangkok, Chiang Mai (all of Thailand)', land: 'Thailand', months: [4],
    dates: [{ from: '2027-04-13', to: '2027-04-15' }],
    rule: 'Fixed: 13–15 April (Thai New Year); Chiang Mai often celebrates for longer',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Songkran_(Thailand)',
    sources: ['https://en.wikipedia.org/wiki/Songkran_(Thailand)'],
    note: 'Nationwide water fight — bring a waterproof phone pouch.' },

  { id: 'kings-day', type: 'festival', category: 'cultural', name: "King's Day (Koningsdag)", icon: '👑',
    place: 'Amsterdam', land: 'Netherlands', months: [4],
    dates: [{ from: '2027-04-27', to: '2027-04-27' }],
    rule: 'Fixed: 27 April (26 April when the 27th is a Sunday) — the whole country wears orange',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/King%27s_Day_(Netherlands)', sources: [] },

  // ── May – June ──────────────────────────────────────────────────────
  { id: 'vivid-sydney', type: 'festival', category: 'light', name: 'Vivid Sydney', icon: '💡',
    place: 'Sydney', land: 'Australia', months: [5, 6], wonder: 'Sydney Opera House',
    dates: [{ from: '2027-05-28', to: '2027-06-19' }],
    rule: 'Late May to mid June: light projections on the Opera House, music and talks',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Vivid_Sydney',
    sources: ['https://www.sydney.com/destinations/sydney/sydney-city/sydney-harbour/events/vivid-sydney-2027'] },

  { id: 'inti-raymi', type: 'festival', category: 'cultural', name: 'Inti Raymi', icon: '☀️',
    place: 'Cusco (Sacsayhuamán)', land: 'Peru', months: [6], wonder: 'Machu Picchu',
    dates: [{ from: '2027-06-24', to: '2027-06-24' }],
    rule: 'Fixed: 24 June — Inca Festival of the Sun at Qorikancha, Plaza de Armas and Sacsayhuamán',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Inti_Raymi',
    sources: ['https://en.wikipedia.org/wiki/Inti_Raymi'],
    note: 'Combine with Machu Picchu — dry season, but book trains early.' },

  { id: 'midsummer-sweden', type: 'festival', category: 'cultural', name: 'Midsummer (Midsommar)', icon: '🌼',
    place: 'Dalarna, Stockholm archipelago', land: 'Sweden', months: [6],
    dates: [{ from: '2027-06-25', to: '2027-06-26' }],
    rule: 'Midsummer Eve is the Friday between 19 and 25 June',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Midsummer#Sweden',
    sources: ['https://www.officeholidays.com/holidays/sweden/sweden-midsummer-day'] },

  // ── July ────────────────────────────────────────────────────────────
  { id: 'san-fermin', type: 'festival', category: 'cultural', name: 'San Fermín', icon: '🐂',
    place: 'Pamplona', land: 'Spain', months: [7],
    dates: [{ from: '2027-07-06', to: '2027-07-14' }],
    rule: 'Fixed: 6–14 July, starting with the Chupinazo at noon on the 6th',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/San_Ferm%C3%ADn', sources: [] },

  { id: 'naadam', type: 'festival', category: 'cultural', name: 'Naadam', icon: '🏹',
    place: 'Ulaanbaatar', land: 'Mongolia', months: [7],
    dates: [{ from: '2027-07-11', to: '2027-07-13' }],
    rule: 'Fixed: 11–13 July — wrestling, horse racing and archery',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Naadam',
    sources: ['https://mongolia-guide.com/about-mongolia/tradition/naadam-festival'] },

  { id: 'gion-matsuri', type: 'festival', category: 'religious', name: 'Gion Matsuri', icon: '⛩️',
    place: 'Kyoto', land: 'Japan', months: [7], wonder: 'Kyoto Temples',
    dates: [{ from: '2027-07-17', to: '2027-07-17', label: 'Yamaboko float parade (23 floats)' },
            { from: '2027-07-24', to: '2027-07-24', label: 'Second parade (11 floats)' }],
    rule: 'Fixed: all of July; float parades on 17 and 24 July, Yoiyama street evenings on 14–16 and 21–23 July',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Gion_Matsuri',
    sources: ['https://en.japantravel.com/event/gion-matsuri/32852'] },

  { id: 'boryeong-mud', type: 'festival', category: 'cultural', name: 'Boryeong Mud Festival', icon: '🟤',
    place: 'Daecheon Beach, Boryeong', land: 'South Korea', months: [7, 8],
    dates: [],
    rule: 'About two weeks from late July into August (2026: 24 July – 9 August); 2027 dates not yet announced',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Boryeong_Mud_Festival',
    sources: ['https://www.wboc.com/online_features/press_releases/boryeong-mud-festival-2026-takes-flight-at-daecheon-beach-k-pop-stars-drone-displays-global/article_e5d98678-c9a1-5396-8a49-0b93ebc6db22.html'] },

  // ── August – September ──────────────────────────────────────────────
  { id: 'edinburgh-fringe', type: 'festival', category: 'music', name: 'Edinburgh Festival Fringe', icon: '🎤',
    place: 'Edinburgh', land: 'United Kingdom', months: [8],
    dates: [{ from: '2027-08-06', to: '2027-08-30' }],
    rule: 'About three and a half weeks in August — the world’s largest arts festival',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Edinburgh_Festival_Fringe',
    sources: ['https://www.chortle.co.uk/news/2026/09/02/61543/edinburgh_fringe_rejects_calls_to_bring_2027_event_earlier'] },

  { id: 'kumbh-mela-nashik', type: 'festival', category: 'religious', name: 'Kumbh Mela (Nashik Simhastha)', icon: '🙏',
    place: 'Nashik & Trimbakeshwar', land: 'India', months: [7, 8, 9],
    dates: [{ from: '2027-08-02', to: '2027-08-02', label: '1st Amrit Snan (holy dip)' },
            { from: '2027-08-31', to: '2027-08-31', label: '2nd Amrit Snan — main bathing day' },
            { from: '2027-09-11', to: '2027-09-11', label: '3rd Amrit Snan' }],
    rule: 'Every 12 years per site (astrological); Nashik mela runs 31 Oct 2026 – 24 Jul 2028, peak bathing days Aug–Sep 2027',
    recurrence: 'every 12 years', wiki: 'https://en.wikipedia.org/wiki/Kumbh_Mela',
    sources: ['https://www.sakshipost.com/news/maha-govt-releases-schedule-2027-nashik-kumbh-mela-preparations-begin-414383'],
    note: 'Once-in-12-years in Nashik — the world’s largest religious gathering. Expect enormous crowds on bathing days.' },

  { id: 'la-tomatina', type: 'festival', category: 'food', name: 'La Tomatina', icon: '🍅',
    place: 'Buñol (near Valencia)', land: 'Spain', months: [8],
    dates: [{ from: '2027-08-25', to: '2027-08-25' }],
    rule: 'Last Wednesday of August — one-hour tomato fight (ticketed)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/La_Tomatina',
    sources: ['https://en.wikipedia.org/wiki/La_Tomatina'] },

  { id: 'notting-hill', type: 'festival', category: 'carnival', name: 'Notting Hill Carnival', icon: '🥳',
    place: 'London', land: 'United Kingdom', months: [8], wonder: 'Big Ben',
    dates: [{ from: '2027-08-29', to: '2027-08-30' }],
    rule: 'August bank holiday weekend: Sunday family day, Monday main parade',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Notting_Hill_Carnival',
    sources: ['https://days.to/notting-hill-carnival/2027'] },

  { id: 'burning-man', type: 'festival', category: 'music', name: 'Burning Man', icon: '🎪',
    place: 'Black Rock Desert, Nevada', land: 'United States of America', months: [8, 9],
    dates: [{ from: '2027-08-29', to: '2027-09-06' }],
    rule: 'Nine days ending on Labor Day (first Monday of September)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Burning_Man',
    sources: ['https://burningman.org/black-rock-city/black-rock-city-2027/'] },

  { id: 'oktoberfest', type: 'festival', category: 'food', name: 'Oktoberfest', icon: '🍺',
    place: 'Munich', land: 'Germany', months: [9, 10],
    dates: [{ from: '2027-09-18', to: '2027-10-03' }],
    rule: 'Saturday after 15 September until the first Sunday of October (extended to 3 October, German Unity Day, when needed)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Oktoberfest',
    sources: ['https://www.oktoberfesttours.travel/oktoberfest-2027/', 'https://oktoberfest-guide.com/faqs/when-does-oktoberfest-take-place/'],
    note: 'Tents fill by midday on weekends — go on a weekday morning or reserve a table.' },

  // ── October – December ──────────────────────────────────────────────
  { id: 'balloon-fiesta', type: 'festival', category: 'cultural', name: 'Albuquerque Balloon Fiesta', icon: '🎈',
    place: 'Albuquerque, New Mexico', land: 'United States of America', months: [10],
    dates: [{ from: '2026-10-03', to: '2026-10-11' }, { from: '2027-10-02', to: '2027-10-10' }],
    rule: 'Nine days starting the first Saturday of October; mass ascensions at dawn',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Albuquerque_International_Balloon_Fiesta',
    sources: ['https://independenttravelcats.com/attending-albuquerque-balloon-fiesta/'] },

  { id: 'diwali', type: 'festival', category: 'religious', name: 'Diwali', icon: '🪔',
    place: 'Varanasi, Jaipur (all of India)', land: 'India', months: [10, 11],
    dates: [{ from: '2026-11-08', to: '2026-11-08' }, { from: '2027-10-29', to: '2027-10-29' }],
    rule: 'Lunar: new moon (Amavasya) of Kartika, mid-October to mid-November; festivities span five days',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Diwali',
    sources: ['https://publicholidays.in/diwali-deepavali/'] },

  { id: 'day-of-the-dead', type: 'festival', category: 'religious', name: 'Day of the Dead (Día de Muertos)', icon: '💀',
    place: 'Mexico City, Oaxaca, Pátzcuaro', land: 'Mexico', months: [10, 11],
    dates: [{ from: '2026-10-31', to: '2026-10-31', label: 'Grand parade, Mexico City' },
            { from: '2026-11-01', to: '2026-11-02' },
            { from: '2027-11-01', to: '2027-11-02' }],
    rule: 'Fixed: 1–2 November; Mexico City’s parades run in the weeks before (alebrijes, catrinas, grand parade)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Day_of_the_Dead',
    sources: ['https://cdmxsecreta.com/en/date-of-the-2026-day-of-the-dead-parade-in-mexico-city/'] },

  { id: 'pushkar-fair', type: 'festival', category: 'cultural', name: 'Pushkar Camel Fair', icon: '🐪',
    place: 'Pushkar, Rajasthan', land: 'India', months: [10, 11],
    dates: [{ from: '2026-11-17', to: '2026-11-24' }],
    rule: 'Lunar: about a week up to Kartik Purnima (full moon of Kartika), set by the local administration',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Pushkar_Fair',
    sources: ['https://hindutone.com/festivals/pushkar-fair-2026/'],
    note: 'Camel trading peaks in the first days; the religious bathing on the full moon.' },

  { id: 'yi-peng', type: 'festival', category: 'light', name: 'Yi Peng & Loy Krathong', icon: '🌕',
    place: 'Chiang Mai', land: 'Thailand', months: [11],
    dates: [{ from: '2026-11-24', to: '2026-11-25' }],
    rule: 'Lunar: full moon of the 12th Thai lunar month (usually November)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Yi_Peng',
    sources: ['https://www.twowanderingsoles.com/blog/thailand-lantern-festival-loy-krathong-yi-peng'],
    note: 'Mass sky-lantern releases are ticketed events; floating krathongs on the river are free.' },

  { id: 'christmas-markets', type: 'festival', category: 'cultural', name: 'Christmas Markets (Christkindlesmarkt)', icon: '🎄',
    place: 'Nuremberg (also Strasbourg, Vienna, Cologne…)', land: 'Germany', months: [11, 12],
    dates: [{ from: '2026-11-27', to: '2026-12-24' }],
    rule: 'Friday before the first Sunday of Advent until 24 December',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Christkindlesmarkt_(Nuremberg)',
    sources: ['https://www.nuernberg.de/internet/marktamt/christkindlesmarkt_haendler.html'] },

  // ════════════════════════════════════════════════════════════════════
  //  NATURE
  // ════════════════════════════════════════════════════════════════════

  // ── Blooms ──────────────────────────────────────────────────────────
  { id: 'cherry-blossom', type: 'nature', category: 'bloom', name: 'Cherry Blossom (Sakura)', icon: '🌸',
    place: 'Tokyo, Kyoto → Hokkaido', land: 'Japan', months: [3, 4, 5], peak: [3, 4], wonder: 'Mount Fuji',
    dates: [],
    rule: 'Average full bloom: Tokyo ~3 April, Kyoto ~4 April, Sapporo ~early May (±1 week). Forecasts from February',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Hanami',
    sources: ['https://www.japan-guide.com/e/e2011_when.html', 'https://tenki.jp/sakura/english/'],
    note: 'Full bloom lasts only about a week — keep a few flexible days.' },

  { id: 'keukenhof', type: 'nature', category: 'bloom', name: 'Tulip Season (Keukenhof)', icon: '🌷',
    place: 'Lisse, near Amsterdam', land: 'Netherlands', months: [3, 4, 5], peak: [4], wonder: 'Dutch Windmills (Kinderdijk)',
    dates: [{ from: '2027-03-18', to: '2027-05-09', label: 'Keukenhof open' }],
    rule: 'Keukenhof opens mid/late March to early May; tulip fields peak mid to late April (weather-dependent)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Keukenhof',
    sources: ['https://wanderon.in/international-trips/europe/keukenhof-the-garden-of-europe'] },

  { id: 'lavender-provence', type: 'nature', category: 'bloom', name: 'Lavender in Provence', icon: '💜',
    place: 'Valensole Plateau, Luberon, Sault', land: 'France', months: [6, 7, 8], peak: [6, 7],
    dates: [],
    rule: 'Valensole in full bloom roughly 20 June – 15 July; harvest starts mid-July. Higher fields (Sault) bloom later, into early August',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Valensole',
    sources: ['https://www.lelongweekend.com/lavender-season-in-provence-france/', 'https://beauxvillages.com/en/insights/french-property-blog/lifestyle/lavender-season-valensole-luberon-provence'],
    note: 'Best window 20 June – 5 July, before harvesting starts.' },

  { id: 'namaqualand', type: 'nature', category: 'bloom', name: 'Namaqualand Wildflowers', icon: '🌻',
    place: 'Namaqua National Park, Northern Cape', land: 'South Africa', months: [7, 8, 9], peak: [8],
    dates: [],
    rule: 'Late July to mid September after winter rains; peak usually mid-August to mid-September',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Namaqualand',
    sources: ['https://www.sanparks.org/parks/namaqua/what-to-do/activities/flower-season'],
    note: 'Flowers open only in sunshine — visit between 10:00 and 16:00, drive with the sun behind you.' },

  { id: 'jacarandas-pretoria', type: 'nature', category: 'bloom', name: 'Jacaranda Bloom', icon: '💐',
    place: 'Pretoria ("Jacaranda City")', land: 'South Africa', months: [10, 11], peak: [10, 11],
    dates: [],
    rule: 'Mid-October to mid-November, when ~50,000 jacaranda trees turn the city purple',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Jacaranda_mimosifolia', sources: [] },

  // ── Foliage & landscapes ────────────────────────────────────────────
  { id: 'new-england-foliage', type: 'nature', category: 'landscape', name: 'New England Fall Foliage', icon: '🍁',
    place: 'Vermont, New Hampshire, Maine', land: 'United States of America', months: [9, 10], peak: [10],
    dates: [],
    rule: 'Northern Vermont/NH peak late September; most of New England first half of October; each spot peaks for only 7–10 days',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Leaf_peeping',
    sources: ['https://www.necn.com/news/local/when-does-foliage-usually-peak-in-new-england/173207/'] },

  { id: 'kyoto-autumn', type: 'nature', category: 'landscape', name: 'Autumn Leaves in Kyoto (Kōyō)', icon: '🍂',
    place: 'Kyoto', land: 'Japan', months: [11, 12], peak: [11], wonder: 'Kyoto Temples',
    dates: [],
    rule: 'Typically mid-November to early December; recent warm years push the peak toward early December',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Momijigari',
    sources: ['https://www.nomadotravel.app/en/guides/kyoto-in-autumn'] },

  { id: 'uyuni-mirror', type: 'nature', category: 'landscape', name: 'Salar de Uyuni Mirror', icon: '🪞',
    place: 'Salar de Uyuni', land: 'Bolivia', months: [1, 2, 3, 4], peak: [2],
    dates: [],
    rule: 'Rainy season: a thin layer of water turns the salt flat into a mirror, most reliably late January to early March',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Salar_de_Uyuni',
    sources: ['https://bushop.com/bolivia/guides/best-time-to-visit-the-uyuni-salt-flats-wet-vs-dry-season/'],
    note: 'Some tour routes close when it is too flooded.' },

  { id: 'victoria-falls-peak', type: 'nature', category: 'landscape', name: 'Victoria Falls at Full Flow', icon: '🌈',
    place: 'Livingstone / Victoria Falls town', land: 'Zambia, Zimbabwe', months: [2, 3, 4, 5, 6], peak: [4], wonder: 'Victoria Falls',
    dates: [],
    rule: 'Peak flow March–May (April strongest, ~500 million litres/minute); lowest water Oct–Nov (Devil’s Pool swims Aug–Jan)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Victoria_Falls',
    sources: ['https://wildhorizons.co.za/best-time-to-visit-victoria-falls/'],
    note: 'At peak flow the spray hides much of the view — bring a raincoat.' },

  { id: 'okavango-flood', type: 'nature', category: 'landscape', name: 'Okavango Delta Flood', icon: '🦛',
    place: 'Okavango Delta', land: 'Botswana', months: [6, 7, 8], peak: [7],
    dates: [],
    rule: 'Angola’s summer rains arrive months later: the delta swells to three times its size between June and August, in the dry season',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Okavango_Delta',
    sources: ['https://www.okavango.com/okavango-delta-flood-cycle.php'] },

  // ── Wildlife (land) ─────────────────────────────────────────────────
  { id: 'great-migration', type: 'nature', category: 'wildlife', name: 'Great Migration', icon: '🦓',
    place: 'Serengeti & Masai Mara', land: 'Tanzania, Kenya', months: [1, 2, 3, 6, 7, 8, 9, 10], peak: [2, 8, 9],
    dates: [],
    rule: 'Calving Jan–Mar in the southern Serengeti (peak Feb); Grumeti crossing June; Mara River crossings Jul–Oct (most reliable Aug–Sep); return south Nov–Dec',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Serengeti#Great_migration',
    sources: ['https://www.asiliaafrica.com/the-great-migration/when/'] },

  { id: 'monarch-butterflies', type: 'nature', category: 'wildlife', name: 'Monarch Butterfly Sanctuaries', icon: '🦋',
    place: 'El Rosario & Sierra Chincua, Michoacán', land: 'Mexico', months: [11, 12, 1, 2, 3], peak: [1, 2],
    dates: [],
    rule: 'Millions of monarchs overwinter November–March; most active mid-November to mid-February (festival late February)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Monarch_Butterfly_Biosphere_Reserve',
    sources: ['https://www.journeymexico.com/blog/monarch-butterfly-reserves'],
    note: 'Butterflies fly most on sunny, warm afternoons.' },

  { id: 'snow-monkeys', type: 'nature', category: 'wildlife', name: 'Snow Monkeys (Jigokudani)', icon: '🙈',
    place: 'Yamanouchi, Nagano', land: 'Japan', months: [12, 1, 2, 3], peak: [1, 2],
    dates: [],
    rule: 'Snow usually December–March; the macaques bathe in the hot spring most in January–February',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Jigokudani_Monkey_Park',
    sources: ['https://www.kanpai-japan.com/jigokudani-snow-monkey-park'] },

  { id: 'synchronous-fireflies', type: 'nature', category: 'wildlife', name: 'Synchronous Fireflies', icon: '✨',
    place: 'Elkmont, Great Smoky Mountains', land: 'United States of America', months: [5, 6], peak: [6],
    dates: [],
    rule: 'Eight predicted peak nights in late May / early June (2025: 29 May – 5 June); park announces dates in spring',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Photinus_carolinus',
    sources: ['https://home.nps.gov/grsm/learn/news/synchronous-firefly-lottery-and-viewing-dates-for-2025.htm'],
    note: 'Access only by lottery on recreation.gov (application window in late April).' },

  { id: 'brooks-falls-bears', type: 'nature', category: 'wildlife', name: 'Brown Bears at Brooks Falls', icon: '🐻',
    place: 'Katmai National Park, Alaska', land: 'United States of America', months: [7, 9], peak: [7],
    dates: [],
    rule: 'Bears fish the salmon run in July (up to 25 at once) and again in September',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Brooks_Falls',
    sources: ['https://www.nps.gov/katm/planyourvisit/upload/Bear-Viewing-at-Brooks-Camp.pdf'] },

  { id: 'polar-bears-churchill', type: 'nature', category: 'wildlife', name: 'Polar Bears of Churchill', icon: '🐻‍❄️',
    place: 'Churchill, Manitoba', land: 'Canada', months: [10, 11], peak: [10, 11],
    dates: [],
    rule: 'Mid-October to late November, while bears wait on the coast for Hudson Bay to freeze',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Churchill,_Manitoba',
    sources: ['https://polarbearsinternational.org/news-media/articles/polar-bear-season-has-arrived/'] },

  { id: 'puffins-iceland', type: 'nature', category: 'wildlife', name: 'Atlantic Puffins', icon: '🐦',
    place: 'Westman Islands, Borgarfjörður Eystri, Látrabjarg', land: 'Iceland', months: [5, 6, 7, 8], peak: [6, 7],
    dates: [],
    rule: 'Arrive late April/May, leave by August–early September; best May to mid-August',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Atlantic_puffin',
    sources: ['https://guidetoiceland.is/travel-info/where-to-find-puffins-in-iceland'] },

  { id: 'red-crab-migration', type: 'nature', category: 'wildlife', name: 'Red Crab Migration', icon: '🦀',
    place: 'Christmas Island', land: 'Australia', months: [10, 11, 12, 1], peak: [11],
    dates: [],
    rule: 'Triggered by the first wet-season rains (usually Oct–Nov, sometimes Dec–Jan); spawning at dawn on a receding high tide in the moon’s last quarter',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Christmas_Island_red_crab',
    sources: ['https://christmasislandnationalpark.gov.au/discover/highlights/red-crab-migration/'],
    note: 'The park publishes predicted spawning dates each year.' },

  // ── Marine ──────────────────────────────────────────────────────────
  { id: 'whales-hervey-bay', type: 'nature', category: 'marine', name: 'Humpback Whales, Hervey Bay', icon: '🐋',
    place: 'Hervey Bay, Queensland', land: 'Australia', months: [7, 8, 9, 10, 11], peak: [8, 9, 10],
    dates: [],
    rule: 'Humpbacks rest in the bay on their way south, July–November (best August–October)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Hervey_Bay',
    sources: ['https://thepointsguy.com/travel/8-of-the-best-destinations-on-earth-for-whale-watching-and-when-to-go/'] },

  { id: 'whales-baja', type: 'nature', category: 'marine', name: 'Gray Whales, Baja California', icon: '🐋',
    place: 'Laguna San Ignacio, Magdalena Bay', land: 'Mexico', months: [1, 2, 3, 4], peak: [2, 3],
    dates: [],
    rule: 'Gray whales calve in the lagoons mid-January to mid-April — friendly whales often approach the boats',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/San_Ignacio_Lagoon',
    sources: ['https://thepointsguy.com/travel/8-of-the-best-destinations-on-earth-for-whale-watching-and-when-to-go/'] },

  { id: 'whales-azores', type: 'nature', category: 'marine', name: 'Blue Whales, Azores', icon: '🐳',
    place: 'São Miguel, Pico', land: 'Portugal', months: [4, 5, 6, 7, 8, 9], peak: [4, 5],
    dates: [],
    rule: 'Whale season April–September; blue and fin whales pass mostly in April–May',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Azores',
    sources: ['https://thepointsguy.com/travel/8-of-the-best-destinations-on-earth-for-whale-watching-and-when-to-go/'] },

  { id: 'whales-tonga', type: 'nature', category: 'marine', name: 'Swim with Humpbacks, Tonga', icon: '🐋',
    place: 'Vava’u, Ha’apai', land: 'Tonga', months: [7, 8, 9, 10], peak: [8, 9],
    dates: [],
    rule: 'Humpbacks breed and calve in Tongan waters July–October; one of few places where swimming with them is permitted',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Vava%CA%BBu',
    sources: ['https://thepointsguy.com/travel/8-of-the-best-destinations-on-earth-for-whale-watching-and-when-to-go/'] },

  { id: 'whales-iceland', type: 'nature', category: 'marine', name: 'Whale Watching, Iceland', icon: '🐳',
    place: 'Húsavík, Akureyri', land: 'Iceland', months: [5, 6, 7, 8, 9], peak: [6, 7, 8],
    dates: [],
    rule: 'Peak June–August (~90 % sighting rate): humpback, minke, sometimes blue whales and orcas',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/H%C3%BAsav%C3%ADk',
    sources: ['https://thepointsguy.com/travel/8-of-the-best-destinations-on-earth-for-whale-watching-and-when-to-go/'] },

  { id: 'whale-sharks-ningaloo', type: 'nature', category: 'marine', name: 'Whale Sharks, Ningaloo Reef', icon: '🦈',
    place: 'Exmouth, Western Australia', land: 'Australia', months: [3, 4, 5, 6, 7, 8], peak: [4, 5, 6],
    dates: [],
    rule: 'Peak March–July, sometimes into October; humpbacks join from July',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Ningaloo_Coast',
    sources: ['https://www.ningaloowhalesharks.com/whale-shark-tours/best-time-to-swim-with-whale-sharks-ningaloo/'] },

  { id: 'sardine-run', type: 'nature', category: 'marine', name: 'Sardine Run', icon: '🐟',
    place: 'Wild Coast & KwaZulu-Natal', land: 'South Africa', months: [5, 6, 7], peak: [6, 7],
    dates: [],
    rule: 'Cold water pushes billions of sardines north, May–July (best June–early July), chased by dolphins, sharks and gannets',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Sardine_run',
    sources: ['https://4x4afrika.com/2025/05/29/annual-sardine-run/'],
    note: 'Not guaranteed every year — depends on water temperature.' },

  { id: 'turtles-tortuguero', type: 'nature', category: 'marine', name: 'Green Turtle Nesting', icon: '🐢',
    place: 'Tortuguero National Park', land: 'Costa Rica', months: [7, 8, 9, 10], peak: [8],
    dates: [],
    rule: 'About 22,500 green turtles nest July–October, peaking in August; guided night tours only',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Tortuguero_National_Park',
    sources: ['https://www.roughguides.com/costa-rica/tortuguero-national-park/'] },

  { id: 'coral-spawning', type: 'nature', category: 'marine', name: 'Coral Spawning', icon: '🪸',
    place: 'Great Barrier Reef', land: 'Australia', months: [10, 11, 12], peak: [11, 12], wonder: 'Great Barrier Reef',
    dates: [],
    rule: '1–6 nights after the October (inner reefs), November and December (outer reefs) full moons',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Coral_spawning',
    sources: ['https://www.gbrmpa.gov.au/learn/coral-spawning-101'] },

  // ── Sky ─────────────────────────────────────────────────────────────
  { id: 'northern-lights', type: 'nature', category: 'sky', name: 'Northern Lights Season', icon: '🌌',
    place: 'Tromsø, Lapland, Iceland', land: 'Norway, Finland, Sweden, Iceland', months: [9, 10, 11, 12, 1, 2, 3], peak: [11, 12, 1, 2],
    wonder: 'Northern Lights', dates: [],
    rule: 'Dark skies from late September to late March; longest nights Nov–Feb; geomagnetic activity often higher around the equinoxes (Sep, Mar)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Aurora',
    sources: ['https://fiftydegreesnorth.com/article/best-month-to-see-the-northern-lights-2024'],
    note: 'Activity stays high in the years after the 2024–25 solar maximum.' },

  { id: 'midnight-sun', type: 'nature', category: 'sky', name: 'Midnight Sun', icon: '🌞',
    place: 'Tromsø, Lofoten, North Cape', land: 'Norway, Finland, Sweden', months: [5, 6, 7], peak: [6],
    dates: [],
    rule: 'Tromsø: about 20 May – 22 July; longer the further north (North Cape mid-May to late July)',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Midnight_sun',
    sources: ['https://www.visittromso.no/midnight-sun'] },

  { id: 'perseids', type: 'nature', category: 'sky', name: 'Perseid Meteor Shower', icon: '☄️',
    place: 'Anywhere dark in the Northern Hemisphere', land: '', months: [8], peak: [8],
    dates: [{ from: '2027-08-12', to: '2027-08-13', label: 'Peak night (waxing gibbous moon — watch before dawn)' }],
    rule: 'Peak every year around 12–13 August; up to ~100 meteors per hour under dark skies',
    recurrence: 'yearly', wiki: 'https://en.wikipedia.org/wiki/Perseids',
    sources: ['https://www.telescopeadvisor.com/perseid-meteor-shower-2027/'] },

  { id: 'eclipse-2027', type: 'nature', category: 'sky', name: 'Total Solar Eclipse 2027', icon: '🌑',
    place: 'Southern Spain → North Africa → Luxor', land: 'Spain, Morocco, Algeria, Tunisia, Libya, Egypt, Saudi Arabia, Yemen, Somalia',
    months: [8], peak: [8],
    dates: [{ from: '2027-08-02', to: '2027-08-02', label: 'Up to 6 min 23 s of totality near Luxor' }],
    rule: 'One-off: the longest land-visible totality until 2114. Spain ~13:30–14:00 CEST, Egypt ~14:00–14:30 EET',
    recurrence: 'once', wiki: 'https://en.wikipedia.org/wiki/Solar_eclipse_of_August_2,_2027',
    sources: ['https://www.space.com/16-best-places-to-see-2027-total-solar-eclipse', 'https://photoephemeris.com/en-GB/eclipses/solar/TSE2027'],
    note: 'Luxor has near-certain clear skies; Cádiz and Málaga are the European option. Hotels are already booking up.' }
];
