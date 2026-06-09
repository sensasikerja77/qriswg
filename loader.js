// loader.js - Final version dengan mapping support
(function() {
  'use strict';
  
  // 1. Deteksi script tag
  var scriptSrc = '';
  
  if (document.currentScript && document.currentScript.src) {
    scriptSrc = document.currentScript.src;
  }
  
  if (!scriptSrc) {
    var scripts = document.querySelectorAll('script[src*="loader.js"]');
    if (scripts.length > 0) {
      scriptSrc = scripts[scripts.length - 1].src;
    }
  }
  
  if (!scriptSrc) {
    var allScripts = document.getElementsByTagName('script');
    for (var i = allScripts.length - 1; i >= 0; i--) {
      if (allScripts[i].src && allScripts[i].src.indexOf('loader.js') !== -1) {
        scriptSrc = allScripts[i].src;
        break;
      }
    }
  }
  
  if (!scriptSrc) {
    console.error('[QRIS Loader] ❌ Tidak dapat menemukan src script tag');
    return;
  }
  
  // 2. Parse URL
  var store;
  try {
    var url = new URL(scriptSrc);
    store = url.searchParams.get('store');
  } catch(e) {
    console.error('[QRIS Loader] ❌ Error parse URL:', e);
    return;
  }
  
  if (!store) {
    console.warn('[QRIS Loader] ⚠️ Parameter ?store= tidak ditemukan');
    return;
  }
  
  console.log('[QRIS Loader] 📦 Loading untuk store:', store);
  
  // 3. Fetch dan jalankan
  (async function() {
    try {
      var rawUrl = 'https://gist.githubusercontent.com/sensasikerja77/028a62a9b788046d81dac61df710f36c/raw/config.json?t=' + Date.now();
      
      var response = await fetch(rawUrl);
      if (!response.ok) {
        console.error('[QRIS Loader] ❌ Gagal fetch:', response.status);
        return;
      }
      
      var config = await response.json();
      var storeData = config.stores[store];
      
      if (!storeData) {
        console.warn('[QRIS Loader] ⚠️ Store "' + store + '" tidak ditemukan');
        return;
      }
      
      // 4. Check mapping
      var sourceKey = storeData.use_script_from || store;
      var sourceStore = config.stores[sourceKey];
      
      if (!sourceStore) {
        console.warn('[QRIS Loader] ⚠️ Source store "' + sourceKey + '" tidak ditemukan');
        return;
      }
      
      if (sourceKey !== store) {
        console.log('[QRIS Loader] 🔀 Mapping ke:', sourceKey);
      }
      
      // 5. Ambil script aktif
      var activeIndex = sourceStore.active_index;
      var scriptOptions = sourceStore.script_options;
      
      if (!scriptOptions || scriptOptions.length === 0) {
        console.warn('[QRIS Loader] ⚠️ Tidak ada script options');
        return;
      }
      
      if (activeIndex < 0 || activeIndex >= scriptOptions.length) {
        console.warn('[QRIS Loader] ⚠️ active_index tidak valid');
        return;
      }
      
      var activeScript = scriptOptions[activeIndex];
      
      if (!activeScript || !activeScript.code) {
        console.warn('[QRIS Loader] ⚠️ Script aktif kosong');
        return;
      }
      
      console.log('[QRIS Loader] ✅ Menjalankan:', activeScript.name);
      
      // 6. Inject script
      var scriptElement = document.createElement('script');
      scriptElement.textContent = activeScript.code;
      document.head.appendChild(scriptElement);
      
    } catch(error) {
      console.error('[QRIS Loader] ❌ Error:', error);
    }
  })();
})();
