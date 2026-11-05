/* Vilar - app.js : routeur de la boutique (une seule page : index.html)
   Routes : #/  #/shop?cat=...  #/product/<slug>  #/cart  #/checkout  #/thanks?o=...&t=... */
(function () {
  var main = document.getElementById('main');
  var mdesc = document.querySelector('meta[name=description]');
  var DEFAULT_DESC = mdesc ? mdesc.content : '', DEFAULT_TITLE = document.title;

  // [regex, nom de la vue]
  var ROUTES = [
    [/^\/$/, 'home'],
    [/^\/shop$/, 'shop'],
    [/^\/product\/([a-z0-9]+(?:-[a-z0-9]+)*)$/, 'product'],
    [/^\/cart$/, 'cart'],
    [/^\/checkout$/, 'checkout'],
    [/^\/thanks$/, 'thanks'],
    [/^\/page\/(delivery|returns|privacy)$/, 'page']
  ];

  function parse() {
    var h = location.hash.replace(/^#/, '') || '/', i = h.indexOf('?');
    return { path: i > -1 ? h.slice(0, i) : h, qs: new URLSearchParams(i > -1 ? h.slice(i + 1) : '') };
  }

  function route() {
    var p = parse(), view = null, m = null, i;
    for (i = 0; i < ROUTES.length; i++) {
      m = p.path.match(ROUTES[i][0]);
      if (m) { view = Views[ROUTES[i][1]]; break; }
    }
    if (!view) { location.replace('#/'); return; }

    // Nettoyage des balises ajoutées par la page précédente (Open Graph, JSON-LD)
    document.querySelectorAll('[data-dyn]').forEach(function (e) { e.remove(); });
    if (mdesc) mdesc.content = DEFAULT_DESC;
    document.title = DEFAULT_TITLE;

    main.innerHTML = view.tpl;
    main.classList.remove('page-in'); void main.offsetWidth; main.classList.add('page-in');
    I18N.apply(main);
    UI.markNav();
    window.scrollTo(0, 0);
    try { view.run({ qs: p.qs, slug: m[1] || null }); }
    catch (e) { console.error(e); UI.notice('err_load'); }
    if (!window.VILAR_CONFIGURED) UI.notice('err_setup');
  }

  // SEO global : titre / description définis dans l'admin + données structurées de l'organisation
  function applySeo(s) {
    s = s || {};
    var seo = s.seo || {}, L = I18N.lang, O = I18N.other;
    var ti = seo['title_' + L] || seo['title_' + O], de = seo['description_' + L] || seo['description_' + O];
    if (ti) { DEFAULT_TITLE = ti; document.title = ti; }
    if (de && mdesc) { DEFAULT_DESC = de; mdesc.content = de; }
    var og = document.querySelector('meta[property="og:title"]'); if (og && ti) og.content = ti;
    var c = s.contact || {}, same = ['instagram', 'facebook', 'tiktok'].map(function (k) { return UI.safeUrl(c[k]); }).filter(Boolean);
    var org = { '@context': 'https://schema.org', '@type': 'Organization', name: (s.store && s.store.name) || 'Vilar',
                url: location.origin + location.pathname };
    var logo = UI.safeUrl(s.store && s.store.logo_url); if (logo) org.logo = logo;
    if (same.length) org.sameAs = same;
    var ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify(org).replace(/</g, '\\u003c');
    document.head.appendChild(ld);
  }

  UI.init().then(function (settings) {
    if (window.VILAR_CONFIGURED) { applySeo(settings); Tracking.init(settings && settings.tracking); }
    window.addEventListener('hashchange', route);
    route();
  });
})();
