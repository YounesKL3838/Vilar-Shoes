/* Vilar - ui.js : en-tête, pied de page, cartes produit, accès aux données */
(function () {
  var t = I18N.t, money = I18N.money, pick = I18N.pick;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function safeUrl(u) { return /^https:\/\//i.test(u || '') ? u : ''; }
  function digits(s) { return String(s || '').replace(/[^\d+]/g, ''); }

  /* ---------- Réglages du site (table site_settings) ---------- */
  var settingsPromise = null;
  function settings() {
    if (!window.VILAR_CONFIGURED) return Promise.resolve({});
    if (!settingsPromise) {
      settingsPromise = sb.from('site_settings').select('key,value').then(function (r) {
        var m = {};
        (r.data || []).forEach(function (row) { m[row.key] = row.value; });
        return m;
      }).catch(function () { return {}; });
    }
    return settingsPromise;
  }

  /* ---------- Produits ---------- */
  var PRODUCT_SELECT = '*, categories(slug,name_ar,name_fr), product_images(url,sort_order), ' +
                       'product_variants(id,size,color_name,color_hex,stock,is_active)';

  function normalize(p) {
    p.images = (p.product_images || []).slice()
      .sort(function (a, b) { return a.sort_order - b.sort_order; })
      .map(function (i) { return safeUrl(i.url); }).filter(Boolean);
    p.variants = (p.product_variants || []).filter(function (v) { return v.is_active; });
    p.available = p.variants.some(function (v) { return v.stock > 0; });
    p.finalPrice = p.sale_price != null ? Number(p.sale_price) : Number(p.price);
    return p;
  }
  function fetchProducts() {
    return sb.from('products').select(PRODUCT_SELECT).eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(function (r) { if (r.error) throw r.error; return r.data.map(normalize); });
  }
  function fetchProduct(slug) {
    return sb.from('products').select(PRODUCT_SELECT).eq('slug', slug).eq('is_active', true).maybeSingle()
      .then(function (r) { if (r.error) throw r.error; return r.data ? normalize(r.data) : null; });
  }
  function discountPct(p) {
    return p.sale_price != null && Number(p.price) > 0
      ? Math.round((1 - Number(p.sale_price) / Number(p.price)) * 100) : 0;
  }
  function priceHtml(p) {
    return '<div class="price"><span class="now">' + money(p.finalPrice) + '</span>' +
      (p.sale_price != null ? '<span class="was">' + money(p.price) + '</span>' : '') + '</div>';
  }

  function productCard(p) {
    var name = pick(p, 'name'), pct = discountPct(p);
    var img1 = p.images[0], img2 = p.images[1];
    var badges = '';
    if (!p.available) badges += '<span class="badge sold">' + esc(t('badge_sold')) + '</span>';
    if (pct) badges += '<span class="badge sale"><bdi dir="ltr">-' + pct + '%</bdi></span>';
    if (p.is_new) badges += '<span class="badge">' + esc(t('badge_new')) + '</span>';
    return '<a class="card" href="#/product/' + encodeURIComponent(p.slug) + '">' +
      '<div class="card-media">' + (badges ? '<div class="badges">' + badges + '</div>' : '') +
      (img1 ? '<img src="' + esc(img1) + '" alt="' + esc(name) + '" loading="lazy" decoding="async" width="600" height="750">' : '') +
      (img2 ? '<img class="alt" src="' + esc(img2) + '" alt="" loading="lazy" decoding="async" width="600" height="750">' : '') +
      '</div><h3 class="card-name">' + esc(name) + '</h3>' + priceHtml(p) + '</a>';
  }
  function skeletons(n) {
    var s = ''; for (var i = 0; i < n; i++) s += '<div class="skeleton"></div>'; return s;
  }

  /* ---------- Toast & messages ---------- */
  var toastTimer;
  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2600);
  }
  function notice(msgKey, target) {
    var host = target || document.getElementById('main');
    if (!host) return;
    var d = document.createElement('div');
    d.className = 'notice wrap'; d.textContent = t(msgKey);
    host.prepend(d);
  }

  /* ---------- Éléments communs ---------- */
  var ICON_BAG = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
  var ICON_MENU = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

  function renderHeader() {
    var host = document.getElementById('site-header');
    if (!host) return;
    host.className = 'site-header';
    host.innerHTML =
      '<div class="bar">' +
      '<button class="icon-btn menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="' + esc(t('menu')) + '">' + ICON_MENU + '</button>' +
      '<a class="brand" href="#/">Vilar</a>' +
      '<nav class="nav" id="nav">' +
      '<a href="#/" data-r="/">' + esc(t('nav_home')) + '</a>' +
      '<a href="#/shop" data-r="/shop">' + esc(t('nav_shop')) + '</a>' +
      '<a href="#/shop?cat=new" data-r="/shop?cat=new">' + esc(t('nav_new')) + '</a>' +
      '<a href="#/shop?cat=sale" data-r="/shop?cat=sale">' + esc(t('nav_sale')) + '</a>' +
      '</nav>' +
      '<div class="tools"><button class="lang-btn" type="button">' + esc(t('lang_other')) + '</button>' +
      '<a class="icon-btn" href="#/cart" aria-label="' + esc(t('cart')) + '">' + ICON_BAG + '<span class="cart-count" hidden></span></a></div></div>';

    var btn = host.querySelector('.menu-btn'), nav = host.querySelector('.nav');
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    host.querySelector('.lang-btn').addEventListener('click', function () { I18N.setLang(I18N.other); });
    updateCount(); markNav();
  }
  // Met en évidence le lien du menu correspondant à la route courante et referme le menu mobile
  function markNav() {
    var cur = location.hash.replace(/^#/, '') || '/';
    document.querySelectorAll('#nav a').forEach(function (a) {
      if (a.dataset.r === cur) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    var nav = document.getElementById('nav'), btn = document.querySelector('.menu-btn');
    if (nav) nav.classList.remove('open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
  function updateCount() {
    var el = document.querySelector('.cart-count');
    if (!el) return;
    var n = Cart.count();
    el.textContent = n; el.hidden = n === 0;
  }

  function renderFooter(s) {
    var host = document.getElementById('site-footer');
    if (!host) return;
    var c = (s && s.contact) || {}, items = '';
    if (c.phone) items += '<li><a href="tel:' + esc(digits(c.phone)) + '" dir="ltr">' + esc(c.phone) + '</a></li>';
    if (c.whatsapp) items += '<li><a href="https://wa.me/' + esc(digits(c.whatsapp).replace(/^\+/, '')) + '" rel="noopener">WhatsApp</a></li>';
    if (c.email) items += '<li><a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a></li>';
    ['instagram', 'facebook', 'tiktok'].forEach(function (k) {
      var u = safeUrl(c[k]);
      if (u) items += '<li><a href="' + esc(u) + '" rel="noopener" target="_blank">' + k.charAt(0).toUpperCase() + k.slice(1) + '</a></li>';
    });
    var po = (s && s.policies) || {}, pitems = '';
    ['delivery', 'returns', 'privacy'].forEach(function (k) {
      if (po[k + '_ar'] || po[k + '_fr']) pitems += '<li><a href="#/page/' + k + '">' + esc(t('pol_' + k)) + '</a></li>';
    });
    host.className = 'site-footer';
    host.innerHTML =
      '<div class="foot"><div><a class="brand" href="#/">Vilar</a><p>' + esc(t('foot_tag')) + '</p></div>' +
      '<div><h4>' + esc(t('foot_shop')) + '</h4><ul>' +
      '<li><a href="#/shop">' + esc(t('nav_shop')) + '</a></li>' +
      '<li><a href="#/shop?cat=new">' + esc(t('nav_new')) + '</a></li>' +
      '<li><a href="#/shop?cat=sale">' + esc(t('nav_sale')) + '</a></li></ul></div>' +
      (pitems ? '<div><h4>' + esc(t('foot_info')) + '</h4><ul>' + pitems + '</ul></div>' : '') +
      (items ? '<div><h4>' + esc(t('foot_contact')) + '</h4><ul>' + items + '</ul></div>' : '') +
      '</div><div class="copy">© ' + new Date().getFullYear() + ' ' + esc((s && s.store && s.store.name) || 'Vilar') + '</div>';
  }

  /* ---------- Thème (couleurs choisies dans l'admin) et image de marque ---------- */
  function hexToRgb(h) { return [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16); }); }
  function blend(a, b, w) {
    var x = hexToRgb(a), y = hexToRgb(b);
    return '#' + x.map(function (v, i) { return ('0' + Math.round(v * (1 - w) + y[i] * w).toString(16)).slice(-2); }).join('');
  }
  function applyTheme(th) {
    if (!th) return;
    var ok = function (v) { return /^#[0-9a-f]{6}$/i.test(v || ''); }, r = document.documentElement.style;
    if (ok(th.bg)) {
      r.setProperty('--ivory', th.bg);
      r.setProperty('--bone', blend(th.bg, ok(th.beige) ? th.beige : '#D9C7B0', 0.25));
      var tc = document.querySelector('meta[name=theme-color]'); if (tc) tc.content = th.bg;
    }
    if (ok(th.text)) r.setProperty('--ink', th.text);
    if (ok(th.accent)) r.setProperty('--blush', th.accent);
    if (ok(th.beige)) r.setProperty('--sand', th.beige);
  }
  function applyBranding(st) {
    var name = (st && st.name) || 'Vilar', logo = safeUrl(st && st.logo_url);
    document.querySelectorAll('.brand').forEach(function (b) {
      var inHeader = !!b.closest('.site-header, .lp-top');
      if (logo && inHeader) b.innerHTML = '<img class="brand-img" src="' + esc(logo) + '" alt="' + esc(name) + '" height="40">';
      else b.textContent = name;
    });
  }

  function renderAnnouncement(s) {
    var host = document.getElementById('announce');
    var a = s && s.announcement;
    if (!host || !a || !a.enabled) return;
    var txt = a[I18N.lang] || a[I18N.other];
    if (!txt) return;
    host.className = 'announce'; host.textContent = txt;
  }

  function captureUtm() {
    try {
      var q = new URLSearchParams(location.search), u = {}, any = false;
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'ttclid'].forEach(function (k) {
        var v = q.get(k);
        if (v) { u[k] = v.slice(0, 100); any = true; }
      });
      if (any) sessionStorage.setItem('vilar_utm', JSON.stringify(u));
    } catch (e) {}
  }

  function init() {
    captureUtm();
    renderHeader();
    renderFooter({});
    document.addEventListener('vilar:cart', updateCount);
    window.addEventListener('storage', updateCount);
    I18N.apply();
    if (!window.VILAR_CONFIGURED) { notice('err_setup'); return Promise.resolve({}); }
    return settings().then(function (s) { applyTheme(s.theme); renderFooter(s); applyBranding(s.store); renderAnnouncement(s); return s; });
  }

  window.UI = { applyTheme: applyTheme, applyBranding: applyBranding, markNav: markNav, captureUtm: captureUtm, esc: esc, safeUrl: safeUrl, init: init, settings: settings, fetchProducts: fetchProducts,
                fetchProduct: fetchProduct, productCard: productCard, priceHtml: priceHtml, discountPct: discountPct,
                skeletons: skeletons, toast: toast, notice: notice };
})();
