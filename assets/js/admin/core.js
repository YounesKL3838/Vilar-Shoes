/* Vilar admin - core.js : connexion, routeur (#/...), menu et utilitaires.
   Toute l'administration vit dans admin.html ; chaque écran est une "vue" (assets/js/admin/*.js). */
(function () {
  var STATUS = {
    new: 'Nouvelle commande', pending_confirmation: 'Confirmation en attente', confirmed: 'Confirmée',
    preparing: 'En préparation', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée', returned: 'Retour'
  };
  var NAV = [
    ['dashboard', '#/dashboard', 'الإحصائيات'],
    ['orders', '#/orders', 'الطلبات'],
    ['products', '#/products', 'المنتجات'],
    ['landing', '#/landing', 'صفحات الهبوط'],
    ['categories', '#/categories', 'التصنيفات'],
    ['reviews', '#/reviews', 'آراء العملاء'],
    ['delivery', '#/delivery', 'التوصيل'],
    ['settings', '#/settings', 'الإعدادات']
  ];
  // [regex, nom de la vue, entrée de menu active]
  var ROUTES = [
    [/^\/dashboard$/, 'dashboard', 'dashboard'],
    [/^\/orders$/, 'orders', 'orders'],
    [/^\/products$/, 'products', 'products'],
    [/^\/product\/(new|[0-9a-f-]{36})$/i, 'product-edit', 'products'],
    [/^\/categories$/, 'categories', 'categories'],
    [/^\/delivery$/, 'delivery', 'delivery'],
    [/^\/reviews$/, 'reviews', 'reviews'],
    [/^\/settings$/, 'settings', 'settings'],
    [/^\/landing$/, 'landing-pages', 'landing'],
    [/^\/landing\/(new|[0-9a-f-]{36})$/i, 'landing-edit', 'landing'],
    [/^\/invoice\/([0-9a-f-]{36})$/i, 'invoice', 'orders']
  ];
  var nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
  var $ = function (id) { return document.getElementById(id); };
  var views = {}, authed = false, email = '';

  /* ---------- Utilitaires ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) { return nf.format(Math.round(Number(n) || 0)).replace(/[\u202f\u00a0\s]/g, '\u00a0') + '\u00a0د.ج'; }
  // Isolat LTR (U+2066 ... U+2069) : "04/11/2026 23:03" garde son ordre dans une page RTL
  function fmtDate(d) { return '\u2066' + new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) + '\u2069'; }
  function statusPill(s) { return '<span class="pill st-' + esc(s) + '">' + esc(STATUS[s] || s) + '</span>'; }
  function slugify(s) {
    var r = String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return r || ('item-' + Math.random().toString(36).slice(2, 8));
  }
  function uuid() {
    return (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
      : 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  // Redimensionne, recadre au centre au format voulu (ratio = largeur/hauteur, ex. 4/5) et convertit en WebP
  function resizeImage(file, max, ratio) {
    return createImageBitmap(file).then(function (bmp) {
      var sx = 0, sy = 0, sw = bmp.width, sh = bmp.height;
      if (ratio) {
        var cur = sw / sh;
        if (cur > ratio) { sw = Math.round(sh * ratio); sx = Math.round((bmp.width - sw) / 2); }
        else if (cur < ratio) { sh = Math.round(sw / ratio); sy = Math.round((bmp.height - sh) / 2); }
      }
      var s = Math.min(1, (max || 1400) / Math.max(sw, sh));
      var cv = document.createElement('canvas');
      cv.width = Math.round(sw * s); cv.height = Math.round(sh * s);
      cv.getContext('2d').drawImage(bmp, sx, sy, sw, sh, 0, 0, cv.width, cv.height);
      return new Promise(function (res) {
        cv.toBlob(function (b) {
          if (b && b.type === 'image/webp') res(b); else cv.toBlob(function (j) { res(j); }, 'image/jpeg', 0.85);
        }, 'image/webp', 0.82);
      });
    });
  }
  var toastTimer;
  function toast(msg, isErr) {
    var el = $('toast'); if (!el) return;
    el.textContent = msg; el.className = 'toast show' + (isErr ? ' err' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.className = 'toast'; }, 3200);
  }
  function errText(e) {
    var m = String((e && e.message) || e || '');
    if (/duplicate key|23505/.test(m)) return 'القيمة مستعملة مسبقاً (تكرار).';
    if (/foreign key|23503/.test(m)) return 'لا يمكن الحذف لأن هناك بيانات مرتبطة (طلبات سابقة). عطّل العنصر بدلاً من حذفه.';
    if (/violates check|23514/.test(m)) return 'قيمة غير صالحة.';
    if (/row-level security|42501|FORBIDDEN/.test(m)) return 'لا تملك صلاحية هذه العملية.';
    return m || 'حدث خطأ.';
  }

  /* ---------- Mise en page (une seule fois) ---------- */
  function layout() {
    var side = $('side'), top = $('top');
    side.className = 'side';
    side.innerHTML = '<a class="brand" href="#/dashboard">Vilar</a><nav id="side-nav">' +
      NAV.map(function (n) { return '<a href="' + n[1] + '" data-k="' + n[0] + '">' + n[2] + '</a>'; }).join('') +
      '<a href="index.html" target="_blank" rel="noopener">عرض المتجر ↗</a></nav>';
    top.className = 'top';
    top.innerHTML = '<button class="btn ghost sm menu-btn" type="button" aria-label="القائمة">☰</button>' +
      '<span class="who" dir="ltr">' + esc(email) + '</span>' +
      '<button class="btn ghost sm" type="button" id="logout">تسجيل الخروج</button>';
    top.querySelector('.menu-btn').addEventListener('click', function () { side.classList.toggle('open'); });
    $('logout').addEventListener('click', function () {
      sb.auth.signOut().then(function () { authed = false; location.hash = ''; showLogin(); });
    });
  }
  function markNav(key) {
    document.querySelectorAll('#side-nav a[data-k]').forEach(function (a) {
      if (a.dataset.k === key) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    $('side').classList.remove('open');
  }

  /* ---------- Routeur ---------- */
  function parseHash() {
    var h = location.hash.replace(/^#/, '') || '/dashboard', i = h.indexOf('?');
    return { path: i > -1 ? h.slice(0, i) : h, qs: new URLSearchParams(i > -1 ? h.slice(i + 1) : '') };
  }
  function route() {
    if (!authed) return;
    var p = parseHash(), r = null, m = null, i;
    for (i = 0; i < ROUTES.length; i++) {
      m = p.path.match(ROUTES[i][0]);
      if (m) { r = ROUTES[i]; break; }
    }
    if (!r) { location.replace('#/dashboard'); return; }
    var v = views[r[1]];
    if (!v) return;
    var params = { id: m[1] && m[1] !== 'new' ? m[1] : null, qs: p.qs };
    markNav(r[2]);
    $('app').innerHTML = v.tpl;
    window.scrollTo(0, 0);
    try { v.run(params); } catch (e) { console.error(e); toast(errText(e), true); }
  }

  /* ---------- Connexion ---------- */
  function showLogin(msg) {
    $('shell').hidden = true; $('login').hidden = false;
    $('login-msg').textContent = msg || '';
    $('login-go').disabled = false;
  }
  function enter(mail) {
    authed = true; email = mail;
    $('login').hidden = true; $('shell').hidden = false;
    layout();
    if (!location.hash) location.replace('#/dashboard');
    route();
  }
  function checkAdmin(user) {
    return sb.rpc('is_admin').then(function (a) {
      if (a.error || a.data !== true) {
        return sb.auth.signOut().then(function () { showLogin('هذا الحساب ليس مديراً.'); });
      }
      enter(user.email);
    });
  }
  function start() {
    $('login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!window.VILAR_CONFIGURED) return;
      var msg = $('login-msg'), go = $('login-go');
      msg.textContent = ''; go.disabled = true;
      sb.auth.signInWithPassword({ email: $('login-email').value.trim(), password: $('login-pw').value })
        .then(function (r) {
          if (r.error) { msg.textContent = 'البريد أو كلمة المرور غير صحيحة.'; go.disabled = false; return; }
          $('login-pw').value = '';
          return checkAdmin(r.data.user);
        }).catch(function () { msg.textContent = 'تعذر الاتصال.'; go.disabled = false; });
    });
    window.addEventListener('hashchange', route);
    if (!window.VILAR_CONFIGURED) { showLogin('املأ ملف assets/js/config.js برابط Supabase والمفتاح العام.'); $('login-go').disabled = true; return; }
    sb.auth.getSession().then(function (r) {
      if (!r.data.session) { showLogin(); return; }
      return checkAdmin(r.data.session.user);
    }).catch(function () { showLogin('تعذر الاتصال.'); });
  }

  window.Admin = { STATUS: STATUS, views: views, esc: esc, money: money, fmtDate: fmtDate, statusPill: statusPill,
                   slugify: slugify, uuid: uuid, resizeImage: resizeImage, toast: toast, errText: errText };
  window.addEventListener('DOMContentLoaded', start);
})();
