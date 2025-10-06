const CACHE_NAME = "fadilweb-cache-v3";
const urlsToCache = [
  ".",
  "index.html",
  "About.html",
  "Contact.html",
  "offline.html",
  "images/senja2.jpg",
  "images/senja3.jpg",
  "images/unand.jpeg",
  "images/saya1.jpg",
  "manifest.json",
  "images/icons/logowebsite.png"
];

// Install — cache semua file
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Menyimpan cache awal...");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Aktivasi — hapus cache lama
self.addEventListener("activate", (event) => {
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

// Fetch — ambil dari cache jika offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Simpan versi terbaru ke cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match("./offline.html"))
      )
  );
});


