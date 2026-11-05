/* Vilar admin - landing-pages.js : écran affiché dans admin.html */
Admin.views["landing-pages"] = {
  tpl: "<div class=\"page-title\">\n          <h1>صفحات الهبوط</h1>\n          <a class=\"btn\" href=\"#/landing/new\">+ صفحة هبوط جديدة</a>\n        </div>\n        <p class=\"muted\">انسخ رابط الصفحة وضعه في إعلانات فيسبوك أو إنستغرام أو تيك توك. الرابط يعمل بعد نشر الموقع على الاستضافة.</p>\n        <div class=\"tablewrap\">\n          <table>\n            <thead><tr><th>الصفحة</th><th>الزيارات</th><th>الطلبات</th><th>التحويل</th><th>منشورة</th><th></th></tr></thead>\n            <tbody id=\"rows\"><tr><td colspan=\"6\" class=\"empty\">جاري التحميل…</td></tr></tbody>\n          </table>\n        </div>\n\n        <div class=\"card\" style=\"margin-top:22px\">\n          <h2>الإعلانات والتتبع</h2>\n          <p class=\"muted\">أدخل معرّف البكسل ليتتبع فيسبوك وتيك توك الزيارات والطلبات. اتركه فارغاً لتعطيل التتبع.</p>\n          <form class=\"row2\" id=\"tform\" novalidate>\n            <div><label class=\"lbl\" for=\"meta\">Meta Pixel ID (أرقام)</label><input class=\"field\" id=\"meta\" dir=\"ltr\" inputmode=\"numeric\" maxlength=\"20\"></div>\n            <div><label class=\"lbl\" for=\"tt\">TikTok Pixel ID</label><input class=\"field\" id=\"tt\" dir=\"ltr\" maxlength=\"30\"></div>\n            <div class=\"msg\" id=\"tmsg\" role=\"status\"></div>\n            <div><button class=\"btn\" type=\"submit\">حفظ</button></div>\n          </form>\n        </div>",
  run: function (params) {
  var A = Admin, esc = A.esc;
  var $ = function (id) { return document.getElementById(id); };
  var rows = [];

  function pageUrl(slug) { return new URL('lp.html?s=' + encodeURIComponent(slug), location.href).href; }

  function render() {
    $('rows').innerHTML = rows.length ? rows.map(function (l) {
      return '<tr data-id="' + esc(l.id) + '"><td><a href="#/landing/' + esc(l.id) + '"><b>' + esc(l.title) + '</b></a>' +
        '<div class="muted" dir="ltr" style="text-align:start">lp.html?s=' + esc(l.slug) + '</div></td>' +
        '<td>' + l.views + '</td><td>' + l.orders + '</td><td>' + l.conversion_rate + '%</td>' +
        '<td><label class="check"><input type="checkbox" data-act="pub"' + (l.is_published ? ' checked' : '') + ' aria-label="منشورة"></label></td>' +
        '<td style="white-space:nowrap"><button class="btn ghost sm" type="button" data-act="copy">نسخ الرابط</button> ' +
        '<a class="btn ghost sm" href="' + esc(pageUrl(l.slug)) + '" target="_blank" rel="noopener">فتح</a> ' +
        '<a class="btn ghost sm" href="#/landing/' + esc(l.id) + '">تعديل</a> ' +
        '<button class="btn danger sm" type="button" data-act="del">حذف</button></td></tr>';
    }).join('') : '<tr><td colspan="6" class="empty">لا توجد صفحات هبوط بعد.</td></tr>';
  }

  function load() {
    return sb.from('landing_page_stats').select('*').order('title').then(function (r) {
      if (r.error) throw r.error; rows = r.data || []; render();
    });
  }

  $('rows').addEventListener('change', function (e) {
    if (e.target.dataset.act !== 'pub') return;
    var id = e.target.closest('tr').dataset.id, v = e.target.checked;
    sb.from('landing_pages').update({ is_published: v }).eq('id', id).then(function (r) {
      if (r.error) { e.target.checked = !v; A.toast(A.errText(r.error), true); return; }
      A.toast(v ? 'تم نشر الصفحة.' : 'تم إيقاف الصفحة.');
    });
  });

  $('rows').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]'); if (!b) return;
    var id = b.closest('tr').dataset.id, l = rows.find(function (x) { return x.id === id; });
    if (b.dataset.act === 'copy') {
      var url = pageUrl(l.slug);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { A.toast('تم نسخ الرابط.'); }, function () { prompt('انسخ الرابط:', url); });
      } else prompt('انسخ الرابط:', url);
      return;
    }
    if (b.dataset.act === 'del') {
      if (!confirm('حذف صفحة الهبوط «' + l.title + '» نهائياً مع إحصاءات زياراتها؟\nالطلبات السابقة تبقى محفوظة.')) return;
      sb.from('landing_pages').delete().eq('id', id).then(function (r) {
        if (r.error) { A.toast(A.errText(r.error), true); return; }
        rows = rows.filter(function (x) { return x.id !== id; }); render(); A.toast('تم الحذف.');
      });
    }
  });

  /* ----- Suivi publicitaire ----- */
  $('tform').addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = $('tmsg'), meta = $('meta').value.trim(), tt = $('tt').value.trim();
    msg.className = 'msg';
    if (meta && !/^\d{5,20}$/.test(meta)) { msg.className = 'msg err'; msg.textContent = 'معرّف Meta يجب أن يكون أرقاماً فقط.'; return; }
    if (tt && !/^[A-Za-z0-9]{8,30}$/.test(tt)) { msg.className = 'msg err'; msg.textContent = 'معرّف TikTok غير صالح.'; return; }
    sb.from('site_settings').upsert({ key: 'tracking', value: { meta_pixel_id: meta, tiktok_pixel_id: tt } }).then(function (r) {
      if (r.error) { msg.className = 'msg err'; msg.textContent = A.errText(r.error); return; }
      msg.className = 'msg ok'; msg.textContent = 'تم الحفظ.';
    });
  });

  Promise.resolve().then(function () {
    sb.from('site_settings').select('value').eq('key', 'tracking').maybeSingle().then(function (r) {
      var v = (r.data && r.data.value) || {};
      $('meta').value = v.meta_pixel_id || ''; $('tt').value = v.tiktok_pixel_id || '';
    });
    return load();
  }).catch(function (e) { A.toast(A.errText(e), true); });
}
};
