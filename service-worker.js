const CACHE_NAME = "fadilweb-cache-v4";
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

// INSTALL — cache semua file di atas
self.addEventListener("install", (event) => {
  console.log("📦 Menginstal Service Worker dan menyimpan cache...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// AKTIVASI — hapus cache lama
self.addEventListener("activate", (event) => {
  console.log("⚙️ Mengaktifkan Service Worker baru...");
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

// FETCH — gunakan cache jika offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Simpan versi terbaru ke cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(async () => {
        // Jika gagal (offline), ambil dari cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;

        // Jika tidak ada di cache (halaman baru), tampilkan offline.html
        if (event.request.mode === "navigate" || event.request.destination === "document") {
          return caches.match("offline.html");
        }
      })
  );
});
