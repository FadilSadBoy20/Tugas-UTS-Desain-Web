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
  "logowebsite.png"
];

// INSTALL — cache resources, tapi toleran jika ada yang gagal
self.addEventListener("install", (event) => {
  console.log("📦 Installing Service Worker — caching resources...");
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      for (const url of urlsToCache) {
        try {
          const res = await fetch(url);
          if (res && res.ok) {
            await cache.put(url, res.clone());
            console.log("✅ Cached", url);
          } else {
            console.warn("⚠️ Not cached (bad response):", url);
          }
        } catch (err) {
          console.warn("⚠️ Failed to fetch/cache", url, err);
        }
      }
      await self.skipWaiting();
    })()
  );
});

// ACTIVATE — hapus cache lama jika ada
self.addEventListener("activate", (event) => {
  console.log("⚙️ Activating new Service Worker...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys
        .filter((k) => k !== CACHE_NAME)
        .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// FETCH — network-first, fallback ke cache; untuk navigation fallback ke offline.html
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(event.request);
        // simpan update di cache (non-blocking)
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, networkResponse.clone()).catch(()=>{});
        return networkResponse;
      } catch (err) {
        // jaringan gagal -> cari di cache
        const cached = await caches.match(event.request);
        if (cached) return cached;

        // jika navigasi document (halaman), kembalikan offline.html
        if (event.request.mode === "navigate" || event.request.destination === "document") {
          const offlineResp = await caches.match("offline.html");
          if (offlineResp) return offlineResp;
        }

        // terakhir: gagal total
        return new Response("Offline and no cached version available.", { status: 503, statusText: "Service Unavailable" });
      }
    })()
  );
});
