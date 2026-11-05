/* Vilar - views/cart.js : vue de la boutique (affichée dans index.html) */
window.Views = window.Views || {};
Views["cart"] = {
  tpl: "<div class=\"wrap\">\n      <div class=\"page-head\"><h1 data-i18n=\"c_title\"></h1></div>\n      <div id=\"cart-root\"></div>\n    </div>",
  run: function (params) {
  var t = I18N.t, pick = I18N.pick, esc = UI.esc, money = I18N.money;
  var root = document.getElementById('cart-root');
  var gone = new Set(), adjusted = false;

  function render() {
    var items = Cart.get();
    if (!items.length) {
      root.innerHTML = '<div class="empty"><p>' + esc(t('c_empty')) + '</p><a class="btn" href="#/shop">' + esc(t('nav_shop')) + '</a></div>';
      return;
    }
    var subtotal = 0, available = 0;
    var lines = items.map(function (i) {
      var isGone = gone.has(i.variant_id), name = pick(i, 'name'), img = UI.safeUrl(i.image);
      if (!isGone) { subtotal += i.price * i.qty; available++; }
      return '<div class="line' + (isGone ? ' gone' : '') + '" data-id="' + esc(i.variant_id) + '">' +
        (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" width="96" height="120">' : '<div class="ph"></div>') +
        '<div><h3><a href="#/product/' + encodeURIComponent(i.slug) + '">' + esc(name) + '</a></h3>' +
        '<div class="meta">' + esc(t('p_size')) + ': <bdi>' + esc(i.size) + '</bdi> · ' + esc(t('p_color')) + ': <bdi>' + esc(i.color) + '</bdi></div>' +
        (isGone
          ? '<div class="msg err">' + esc(t('c_gone')) + '</div>'
          : '<div class="qty"><button type="button" data-act="minus" aria-label="' + esc(t('c_less')) + '">−</button>' +
            '<output>' + i.qty + '</output><button type="button" data-act="plus" aria-label="' + esc(t('c_more')) + '">+</button></div>') +
        '<div><button type="button" class="linkbtn" data-act="remove">' + esc(t('c_remove')) + '</button></div></div>' +
        '<div class="tot">' + (isGone ? '' : money(i.price * i.qty)) + '</div></div>';
    }).join('');

    var checkout = '#/checkout';
    root.innerHTML = '<div class="cart"><div>' +
      (adjusted ? '<div class="note" role="status">' + esc(t('c_adjusted')) + '</div>' : '') +
      lines + '</div><aside class="summary">' +
      '<div class="row"><span>' + esc(t('c_sub')) + '</span><b>' + money(subtotal) + '</b></div>' +
      '<p class="muted" style="margin:0 0 18px;font-size:.92rem">' + esc(t('c_note')) + '</p>' +
      '<a class="btn btn-block" href="' + esc(checkout) + '"' + (available ? '' : ' aria-disabled="true"') + '>' + esc(t('c_checkout')) + '</a>' +
      '</aside></div>';
  }

  function refreshFromDb() {
    var items = Cart.get();
    if (!items.length || !window.VILAR_CONFIGURED) return Promise.resolve();
    var ids = items.map(function (i) { return i.variant_id; });
    return sb.from('product_variants')
      .select('id,stock,is_active,products(price,sale_price,is_active)')
      .in('id', ids)
      .then(function (r) {
        if (r.error) throw r.error;
        var map = {};
        (r.data || []).forEach(function (row) { map[row.id] = row; });
        items.forEach(function (i) {
          var row = map[i.variant_id];
          if (!row || !row.is_active || !row.products || !row.products.is_active || row.stock <= 0) {
            gone.add(i.variant_id); return;
          }
          var pr = row.products;
          i.price = pr.sale_price != null ? Number(pr.sale_price) : Number(pr.price);
          if (i.qty > row.stock) { i.qty = row.stock; adjusted = true; }
        });
        Cart.replace(items);
      });
  }

  root.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]'); if (!b) return;
    var id = b.closest('.line').dataset.id;
    var item = Cart.get().find(function (i) { return i.variant_id === id; });
    if (!item) return;
    if (b.dataset.act === 'remove') { gone.delete(id); Cart.remove(id); }
    else if (b.dataset.act === 'minus') Cart.setQty(id, item.qty - 1);
    else if (b.dataset.act === 'plus') Cart.setQty(id, item.qty + 1);
    adjusted = false;
    render();
  });

  Promise.resolve().then(function () {
    render();
    return refreshFromDb().then(render).catch(function () { /* on garde l'affichage local */ });
  });
}
};
