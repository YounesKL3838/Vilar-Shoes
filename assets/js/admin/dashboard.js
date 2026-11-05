/* Vilar admin - dashboard.js : écran affiché dans admin.html */
Admin.views["dashboard"] = {
  tpl: "<div class=\"page-title\">\n          <h1>الإحصائيات</h1>\n          <select class=\"field\" id=\"period\" style=\"width:auto\" aria-label=\"الفترة\">\n            <option value=\"today\">اليوم</option>\n            <option value=\"7\">آخر 7 أيام</option>\n            <option value=\"30\" selected>آخر 30 يوماً</option>\n            <option value=\"month\">هذا الشهر</option>\n            <option value=\"all\">الكل</option>\n          </select>\n        </div>\n        <div class=\"kpis\" id=\"kpis\"></div>\n        <div class=\"row2\">\n          <div class=\"card\"><h2>الطلبات حسب الحالة</h2><div class=\"bars\" id=\"bars\"></div></div>\n          <div class=\"card\"><h2>أكثر المنتجات طلباً</h2><div id=\"top-products\"></div></div>\n        </div>\n        <div class=\"card\" id=\"lp-card\" hidden><h2>صفحات الهبوط</h2>\n          <div class=\"tablewrap\"><table><thead><tr><th>الصفحة</th><th>الزيارات</th><th>الطلبات</th><th>التحويل</th></tr></thead><tbody id=\"lp-body\"></tbody></table></div>\n        </div>\n        <div class=\"card\"><h2>آخر الطلبات</h2>\n          <div class=\"tablewrap\"><table><thead><tr><th>الرقم</th><th>التاريخ</th><th>الزبونة</th><th>الولاية</th><th>المجموع</th><th>الحالة</th></tr></thead><tbody id=\"recent\"></tbody></table></div>\n        </div>",
  run: function (params) {
  var A = Admin, esc = A.esc, money = A.money;

  function range(p) {
    var now = new Date(), from = null;
    var sod = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (p === 'today') from = sod;
    else if (p === '7') from = new Date(sod.getTime() - 6 * 864e5);
    else if (p === '30') from = new Date(sod.getTime() - 29 * 864e5);
    else if (p === 'month') from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: from ? from.toISOString() : null, to: null };
  }

  function load() {
    var r = range(document.getElementById('period').value);
    sb.rpc('admin_stats', { p_from: r.from, p_to: r.to }).then(function (res) {
      if (res.error) throw res.error;
      var s = res.data, bs = s.by_status || {};
      document.getElementById('kpis').innerHTML =
        '<div class="kpi">عدد الطلبات<b>' + (s.orders || 0) + '</b></div>' +
        '<div class="kpi">طلبات جديدة<b>' + (bs.new || 0) + '</b></div>' +
        '<div class="kpi">قيمة الطلبات (دون الملغاة)<b>' + money(s.revenue_active) + '</b></div>' +
        '<div class="kpi">المبيعات المُسلَّمة<b>' + money(s.revenue_delivered) + '</b></div>';

      var max = Math.max.apply(null, Object.keys(A.STATUS).map(function (k) { return bs[k] || 0; }).concat([1]));
      document.getElementById('bars').innerHTML = Object.keys(A.STATUS).map(function (k) {
        var n = bs[k] || 0;
        return '<div class="bar"><span>' + esc(A.STATUS[k]) + '</span><i style="width:' + Math.round(n / max * 100) + '%"></i><b>' + n + '</b></div>';
      }).join('');

      var tp = s.top_products || [];
      document.getElementById('top-products').innerHTML = tp.length
        ? '<ol style="margin:0;padding-inline-start:20px">' + tp.map(function (p) {
            return '<li>' + esc(p.name) + ' <b>× ' + p.qty + '</b></li>';
          }).join('') + '</ol>'
        : '<div class="empty">لا توجد بيانات.</div>';
    }).catch(function (e) { A.toast(A.errText(e), true); });

    var q = sb.from('orders').select('order_number,created_at,customer_name,wilaya_name,total,status')
      .order('created_at', { ascending: false }).limit(8);
    q.then(function (res) {
      var rows = res.data || [];
      document.getElementById('recent').innerHTML = rows.length ? rows.map(function (o) {
        return '<tr><td dir="ltr">' + esc(o.order_number) + '</td><td>' + A.fmtDate(o.created_at) + '</td><td>' + esc(o.customer_name) +
          '</td><td>' + esc(o.wilaya_name) + '</td><td>' + money(o.total) + '</td><td>' + A.statusPill(o.status) + '</td></tr>';
      }).join('') : '<tr><td colspan="6" class="empty">لا توجد طلبات بعد.</td></tr>';
    });
  }

  function loadLanding() {
    sb.from('landing_page_stats').select('*').order('views', { ascending: false }).then(function (res) {
      var rows = res.data || [];
      if (!rows.length) return;
      document.getElementById('lp-card').hidden = false;
      document.getElementById('lp-body').innerHTML = rows.map(function (l) {
        return '<tr><td>' + esc(l.title) + (l.is_published ? '' : ' <span class="pill">متوقفة</span>') + '</td><td>' + l.views +
          '</td><td>' + l.orders + '</td><td>' + l.conversion_rate + '%</td></tr>';
      }).join('');
    });
  }

  Promise.resolve().then(function () {
    document.getElementById('period').addEventListener('change', load);
    load(); loadLanding();
  });
}
};
