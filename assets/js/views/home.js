/* Vilar - views/home.js : vue de la boutique (affichée dans index.html) */
window.Views = window.Views || {};
Views["home"] = {
  tpl: "<section class=\"hero\"><div class=\"hero-copy\"><span class=\"eyebrow\" data-i18n=\"hero_eyebrow\"></span><h1 id=\"hero-title\" data-i18n=\"hero_title\"></h1><p id=\"hero-sub\" data-i18n=\"hero_sub\"></p><div class=\"hero-actions\"><a class=\"btn\" href=\"#/shop\" data-i18n=\"hero_cta\"></a><a class=\"btn btn-ghost\" href=\"#/shop?cat=sale\" data-i18n=\"nav_sale\"></a></div></div><div class=\"hero-visual\"><div class=\"hero-media\" id=\"hero-art\"><span class=\"hero-word\" aria-hidden=\"true\">Vilar</span></div><div class=\"hero-chip chip-a\"><svg viewBox=\"0 0 24 24\" width=\"22\" height=\"22\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 7h11v9H3z\"/><path d=\"M14 10h4l3 3v3h-7z\"/><circle cx=\"7\" cy=\"18\" r=\"1.8\"/><circle cx=\"17\" cy=\"18\" r=\"1.8\"/></svg><span data-i18n=\"f1\"></span></div><div class=\"hero-chip chip-b\"><svg viewBox=\"0 0 24 24\" width=\"22\" height=\"22\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"2.6\"/></svg><span data-i18n=\"f2\"></span></div></div></section><div class=\"marquee\"><div class=\"marquee-track\"><div class=\"marquee-set\"><span data-i18n=\"f2\"></span><i></i><span data-i18n=\"f1\"></span><i></i><span data-i18n=\"f3\"></span><i></i><span data-i18n=\"f2\"></span><i></i><span data-i18n=\"f1\"></span><i></i><span data-i18n=\"f3\"></span><i></i></div><div class=\"marquee-set\" aria-hidden=\"true\"><span data-i18n=\"f2\"></span><i></i><span data-i18n=\"f1\"></span><i></i><span data-i18n=\"f3\"></span><i></i><span data-i18n=\"f2\"></span><i></i><span data-i18n=\"f1\"></span><i></i><span data-i18n=\"f3\"></span><i></i></div></div></div><p class=\"empty wrap\" id=\"empty-home\" data-i18n=\"store_soon\" hidden></p><section class=\"section\" id=\"sec-cats\" hidden><div class=\"wrap\"><div class=\"sec-head\"><h2 data-i18n=\"sec_cats\"></h2></div><div class=\"cat-grid\" id=\"cat-grid\"></div></div></section><section class=\"section tint\" id=\"sec-new\" hidden><div class=\"wrap\"><div class=\"sec-head\"><h2 data-i18n=\"sec_new\"></h2><a class=\"link-all\" href=\"#/shop?cat=new\" data-i18n=\"view_all\"></a></div><div class=\"grid\" id=\"grid-new\"></div></div></section><section class=\"section\" id=\"sec-best\" hidden><div class=\"wrap\"><div class=\"sec-head\"><h2 data-i18n=\"sec_best\"></h2><a class=\"link-all\" href=\"#/shop\" data-i18n=\"view_all\"></a></div><div class=\"grid\" id=\"grid-best\"></div></div></section><section class=\"section tint\" id=\"sec-sale\" hidden><div class=\"wrap\"><div class=\"sec-head\"><h2 data-i18n=\"sec_sale\"></h2><a class=\"link-all\" href=\"#/shop?cat=sale\" data-i18n=\"view_all\"></a></div><div class=\"grid\" id=\"grid-sale\"></div></div></section><section class=\"section\"><div class=\"wrap features\"><div class=\"feature\"><span class=\"ic\"><svg viewBox=\"0 0 24 24\" width=\"22\" height=\"22\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 7h11v9H3z\"/><path d=\"M14 10h4l3 3v3h-7z\"/><circle cx=\"7\" cy=\"18\" r=\"1.8\"/><circle cx=\"17\" cy=\"18\" r=\"1.8\"/></svg></span><h3 data-i18n=\"f1\"></h3><p data-i18n=\"f1d\"></p></div><div class=\"feature\"><span class=\"ic\"><svg viewBox=\"0 0 24 24\" width=\"22\" height=\"22\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"2.6\"/></svg></span><h3 data-i18n=\"f2\"></h3><p data-i18n=\"f2d\"></p></div><div class=\"feature\"><span class=\"ic\"><svg viewBox=\"0 0 24 24\" width=\"22\" height=\"22\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 12a8 8 0 0 1 13.5-5.8L20 8\"/><path d=\"M20 4v4h-4\"/><path d=\"M20 12a8 8 0 0 1-13.5 5.8L4 16\"/><path d=\"M4 20v-4h4\"/></svg></span><h3 data-i18n=\"f3\"></h3><p data-i18n=\"f3d\"></p></div></div></section><section class=\"section tint\" id=\"sec-reviews\" hidden><div class=\"wrap\"><div class=\"sec-head\"><h2 data-i18n=\"sec_reviews\"></h2></div><div class=\"reviews\" id=\"review-list\"></div></div></section><section class=\"section\"><div class=\"wrap\"><div class=\"newsletter\"><h2 data-i18n=\"nl_title\"></h2><p class=\"muted\" data-i18n=\"nl_sub\"></p><form class=\"nl-form\" id=\"nl-form\" novalidate><input class=\"field\" type=\"email\" name=\"email\" autocomplete=\"email\" inputmode=\"email\" data-i18n-ph=\"nl_email\" data-i18n-aria=\"nl_email\" dir=\"ltr\"><button class=\"btn\" type=\"submit\" data-i18n=\"nl_btn\"></button></form><div class=\"nl-msg\" id=\"nl-msg\" role=\"status\"></div></div></div></section>",
  run: function (params) {
  var t = I18N.t, pick = I18N.pick, esc = UI.esc;

  function fill(sectionId, gridId, list) {
    var sec = document.getElementById(sectionId);
    if (!list.length) return;
    document.getElementById(gridId).innerHTML = list.slice(0, 8).map(UI.productCard).join('');
    sec.hidden = false;
  }

  function renderHero(h) {
    h = h || {};
    var title = h['title_' + I18N.lang], sub = h['subtitle_' + I18N.lang];
    if (title) document.getElementById('hero-title').textContent = title;
    if (sub) document.getElementById('hero-sub').textContent = sub;
    var img = UI.safeUrl(h.image_url);
    if (img) {
      document.getElementById('hero-art').innerHTML =
        '<img src="' + esc(img) + '" alt="Vilar" width="800" height="1000" fetchpriority="high">';
    }
  }

  function renderCategories(cats, products) {
    var withProducts = cats.filter(function (c) {
      return products.some(function (p) { return p.categories && p.categories.slug === c.slug; });
    });
    if (!withProducts.length) return;
    document.getElementById('cat-grid').innerHTML = withProducts.map(function (c) {
      var img = UI.safeUrl(c.image_url), name = pick(c, 'name');
      return '<a class="cat" href="#/shop?cat=' + encodeURIComponent(c.slug) + '"><div class="cat-img">' +
        (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" decoding="async" width="400" height="500">'
             : '<div class="cat-ph" aria-hidden="true">' + esc(name.charAt(0)) + '</div>') +
        '<div class="cat-label"><b>' + esc(name) + '</b><i aria-hidden="true">↗</i></div></div></a>';
    }).join('');
    document.getElementById('sec-cats').hidden = false;
  }

  function renderReviews(list) {
    if (!list.length) return;
    document.getElementById('review-list').innerHTML = list.map(function (r) {
      var n = Math.max(1, Math.min(5, r.rating | 0));
      return '<figure class="review" style="margin:0"><div class="stars" role="img" aria-label="' + n + '/5">' +
        '★★★★★'.slice(0, n) + '<span style="color:var(--sand)">' + '★★★★★'.slice(n) + '</span></div>' +
        '<p>' + esc(r.body) + '</p><figcaption><b>' + esc(r.author) + '</b></figcaption></figure>';
    }).join('');
    document.getElementById('sec-reviews').hidden = false;
  }

  function initNewsletter() {
    var form = document.getElementById('nl-form'), msg = document.getElementById('nl-msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.email.value.trim().toLowerCase();
      msg.className = 'nl-msg';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
        msg.textContent = t('nl_err'); msg.classList.add('err'); return;
      }
      if (!window.VILAR_CONFIGURED) { msg.textContent = t('nl_fail'); msg.classList.add('err'); return; }
      var btn = form.querySelector('button'); btn.disabled = true;
      sb.from('newsletter_subscribers').insert({ email: email }).then(function (r) {
        btn.disabled = false;
        // 23505 = déjà inscrit : on répond positivement sans révéler l'état
        if (!r.error || r.error.code === '23505') {
          msg.textContent = t('nl_ok'); msg.classList.add('ok'); form.reset();
        } else { msg.textContent = t('nl_fail'); msg.classList.add('err'); }
      });
    });
  }

  Promise.resolve().then(function () {
    initNewsletter();
    if (!window.VILAR_CONFIGURED) return;
    ['grid-new', 'grid-best', 'grid-sale'].forEach(function (id) {
      document.getElementById(id).innerHTML = UI.skeletons(4);
    });
    return Promise.all([
      UI.settings(),
      sb.from('categories').select('*').eq('is_active', true).order('sort_order'),
      UI.fetchProducts(),
      sb.from('reviews').select('author,rating,body').eq('is_visible', true).order('created_at', { ascending: false }).limit(6)
    ]).then(function (res) {
      var s = res[0], cats = res[1].data || [], products = res[2], reviews = res[3].data || [];
      renderHero(s.hero);
      renderCategories(cats, products);
      fill('sec-new', 'grid-new', products.filter(function (p) { return p.is_new; }));
      fill('sec-best', 'grid-best', products.filter(function (p) { return p.is_bestseller; }));
      fill('sec-sale', 'grid-sale', products.filter(function (p) { return p.sale_price != null; }));
      renderReviews(reviews);
      if (!products.length) document.getElementById('empty-home').hidden = false;
    }).catch(function () { UI.notice('err_load'); })
      .then(function () {
        // Retire les squelettes des sections restées vides
        ['grid-new', 'grid-best', 'grid-sale'].forEach(function (id) {
          var g = document.getElementById(id);
          if (g.querySelector('.skeleton')) g.innerHTML = '';
        });
      });
  });
}
};
