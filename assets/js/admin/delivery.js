/* Vilar admin - delivery.js : zones de livraison (wilayas), tarifs, ajout de nouvelles wilayas */
(function () {
  var TPL = [
    '<div class="page-title"><h1>الولايات وأسعار التوصيل</h1><button class="btn" id="d-save" type="button">حفظ التغييرات</button></div>',
    '<p class="muted">الولاية المعطّلة لا تظهر في نموذج الطلب. السعر 0 يعني توصيلاً مجانياً. ',
    'تعتمد الجزائر 69 ولاية؛ إن لم تجد الولايات 59 إلى 69 في القائمة فنفّذ الملف <code>08_wilayas_69.sql</code> أو أضفها من الأسفل.</p>',

    '<div class="card"><h2>تطبيق سريع على كل الولايات</h2>',
    '<div class="row3" style="align-items:end">',
    '<div><label class="lbl" for="all-home">إلى المنزل (د.ج)</label><input class="field" id="all-home" type="number" min="0" dir="ltr"></div>',
    '<div><label class="lbl" for="all-desk">إلى المكتب (د.ج)</label><input class="field" id="all-desk" type="number" min="0" dir="ltr"></div>',
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost" id="apply-all" type="button">تطبيق الأسعار</button>',
    '<button class="btn ghost" id="on-all" type="button">تفعيل الكل</button><button class="btn ghost" id="off-all" type="button">تعطيل الكل</button></div>',
    '</div></div>',

    '<div class="card"><h2>إضافة ولاية جديدة</h2>',
    '<form id="add-form" novalidate><div class="row3" style="grid-template-columns:repeat(5,1fr);align-items:end">',
    '<div><label class="lbl" for="n-code">رقم الولاية *</label><input class="field" id="n-code" type="number" min="1" max="999" dir="ltr"></div>',
    '<div><label class="lbl" for="n-fr">الاسم بالفرنسية *</label><input class="field" id="n-fr" maxlength="60" dir="ltr"></div>',
    '<div><label class="lbl" for="n-ar">الاسم بالعربية</label><input class="field" id="n-ar" maxlength="60"></div>',
    '<div><label class="lbl" for="n-home">إلى المنزل</label><input class="field" id="n-home" type="number" min="0" value="0" dir="ltr"></div>',
    '<div><label class="lbl" for="n-desk">إلى المكتب</label><input class="field" id="n-desk" type="number" min="0" value="0" dir="ltr"></div>',
    '</div><div class="msg" id="add-msg" role="alert" style="margin-top:8px"></div>',
    '<button class="btn" type="submit">+ إضافة الولاية</button></form></div>',

    '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:12px">',
    '<input class="field" id="d-search" type="search" placeholder="بحث بالرقم أو الاسم" aria-label="بحث" style="max-width:320px">',
    '<span class="muted" id="d-count" role="status"></span></div>',
    '<div class="tablewrap"><table style="min-width:760px"><thead><tr><th>#</th><th>Nom (FR)</th><th>الاسم (عربي)</th><th>إلى المنزل</th><th>إلى المكتب</th><th>مفعّلة</th><th></th></tr></thead>',
    '<tbody id="d-rows"></tbody></table></div>'
  ].join('');

  Admin.views['delivery'] = {
    tpl: TPL,
    run: function () {
      var A = Admin, esc = A.esc, $ = function (id) { return document.getElementById(id); };
      var zones = [], dirty = {};

      function updateCount() {
        var on = zones.filter(function (z) { return z.is_active; }).length;
        $('d-count').textContent = zones.length + ' ولاية · ' + on + ' مفعّلة';
      }
      function render() {
        var term = $('d-search').value.trim().toLowerCase();
        var list = zones.filter(function (z) {
          return !term || String(z.wilaya_code).indexOf(term) !== -1 ||
                 (z.name_fr || '').toLowerCase().indexOf(term) !== -1 || (z.name_ar || '').indexOf(term) !== -1;
        });
        $('d-rows').innerHTML = list.length ? list.map(function (z) {
          return '<tr data-code="' + z.wilaya_code + '"><td>' + String(z.wilaya_code).padStart(2, '0') + '</td>' +
            '<td><input class="field sm" data-f="name_fr" value="' + esc(z.name_fr) + '" maxlength="60" dir="ltr" aria-label="الاسم بالفرنسية"></td>' +
            '<td><input class="field sm" data-f="name_ar" value="' + esc(z.name_ar || '') + '" maxlength="60" aria-label="الاسم بالعربية"></td>' +
            '<td><input class="field sm" type="number" min="0" step="1" data-f="home_fee" value="' + esc(z.home_fee) + '" dir="ltr" aria-label="سعر المنزل"></td>' +
            '<td><input class="field sm" type="number" min="0" step="1" data-f="desk_fee" value="' + esc(z.desk_fee) + '" dir="ltr" aria-label="سعر المكتب"></td>' +
            '<td><input type="checkbox" data-f="is_active"' + (z.is_active ? ' checked' : '') + ' aria-label="مفعّلة" style="width:18px;height:18px"></td>' +
            '<td><button class="btn danger sm" type="button" data-act="del">حذف</button></td></tr>';
        }).join('') : '<tr><td colspan="7" class="empty">لا توجد نتائج.</td></tr>';
        updateCount();
      }
      function find(code) { return zones.find(function (x) { return x.wilaya_code === code; }); }
      function mark(z) { dirty[z.wilaya_code] = true; }

      $('d-rows').addEventListener('input', function (e) {
        var f = e.target.dataset.f; if (!f) return;
        var z = find(+e.target.closest('tr').dataset.code);
        z[f] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        mark(z);
        if (f === 'is_active') updateCount();
      });
      $('d-search').addEventListener('input', render);

      function setAll(fn) { zones.forEach(function (z) { fn(z); mark(z); }); render(); }
      function num(id) { var v = parseFloat($(id).value); return isFinite(v) && v >= 0 ? v : null; }
      $('apply-all').addEventListener('click', function () {
        var h = num('all-home'), d = num('all-desk');
        if (h === null && d === null) { A.toast('أدخل سعراً واحداً على الأقل.', true); return; }
        setAll(function (z) { if (h !== null) z.home_fee = h; if (d !== null) z.desk_fee = d; });
      });
      $('on-all').addEventListener('click', function () { setAll(function (z) { z.is_active = true; }); });
      $('off-all').addEventListener('click', function () { setAll(function (z) { z.is_active = false; }); });

      /* ----- Suppression ----- */
      $('d-rows').addEventListener('click', function (e) {
        var b = e.target.closest('button[data-act=del]'); if (!b) return;
        var code = +b.closest('tr').dataset.code, z = find(code);
        if (!confirm('حذف الولاية «' + (z.name_ar || z.name_fr) + '» من قائمة التوصيل؟\nإذا كانت لها طلبات سابقة فلن يُسمح بالحذف، عطّلها بدلاً من ذلك.')) return;
        sb.from('delivery_zones').delete().eq('wilaya_code', code).then(function (r) {
          if (r.error) { A.toast(A.errText(r.error), true); return; }
          zones = zones.filter(function (x) { return x.wilaya_code !== code; }); delete dirty[code]; render(); A.toast('تم الحذف.');
        });
      });

      /* ----- Ajout d'une nouvelle wilaya ----- */
      $('add-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = $('add-msg'); msg.className = 'msg'; msg.textContent = '';
        var code = parseInt($('n-code').value, 10), fr = $('n-fr').value.trim(), ar = $('n-ar').value.trim();
        var home = parseFloat($('n-home').value), desk = parseFloat($('n-desk').value);
        function bad(t) { msg.className = 'msg err'; msg.textContent = t; }
        if (!(code >= 1 && code <= 999)) return bad('رقم الولاية يجب أن يكون بين 1 و999.');
        if (find(code)) return bad('هذا الرقم موجود مسبقاً في القائمة.');
        if (!fr) return bad('الاسم بالفرنسية مطلوب.');
        if (!(home >= 0) || !(desk >= 0)) return bad('الأسعار يجب أن تكون أرقاماً ≥ 0.');
        var row = { wilaya_code: code, name_fr: fr, name_ar: ar || null, home_fee: home, desk_fee: desk, is_active: false };
        sb.from('delivery_zones').insert(row).then(function (r) {
          if (r.error) { bad(A.errText(r.error)); return; }
          zones.push(row); zones.sort(function (a, b) { return a.wilaya_code - b.wilaya_code; });
          $('add-form').reset(); $('n-home').value = 0; $('n-desk').value = 0;
          $('d-search').value = ''; render();
          A.toast('أُضيفت الولاية معطّلة؛ فعّلها ثم احفظ لتظهر في المتجر.');
        });
      });

      /* ----- Enregistrement des modifications ----- */
      $('d-save').addEventListener('click', function () {
        var btn = this, rows = zones.filter(function (z) { return dirty[z.wilaya_code]; });
        if (!rows.length) { A.toast('لا توجد تغييرات.'); return; }
        var bad = rows.some(function (z) {
          return !String(z.name_fr || '').trim() || z.home_fee === '' || z.desk_fee === '' || !(Number(z.home_fee) >= 0) || !(Number(z.desk_fee) >= 0);
        });
        if (bad) { A.toast('تحقق من الأسماء الفرنسية ومن أن الأسعار أرقام ≥ 0.', true); return; }
        btn.disabled = true;
        sb.from('delivery_zones').upsert(rows.map(function (z) {
          return { wilaya_code: z.wilaya_code, name_fr: String(z.name_fr).trim(), name_ar: String(z.name_ar || '').trim() || null,
                   home_fee: Number(z.home_fee), desk_fee: Number(z.desk_fee), is_active: !!z.is_active };
        })).then(function (r) {
          btn.disabled = false;
          if (r.error) { A.toast(A.errText(r.error), true); return; }
          dirty = {}; A.toast('تم الحفظ.');
        });
      });

      sb.from('delivery_zones').select('*').order('wilaya_code').then(function (r) {
        if (r.error) { A.toast(A.errText(r.error), true); return; }
        zones = r.data || []; render();
      });
    }
  };
})();
