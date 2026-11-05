/* Vilar - tracking.js : Meta Pixel + TikTok Pixel (chargés seulement si un ID est configuré)
   Les IDs se règlent dans l'admin (page Landing pages > Suivi publicitaire). */
(function () {
  var meta = false, tt = false;

  function loadMeta(id) {
    if (!/^\d{5,20}$/.test(id || '') || window.fbq) return;
    var n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!window._fbq) window._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    var s = document.createElement('script');
    s.async = true; s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
    window.fbq('init', id);
    window.fbq('track', 'PageView');
    meta = true;
  }

  function loadTikTok(id) {
    if (!/^[A-Za-z0-9]{8,30}$/.test(id || '') || (window.ttq && window.ttq._loaded)) return;
    var t = 'ttq', ttq = window[t] = window[t] || [];
    ttq._loaded = true;
    ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
    ttq.setAndDefer = function (o, m) {
      o[m] = function () { o.push([m].concat(Array.prototype.slice.call(arguments, 0))); };
    };
    ttq.methods.forEach(function (m) { ttq.setAndDefer(ttq, m); });
    var src = 'https://analytics.tiktok.com/i18n/pixel/events.js';
    ttq._i = ttq._i || {}; ttq._i[id] = []; ttq._i[id]._u = src;
    ttq._t = ttq._t || {}; ttq._t[id] = +new Date();
    ttq._o = ttq._o || {}; ttq._o[id] = {};
    var s = document.createElement('script');
    s.async = true; s.src = src + '?sdkid=' + id + '&lib=' + t;
    document.head.appendChild(s);
    ttq.page();
    tt = true;
  }

  // ev : 'ViewContent' | 'InitiateCheckout' | 'Purchase'
  function track(ev, data) {
    data = data || {};
    try {
      if (meta && window.fbq) window.fbq('track', ev, data);
      if (tt && window.ttq) window.ttq.track(ev === 'Purchase' ? 'CompletePayment' : ev, data);
    } catch (e) {}
  }

  function init(trackingSettings) {
    var s = trackingSettings || {};
    loadMeta(String(s.meta_pixel_id || '').trim());
    loadTikTok(String(s.tiktok_pixel_id || '').trim());
  }

  window.Tracking = { init: init, track: track };
})();
