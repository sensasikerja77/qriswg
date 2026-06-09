// Letakkan di halaman target (via Tampermonkey, bookmarklet, atau console)
(async function() {
  var store = new URLSearchParams(location.search).get('store');
  if (!store) return;
  
  try {
    // Cache-buster dengan timestamp (meski CDN GitHub kadang tetap cache)
    var url = 'https://gist.githubusercontent.com/sensasikerja77/028a62a9b788046d81dac61df710f36c/raw/config.json?t=' + Date.now();
    var r = await fetch(url);
    if (!r.ok) return;
    var d = await r.json();
    var s = d.stores[store];
    if (!s) return;
    
    var activeOpt = s.script_options[s.active_index];
    if (activeOpt && activeOpt.code) {
      var t = document.createElement('script');
      t.textContent = activeOpt.code;
      document.head.appendChild(t);
    }
  } catch(e) {
    console.error('[QRIS Loader] Error:', e);
  }
})();
