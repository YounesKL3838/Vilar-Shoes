/* Vilar admin - invoice.js : écran affiché dans admin.html */
Admin.views["invoice"] = {
  tpl: "<div class=\"inv-bar\"><a class=\"btn ghost\" href=\"#/orders\">← الطلبات</a> <button class=\"btn\" type=\"button\" id=\"inv-print\">طباعة</button></div><div class=\"invoice\"><div class=\"sheet\" id=\"sheet\"><p>Chargement…</p></div></div>",
  run: function (params) {
  document.getElementById('inv-print').addEventListener('click', function () { window.print(); });
  var A = Admin, esc = A.esc;
  var nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
  function da(n) { return nf.format(Math.round(Number(n) || 0)).replace(/\u202f|\u00a0/g, ' ') + ' DA'; }

  Promise.resolve().then(function () {
    var q = params.qs, id = params.id;
    var sheet = document.getElementById('sheet');
    if (!/^[0-9a-f-]{36}$/i.test(id || '')) { sheet.textContent = 'Commande introuvable.'; return; }

    Promise.all([
      sb.from('orders').select('*, order_items(*)').eq('id', id).single(),
      sb.from('site_settings').select('key,value').in('key', ['store', 'contact'])
    ]).then(function (res) {
      if (res[0].error) throw res[0].error;
      var o = res[0].data, cfg = {};
      (res[1].data || []).forEach(function (r) { cfg[r.key] = r.value; });
      var store = (cfg.store && cfg.store.name) || 'Vilar', c = cfg.contact || {};

      var rows = (o.order_items || []).map(function (i) {
        return '<tr><td>' + esc(i.product_name) + '</td><td>' + esc(i.size) + '</td><td>' + esc(i.color_name) +
          '</td><td class="n">' + i.qty + '</td><td class="n">' + da(i.unit_price) + '</td><td class="n">' + da(i.unit_price * i.qty) + '</td></tr>';
      }).join('');

      sheet.innerHTML =
        '<header><div><div class="brand">' + esc(store) + '</div>' +
        '<div class="meta" style="text-align:start">' + esc([c.phone, c.email].filter(Boolean).join(' · ')) + '</div></div>' +
        '<div><h1>FACTURE</h1><div class="meta">N° ' + esc(o.order_number) + '<br>' + A.fmtDate(o.created_at) + '</div></div></header>' +
        '<div class="cols"><div><h2>Client</h2><b>' + esc(o.customer_name) + '</b><br>' + esc(o.phone) + '</div>' +
        '<div><h2>Livraison</h2>' + esc(o.address) + '<br>' + esc(o.commune) + ', ' + esc(o.wilaya_name) +
        '<br>' + (o.delivery_type === 'desk' ? 'Point de retrait' : 'À domicile') + '</div></div>' +
        '<table><thead><tr><th>Article</th><th>Pointure</th><th>Couleur</th><th class="n">Qté</th><th class="n">Prix</th><th class="n">Total</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        '<div class="tot"><div><span>Sous-total</span><span>' + da(o.subtotal) + '</span></div>' +
        '<div><span>Livraison</span><span>' + da(o.delivery_fee) + '</span></div>' +
        '<div class="g"><span>Total à payer</span><span>' + da(o.total) + '</span></div></div>' +
        '<div class="note">Paiement à la livraison (espèces).' + (o.notes ? '<br>Notes : ' + esc(o.notes) : '') + '</div>';
      document.title = 'Facture ' + o.order_number;
      if (q.get('print') === '1') setTimeout(function () { window.print(); }, 400);
    }).catch(function () { sheet.textContent = 'Commande introuvable.'; });
  });
}
};
