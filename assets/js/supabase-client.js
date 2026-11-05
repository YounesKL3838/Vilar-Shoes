/* Vilar - supabase-client.js */
(function () {
  var c = window.VILAR_CONFIG || {};
  var ok = !!(c.SUPABASE_URL && c.SUPABASE_ANON_KEY &&
              c.SUPABASE_URL.indexOf('YOUR_') === -1 &&
              c.SUPABASE_ANON_KEY.indexOf('YOUR_') === -1 &&
              window.supabase && window.supabase.createClient);
  window.VILAR_CONFIGURED = ok;
  if (ok) {
    try {
      var l = document.createElement('link');
      l.rel = 'preconnect'; l.href = new URL(c.SUPABASE_URL).origin; l.crossOrigin = 'anonymous';
      document.head.appendChild(l);
    } catch (e) {}
  }
  window.sb = ok ? window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY) : null;
})();
