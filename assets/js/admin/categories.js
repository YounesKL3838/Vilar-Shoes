/* Vilar admin - categories.js : écran affiché dans admin.html */
Admin.views["categories"] = {
  tpl: "<div class=\"page-title\">\n          <h1>التصنيفات</h1>\n          <button class=\"btn\" id=\"add\" type=\"button\">+ تصنيف جديد</button>\n        </div>\n        <p class=\"muted\">«وصل حديثاً» و«التخفيضات» ليستا تصنيفات مخزّنة: تُحسبان تلقائياً من علامة «وصل حديثاً» ووجود سعر تخفيض.</p>\n        <div class=\"tablewrap\">\n          <table>\n            <thead><tr><th></th><th>التصنيف</th><th>الترتيب</th><th>ظاهر</th><th></th></tr></thead>\n            <tbody id=\"rows\"></tbody>\n          </table>\n        </div>\n<dialog id=\"dlg\">\n    <div class=\"dlg-head\"><h2 id=\"d-title\">تصنيف</h2><button class=\"btn ghost sm\" id=\"d-close\" type=\"button\" aria-label=\"إغلاق\">✕</button></div>\n    <form class=\"dlg-body\" id=\"cform\" novalidate>\n      <div class=\"row2\">\n        <div><label class=\"lbl\" for=\"name_ar\">الاسم بالعربية *</label><input class=\"field\" id=\"name_ar\" maxlength=\"80\"></div>\n        <div><label class=\"lbl\" for=\"name_fr\">Nom en français *</label><input class=\"field\" id=\"name_fr\" maxlength=\"80\" dir=\"ltr\"></div>\n      </div>\n      <div class=\"row2\">\n        <div><label class=\"lbl\" for=\"slug\">الرابط (slug) *</label><input class=\"field\" id=\"slug\" maxlength=\"60\" dir=\"ltr\"></div>\n        <div><label class=\"lbl\" for=\"sort_order\">الترتيب</label><input class=\"field\" id=\"sort_order\" type=\"number\" step=\"1\" value=\"0\" dir=\"ltr\"></div>\n      </div>\n      <div>\n        <label class=\"lbl\">الصورة</label>\n        <div style=\"display:flex;gap:12px;align-items:center;flex-wrap:wrap\">\n          <img id=\"c-img\" class=\"thumb\" alt=\"\" hidden style=\"width:64px;height:80px;object-fit:cover;border-radius:2px\">\n          <input type=\"file\" id=\"c-file\" accept=\"image/jpeg,image/png,image/webp\" hidden>\n          <button class=\"btn ghost sm\" type=\"button\" id=\"c-pick\">اختيار صورة</button>\n          <button class=\"btn ghost sm\" type=\"button\" id=\"c-clear\" hidden>إزالة</button>\n          <span class=\"muted\" id=\"c-msg\" role=\"status\"></span>\n        </div>\n      </div>\n      <label class=\"check\"><input type=\"checkbox\" id=\"is_active\" checked> ظاهر في المتجر</label>\n      <div class=\"msg\" id=\"msg\" role=\"alert\"></div>\n      <button class=\"btn\" id=\"save\" type=\"submit\">حفظ</button>\n    </form>\n  </dialog>",
  run: function (params) {
  var A = Admin, esc = A.esc;
  var $ = function (id) { return document.getElementById(id); };
  var MARK = '/storage/v1/object/public/site/';
  var cats = [], editing = null, imageUrl = '', slugTouched = false;
  var dlg = $('dlg');

  function storagePath(url) {
    var i = String(url || '').indexOf(MARK);
    return i === -1 ? null : decodeURIComponent(String(url).slice(i + MARK.length));
  }

  function render() {
    $('rows').innerHTML = cats.length ? cats.map(function (c) {
      return '<tr data-id="' + esc(c.id) + '"><td>' + (c.image_url ? '<img class="thumb" src="' + esc(c.image_url) + '" alt="">' : '<div class="thumb"></div>') + '</td>' +
        '<td><b>' + esc(c.name_ar) + '</b><div class="muted" dir="ltr" style="text-align:start">' + esc(c.name_fr) + '</div></td>' +
        '<td>' + c.sort_order + '</td><td>' + (c.is_active ? '✓' : '—') + '</td>' +
        '<td style="white-space:nowrap"><button class="btn ghost sm" type="button" data-act="edit">تعديل</button> ' +
        '<button class="btn danger sm" type="button" data-act="del">حذف</button></td></tr>';
    }).join('') : '<tr><td colspan="5" class="empty">لا توجد تصنيفات.</td></tr>';
  }
  function load() {
    return sb.from('categories').select('*').order('sort_order').then(function (r) {
      if (r.error) throw r.error; cats = r.data || []; render();
    });
  }

  function showImage() {
    $('c-img').hidden = !imageUrl; if (imageUrl) $('c-img').src = imageUrl;
    $('c-clear').hidden = !imageUrl;
  }
  function openForm(c) {
    editing = c || null; slugTouched = !!c; imageUrl = (c && c.image_url) || '';
    $('d-title').textContent = c ? 'تعديل التصنيف' : 'تصنيف جديد';
    $('name_ar').value = c ? c.name_ar : ''; $('name_fr').value = c ? c.name_fr : '';
    $('slug').value = c ? c.slug : ''; $('sort_order').value = c ? c.sort_order : cats.length + 1;
    $('is_active').checked = c ? c.is_active : true;
    $('msg').textContent = ''; $('c-msg').textContent = ''; showImage();
    dlg.showModal();
  }

  $('add').addEventListener('click', function () { openForm(null); });
  $('d-close').addEventListener('click', function () { dlg.close(); });
  $('name_fr').addEventListener('input', function () { if (!slugTouched) $('slug').value = A.slugify($('name_fr').value); });
  $('slug').addEventListener('input', function () { slugTouched = true; });

  $('rows').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]'); if (!b) return;
    var id = b.closest('tr').dataset.id, c = cats.find(function (x) { return x.id === id; });
    if (b.dataset.act === 'edit') return openForm(c);
    if (!confirm('حذف التصنيف «' + c.name_ar + '»؟ ستبقى المنتجات لكن بدون تصنيف.')) return;
    var p = storagePath(c.image_url);
    (p ? sb.storage.from('site').remove([p]) : Promise.resolve())
      .then(function () { return sb.from('categories').delete().eq('id', id); })
      .then(function (r) { if (r.error) throw r.error; return load(); })
      .then(function () { A.toast('تم الحذف.'); })
      .catch(function (err) { A.toast(A.errText(err), true); });
  });

  /* ----- image ----- */
  function resize(file) {
    return createImageBitmap(file).then(function (bmp) {
      var s = Math.min(1, 900 / Math.max(bmp.width, bmp.height));
      var cv = document.createElement('canvas');
      cv.width = Math.round(bmp.width * s); cv.height = Math.round(bmp.height * s);
      cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
      return new Promise(function (res) {
        cv.toBlob(function (b) {
          if (b && b.type === 'image/webp') res(b); else cv.toBlob(function (j) { res(j); }, 'image/jpeg', 0.85);
        }, 'image/webp', 0.82);
      });
    });
  }
  $('c-pick').addEventListener('click', function () { $('c-file').click(); });
  $('c-clear').addEventListener('click', function () { imageUrl = ''; showImage(); });
  $('c-file').addEventListener('change', function () {
    var f = this.files[0], input = this; if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type) || f.size > 20 * 1024 * 1024) { A.toast('ملف غير صالح.', true); input.value = ''; return; }
    $('c-msg').textContent = 'جاري الرفع…';
    resize(f).then(function (blob) {
      var path = 'categories/' + A.uuid() + (blob.type === 'image/webp' ? '.webp' : '.jpg');
      return sb.storage.from('site').upload(path, blob, { contentType: blob.type, cacheControl: '31536000' }).then(function (u) {
        if (u.error) throw u.error;
        imageUrl = sb.storage.from('site').getPublicUrl(path).data.publicUrl; showImage();
      });
    }).catch(function (e) { A.toast(A.errText(e), true); })
      .then(function () { $('c-msg').textContent = ''; input.value = ''; });
  });

  /* ----- save ----- */
  $('cform').addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = $('msg'); msg.className = 'msg'; msg.textContent = '';
    var row = {
      name_ar: $('name_ar').value.trim(), name_fr: $('name_fr').value.trim(),
      slug: $('slug').value.trim().toLowerCase(), sort_order: parseInt($('sort_order').value, 10) || 0,
      is_active: $('is_active').checked, image_url: imageUrl || null
    };
    if (!row.name_ar || !row.name_fr) { msg.className = 'msg err'; msg.textContent = 'الاسمان مطلوبان.'; return; }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(row.slug)) { msg.className = 'msg err'; msg.textContent = 'الرابط: أحرف لاتينية صغيرة وأرقام وشرطات.'; return; }
    var btn = $('save'); btn.disabled = true;
    var req = editing ? sb.from('categories').update(row).eq('id', editing.id) : sb.from('categories').insert(row);
    req.then(function (r) {
      if (r.error) throw r.error;
      dlg.close(); return load();
    }).then(function () { A.toast('تم الحفظ.'); })
      .catch(function (err) { msg.className = 'msg err'; msg.textContent = A.errText(err); })
      .then(function () { btn.disabled = false; });
  });

  Promise.resolve().then(function () { return load(); }).catch(function (e) { A.toast(A.errText(e), true); });
}
};
