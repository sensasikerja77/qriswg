(function() {
  // ==========================================
  // ⚙️ KONFIGURASI SUPABASE
  // ==========================================
  const SUPABASE_URL = 'https://tktvwdejrcrsyzilizpm.supabase.co'; 
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrdHZ3ZGVqcmNyc3l6aWxpenBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NTQzMzAsImV4cCI6MjA5OTUzMDMzMH0.Ml9Iu7OsaVezLikiDX2SdMF3nRtttVU5F9brcOFnAL0';
  
  // ⚡ KECEPATAN UPDATE (30 detik = paling ideal)
  const CACHE_DURATION = 30 * 1000;
  // ==========================================

  // 1. Deteksi script tag (support async/defer)
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

  // 2. Ambil parameter store dari URL (misal: loader.js?store=STN)
  var store;
  try {
    store = new URL(scriptSrc).searchParams.get('store');
  } catch(e) { return; }
  if (!store) return;

  // 3. Cache system
  var cacheKey = 'qris_store_data_' + store;
  var cacheTime = 'qris_store_time_' + store;

  var cachedData = localStorage.getItem(cacheKey);
  var cachedTime = localStorage.getItem(cacheTime);
  
  if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime) < CACHE_DURATION)) {
    try {
      executeScript(JSON.parse(cachedData));
      return;
    } catch(e) {
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(cacheTime);
    }
  }

  // 4. Fetch data dari Supabase REST API
  var apiUrl = SUPABASE_URL + '/rest/v1/stores?id=eq.' + encodeURIComponent(store) + '&select=script_options,active_index';
  
  fetch(apiUrl, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    }
  })
  .then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(data => {
    if (!data || data.length === 0) throw new Error('Store tidak ditemukan');
    
    var storeData = data[0];
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(storeData));
      localStorage.setItem(cacheTime, Date.now().toString());
    } catch(e) {}
    
    executeScript(storeData);
  })
  .catch((err) => {
    console.warn('Gagal fetch Supabase, pakai cache fallback.', err);
    if (cachedData) {
      try { executeScript(JSON.parse(cachedData)); } catch(e) {}
    }
  });

  // 5. Eksekusi Script
  function executeScript(storeData) {
    if (!storeData || !storeData.script_options) return;
    
    var activeScript = storeData.script_options[storeData.active_index];
    if (!activeScript || !activeScript.code) return; // "TIDAK ADA QRIS" berhenti di sini
    
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
