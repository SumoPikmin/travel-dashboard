const WONDERS_DATA = {
  natural: [
    { name: "Amazon Rainforest",                land: "Brazil, Peru, Colombia",                  wiki: "https://en.wikipedia.org/wiki/Amazon_rainforest", icon: "🦜", bottle: true, ll: [-3.47, -62.37], best: [6, 7, 8, 9, 10, 11] },
    { name: "Antarctica",                     land: "Antarctica",                             wiki: "https://en.wikipedia.org/wiki/Antarctica", icon: "🐧", bottle: true, ll: [-64.82, -62.86], best: [1, 2, 3, 11, 12] },
    { name: "Chocolate Hills",                  land: "Philippines",                             wiki: "https://en.wikipedia.org/wiki/Chocolate_Hills", icon: "🍫", ll: [9.83, 124.17], best: [1, 2, 3, 4, 5, 12] },
    { name: "Dead Sea",                         land: "Jordan, Israel, Palestine",               wiki: "https://en.wikipedia.org/wiki/Dead_Sea", icon: "🧂", bottle: true, ll: [31.5, 35.48], best: [3, 4, 5, 10, 11] },
    { name: "Delicate Arch",                    land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Delicate_Arch", icon: "🌵", ll: [38.74, -109.5], best: [4, 5, 9, 10] },
    { name: "Galapagos Islands",                land: "Ecuador",                                 wiki: "https://en.wikipedia.org/wiki/Gal%C3%A1pagos_Islands", icon: "🐢", bottle: true, ll: [-0.74, -90.31], best: [1, 2, 3, 4, 5, 6, 12] },
    { name: "Giant's Causeway",                 land: "United Kingdom",                          wiki: "https://en.wikipedia.org/wiki/Giant%27s_Causeway", icon: "🪨", ll: [55.24, -6.51], best: [5, 6, 7, 8, 9] },
    { name: "Grand Canyon",                     land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Grand_Canyon", icon: "🏜️", bottle: true, ll: [36.06, -112.14], best: [4, 5, 9, 10] },
    { name: "Great Barrier Reef",               land: "Australia",                               wiki: "https://en.wikipedia.org/wiki/Great_Barrier_Reef", icon: "🐠", bottle: true, ll: [-16.92, 146.03], best: [6, 7, 8, 9, 10] },
    { name: "Ha Long Bay",                      land: "Vietnam",                                 wiki: "https://en.wikipedia.org/wiki/Ha_Long_Bay", icon: "🛶", bottle: true, ll: [20.91, 107.18], best: [3, 4, 5, 9, 10, 11] },
    { name: "Iceland (Kirkjufell)",           land: "Iceland",                                wiki: "https://en.wikipedia.org/wiki/Kirkjufell", icon: "🧊", bottle: true, ll: [64.94, -23.31], best: [6, 7, 8, 9] },
    { name: "Iguazu Falls",                     land: "Argentina, Brazil",                       wiki: "https://en.wikipedia.org/wiki/Iguazu_Falls", icon: "💦", ll: [-25.69, -54.44], best: [3, 4, 5, 8, 9, 10, 11] },
    { name: "Ik-Kil Cenote",                    land: "Mexico",                                  wiki: "https://en.wikipedia.org/wiki/Ik_Kil", icon: "🕳️", ll: [20.66, -88.55], best: [1, 2, 3, 4, 11, 12] },
    { name: "Jeju Island",                      land: "South Korea",                             wiki: "https://en.wikipedia.org/wiki/Jeju_Island", icon: "🍊", ll: [33.39, 126.53], best: [4, 5, 9, 10] },
    { name: "Komodo Island",                    land: "Indonesia",                               wiki: "https://en.wikipedia.org/wiki/Komodo_(island)", icon: "🦎", ll: [-8.55, 119.49], best: [4, 5, 6, 7, 8, 9, 10, 11] },
    { name: "Krakatoa",                         land: "Indonesia",                               wiki: "https://en.wikipedia.org/wiki/Krakatoa", icon: "🌋", ll: [-6.1, 105.42], best: [5, 6, 7, 8, 9] },
    { name: "Kruger National Park",           land: "South Africa",                           wiki: "https://en.wikipedia.org/wiki/Kruger_National_Park", icon: "🐘", bottle: true, ll: [-23.99, 31.55], best: [5, 6, 7, 8, 9] },
    { name: "Lake Victoria",                    land: "Kenya, Tanzania, Uganda",                 wiki: "https://en.wikipedia.org/wiki/Lake_Victoria", icon: "🐟", ll: [-1.0, 33.0], best: [1, 2, 6, 7, 8, 9, 12] },
    { name: "Mato Tipila (Devils Tower)",       land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Devils_Tower", icon: "🛸", ll: [44.59, -104.72], best: [5, 6, 7, 8, 9] },
    { name: "Matterhorn",                       land: "Switzerland, Italy",                      wiki: "https://en.wikipedia.org/wiki/Matterhorn", icon: "🏔️", bottle: true, ll: [45.98, 7.66], best: [1, 2, 3, 7, 8, 9, 12] },
    { name: "Milford Sound",                    land: "New Zealand",                             wiki: "https://en.wikipedia.org/wiki/Milford_Sound_/_Piopiotahi", icon: "🏞️", bottle: true, ll: [-44.67, 167.93], best: [1, 2, 3, 11, 12] },
    { name: "Mount Everest",                    land: "Nepal, China",                            wiki: "https://en.wikipedia.org/wiki/Mount_Everest", icon: "🧗", bottle: true, ll: [27.99, 86.93], best: [3, 4, 5, 10, 11] },
    { name: "Mount Fuji",                       land: "Japan",                                   wiki: "https://en.wikipedia.org/wiki/Mount_Fuji", icon: "🗻", bottle: true, ll: [35.36, 138.73], best: [1, 2, 7, 8, 11, 12] },
    { name: "Mount Kailash",                    land: "China",                                   wiki: "https://en.wikipedia.org/wiki/Mount_Kailash", icon: "⛰️", ll: [31.07, 81.31], best: [5, 6, 7, 8, 9, 10] },
    { name: "Mount Kilimanjaro",                land: "Tanzania",                                wiki: "https://en.wikipedia.org/wiki/Mount_Kilimanjaro", icon: "🦒", bottle: true, ll: [-3.07, 37.35], best: [1, 2, 6, 7, 8, 9, 10] },
    { name: "Mount Roraima",                    land: "Venezuela, Brazil, Guyana",               wiki: "https://en.wikipedia.org/wiki/Mount_Roraima", icon: "☁️", ll: [5.14, -60.76], best: [1, 2, 3, 4, 12] },
    { name: "Mount Sinai",                      land: "Egypt",                                   wiki: "https://en.wikipedia.org/wiki/Mount_Sinai", icon: "📜", ll: [28.54, 33.98], best: [3, 4, 5, 10, 11] },
    { name: "Niagara Falls",                    land: "Canada, United States of America",        wiki: "https://en.wikipedia.org/wiki/Niagara_Falls", icon: "🌊", bottle: true, ll: [43.08, -79.07], best: [5, 6, 7, 8, 9, 10] },
    { name: "Northern Lights",                  land: "Norway, Iceland, Finland",                wiki: "https://en.wikipedia.org/wiki/Aurora", icon: "🌌", bottle: true, ll: [69.65, 18.96], best: [1, 2, 3, 9, 10, 11, 12] },
    { name: "Old Faithful",                     land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Old_Faithful", icon: "⛲", ll: [44.46, -110.83], best: [5, 6, 7, 8, 9] },
    { name: "Pamukkale",                        land: "Turkey",                                  wiki: "https://en.wikipedia.org/wiki/Pamukkale", icon: "🛁", ll: [37.92, 29.12], best: [4, 5, 6, 9, 10] },
    { name: "Pantanal",                         land: "Brazil, Bolivia, Paraguay",               wiki: "https://en.wikipedia.org/wiki/Pantanal", icon: "🐊", ll: [-18.0, -56.6], best: [7, 8, 9, 10] },
    { name: "Patagonia",                        land: "Argentina, Chile",                        wiki: "https://en.wikipedia.org/wiki/Patagonia", icon: "🌬️", bottle: true, ll: [-49.33, -72.89], best: [1, 2, 3, 11, 12] },
    { name: "Puerto Princesa Underground River",land: "Philippines",                             wiki: "https://en.wikipedia.org/wiki/Puerto_Princesa_Subterranean_River_National_Park", icon: "🦇", ll: [10.19, 118.93], best: [1, 2, 3, 4, 5, 12] },
    { name: "Rock of Gibraltar",                land: "United Kingdom",                          wiki: "https://en.wikipedia.org/wiki/Rock_of_Gibraltar", icon: "🐒", ll: [36.14, -5.35], best: [4, 5, 6, 9, 10] },
    { name: "Sahara Desert",                    land: "Algeria, Morocco, Tunisia, Egypt",        wiki: "https://en.wikipedia.org/wiki/Sahara", icon: "🐪", bottle: true, ll: [31.1, -4.01], best: [1, 2, 3, 10, 11, 12] },
    { name: "Sri Pada (Adam's Peak)",           land: "Sri Lanka",                               wiki: "https://en.wikipedia.org/wiki/Adam%27s_Peak", icon: "👣", ll: [6.81, 80.5], best: [1, 2, 3, 4, 5, 12] },
    { name: "Table Mountain",                   land: "South Africa",                            wiki: "https://en.wikipedia.org/wiki/Table_Mountain", icon: "🍽️", ll: [-33.96, 18.4], best: [1, 2, 3, 11, 12] },
    { name: "Torres del Paine",                 land: "Chile",                                   wiki: "https://en.wikipedia.org/wiki/Torres_del_Paine_National_Park", icon: "🏕️", ll: [-50.94, -73.41], best: [1, 2, 3, 11, 12] },
    { name: "Tsingy de Bemaraha",               land: "Madagascar",                              wiki: "https://en.wikipedia.org/wiki/Tsingy_de_Bemaraha_Strict_Nature_Reserve", icon: "🗡️", ll: [-18.73, 44.76], best: [5, 6, 7, 8, 9, 10, 11] },
    { name: "Uluru",                            land: "Australia",                               wiki: "https://en.wikipedia.org/wiki/Uluru", icon: "🪃", ll: [-25.34, 131.04], best: [5, 6, 7, 8, 9] },
    { name: "Victoria Falls",                   land: "Zambia, Zimbabwe",                        wiki: "https://en.wikipedia.org/wiki/Victoria_Falls", icon: "🌈", ll: [-17.92, 25.86], best: [3, 4, 5, 6, 7, 8] },
    { name: "White Desert",                     land: "Egypt",                                   wiki: "https://en.wikipedia.org/wiki/White_Desert_National_Park", icon: "🍄", ll: [27.36, 28.03], best: [1, 2, 3, 4, 10, 11, 12] },
    { name: "Yosemite National Park",           land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Yosemite_National_Park", icon: "🐻", bottle: true, ll: [37.75, -119.59], best: [5, 6, 7, 8, 9, 10] },
    { name: "Zugspitze",                        land: "Germany, Austria",                        wiki: "https://en.wikipedia.org/wiki/Zugspitze", icon: "🚠", ll: [47.42, 10.99], best: [1, 2, 3, 6, 7, 8, 9, 12] }
  ],
  cultural: [
    { name: "Acropolis of Athens",              land: "Greece",                                  wiki: "https://en.wikipedia.org/wiki/Acropolis_of_Athens", icon: "🦉", bottle: true, ll: [37.97, 23.73], best: [4, 5, 9, 10] },
    { name: "Alhambra",                         land: "Spain",                                   wiki: "https://en.wikipedia.org/wiki/Alhambra", icon: "💃", ll: [37.18, -3.59], best: [3, 4, 5, 9, 10, 11] },
    { name: "Angkor Wat",                       land: "Cambodia",                                wiki: "https://en.wikipedia.org/wiki/Angkor_Wat", icon: "🛕", bottle: true, ll: [13.41, 103.87], best: [1, 2, 3, 11, 12] },
    { name: "Bali (Pura Lempuyang)",          land: "Indonesia",                              wiki: "https://en.wikipedia.org/wiki/Pura_Lempuyang_Luhur", icon: "🌺", bottle: true, ll: [-8.39, 115.63], best: [4, 5, 6, 7, 8, 9, 10] },
    { name: "Barcelona (Sagrada Família)",    land: "Spain",                                  wiki: "https://en.wikipedia.org/wiki/Sagrada_Fam%C3%ADlia", icon: "🏗️", bottle: true, ll: [41.4, 2.17], best: [4, 5, 6, 9, 10] },
    { name: "Big Ben",                          land: "United Kingdom",                          wiki: "https://en.wikipedia.org/wiki/Big_Ben", icon: "⏰", bottle: true, ll: [51.5, -0.12], best: [5, 6, 7, 8, 9] },
    { name: "Borobudur",                        land: "Indonesia",                               wiki: "https://en.wikipedia.org/wiki/Borobudur", icon: "🧘", ll: [-7.61, 110.2], best: [4, 5, 6, 7, 8, 9, 10] },
    { name: "Brandenburg Gate",                 land: "Germany",                                 wiki: "https://en.wikipedia.org/wiki/Brandenburg_Gate", icon: "🚪", bottle: true, ll: [52.52, 13.38], best: [5, 6, 7, 8, 9, 12] },
    { name: "Cappadocia",                       land: "Turkey",                                  wiki: "https://en.wikipedia.org/wiki/Cappadocia", icon: "🎈", bottle: true, ll: [38.64, 34.83], best: [4, 5, 6, 9, 10] },
    { name: "Chichén Itzá",                     land: "Mexico",                                  wiki: "https://en.wikipedia.org/wiki/Chichen_Itza", icon: "🐍", ll: [20.68, -88.57], best: [1, 2, 3, 4, 11, 12] },
    { name: "Christ the Redeemer",              land: "Brazil",                                  wiki: "https://en.wikipedia.org/wiki/Christ_the_Redeemer_(statue)", icon: "✝️", bottle: true, ll: [-22.95, -43.21], best: [4, 5, 6, 7, 8, 9, 10] },
    { name: "CN Tower",                         land: "Canada",                                  wiki: "https://en.wikipedia.org/wiki/CN_Tower", icon: "📡", ll: [43.64, -79.39], best: [5, 6, 7, 8, 9, 10] },
    { name: "Colosseum",                        land: "Italy",                                   wiki: "https://en.wikipedia.org/wiki/Colosseum", icon: "🏟️", bottle: true, ll: [41.89, 12.49], best: [4, 5, 6, 9, 10] },
    { name: "Dubai (Burj Khalifa)",           land: "United Arab Emirates",                   wiki: "https://en.wikipedia.org/wiki/Burj_Khalifa", icon: "🏙️", bottle: true, ll: [25.2, 55.27], best: [1, 2, 3, 11, 12] },
    { name: "Dubrovnik Old Town",             land: "Croatia",                                wiki: "https://en.wikipedia.org/wiki/Dubrovnik", icon: "🍷", bottle: true, ll: [42.64, 18.11], best: [5, 6, 9, 10] },
    { name: "Dutch Windmills (Kinderdijk)",   land: "Netherlands",                            wiki: "https://en.wikipedia.org/wiki/Kinderdijk", icon: "🌷", bottle: true, ll: [51.88, 4.64], best: [4, 5, 6, 7, 8, 9] },
    { name: "Easter Island (Rapa Nui)",         land: "Chile",                                   wiki: "https://en.wikipedia.org/wiki/Easter_Island", icon: "🗿", bottle: true, ll: [-27.11, -109.35], best: [1, 2, 3, 4, 10, 11, 12] },
    { name: "Eiffel Tower",                     land: "France",                                  wiki: "https://en.wikipedia.org/wiki/Eiffel_Tower", icon: "🗼", bottle: true, ll: [48.86, 2.29], best: [4, 5, 6, 9, 10] },
    { name: "Forbidden City",                   land: "China",                                   wiki: "https://en.wikipedia.org/wiki/Forbidden_City", icon: "👑", ll: [39.92, 116.4], best: [4, 5, 9, 10] },
    { name: "Gardens by the Bay",             land: "Singapore",                              wiki: "https://en.wikipedia.org/wiki/Gardens_by_the_Bay", icon: "🌳", bottle: true, ll: [1.28, 103.86], best: [2, 3, 4, 5, 6, 7, 8] },
    { name: "Golden Gate Bridge",               land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Golden_Gate_Bridge", icon: "🌉", ll: [37.82, -122.48], best: [9, 10] },
    { name: "Great Mosque of Djenné",           land: "Mali",                                    wiki: "https://en.wikipedia.org/wiki/Great_Mosque_of_Djenn%C3%A9", icon: "🧱", ll: [13.91, -4.56], best: [1, 2, 11, 12] },
    { name: "Great Wall of China",              land: "China",                                   wiki: "https://en.wikipedia.org/wiki/Great_Wall_of_China", icon: "🐉", bottle: true, ll: [40.43, 116.57], best: [4, 5, 9, 10] },
    { name: "Hagia Sophia",                     land: "Turkey",                                  wiki: "https://en.wikipedia.org/wiki/Hagia_Sophia", icon: "🕌", bottle: true, ll: [41.01, 28.98], best: [4, 5, 6, 9, 10] },
    { name: "Hermitage Museum",                 land: "Russia",                                  wiki: "https://en.wikipedia.org/wiki/Hermitage_Museum", icon: "🐈", ll: [59.94, 30.31], best: [5, 6, 7, 8, 9] },
    { name: "Himeji Castle",                    land: "Japan",                                   wiki: "https://en.wikipedia.org/wiki/Himeji_Castle", icon: "🏯", ll: [34.84, 134.69], best: [3, 4, 5, 10, 11] },
    { name: "Hong Kong Skyline",              land: "China",                                  wiki: "https://en.wikipedia.org/wiki/Victoria_Harbour", icon: "🌃", bottle: true, ll: [22.29, 114.17], best: [1, 2, 3, 10, 11, 12] },
    { name: "Kyoto Temples",                  land: "Japan",                                  wiki: "https://en.wikipedia.org/wiki/Historic_Monuments_of_Ancient_Kyoto", icon: "⛩️", bottle: true, ll: [35.0, 135.77], best: [3, 4, 5, 10, 11] },
    { name: "Leaning Tower of Pisa",            land: "Italy",                                   wiki: "https://en.wikipedia.org/wiki/Leaning_Tower_of_Pisa", icon: "📐", ll: [43.72, 10.4], best: [4, 5, 6, 9, 10] },
    { name: "Machu Picchu",                     land: "Peru",                                    wiki: "https://en.wikipedia.org/wiki/Machu_Picchu", icon: "🦙", bottle: true, ll: [-13.16, -72.55], best: [4, 5, 6, 7, 8, 9, 10] },
    { name: "Mont Saint-Michel",                land: "France",                                  wiki: "https://en.wikipedia.org/wiki/Mont_Saint-Michel", icon: "🏰", ll: [48.64, -1.51], best: [4, 5, 6, 9, 10] },
    { name: "Neuschwanstein Castle",            land: "Germany",                                 wiki: "https://en.wikipedia.org/wiki/Neuschwanstein_Castle", icon: "🦢", ll: [47.56, 10.75], best: [5, 6, 7, 8, 9, 10, 12] },
    { name: "Notre-Dame de Paris",              land: "France",                                  wiki: "https://en.wikipedia.org/wiki/Notre-Dame_de_Paris", icon: "🔔", ll: [48.85, 2.35], best: [4, 5, 6, 9, 10] },
    { name: "Oracle of Delphi",                 land: "Greece",                                  wiki: "https://en.wikipedia.org/wiki/Delphi", icon: "🔮", ll: [38.48, 22.5], best: [4, 5, 6, 9, 10] },
    { name: "Országház",                        land: "Hungary",                                 wiki: "https://en.wikipedia.org/wiki/Hungarian_Parliament_Building", icon: "⚖️", ll: [47.51, 19.05], best: [4, 5, 6, 9, 10, 12] },
    { name: "Oxford University",                land: "United Kingdom",                          wiki: "https://en.wikipedia.org/wiki/University_of_Oxford", icon: "🎓", ll: [51.75, -1.25], best: [5, 6, 7, 8, 9] },
    { name: "Petra",                            land: "Jordan",                                  wiki: "https://en.wikipedia.org/wiki/Petra", icon: "🐫", bottle: true, ll: [30.33, 35.44], best: [3, 4, 5, 9, 10, 11] },
    { name: "Potala Palace",                    land: "China",                                   wiki: "https://en.wikipedia.org/wiki/Potala_Palace", icon: "🙏", ll: [29.66, 91.12], best: [4, 5, 6, 9, 10] },
    { name: "Prague Old Town",                land: "Czech Republic",                         wiki: "https://en.wikipedia.org/wiki/Old_Town_(Prague)", icon: "🕰️", bottle: true, ll: [50.09, 14.42], best: [4, 5, 6, 9, 10, 12] },
    { name: "Pyramids of Giza",                 land: "Egypt",                                   wiki: "https://en.wikipedia.org/wiki/Giza_pyramid_complex", icon: "🔺", bottle: true, ll: [29.98, 31.13], best: [1, 2, 3, 4, 10, 11, 12] },
    { name: "Red Fort",                         land: "India",                                   wiki: "https://en.wikipedia.org/wiki/Red_Fort", icon: "🐅", ll: [28.66, 77.24], best: [1, 2, 3, 10, 11, 12] },
    { name: "Santorini",                      land: "Greece",                                 wiki: "https://en.wikipedia.org/wiki/Santorini", icon: "🌅", bottle: true, ll: [36.42, 25.43], best: [4, 5, 6, 9, 10] },
    { name: "Sistine Chapel",                   land: "Vatican City",                            wiki: "https://en.wikipedia.org/wiki/Sistine_Chapel", icon: "🖌️", bottle: true, ll: [41.9, 12.45], best: [3, 4, 5, 10, 11] },
    { name: "Statue of Liberty",                land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Statue_of_Liberty", icon: "🗽", bottle: true, ll: [40.69, -74.04], best: [4, 5, 6, 9, 10] },
    { name: "Stonehenge",                       land: "United Kingdom",                          wiki: "https://en.wikipedia.org/wiki/Stonehenge", icon: "🌘", ll: [51.18, -1.83], best: [5, 6, 7, 8, 9] },
    { name: "Sydney Opera House",               land: "Australia",                               wiki: "https://en.wikipedia.org/wiki/Sydney_Opera_House", icon: "🎶", bottle: true, ll: [-33.86, 151.22], best: [3, 4, 5, 9, 10, 11] },
    { name: "Taj Mahal",                        land: "India",                                   wiki: "https://en.wikipedia.org/wiki/Taj_Mahal", icon: "💍", bottle: true, ll: [27.18, 78.04], best: [1, 2, 3, 10, 11, 12] },
    { name: "Terracotta Army",                  land: "China",                                   wiki: "https://en.wikipedia.org/wiki/Terracotta_Army", icon: "⚔️", ll: [34.38, 109.27], best: [4, 5, 9, 10] },
    { name: "The Kremlin",                      land: "Russia",                                  wiki: "https://en.wikipedia.org/wiki/Moscow_Kremlin", icon: "⭐", bottle: true, ll: [55.75, 37.62], best: [5, 6, 7, 8, 9] },
    { name: "The Louvre",                       land: "France",                                  wiki: "https://en.wikipedia.org/wiki/Louvre", icon: "🖼️", ll: [48.86, 2.34], best: [4, 5, 6, 9, 10] },
    { name: "Torre de Belém",                   land: "Portugal",                                wiki: "https://en.wikipedia.org/wiki/Bel%C3%A9m_Tower", icon: "⛵", ll: [38.69, -9.22], best: [4, 5, 6, 9, 10] },
    { name: "Uffizi Gallery",                   land: "Italy",                                   wiki: "https://en.wikipedia.org/wiki/Uffizi", icon: "🎨", bottle: true, ll: [43.77, 11.26], best: [4, 5, 6, 9, 10] },
    { name: "Venice",                         land: "Italy",                                  wiki: "https://en.wikipedia.org/wiki/Venice", icon: "🚣", bottle: true, ll: [45.44, 12.34], best: [4, 5, 6, 9, 10] }
  ]
};

// ── Expose flat list for tooltip ──────────────────────────────
window.WONDERS_ALL = [...WONDERS_DATA.natural, ...WONDERS_DATA.cultural];

// ── Wonder states ─────────────────────────────────────────────
const WONDERS_STORAGE_KEY = 'wonders_states_v1';
window.wonderStates = JSON.parse(localStorage.getItem(WONDERS_STORAGE_KEY) || '{}');

// Wonders that were merged or renamed: saved marks move to the new entry
const WONDER_RENAMES = {
  'The Parthenon':           'Acropolis of Athens',
  "St. Peter's Basilica":    'Sistine Chapel',
  "Saint Basil's Cathedral": 'The Kremlin',
  'Florence Cathedral':      'Uffizi Gallery',
  'Venetian Arsenal':        'Venice',
  'Venice Canals':           'Venice'
};

function migrateWonderNames(map, rank) {
  let changed = false;
  Object.entries(WONDER_RENAMES).forEach(([from, to]) => {
    if (!(from in map)) return;
    if (!(to in map) || rank(map[from]) > rank(map[to])) map[to] = map[from];
    delete map[from];
    changed = true;
  });
  return changed;
}

if (migrateWonderNames(window.wonderStates, v => ({ been: 2, want: 1 }[v] || 0))) {
  localStorage.setItem(WONDERS_STORAGE_KEY, JSON.stringify(window.wonderStates));
}

function saveWonderStates() {
  localStorage.setItem(WONDERS_STORAGE_KEY, JSON.stringify(window.wonderStates));
}

function getWonderState(name) {
  return window.wonderStates[name] || 'neutral';
}

function setWonderState(name, status) {
  if (status === 'neutral') delete window.wonderStates[name];
  else window.wonderStates[name] = status;
  saveWonderStates();
}

// ── Wonder priorities ─────────────────────────────────────────
const WONDER_PRIORITY_KEY = 'wonder_priorities_v1';
window.wonderPriorities = JSON.parse(localStorage.getItem(WONDER_PRIORITY_KEY) || '{}');

if (migrateWonderNames(window.wonderPriorities, v => ({ next: 2, longterm: 1 }[v] || 0))) {
  localStorage.setItem(WONDER_PRIORITY_KEY, JSON.stringify(window.wonderPriorities));
}

function saveWonderPriorities() {
  localStorage.setItem(WONDER_PRIORITY_KEY, JSON.stringify(window.wonderPriorities));
}

function getWonderPriority(name) {
  return window.wonderPriorities[name] || null;
}

function cycleWonderPriority(name) {
  const current = getWonderPriority(name);
  const next = current === null ? 'next' : current === 'next' ? 'longterm' : null;
  if (!next) delete window.wonderPriorities[name];
  else window.wonderPriorities[name] = next;
  saveWonderPriorities();
}

function priorityBadgeHtml(priority) {
  if (priority === 'next')     return `<span class="priority-badge priority-next">🎯 Next Up</span>`;
  if (priority === 'longterm') return `<span class="priority-badge priority-longterm">🗓️ Long Term</span>`;
  return `<span class="priority-badge priority-none">＋ Priority</span>`;
}

// ── Tab state ─────────────────────────────────────────────────
let currentWonderSection = 'natural';
let currentWonderFilter  = 'all';

// ── Circle helpers ────────────────────────────────────────────
function buildWonderCircleSVG(id, color) {
  return `
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle stroke="#ece6da" stroke-width="9" fill="none" r="44" cx="50" cy="50"></circle>
      <circle id="wonder-circle-${id}" stroke="${color}" stroke-width="9" fill="none"
        r="44" cx="50" cy="50" stroke-linecap="round" transform="rotate(-90, 50, 50)"></circle>
      <text id="wonder-text-${id}" x="50" y="55" text-anchor="middle" font-size="16" font-weight="bold" fill="${color}">0%</text>
    </svg>`;
}

function updateWonderCircle(id, visited, total, color) {
  const circle = document.getElementById('wonder-circle-' + id);
  const text   = document.getElementById('wonder-text-' + id);
  if (!circle || !text) return;
  const percent       = total > 0 ? (visited / total) * 100 : 0;
  const circumference = 2 * Math.PI * 44;
  circle.style.stroke           = color;
  circle.style.strokeDasharray  = `${circumference}`;
  circle.style.strokeDashoffset = `${circumference - (percent / 100) * circumference}`;
  text.textContent = `${Math.round(percent)}%`;
}

function updateWonderCircles() {
  const naturalVisited  = WONDERS_DATA.natural.filter(w => getWonderState(w.name) === 'been').length;
  const culturalVisited = WONDERS_DATA.cultural.filter(w => getWonderState(w.name) === 'been').length;
  updateWonderCircle('natural',  naturalVisited,  WONDERS_DATA.natural.length,  '#3f8f5a');
  updateWonderCircle('cultural', culturalVisited, WONDERS_DATA.cultural.length, '#c9772a');
  const nl = document.getElementById('wonder-label-natural');
  const cl = document.getElementById('wonder-label-cultural');
  if (nl) nl.textContent = `${naturalVisited} / ${WONDERS_DATA.natural.length}`;
  if (cl) cl.textContent = `${culturalVisited} / ${WONDERS_DATA.cultural.length}`;
}

// ── Init ──────────────────────────────────────────────────────
window.initWonders = function() {
  const container = document.getElementById('wondersContent');
  if (!container || container.dataset.built) return;
  container.dataset.built = 'true';

  container.innerHTML = `
    <h2>Wonders of the World</h2>

    <div class="stat-circles-row" style="margin: 16px 0;">
      <div class="stat-circle-item">
        ${buildWonderCircleSVG('natural', '#3f8f5a')}
        <div class="stat-circle-label">🌿 Natural</div>
        <div class="stat-circle-sub" id="wonder-label-natural">0 / ${WONDERS_DATA.natural.length}</div>
      </div>
      <div class="stat-circle-item">
        ${buildWonderCircleSVG('cultural', '#c9772a')}
        <div class="stat-circle-label">🏛️ Cultural</div>
        <div class="stat-circle-sub" id="wonder-label-cultural">0 / ${WONDERS_DATA.cultural.length}</div>
      </div>
    </div>

    <hr />

    <div class="wonders-section-toggle">
      <button class="wonders-seg-btn active" data-section="natural">🌿 Natural Wonders</button>
      <button class="wonders-seg-btn" data-section="cultural">🏛️ Cultural Sites</button>
    </div>

    <p id="wondersSummary" class="wonders-summary"></p>

    <div class="cl-toolbar">
      <div class="cl-filters" id="wonderFilters">
        <button class="cl-filter-btn active" data-filter="all">All</button>
        <button class="cl-filter-btn" data-filter="been">Been</button>
        <button class="cl-filter-btn" data-filter="want">Want</button>
        <button class="cl-filter-btn" data-filter="neutral">Neutral</button>
        <button class="cl-filter-btn" data-filter="next">🎯 Next Up</button>
        <button class="cl-filter-btn" data-filter="longterm">🗓️ Long Term</button>
        <button class="cl-filter-btn" data-filter="bottle" title="The 50 Let's Wander World Explorer bottle destinations">🍶 Bottle</button>
      </div>
    </div>

    <ul class="wonders-list" id="wondersList"></ul>
  `;

  container.querySelectorAll('.wonders-seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.wonders-seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentWonderSection = btn.dataset.section;
      currentWonderFilter  = 'all';
      container.querySelectorAll('.cl-filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
      renderWondersList();
    });
  });

  container.querySelectorAll('.cl-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.cl-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentWonderFilter = btn.dataset.filter;
      renderWondersList();
    });
  });

  updateWonderCircles();
  renderWondersList();
};

function renderWondersList() {
  const list    = document.getElementById('wondersList');
  const summary = document.getElementById('wondersSummary');
  if (!list) return;

  const items = WONDERS_DATA[currentWonderSection];
  const total = items.length;
  const been  = items.filter(w => getWonderState(w.name) === 'been').length;
  const want  = items.filter(w => getWonderState(w.name) === 'want').length;

  summary.innerHTML = `<strong>Visited: ${been} / ${total}</strong> &nbsp;·&nbsp; Want to go: ${want}`;

  const visible = items.filter(wonderMatchesFilter);
  list.innerHTML = '';

  visible.forEach(wonder => {
    const status   = getWonderState(wonder.name);
    const priority = getWonderPriority(wonder.name);

    const li = document.createElement('li');
    li.className = `wonders-item cl-${status}`;
    li.dataset.name = wonder.name;
    li.addEventListener('mouseenter', () => window.highlightWonderMarker && window.highlightWonderMarker(wonder.name, true));
    li.addEventListener('mouseleave', () => window.highlightWonderMarker && window.highlightWonderMarker(wonder.name, false));
    li.innerHTML = `
      <span class="cl-dot"></span>
      <span class="wonders-item-icon" aria-hidden="true">${wonder.icon || '📍'}</span>
      <div class="wonders-item-info">
        <span class="wonders-item-name">${wonder.name}</span>
        <span class="wonders-item-land">${wonder.land}</span>
        ${wonder.wiki ? `<a class="wonders-wiki-link" href="${wonder.wiki}" target="_blank" rel="noopener noreferrer">Learn more →</a>` : ''}
      </div>
      <button class="priority-badge-btn" title="Cycle priority">${priorityBadgeHtml(priority)}</button>
      <div class="wonders-item-actions">
        <button class="wonders-status-btn ${status === 'been'    ? 'active-been'    : ''}" data-status="been"    title="Been (click again to reset)">✓</button>
        <button class="wonders-status-btn ${status === 'want'    ? 'active-want'    : ''}" data-status="want"    title="Want to go (click again to reset)">★</button>
        <button class="wonders-status-btn ${status === 'neutral' ? 'active-neutral' : ''}" data-status="neutral" title="Neutral">✕</button>
      </div>
    `;

    li.querySelector('.priority-badge-btn').addEventListener('click', () => {
      cycleWonderPriority(wonder.name);
      renderWondersList();
    });

    li.querySelectorAll('.wonders-status-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Clicking the already-active ✓ or ★ again resets the wonder to neutral
        const clicked = btn.dataset.status;
        const next    = clicked !== 'neutral' && clicked === getWonderState(wonder.name) ? 'neutral' : clicked;
        setWonderState(wonder.name, next);
        updateWonderCircles();
        renderWondersList();
        if (window.refreshBadges) window.refreshBadges();
      });
    });

    list.appendChild(li);
  });

  if (list.children.length === 0) {
    list.innerHTML = `<li class="wonders-empty">No items match this filter.</li>`;
  }

  if (window.refreshWonderMap) window.refreshWonderMap();
}

// Wonders shown on the map: current section + filter (wonders-map.js drops visited ones)
window.getWonderMapItems = function () {
  return WONDERS_DATA[currentWonderSection].filter(wonderMatchesFilter);
};
window.getWonderSectionItems = function () {
  return WONDERS_DATA[currentWonderSection];
};

function wonderMatchesFilter(wonder) {
  const status   = getWonderState(wonder.name);
  const priority = getWonderPriority(wonder.name);
  switch (currentWonderFilter) {
    case 'been':
    case 'want':
    case 'neutral':  return status === currentWonderFilter;
    case 'next':     return priority === 'next';
    case 'longterm': return priority === 'longterm';
    case 'bottle':   return !!wonder.bottle;
    default:         return true;
  }
}
