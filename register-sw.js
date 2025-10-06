// register-sw.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker terdaftar:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ Gagal mendaftarkan Service Worker:', error);
      });
  });
}
