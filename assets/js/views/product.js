/* Vilar - views/product.js : vue de la boutique (affichée dans index.html) */
window.Views = window.Views || {};
Views["product"] = {
  tpl: "<div class=\"wrap\">\n      <div class=\"product\" id=\"product\">\n        <div class=\"gallery\">\n          <div class=\"gallery-main skeleton\" id=\"g-main\"></div>\n          <div class=\"thumbs\" id=\"thumbs\"></div>\n        </div>\n        <div class=\"info\" id=\"info\"></div>\n      </div>\n    </div>\n    <section class=\"section tint\" id=\"sec-similar\" hidden>\n      <div class=\"wrap\">\n        <div class=\"sec-head\"><h2 data-i18n=\"p_similar\"></h2></div>\n        <div class=\"grid\" id=\"grid-similar\"></div>\n      </div>\n    </section>",
  run: function (params) {
  var t = I18N.t, pick = I18N.pick, esc = UI.esc, money = I18N.money;
  var infoEl = document.getElementById('info');
  var p = null, sel = { color: null, size: null, qty: 1 };

  function colors() {
    var m = new Map();
    p.variants.forEach(function (v) { if (!m.has(v.color_name)) m.set(v.color_name, v.color_hex); });
    return Array.from(m.entries());
  }
  function sizesFor(color) {
    var seen = new Map();
    p.variants.forEach(function (v) {
      if (color && v.color_name !== color) return;
      var cur = seen.get(v.size) || 0;
      seen.set(v.size, cur + v.stock);
    });
    return Array.from(seen.entries()).sort(function (a, b) {
      return parseFloat(a[0]) - parseFloat(b[0]) || String(a[0]).localeCompare(b[0]);
    });
  }
  function variant() {
    if (!sel.color || !sel.size) return null;
    return p.variants.find(function (v) { return v.color_name === sel.color && v.size === sel.size; }) || null;
  }

  function optionsHtml() {
    var cs = colors(), ss = sizesFor(sel.color), v = variant(), h = '';
    if (cs.length) {
      h += '<div class="opt-block"><h2>' + esc(t('p_color')) + ' <span>' + esc(sel.color || '') + '</span></h2><div class="chips">' +
        cs.map(function (c) {
          var hex = /^#[0-9a-f]{6}$/i.test(c[1] || '') ? c[1] : '#cccccc';
          return '<button type="button" class="swatch" data-color="' + esc(c[0]) + '" style="background:' + hex +
            '" title="' + esc(c[0]) + '" aria-label="' + esc(c[0]) + '" aria-pressed="' + (sel.color === c[0]) + '"></button>';
        }).join('') + '</div></div>';
    }
    if (ss.length) {
      h += '<div class="opt-block"><h2>' + esc(t('p_size')) + ' <span>' + esc(sel.size || '') + '</span></h2><div class="chips">' +
        ss.map(function (s) {
          return '<button type="button" class="chip" data-size="' + esc(s[0]) + '"' + (s[1] <= 0 ? ' disabled' : '') +
            ' aria-pressed="' + (sel.size === s[0]) + '">' + esc(s[0]) + '</button>';
        }).join('') + '</div></div>';
    }
    var stockTxt = '', cls = 'stock';
    if (v) {
      if (v.stock <= 0) { stockTxt = t('p_out'); cls += ' low'; }
      else if (v.stock <= 5) { stockTxt = t('p_low', { n: v.stock }); cls += ' low'; }
      else { stockTxt = t('p_in'); cls += ' ok'; }
    } else if (!p.available) { stockTxt = t('p_out'); cls += ' low'; }
    else { stockTxt = t('p_in'); cls += ' ok'; }
    h += '<div class="' + cls + '" role="status">' + esc(stockTxt) + '</div>';
    return h;
  }

  function renderOptions(focusSel) {
    var box = document.getElementById('opts');
    box.innerHTML = optionsHtml();
    if (focusSel) { var el = box.querySelector(focusSel); if (el) el.focus(); }
    var v = variant(), max = Math.min(Cart.MAX_QTY, v ? Math.max(v.stock, 1) : Cart.MAX_QTY);
    sel.qty = Math.max(1, Math.min(sel.qty, max));
    document.getElementById('qty-out').textContent = sel.qty;
    var out = !p.available || (v && v.stock <= 0);
    document.getElementById('btn-add').disabled = out;
    document.getElementById('btn-buy').disabled = out;
  }

  function msg(text, cls) {
    var m = document.getElementById('p-msg');
    m.className = 'msg ' + (cls || ''); m.textContent = text || '';
  }

  function addToCart() {
    if (!sel.color && colors().length > 1) { msg(t('p_pick_color'), 'err'); return false; }
    if (!sel.size) { msg(t('p_pick_size'), 'err'); return false; }
    var v = variant();
    if (!v || v.stock <= 0) { msg(t('p_out'), 'err'); return false; }
    Cart.add({
      variant_id: v.id, product_id: p.id, slug: p.slug, name_ar: p.name_ar, name_fr: p.name_fr,
      image: p.images[0] || '', size: v.size, color: v.color_name, price: p.finalPrice,
      qty: Math.min(sel.qty, v.stock)
    });
    msg('');
    return true;
  }

  function render() {
    var name = pick(p, 'name'), desc = pick(p, 'description'), pct = UI.discountPct(p);
    document.title = name + ' | Vilar';
    var metaDesc = document.querySelector('meta[name=description]');
    if (metaDesc) metaDesc.content = (desc || name).replace(/\s+/g, ' ').slice(0, 155);
    function og(prop, val) {
      var m = document.createElement('meta'); m.setAttribute('data-dyn', '1'); m.setAttribute('property', prop); m.content = val; document.head.appendChild(m);
    }
    og('og:title', name); og('og:type', 'product'); if (p.images[0]) og('og:image', p.images[0]);

    var gm = document.getElementById('g-main');
    gm.classList.remove('skeleton');
    gm.innerHTML = p.images[0] ? '<img id="g-img" src="' + esc(p.images[0]) + '" alt="' + esc(name) + '" width="800" height="1000" fetchpriority="high">' : '';
    if (p.images.length > 1) {
      document.getElementById('thumbs').innerHTML = p.images.map(function (u, i) {
        return '<button type="button" class="thumb" data-i="' + i + '" aria-label="' + (i + 1) + '"' + (i === 0 ? ' aria-current="true"' : '') +
          '><img src="' + esc(u) + '" alt="" loading="lazy" width="72" height="72"></button>';
      }).join('');
      document.getElementById('thumbs').addEventListener('click', function (e) {
        var b = e.target.closest('.thumb'); if (!b) return;
        var gi = document.getElementById('g-img'); gi.src = p.images[+b.dataset.i]; gi.classList.remove('swap'); void gi.offsetWidth; gi.classList.add('swap');
        document.querySelectorAll('.thumb').forEach(function (x) { x.removeAttribute('aria-current'); });
        b.setAttribute('aria-current', 'true');
      });
    }

    infoEl.innerHTML =
      '<h1>' + esc(name) + '</h1>' +
      '<div class="price"><span class="now">' + money(p.finalPrice) + '</span>' +
      (p.sale_price != null ? '<span class="was">' + money(p.price) + '</span><span class="pct"><bdi dir="ltr">-' + pct + '%</bdi></span>' : '') + '</div>' +
      '<div id="opts"></div>' +
      '<div class="opt-block"><h2>' + esc(t('p_qty')) + '</h2><div class="qty">' +
      '<button type="button" id="q-minus" aria-label="' + esc(t('c_less')) + '">−</button><output id="qty-out">1</output>' +
      '<button type="button" id="q-plus" aria-label="' + esc(t('c_more')) + '">+</button></div></div>' +
      '<div class="buy"><button class="btn btn-ghost" type="button" id="btn-add">' + esc(t('p_add')) + '</button>' +
      '<button class="btn" type="button" id="btn-buy">' + esc(t('p_buy')) + '</button></div>' +
      '<div class="msg" id="p-msg" role="status"></div>' +
      (desc ? '<div class="desc">' + esc(desc) + '</div>' : '');

    var cs = colors();
    if (cs.length === 1) sel.color = cs[0][0];
    renderOptions();

    infoEl.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.color !== undefined) {
        sel.color = b.dataset.color;
        var ok = sizesFor(sel.color).some(function (s) { return s[0] === sel.size && s[1] > 0; });
        if (!ok) sel.size = null;
        msg(''); renderOptions('[data-color="' + CSS.escape(sel.color) + '"]');
      } else if (b.dataset.size !== undefined) {
        sel.size = b.dataset.size; msg('');
        renderOptions('[data-size="' + CSS.escape(sel.size) + '"]');
      } else if (b.id === 'q-minus') { sel.qty = Math.max(1, sel.qty - 1); renderOptions(); }
      else if (b.id === 'q-plus') { sel.qty = sel.qty + 1; renderOptions(); }
      else if (b.id === 'btn-add') { if (addToCart()) UI.toast(t('p_added')); }
      else if (b.id === 'btn-buy') { if (addToCart()) location.hash = '#/checkout'; }
    });

    // Données structurées (SEO)
    var ld = document.createElement('script');
    ld.type = 'application/ld+json'; ld.setAttribute('data-dyn', '1');
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Product', name: name,
      image: p.images, description: desc || name,
      offers: { '@type': 'Offer', priceCurrency: 'DZD', price: p.finalPrice,
                availability: p.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' }
    }).replace(/</g, '\\u003c');
    document.head.appendChild(ld);
  }

  function renderSimilar(all) {
    var list = all.filter(function (x) {
      return x.id !== p.id && x.categories && p.categories && x.categories.slug === p.categories.slug;
    }).sort(function (a, b) { return (b.available ? 1 : 0) - (a.available ? 1 : 0); }).slice(0, 4);
    if (!list.length) return;
    document.getElementById('grid-similar').innerHTML = list.map(UI.productCard).join('');
    document.getElementById('sec-similar').hidden = false;
  }

  function notFound() {
    document.getElementById('g-main').classList.remove('skeleton');
    infoEl.innerHTML = '<h1>' + esc(t('p_notfound')) + '</h1><p><a class="btn" href="#/shop">' + esc(t('p_back')) + '</a></p>';
  }

  Promise.resolve().then(function () {
    if (!window.VILAR_CONFIGURED) return;
    var slug = params.slug;
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) return notFound();
    return UI.fetchProduct(slug).then(function (prod) {
      if (!prod) return notFound();
      p = prod; render();
      return UI.fetchProducts().then(renderSimilar);
    }).catch(function () { notFound(); UI.notice('err_load'); });
  });
}
};
