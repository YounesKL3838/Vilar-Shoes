/* Vilar admin - products.js : écran affiché dans admin.html */
Admin.views["products"] = {
  tpl: "<div class=\"page-title\">\n          <h1>المنتجات</h1>\n          <a class=\"btn\" href=\"#/product/new\">+ منتج جديد</a>\n        </div>\n        <div style=\"margin-bottom:14px\"><input class=\"field\" id=\"search\" type=\"search\" placeholder=\"بحث بالاسم\" aria-label=\"بحث\"></div>\n        <div class=\"tablewrap\">\n          <table>\n            <thead><tr><th></th><th>المنتج</th><th>التصنيف</th><th>السعر</th><th>المخزون</th><th>ظاهر</th><th></th></tr></thead>\n            <tbody id=\"rows\"><tr><td colspan=\"7\" class=\"empty\">جاري التحميل…</td></tr></tbody>\n          </table>\n        </div>",
  run: function (params) {
  var A = Admin, esc = A.esc, money = A.money;
  var all = [], rowsEl = document.getElementById('rows');
  var MARK = '/storage/v1/object/public/products/';

  function storagePath(url) {
    var i = String(url).indexOf(MARK);
    return i === -1 ? null : decodeURIComponent(String(url).slice(i + MARK.length));
  }

  function render() {
    var term = document.getElementById('search').value.trim().toLowerCase();
    var list = all.filter(function (p) {
      return !term || (p.name_ar + ' ' + p.name_fr).toLowerCase().indexOf(term) !== -1;
    });
    if (!list.length) { rowsEl.innerHTML = '<tr><td colspan="7" class="empty">لا توجد منتجات.</td></tr>'; return; }
    rowsEl.innerHTML = list.map(function (p) {
      var imgs = (p.product_images || []).sort(function (a, b) { return a.sort_order - b.sort_order; });
      var stock = (p.product_variants || []).reduce(function (s, v) { return s + (v.is_active ? v.stock : 0); }, 0);
      var price = p.sale_price != null
        ? '<b>' + money(p.sale_price) + '</b> <s class="muted">' + money(p.price) + '</s>' : money(p.price);
      return '<tr data-id="' + esc(p.id) + '"><td>' + (imgs[0] ? '<img class="thumb" src="' + esc(imgs[0].url) + '" alt="">' : '<div class="thumb"></div>') + '</td>' +
        '<td><a href="#/product/' + esc(p.id) + '"><b>' + esc(p.name_ar) + '</b></a><div class="muted">' + esc(p.name_fr) + '</div></td>' +
        '<td>' + esc((p.categories && p.categories.name_ar) || '—') + '</td><td>' + price + '</td>' +
        '<td>' + (stock > 0 ? stock : '<span class="pill st-cancelled">نفد</span>') + '</td>' +
        '<td><label class="check"><input type="checkbox" data-act="active"' + (p.is_active ? ' checked' : '') + ' aria-label="ظاهر في المتجر"></label></td>' +
        '<td style="white-space:nowrap"><a class="btn ghost sm" href="#/product/' + esc(p.id) + '">تعديل</a> ' +
        '<button class="btn danger sm" type="button" data-act="del">حذف</button></td></tr>';
    }).join('');
  }

  function load() {
    sb.from('products')
      .select('id,name_ar,name_fr,price,sale_price,is_active,categories(name_ar),product_images(url,sort_order),product_variants(stock,is_active)')
      .order('created_at', { ascending: false })
      .then(function (r) { if (r.error) throw r.error; all = r.data || []; render(); })
      .catch(function (e) { A.toast(A.errText(e), true); });
  }

  rowsEl.addEventListener('change', function (e) {
    if (e.target.dataset.act !== 'active') return;
    var id = e.target.closest('tr').dataset.id, v = e.target.checked;
    sb.from('products').update({ is_active: v }).eq('id', id).then(function (r) {
      if (r.error) { e.target.checked = !v; A.toast(A.errText(r.error), true); return; }
      var p = all.find(function (x) { return x.id === id; }); if (p) p.is_active = v;
      A.toast(v ? 'أصبح المنتج ظاهراً.' : 'تم إخفاء المنتج.');
    });
  });

  rowsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act=del]'); if (!b) return;
    var id = b.closest('tr').dataset.id;
    var p = all.find(function (x) { return x.id === id; });
    if (!confirm('حذف المنتج «' + (p ? p.name_ar : '') + '» نهائياً مع صوره ومقاساته؟\nالطلبات السابقة تحتفظ بنسخة من بياناته.')) return;
    var paths = ((p && p.product_images) || []).map(function (i) { return storagePath(i.url); }).filter(Boolean);
    var step = paths.length ? sb.storage.from('products').remove(paths) : Promise.resolve();
    step.then(function () { return sb.from('products').delete().eq('id', id); }).then(function (r) {
      if (r.error) throw r.error;
      all = all.filter(function (x) { return x.id !== id; }); render(); A.toast('تم الحذف.');
    }).catch(function (e2) { A.toast(A.errText(e2), true); });
  });

  document.getElementById('search').addEventListener('input', render);
  Promise.resolve().then(load);
}
};
