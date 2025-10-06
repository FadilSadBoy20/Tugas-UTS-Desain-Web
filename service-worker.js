const CACHE_NAME = "fadilweb-cache-v5";
const urlsToCache = [
  ".",
  "index.html",
  "About.html",
  "Contact.html",
  "offline.html",
  "manifest.json",
  "images/senja2.jpg",
  "images/senja3.jpg",
  "images/unand.jpeg",
  "images/saya1.jpg",
  "images/icons/logowebsite.png"
];

// Install Service Worker
self.addEventListener("install", (event) => {
  console.log("📦 Installing Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("Caching files...");
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
          console.log("✅ Cached:", url);
        } catch (err) {
          console.warn("⚠️ Gagal cache:", url, err);
        }
      }
    })
  );
});

// Activate Service Worker & hapus cache lama
self.addEventListener("activate", (event) => {
  console.log("⚙️ Activating new Service Worker...");
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Halaman offline fallback
const offlinePage = "offline.html";

// Fetch handler (navigate → offline fallback)
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedOffline = await cache.match(offlinePage);
        return cachedOffline || new Response("Offline page not found.", { status: 404 });
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => cachedResponse || fetch(event.request))
    );
  }
});
