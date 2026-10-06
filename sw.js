/**
 * sw.js — Service worker for offline use and "Add to Home Screen".
 *
 * Strategy:
 *   - App files (same origin): network-first, so a new deploy shows up on the
 *     next load; the cached copy is used only when offline.
 *   - CDN libraries, fonts and flags: cache-first, refreshed in the background.
 *
 * Bump CACHE_VERSION when the list of app files changes.
 */

const CACHE_VERSION = 'td-v8';
const APP_CACHE     = `${CACHE_VERSION}-app`;
const CDN_CACHE     = `${CACHE_VERSION}-cdn`;

const APP_FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'style.css', 'triplog.css', 'triplist.css', 'tripstats.css', 'planner.css', 'dark.css', 'theme.css',
  'migration.js', 'planner.js', 'trips.js', 'map.js', 'stats.js', 'wonders.js', 'wonders-map.js',
  'triplog.js', 'triplist.js', 'tripstats.js', 'planner-ui.js', 'planner-form.js', 'compat.js', 'calendar-data.js', 'calendar.js', 'seasons-data.js', 'where-to-go.js', 'badges.js', 'stickers.js',
  'data/countries-110m.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon-64.png'
];

const CDN_HOSTS = [
  'unpkg.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'flagcdn.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !k.startsWith(CACHE_VERSION)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(req));
  } else if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(req));
  }
});

async function networkFirst(req) {
  const cache = await caches.open(APP_CACHE);
  try {
    const fresh = await fetch(req, { cache: 'no-cache' });
    if (fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(req, { ignoreSearch: true });
    if (cached) return cached;
    if (req.mode === 'navigate') {
      const shell = await cache.match('index.html');
      if (shell) return shell;
    }
    throw err;
  }
}

async function staleWhileRevalidate(req) {
  const cache  = await caches.open(CDN_CACHE);
  const cached = await cache.match(req);
  const update = fetch(req)
    .then(res => {
      if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || update;
}
