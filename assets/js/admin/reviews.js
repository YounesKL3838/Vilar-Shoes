/* Vilar admin - reviews.js : آراء العملاء */
(function () {
  var TPL = [
    '<div class="page-title"><h1>آراء العملاء</h1><button class="btn" id="r-add" type="button">+ رأي جديد</button></div>',
    '<p class="muted">أدخل آراء حقيقية من زبوناتك فقط. الآراء الظاهرة تعرض في الصفحة الرئيسية.</p>',
    '<div class="tablewrap"><table><thead><tr><th>الاسم</th><th>التقييم</th><th>الرأي</th><th>ظاهر</th><th></th></tr></thead>',
    '<tbody id="r-rows"><tr><td colspan="5" class="empty">جاري التحميل…</td></tr></tbody></table></div>',
    '<dialog id="r-dlg"><div class="dlg-head"><h2 id="r-title">رأي</h2>',
    '<button class="btn ghost sm" id="r-close" type="button" aria-label="إغلاق">✕</button></div>',
    '<form class="dlg-body" id="r-form" novalidate>',
    '<div class="row2"><div><label class="lbl" for="r-author">اسم الزبونة *</label><input class="field" id="r-author" maxlength="60"></div>',
    '<div><label class="lbl" for="r-rating">التقييم</label><select class="field" id="r-rating">',
    '<option value="5">5 ★</option><option value="4">4 ★</option><option value="3">3 ★</option><option value="2">2 ★</option><option value="1">1 ★</option></select></div></div>',
    '<div><label class="lbl" for="r-body">الرأي *</label><textarea class="field" id="r-body" rows="4" maxlength="500"></textarea></div>',
    '<label class="check"><input type="checkbox" id="r-vis" checked> ظاهر في المتجر</label>',
    '<div class="msg" id="r-msg" role="alert"></div>',
    '<button class="btn" id="r-save" type="submit">حفظ</button></form></dialog>'
  ].join('');

  Admin.views['reviews'] = {
    tpl: TPL,
    run: function () {
      var A = Admin, esc = A.esc, $ = function (id) { return document.getElementById(id); };
      var list = [], editing = null, dlg = $('r-dlg');

      function stars(n) { return '★★★★★'.slice(0, n) + '<span class="muted">' + '★★★★★'.slice(n) + '</span>'; }
      function render() {
        $('r-rows').innerHTML = list.length ? list.map(function (r) {
          return '<tr data-id="' + esc(r.id) + '"><td>' + esc(r.author) + '</td><td style="white-space:nowrap;color:var(--blush-deep)">' + stars(r.rating) +
            '</td><td style="max-width:420px">' + esc(r.body.length > 110 ? r.body.slice(0, 110) + '…' : r.body) + '</td>' +
            '<td><label class="check"><input type="checkbox" data-act="vis"' + (r.is_visible ? ' checked' : '') + ' aria-label="ظاهر"></label></td>' +
            '<td style="white-space:nowrap"><button class="btn ghost sm" type="button" data-act="edit">تعديل</button> ' +
            '<button class="btn danger sm" type="button" data-act="del">حذف</button></td></tr>';
        }).join('') : '<tr><td colspan="5" class="empty">لا توجد آراء بعد.</td></tr>';
      }
      function load() {
        return sb.from('reviews').select('*').order('created_at', { ascending: false }).then(function (r) {
          if (r.error) throw r.error; list = r.data || []; render();
        });
      }
      function openForm(r) {
        editing = r || null;
        $('r-title').textContent = r ? 'تعديل الرأي' : 'رأي جديد';
        $('r-author').value = r ? r.author : ''; $('r-rating').value = r ? r.rating : 5;
        $('r-body').value = r ? r.body : ''; $('r-vis').checked = r ? r.is_visible : true;
        $('r-msg').textContent = ''; dlg.showModal();
      }

      $('r-add').addEventListener('click', function () { openForm(null); });
      $('r-close').addEventListener('click', function () { dlg.close(); });

      $('r-rows').addEventListener('change', function (e) {
        if (e.target.dataset.act !== 'vis') return;
        var id = e.target.closest('tr').dataset.id, v = e.target.checked;
        sb.from('reviews').update({ is_visible: v }).eq('id', id).then(function (r) {
          if (r.error) { e.target.checked = !v; A.toast(A.errText(r.error), true); return; }
          A.toast(v ? 'أصبح الرأي ظاهراً.' : 'تم إخفاء الرأي.');
        });
      });
      $('r-rows').addEventListener('click', function (e) {
        var b = e.target.closest('button[data-act]'); if (!b) return;
        var id = b.closest('tr').dataset.id, r = list.find(function (x) { return x.id === id; });
        if (b.dataset.act === 'edit') return openForm(r);
        if (!confirm('حذف رأي «' + r.author + '»؟')) return;
        sb.from('reviews').delete().eq('id', id).then(function (d) {
          if (d.error) { A.toast(A.errText(d.error), true); return; }
          list = list.filter(function (x) { return x.id !== id; }); render(); A.toast('تم الحذف.');
        });
      });

      $('r-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = $('r-msg'), btn = $('r-save'); msg.className = 'msg'; msg.textContent = '';
        var row = { author: $('r-author').value.trim(), rating: parseInt($('r-rating').value, 10),
                    body: $('r-body').value.trim(), is_visible: $('r-vis').checked };
        if (!row.author || !row.body) { msg.className = 'msg err'; msg.textContent = 'الاسم والرأي مطلوبان.'; return; }
        btn.disabled = true;
        var req = editing ? sb.from('reviews').update(row).eq('id', editing.id) : sb.from('reviews').insert(row);
        req.then(function (r) {
          if (r.error) throw r.error;
          dlg.close(); return load();
        }).then(function () { A.toast('تم الحفظ.'); })
          .catch(function (err) { msg.className = 'msg err'; msg.textContent = A.errText(err); })
          .then(function () { btn.disabled = false; });
      });

      load().catch(function (e) { A.toast(A.errText(e), true); });
    }
  };
})();
