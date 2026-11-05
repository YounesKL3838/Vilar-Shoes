/* Vilar admin - orders.js : écran affiché dans admin.html */
Admin.views["orders"] = {
  tpl: "<div class=\"page-title\">\n          <h1>الطلبات</h1>\n          <button class=\"btn ghost\" id=\"export\" type=\"button\">تصدير إلى Excel</button>\n        </div>\n        <div class=\"chips\" id=\"chips\" role=\"group\" aria-label=\"الحالة\"></div>\n\n        <form class=\"filters\" id=\"filters\">\n          <div><label class=\"lbl\" for=\"q\">بحث</label>\n            <input class=\"field\" id=\"q\" type=\"search\" placeholder=\"رقم الطلب، الهاتف أو الاسم\"></div>\n          <div><label class=\"lbl\" for=\"wilaya\">الولاية</label>\n            <select class=\"field\" id=\"wilaya\"><option value=\"\">الكل</option></select></div>\n          <div><label class=\"lbl\" for=\"source\">المصدر</label>\n            <select class=\"field\" id=\"source\"><option value=\"\">الكل</option><option value=\"home\">الصفحة الرئيسية</option><option value=\"landing\">صفحات الهبوط</option></select></div>\n          <div><label class=\"lbl\" for=\"from\">من تاريخ</label><input class=\"field\" id=\"from\" type=\"date\"></div>\n          <div><label class=\"lbl\" for=\"to\">إلى تاريخ</label><input class=\"field\" id=\"to\" type=\"date\"></div>\n          <button class=\"btn\" type=\"submit\">تطبيق</button>\n        </form>\n\n        <div class=\"tablewrap\">\n          <table>\n            <thead><tr><th>الرقم</th><th>التاريخ</th><th>الزبونة</th><th>الهاتف</th><th>الولاية</th><th>المصدر</th><th>المجموع</th><th>الحالة</th></tr></thead>\n            <tbody id=\"rows\"></tbody>\n          </table>\n        </div>\n        <div class=\"pager\">\n          <span class=\"muted\" id=\"count\"></span>\n          <span><button class=\"btn ghost sm\" id=\"prev\" type=\"button\">السابق</button>\n          <button class=\"btn ghost sm\" id=\"next\" type=\"button\">التالي</button></span>\n        </div>\n<dialog id=\"dlg\">\n    <div class=\"dlg-head\"><h2 id=\"d-title\"></h2><button class=\"btn ghost sm\" id=\"d-close\" type=\"button\" aria-label=\"إغلاق\">✕</button></div>\n    <div class=\"dlg-body\" id=\"d-body\"></div>\n  </dialog>",
  run: function (params) {
  var A = Admin, esc = A.esc, money = A.money, PAGE = 50;
  var st = { status: '', page: 0, total: 0 };
  var dlg = document.getElementById('dlg');

  function sanitize(s) { return String(s || '').replace(/[,()%*\\]/g, ' ').trim(); }

  function applyFilters(q) {
    var f = document.getElementById('filters');
    if (st.status) q = q.eq('status', st.status);
    var w = document.getElementById('wilaya').value;
    if (w) q = q.eq('wilaya_code', parseInt(w, 10));
    var src = document.getElementById('source').value;
    if (src === 'home') q = q.eq('source', 'home');
    else if (src === 'landing') q = q.like('source', 'landing:%');
    var from = document.getElementById('from').value, to = document.getElementById('to').value;
    if (from) q = q.gte('created_at', new Date(from + 'T00:00:00').toISOString());
    if (to) { var d = new Date(to + 'T00:00:00'); d.setDate(d.getDate() + 1); q = q.lt('created_at', d.toISOString()); }
    var term = sanitize(document.getElementById('q').value);
    if (term) q = q.or('order_number.ilike.%' + term + '%,phone.ilike.%' + term + '%,customer_name.ilike.%' + term + '%');
    return q;
  }

  function loadChips() {
    sb.rpc('admin_stats', { p_from: null, p_to: null }).then(function (r) {
      var bs = (r.data && r.data.by_status) || {}, total = (r.data && r.data.orders) || 0;
      var html = '<button class="chipbtn" type="button" data-s="" aria-pressed="' + (st.status === '') + '">الكل (' + total + ')</button>';
      Object.keys(A.STATUS).forEach(function (k) {
        html += '<button class="chipbtn" type="button" data-s="' + k + '" aria-pressed="' + (st.status === k) + '">' +
          '<bdi dir="ltr">' + esc(A.STATUS[k]) + ' (' + (bs[k] || 0) + ')</bdi></button>';
      });
      document.getElementById('chips').innerHTML = html;
    });
  }

  function load() {
    var q = sb.from('orders')
      .select('id,order_number,created_at,customer_name,phone,wilaya_name,source,total,status', { count: 'exact' });
    q = applyFilters(q).order('created_at', { ascending: false }).range(st.page * PAGE, st.page * PAGE + PAGE - 1);
    q.then(function (r) {
      if (r.error) throw r.error;
      st.total = r.count || 0;
      var rows = r.data || [];
      document.getElementById('rows').innerHTML = rows.length ? rows.map(function (o) {
        var src = o.source === 'home' ? 'الرئيسية' : (o.source || '').replace('landing:', 'هبوط: ');
        return '<tr class="click" tabindex="0" data-id="' + esc(o.id) + '"><td dir="ltr">' + esc(o.order_number) + '</td><td>' + A.fmtDate(o.created_at) +
          '</td><td>' + esc(o.customer_name) + '</td><td dir="ltr">' + esc(o.phone) + '</td><td>' + esc(o.wilaya_name) +
          '</td><td>' + esc(src) + '</td><td>' + money(o.total) + '</td><td>' + A.statusPill(o.status) + '</td></tr>';
      }).join('') : '<tr><td colspan="8" class="empty">لا توجد طلبات مطابقة.</td></tr>';
      var from = st.total ? st.page * PAGE + 1 : 0, to = Math.min(st.total, (st.page + 1) * PAGE);
      document.getElementById('count').textContent = from + '–' + to + ' / ' + st.total;
      document.getElementById('prev').disabled = st.page === 0;
      document.getElementById('next').disabled = to >= st.total;
    }).catch(function (e) { A.toast(A.errText(e), true); });
  }

  /* ---------- Détail d'une commande ---------- */
  function waLink(phone) { return 'https://wa.me/213' + String(phone).replace(/^0/, ''); }

  function openOrder(id) {
    sb.from('orders').select('*, order_items(*), order_status_history(*)').eq('id', id).single().then(function (r) {
      if (r.error) throw r.error;
      var o = r.data;
      document.getElementById('d-title').textContent = 'الطلب ' + o.order_number;
      var items = (o.order_items || []).map(function (i) {
        return '<tr><td>' + esc(i.product_name) + '</td><td>' + esc(i.size) + '</td><td>' + esc(i.color_name) + '</td><td>' + i.qty +
          '</td><td>' + money(i.unit_price) + '</td><td>' + money(i.unit_price * i.qty) + '</td></tr>';
      }).join('');
      var hist = (o.order_status_history || []).sort(function (a, b) { return new Date(b.changed_at) - new Date(a.changed_at); })
        .map(function (h) { return '<li>' + A.fmtDate(h.changed_at) + ' — ' + esc(A.STATUS[h.status] || h.status) + '</li>'; }).join('');
      var opts = Object.keys(A.STATUS).map(function (k) {
        return '<option value="' + k + '"' + (k === o.status ? ' selected' : '') + '>' + esc(A.STATUS[k]) + '</option>';
      }).join('');

      document.getElementById('d-body').innerHTML =
        '<dl class="kv">' +
        '<dt>الاسم</dt><dd>' + esc(o.customer_name) + '</dd>' +
        '<dt>الهاتف</dt><dd dir="ltr" style="text-align:start">' + esc(o.phone) +
          ' · <a href="tel:' + esc(o.phone) + '">اتصال</a> · <a href="' + waLink(o.phone) + '" target="_blank" rel="noopener">WhatsApp</a></dd>' +
        '<dt>الولاية</dt><dd>' + esc(o.wilaya_name) + '</dd>' +
        '<dt>البلدية</dt><dd>' + esc(o.commune) + '</dd>' +
        '<dt>العنوان</dt><dd>' + esc(o.address) + '</dd>' +
        '<dt>التوصيل</dt><dd>' + (o.delivery_type === 'desk' ? 'مكتب التوصيل' : 'المنزل') + '</dd>' +
        '<dt>ملاحظات</dt><dd>' + esc(o.notes || '—') + '</dd>' +
        '<dt>المصدر</dt><dd>' + esc(o.source) + '</dd>' +
        '<dt>التاريخ</dt><dd>' + A.fmtDate(o.created_at) + '</dd></dl>' +
        '<div class="tablewrap"><table style="min-width:520px"><thead><tr><th>المنتج</th><th>المقاس</th><th>اللون</th><th>الكمية</th><th>السعر</th><th>المجموع</th></tr></thead><tbody>' + items + '</tbody></table></div>' +
        '<dl class="kv"><dt>المجموع الفرعي</dt><dd>' + money(o.subtotal) + '</dd><dt>التوصيل</dt><dd>' + money(o.delivery_fee) +
        '</dd><dt><b>الإجمالي</b></dt><dd><b>' + money(o.total) + '</b></dd></dl>' +
        '<div class="row2"><div><label class="lbl" for="d-status">الحالة</label><select class="field" id="d-status">' + opts + '</select></div>' +
        '<div style="display:flex;gap:8px;align-items:end"><button class="btn" id="d-save" type="button">حفظ الحالة</button>' +
        '<a class="btn ghost" href="#/invoice/' + encodeURIComponent(o.id) + '?print=1">طباعة الفاتورة</a></div></div>' +
        '<div class="msg" id="d-msg" role="status"></div>' +
        '<div><b>سجل الحالات</b><ul style="margin:6px 0 0;padding-inline-start:20px">' + hist + '</ul></div>';

      document.getElementById('d-save').addEventListener('click', function () {
        var btn = this, val = document.getElementById('d-status').value, msg = document.getElementById('d-msg');
        btn.disabled = true; msg.className = 'msg'; msg.textContent = '';
        sb.from('orders').update({ status: val }).eq('id', o.id).then(function (u) {
          btn.disabled = false;
          if (u.error) { msg.className = 'msg err'; msg.textContent = A.errText(u.error); return; }
          msg.className = 'msg ok'; msg.textContent = 'تم تحديث الحالة.';
          load(); loadChips();
        });
      });
      if (!dlg.open) dlg.showModal();
    }).catch(function (e) { A.toast(A.errText(e), true); });
  }

  /* ---------- Export Excel ---------- */
  function loadXlsx() {
    if (window.XLSX) return Promise.resolve();
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      s.onload = res; s.onerror = function () { rej(new Error('تعذر تحميل مكتبة Excel.')); };
      document.head.appendChild(s);
    });
  }

  function exportXlsx() {
    var btn = document.getElementById('export'); btn.disabled = true;
    var all = [], pageSize = 1000;
    function next(from) {
      var q = sb.from('orders').select('*, order_items(*)');
      return applyFilters(q).order('created_at', { ascending: false }).range(from, from + pageSize - 1).then(function (r) {
        if (r.error) throw r.error;
        all = all.concat(r.data || []);
        if ((r.data || []).length === pageSize && all.length < 10000) return next(from + pageSize);
      });
    }
    loadXlsx().then(function () { return next(0); }).then(function () {
      if (!all.length) { A.toast('لا توجد طلبات للتصدير.', true); return; }
      var rows = all.map(function (o) {
        return {
          'N° commande': o.order_number, 'Date': A.fmtDate(o.created_at).replace(/[\u2066\u2069]/g, ''), 'Client': o.customer_name, 'Téléphone': o.phone,
          'Wilaya': o.wilaya_name, 'Commune': o.commune, 'Adresse': o.address,
          'Livraison': o.delivery_type === 'desk' ? 'Bureau' : 'Domicile',
          'Articles': (o.order_items || []).map(function (i) { return i.product_name + ' (' + i.size + ', ' + i.color_name + ') x' + i.qty; }).join(' | '),
          'Sous-total': Number(o.subtotal), 'Frais livraison': Number(o.delivery_fee), 'Total': Number(o.total),
          'Statut': A.STATUS[o.status] || o.status, 'Source': o.source, 'Notes': o.notes || ''
        };
      });
      var ws = XLSX.utils.json_to_sheet(rows), wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Commandes');
      XLSX.writeFile(wb, 'commandes-vilar-' + new Date().toISOString().slice(0, 10) + '.xlsx');
    }).catch(function (e) { A.toast(A.errText(e), true); })
      .then(function () { btn.disabled = false; });
  }

  /* ---------- Événements ---------- */
  document.getElementById('filters').addEventListener('submit', function (e) { e.preventDefault(); st.page = 0; load(); });
  document.getElementById('chips').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    st.status = b.dataset.s; st.page = 0;
    document.querySelectorAll('#chips .chipbtn').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    load();
  });
  document.getElementById('rows').addEventListener('click', function (e) {
    var tr = e.target.closest('tr[data-id]'); if (tr) openOrder(tr.dataset.id);
  });
  document.getElementById('rows').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { var tr = e.target.closest('tr[data-id]'); if (tr) openOrder(tr.dataset.id); }
  });
  document.getElementById('prev').addEventListener('click', function () { if (st.page > 0) { st.page--; load(); } });
  document.getElementById('next').addEventListener('click', function () { st.page++; load(); });
  document.getElementById('d-close').addEventListener('click', function () { dlg.close(); });
  document.getElementById('export').addEventListener('click', exportXlsx);

  Promise.resolve().then(function () {
    sb.from('delivery_zones').select('wilaya_code,name_fr').order('wilaya_code').then(function (r) {
      document.getElementById('wilaya').insertAdjacentHTML('beforeend', (r.data || []).map(function (z) {
        return '<option value="' + z.wilaya_code + '">' + String(z.wilaya_code).padStart(2, '0') + ' - ' + esc(z.name_fr) + '</option>';
      }).join(''));
    });
    loadChips(); load();
  });
}
};
