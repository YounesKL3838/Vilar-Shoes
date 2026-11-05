/* Vilar - views/shop.js : vue de la boutique (affichée dans index.html) */
window.Views = window.Views || {};
Views["shop"] = {
  tpl: "<div class=\"wrap\">\n      <div class=\"page-head\"><h1 id=\"shop-title\" data-i18n=\"nav_shop\"></h1></div>\n      <div class=\"shop\">\n        <aside class=\"filters\" id=\"filters\" aria-label=\"Filtres\"></aside>\n        <section>\n          <div class=\"toolbar\">\n            <button class=\"btn btn-ghost filter-toggle\" id=\"filter-toggle\" type=\"button\" aria-expanded=\"false\" aria-controls=\"filters\" data-i18n=\"f_show\"></button>\n            <span class=\"muted\" id=\"count\" role=\"status\"></span>\n            <label class=\"muted\"><span data-i18n=\"sort\"></span>\n              <select id=\"sort\">\n                <option value=\"new\" data-i18n=\"s_new\"></option>\n                <option value=\"asc\" data-i18n=\"s_asc\"></option>\n                <option value=\"desc\" data-i18n=\"s_desc\"></option>\n              </select>\n            </label>\n          </div>\n          <div class=\"grid\" id=\"grid\"></div>\n          <p class=\"empty\" id=\"no-results\" data-i18n=\"no_results\" hidden></p>\n        </section>\n      </div>\n    </div>",
  run: function (params) {
  var t = I18N.t, pick = I18N.pick, esc = UI.esc;
  var state = { cat: 'all', min: null, max: null, sizes: new Set(), colors: new Set(), sort: 'new' };
  var products = [], cats = [];

  var gridEl = document.getElementById('grid');
  var filtersEl = document.getElementById('filters');

  function matches(p) {
    if (state.cat === 'new' && !p.is_new) return false;
    if (state.cat === 'sale' && p.sale_price == null) return false;
    if (state.cat !== 'all' && state.cat !== 'new' && state.cat !== 'sale' &&
        !(p.categories && p.categories.slug === state.cat)) return false;
    if (state.min != null && p.finalPrice < state.min) return false;
    if (state.max != null && p.finalPrice > state.max) return false;
    if (state.sizes.size || state.colors.size) {
      var ok = p.variants.some(function (v) {
        return v.stock > 0 &&
          (!state.sizes.size || state.sizes.has(v.size)) &&
          (!state.colors.size || state.colors.has(v.color_name));
      });
      if (!ok) return false;
    }
    return true;
  }

  function render() {
    var list = products.filter(matches);
    if (state.sort === 'asc') list.sort(function (a, b) { return a.finalPrice - b.finalPrice; });
    else if (state.sort === 'desc') list.sort(function (a, b) { return b.finalPrice - a.finalPrice; });
    gridEl.innerHTML = list.map(UI.productCard).join('');
    document.getElementById('no-results').hidden = list.length > 0;
    document.getElementById('count').textContent = t('results', { n: list.length });
  }

  function uniqueSizes() {
    var s = new Set();
    products.forEach(function (p) { p.variants.forEach(function (v) { s.add(v.size); }); });
    return Array.from(s).sort(function (a, b) { return parseFloat(a) - parseFloat(b) || String(a).localeCompare(b); });
  }
  function uniqueColors() {
    var m = new Map();
    products.forEach(function (p) { p.variants.forEach(function (v) { if (!m.has(v.color_name)) m.set(v.color_name, v.color_hex); }); });
    return Array.from(m.entries());
  }

  function renderFilters() {
    var catOpts = [['all', t('all')]]
      .concat(cats.filter(function (c) {
        return products.some(function (p) { return p.categories && p.categories.slug === c.slug; });
      }).map(function (c) { return [c.slug, pick(c, 'name')]; }))
      .concat([['new', t('nav_new')], ['sale', t('nav_sale')]]);

    var html = '<fieldset><legend>' + esc(t('f_cat')) + '</legend>' +
      catOpts.map(function (o) {
        return '<label class="opt"><input type="radio" name="cat" value="' + esc(o[0]) + '"' +
          (state.cat === o[0] ? ' checked' : '') + '> ' + esc(o[1]) + '</label>';
      }).join('') + '</fieldset>';

    html += '<fieldset><legend>' + esc(t('f_price')) + '</legend><div class="price-row">' +
      '<input class="field" id="pmin" type="number" min="0" inputmode="numeric" placeholder="' + esc(t('f_min')) + '" aria-label="' + esc(t('f_min')) + '" value="' + (state.min != null ? state.min : '') + '">' +
      '<span aria-hidden="true">–</span>' +
      '<input class="field" id="pmax" type="number" min="0" inputmode="numeric" placeholder="' + esc(t('f_max')) + '" aria-label="' + esc(t('f_max')) + '" value="' + (state.max != null ? state.max : '') + '"></div></fieldset>';

    var sizes = uniqueSizes();
    if (sizes.length) {
      html += '<fieldset><legend>' + esc(t('f_size')) + '</legend><div class="chips">' +
        sizes.map(function (s) {
          return '<button type="button" class="chip" data-size="' + esc(s) + '" aria-pressed="' + state.sizes.has(s) + '">' + esc(s) + '</button>';
        }).join('') + '</div></fieldset>';
    }
    var colors = uniqueColors();
    if (colors.length) {
      html += '<fieldset><legend>' + esc(t('f_color')) + '</legend><div class="chips">' +
        colors.map(function (c) {
          var hex = /^#[0-9a-f]{6}$/i.test(c[1] || '') ? c[1] : '#cccccc';
          return '<button type="button" class="swatch" data-color="' + esc(c[0]) + '" style="background:' + hex +
            '" title="' + esc(c[0]) + '" aria-label="' + esc(c[0]) + '" aria-pressed="' + state.colors.has(c[0]) + '"></button>';
        }).join('') + '</div></fieldset>';
    }
    html += '<button type="button" class="linkbtn" id="reset">' + esc(t('f_reset')) + '</button>';
    filtersEl.innerHTML = html;
  }

  function syncUrl() {
    var hash = '#/shop' + (state.cat === 'all' ? '' : '?cat=' + encodeURIComponent(state.cat));
    try { history.replaceState(null, '', hash); } catch (e) { /* ouverture via file:// : on ignore */ }
    updateTitle();
  }
  function updateTitle() {
    var h = document.getElementById('shop-title'), name = t('nav_shop');
    if (state.cat === 'new') name = t('nav_new');
    else if (state.cat === 'sale') name = t('nav_sale');
    else if (state.cat !== 'all') {
      var c = cats.find(function (x) { return x.slug === state.cat; });
      if (c) name = pick(c, 'name');
    }
    h.removeAttribute('data-i18n'); h.textContent = name;
    document.title = name + ' | Vilar';
  }
  function num(v) { var n = parseFloat(v); return isFinite(n) && n >= 0 ? n : null; }

  function bind() {
    filtersEl.addEventListener('change', function (e) {
      if (e.target.name === 'cat') { state.cat = e.target.value; syncUrl(); render(); }
    });
    filtersEl.addEventListener('input', function (e) {
      if (e.target.id === 'pmin') { state.min = num(e.target.value); render(); }
      if (e.target.id === 'pmax') { state.max = num(e.target.value); render(); }
    });
    filtersEl.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.size !== undefined) {
        state.sizes.has(b.dataset.size) ? state.sizes.delete(b.dataset.size) : state.sizes.add(b.dataset.size);
        b.setAttribute('aria-pressed', state.sizes.has(b.dataset.size)); render();
      } else if (b.dataset.color !== undefined) {
        state.colors.has(b.dataset.color) ? state.colors.delete(b.dataset.color) : state.colors.add(b.dataset.color);
        b.setAttribute('aria-pressed', state.colors.has(b.dataset.color)); render();
      } else if (b.id === 'reset') {
        state = { cat: 'all', min: null, max: null, sizes: new Set(), colors: new Set(), sort: state.sort };
        syncUrl(); renderFilters(); render();
      }
    });
    document.getElementById('sort').addEventListener('change', function (e) { state.sort = e.target.value; render(); });
    var tog = document.getElementById('filter-toggle');
    tog.addEventListener('click', function () {
      var open = filtersEl.classList.toggle('open');
      tog.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  Promise.resolve().then(function () {
    if (!window.VILAR_CONFIGURED) return;
    var q = params.qs.get('cat');
    if (q && /^[a-z0-9-]+$/.test(q)) state.cat = q;
    gridEl.innerHTML = UI.skeletons(6);
    return Promise.all([
      sb.from('categories').select('*').eq('is_active', true).order('sort_order'),
      UI.fetchProducts()
    ]).then(function (res) {
      cats = res[0].data || []; products = res[1];
      renderFilters(); bind(); updateTitle(); render();
    }).catch(function () { gridEl.innerHTML = ''; UI.notice('err_load'); });
  });
}
};
