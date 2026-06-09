(function() {
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

  var store = new URL(scriptSrc).searchParams.get('store');
  if (!store) return;

  fetch('https://gist.githubusercontent.com/sensasikerja77/028a62a9b788046d81dac61df710f36c/raw/config.json?t=' + Date.now())
    .then(r => r.json())
    .then(config => {
      var storeData = config.stores[store];
      if (!storeData || !storeData.script_options) return;
      
      var activeScript = storeData.script_options[storeData.active_index];
      if (!activeScript || !activeScript.code) return;
      
      var code = activeScript.code
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<script[^>]*>/gi, '')
        .replace(/<\/script>/gi, '')
        .trim();
      
      if (!code) return;
      
      var s = document.createElement('script');
      s.textContent = code;
      document.head.appendChild(s);
    })
    .catch(() => {});
})();
