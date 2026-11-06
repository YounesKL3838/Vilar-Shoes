/* Vilar admin - product-edit.js : écran affiché dans admin.html */
Admin.views["product-edit"] = {
  tpl: "<div class=\"page-title\">\n          <h1 id=\"title\">منتج جديد</h1>\n          <a class=\"btn ghost\" href=\"#/products\">← كل المنتجات</a>\n        </div>\n\n        <form id=\"pform\" novalidate>\n          <div class=\"card stack\">\n            <h2>المعلومات الأساسية</h2>\n            <div class=\"row2\">\n              <div><label class=\"lbl\" for=\"name_ar\">الاسم بالعربية *</label><input class=\"field\" id=\"name_ar\" maxlength=\"150\"></div>\n              <div><label class=\"lbl\" for=\"name_fr\">Nom en français *</label><input class=\"field\" id=\"name_fr\" maxlength=\"150\" dir=\"ltr\"></div>\n            </div>\n            <div class=\"row2\">\n              <div><label class=\"lbl\" for=\"slug\">الرابط (slug) *</label><input class=\"field\" id=\"slug\" maxlength=\"120\" dir=\"ltr\" placeholder=\"sandale-beige\"></div>\n              <div><label class=\"lbl\" for=\"category\">التصنيف</label><select class=\"field\" id=\"category\"><option value=\"\">— بدون —</option></select></div>\n            </div>\n            <div class=\"row2\">\n              <div><label class=\"lbl\" for=\"desc_ar\">الوصف بالعربية</label><textarea class=\"field\" id=\"desc_ar\" rows=\"4\"></textarea></div>\n              <div><label class=\"lbl\" for=\"desc_fr\">Description en français</label><textarea class=\"field\" id=\"desc_fr\" rows=\"4\" dir=\"ltr\"></textarea></div>\n            </div>\n          </div>\n\n          <div class=\"card stack\">\n            <h2>السعر والعرض</h2>\n            <div class=\"row2\">\n              <div><label class=\"lbl\" for=\"price\">السعر الأصلي (د.ج) *</label><input class=\"field\" id=\"price\" type=\"number\" min=\"0\" step=\"1\" inputmode=\"numeric\" dir=\"ltr\"></div>\n              <div><label class=\"lbl\" for=\"sale_price\">سعر التخفيض (اختياري)</label><input class=\"field\" id=\"sale_price\" type=\"number\" min=\"0\" step=\"1\" inputmode=\"numeric\" dir=\"ltr\"></div>\n            </div>\n            <div style=\"display:flex;gap:22px;flex-wrap:wrap\">\n              <label class=\"check\"><input type=\"checkbox\" id=\"is_active\" checked> ظاهر في المتجر</label>\n              <label class=\"check\"><input type=\"checkbox\" id=\"is_new\"> وصل حديثاً</label>\n              <label class=\"check\"><input type=\"checkbox\" id=\"is_bestseller\"> الأكثر مبيعاً</label>\n              <label class=\"check\"><input type=\"checkbox\" id=\"is_featured\"> مميز</label>\n            </div>\n          </div>\n\n          <div class=\"card\">\n            <h2>المقاسات والألوان والمخزون</h2>\n            <div class=\"row3\" style=\"align-items:end;margin-bottom:14px\">\n              <div><label class=\"lbl\" for=\"g-color\">اللون</label><input class=\"field sm\" id=\"g-color\" placeholder=\"Beige\"></div>\n              <div><label class=\"lbl\" for=\"g-hex\">درجة اللون</label><input class=\"field sm\" id=\"g-hex\" type=\"color\" value=\"#d9c7b0\" style=\"padding:2px;width:70px\"></div>\n              <div></div>\n            </div>\n            <div class=\"row3\" style=\"align-items:end;margin-bottom:14px\">\n              <div><label class=\"lbl\" for=\"g-from\">من المقاس</label><input class=\"field sm\" id=\"g-from\" type=\"number\" min=\"1\" max=\"60\" value=\"36\" dir=\"ltr\"></div>\n              <div><label class=\"lbl\" for=\"g-to\">إلى المقاس</label><input class=\"field sm\" id=\"g-to\" type=\"number\" min=\"1\" max=\"60\" value=\"41\" dir=\"ltr\"></div>\n              <div><label class=\"lbl\" for=\"g-stock\">الكمية لكل مقاس</label><input class=\"field sm\" id=\"g-stock\" type=\"number\" min=\"0\" value=\"5\" dir=\"ltr\"></div>\n            </div>\n            <button class=\"btn ghost sm\" type=\"button\" id=\"g-add\">توليد المقاسات لهذا اللون</button>\n            <button class=\"btn ghost sm\" type=\"button\" id=\"v-add\">+ سطر يدوي</button>\n            <div class=\"tablewrap\" style=\"margin-top:14px\">\n              <table class=\"vtable\" style=\"min-width:560px\">\n                <thead><tr><th>المقاس</th><th>اللون</th><th>درجة</th><th>الكمية</th><th>مفعّل</th><th></th></tr></thead>\n                <tbody id=\"vbody\"></tbody>\n              </table>\n            </div>\n          </div>\n\n          <div class=\"msg\" id=\"msg\" role=\"alert\"></div>\n          <button class=\"btn\" type=\"submit\" id=\"save\">حفظ المنتج</button>\n        </form>\n\n        <div class=\"card\" id=\"img-card\" style=\"margin-top:18px\">\n          <h2>الصور</h2>\n          <p class=\"muted\" id=\"img-hint\">احفظ المنتج أولاً ثم ارفع صوره.</p>\n          <div id=\"img-tools\" hidden>\n            <input type=\"file\" id=\"files\" accept=\"image/jpeg,image/png,image/webp\" multiple hidden>\n            <button class=\"btn ghost sm\" type=\"button\" id=\"pick\">+ رفع صور</button>\n            <span class=\"muted\" id=\"up-msg\" role=\"status\"></span>\n            <p class=\"muted\" style=\"margin:8px 0 14px\">تُحوَّل الصور تلقائياً إلى صيغة بورتريه 4:5 مثل إنستغرام (قصّ من الوسط) وتُضغط قبل الرفع. أول صورة هي الصورة الرئيسية.</p>\n            <div class=\"imgs\" id=\"imgs\"></div>\n          </div>\n        </div>",
  run: function (params) {
  var A = Admin, esc = A.esc;
  var $ = function (id) { return document.getElementById(id); };
  var MARK = '/storage/v1/object/public/products/';
  var pid = null, variants = [], origIds = [], images = [], slugTouched = false;

  /* ---------- Variantes ---------- */
  function renderVariants() {
    $('vbody').innerHTML = variants.length ? variants.map(function (v, i) {
      return '<tr data-i="' + i + '">' +
        '<td><input class="field sm" data-f="size" value="' + esc(v.size) + '" dir="ltr" maxlength="10" aria-label="المقاس"></td>' +
        '<td><input class="field sm" data-f="color_name" value="' + esc(v.color_name) + '" maxlength="40" aria-label="اللون"></td>' +
        '<td><input class="field sm" type="color" data-f="color_hex" value="' + esc(/^#[0-9a-f]{6}$/i.test(v.color_hex || '') ? v.color_hex : '#cccccc') + '" aria-label="درجة اللون"></td>' +
        '<td><input class="field sm" type="number" min="0" step="1" data-f="stock" value="' + esc(v.stock) + '" dir="ltr" aria-label="الكمية"></td>' +
        '<td><input type="checkbox" data-f="is_active"' + (v.is_active ? ' checked' : '') + ' aria-label="مفعّل" style="width:18px;height:18px"></td>' +
        '<td><button class="btn danger sm" type="button" data-act="rm">حذف</button></td></tr>';
    }).join('') : '<tr><td colspan="6" class="empty">أضف مقاسات وألواناً.</td></tr>';
  }
  $('vbody').addEventListener('input', function (e) {
    var f = e.target.dataset.f, tr = e.target.closest('tr'); if (!f || !tr) return;
    var v = variants[+tr.dataset.i];
    v[f] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  });
  $('vbody').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act=rm]'); if (!b) return;
    variants.splice(+b.closest('tr').dataset.i, 1); renderVariants();
  });
  $('v-add').addEventListener('click', function () {
    variants.push({ size: '', color_name: '', color_hex: '#d9c7b0', stock: 0, is_active: true }); renderVariants();
  });
  $('g-add').addEventListener('click', function () {
    var color = $('g-color').value.trim(), hex = $('g-hex').value;
    var from = parseInt($('g-from').value, 10), to = parseInt($('g-to').value, 10), stock = Math.max(0, parseInt($('g-stock').value, 10) || 0);
    if (!color) { A.toast('أدخل اسم اللون أولاً.', true); return; }
    if (!(from >= 1 && to >= from && to - from <= 30)) { A.toast('نطاق المقاسات غير صالح.', true); return; }
    for (var s = from; s <= to; s++) {
      var exists = variants.some(function (v) { return String(v.size).trim() === String(s) && v.color_name.trim().toLowerCase() === color.toLowerCase(); });
      if (!exists) variants.push({ size: String(s), color_name: color, color_hex: hex, stock: stock, is_active: true });
    }
    renderVariants();
  });

  /* ---------- Collecte + validation ---------- */
  function collect() {
    var name_ar = $('name_ar').value.trim(), name_fr = $('name_fr').value.trim();
    var slug = $('slug').value.trim().toLowerCase();
    var price = parseFloat($('price').value), sp = $('sale_price').value.trim();
    var sale = sp === '' ? null : parseFloat(sp);
    if (!name_ar || !name_fr) return { err: 'الاسم بالعربية والفرنسية مطلوبان.' };
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return { err: 'الرابط (slug): أحرف لاتينية صغيرة وأرقام وشرطات فقط.' };
    if (!(price > 0)) return { err: 'السعر الأصلي مطلوب.' };
    if (sale !== null && !(sale >= 0 && sale < price)) return { err: 'سعر التخفيض يجب أن يكون أقل من السعر الأصلي.' };
    var seen = {};
    for (var i = 0; i < variants.length; i++) {
      var v = variants[i], size = String(v.size).trim(), color = String(v.color_name).trim(), stock = Number(v.stock);
      if (!size || !color) return { err: 'كل سطر مقاس يحتاج مقاساً ولوناً.' };
      if (!Number.isInteger(stock) || stock < 0) return { err: 'الكمية يجب أن تكون عدداً صحيحاً ≥ 0.' };
      var key = size + '|' + color.toLowerCase();
      if (seen[key]) return { err: 'تكرار: ' + size + ' / ' + color };
      seen[key] = true;
    }
    return {
      payload: {
        name_ar: name_ar, name_fr: name_fr, slug: slug,
        description_ar: $('desc_ar').value.trim() || null, description_fr: $('desc_fr').value.trim() || null,
        price: price, sale_price: sale, category_id: $('category').value || null,
        is_active: $('is_active').checked, is_new: $('is_new').checked,
        is_bestseller: $('is_bestseller').checked, is_featured: $('is_featured').checked
      }
    };
  }

  function syncVariants() {
    var clean = function (v) {
      return { size: String(v.size).trim(), color_name: String(v.color_name).trim(),
               color_hex: /^#[0-9a-f]{6}$/i.test(v.color_hex || '') ? v.color_hex : null,
               stock: Number(v.stock), is_active: !!v.is_active };
    };
    var ins = variants.filter(function (v) { return !v.id; }).map(function (v) { var c = clean(v); c.product_id = pid; return c; });
    var upd = variants.filter(function (v) { return v.id; });
    var keep = upd.map(function (v) { return v.id; });
    var del = origIds.filter(function (id) { return keep.indexOf(id) === -1; });
    var jobs = [];
    if (ins.length) jobs.push(sb.from('product_variants').insert(ins));
    upd.forEach(function (v) { jobs.push(sb.from('product_variants').update(clean(v)).eq('id', v.id)); });
    if (del.length) jobs.push(sb.from('product_variants').delete().in('id', del));
    return Promise.all(jobs).then(function (rs) {
      rs.forEach(function (r) { if (r.error) throw r.error; });
    });
  }

  function loadVariants() {
    return sb.from('product_variants').select('*').eq('product_id', pid).order('color_name').order('size').then(function (r) {
      if (r.error) throw r.error;
      variants = (r.data || []).sort(function (a, b) {
        return a.color_name.localeCompare(b.color_name) || (parseFloat(a.size) - parseFloat(b.size)) || String(a.size).localeCompare(b.size);
      });
      origIds = variants.map(function (v) { return v.id; });
      renderVariants();
    });
  }

  /* ---------- Sauvegarde ---------- */
  $('pform').addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = $('msg'), btn = $('save');
    msg.className = 'msg'; msg.textContent = '';
    var c = collect();
    if (c.err) { msg.className = 'msg err'; msg.textContent = c.err; return; }
    btn.disabled = true;
    var wasNew = !pid;
    var req = pid
      ? sb.from('products').update(c.payload).eq('id', pid).select('id').single()
      : sb.from('products').insert(c.payload).select('id').single();
    req.then(function (r) {
      if (r.error) throw r.error;
      pid = r.data.id;
      return syncVariants();
    }).then(function () {
      if (wasNew) { location.replace('#/product/' + pid + '?saved=1'); return; }
      return loadVariants().then(function () { A.toast('تم حفظ المنتج.'); });
    }).catch(function (err) {
      msg.className = 'msg err'; msg.textContent = A.errText(err);
    }).then(function () { btn.disabled = false; });
  });

  /* ---------- Images ---------- */
  function storagePath(url) {
    var i = String(url).indexOf(MARK);
    return i === -1 ? null : decodeURIComponent(String(url).slice(i + MARK.length));
  }
  function resize(file) { return A.resizeImage(file, 1350, 4 / 5); }   // portrait 4:5 comme Instagram (1080x1350 max)
  function renderImages() {
    $('imgs').innerHTML = images.map(function (im, i) {
      return '<figure data-id="' + esc(im.id) + '"><img src="' + esc(im.url) + '" alt="">' +
        (i === 0 ? '<div class="main">الصورة الرئيسية</div>' : '') +
        '<div class="acts"><button class="btn ghost sm" type="button" data-act="left"' + (i === 0 ? ' disabled' : '') + ' aria-label="تقديم">→</button>' +
        '<button class="btn ghost sm" type="button" data-act="right"' + (i === images.length - 1 ? ' disabled' : '') + ' aria-label="تأخير">←</button>' +
        '<button class="btn danger sm" type="button" data-act="del">حذف</button></div></figure>';
    }).join('');
  }
  function loadImages() {
    return sb.from('product_images').select('*').eq('product_id', pid).order('sort_order').then(function (r) {
      if (r.error) throw r.error; images = r.data || []; renderImages();
    });
  }

  $('pick').addEventListener('click', function () { $('files').click(); });
  $('files').addEventListener('change', function () {
    var files = Array.prototype.slice.call(this.files), input = this, msg = $('up-msg'), n = 0;
    function next() {
      if (!files.length) { msg.textContent = ''; input.value = ''; return loadImages(); }
      var f = files.shift();
      msg.textContent = 'جاري رفع الصورة ' + (++n) + '…';
      if (!/^image\/(jpeg|png|webp)$/.test(f.type) || f.size > 20 * 1024 * 1024) {
        A.toast('تم تجاهل ملف غير صالح: ' + f.name, true); return next();
      }
      return resize(f).then(function (blob) {
        var ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
        var path = pid + '/' + A.uuid() + '.' + ext;
        return sb.storage.from('products').upload(path, blob, { contentType: blob.type, cacheControl: '31536000' })
          .then(function (u) {
            if (u.error) throw u.error;
            var url = sb.storage.from('products').getPublicUrl(path).data.publicUrl;
            var order = images.length ? images[images.length - 1].sort_order + 1 : 0;
            return sb.from('product_images').insert({ product_id: pid, url: url, sort_order: order });
          }).then(function (r) {
            if (r.error) throw r.error;
            return loadImages();
          });
      }).then(next);
    }
    next().catch(function (e) { msg.textContent = ''; A.toast(A.errText(e), true); });
  });

  $('imgs').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]'); if (!b) return;
    var id = b.closest('figure').dataset.id;
    var i = images.findIndex(function (x) { return x.id === id; });
    if (b.dataset.act === 'del') {
      if (!confirm('حذف هذه الصورة؟')) return;
      var p = storagePath(images[i].url);
      (p ? sb.storage.from('products').remove([p]) : Promise.resolve())
        .then(function () { return sb.from('product_images').delete().eq('id', id); })
        .then(function (r) { if (r.error) throw r.error; return loadImages(); })
        .catch(function (err) { A.toast(A.errText(err), true); });
      return;
    }
    var j = b.dataset.act === 'left' ? i - 1 : i + 1;
    if (j < 0 || j >= images.length) return;
    var a = images[i], c = images[j];
    Promise.all([
      sb.from('product_images').update({ sort_order: c.sort_order }).eq('id', a.id),
      sb.from('product_images').update({ sort_order: a.sort_order }).eq('id', c.id)
    ]).then(loadImages).catch(function (err) { A.toast(A.errText(err), true); });
  });

  /* ---------- Démarrage ---------- */
  $('name_fr').addEventListener('input', function () {
    if (!slugTouched) $('slug').value = A.slugify($('name_fr').value);
  });
  $('slug').addEventListener('input', function () { slugTouched = true; });

  function fill(p) {
    $('title').textContent = p.name_ar;
    $('name_ar').value = p.name_ar; $('name_fr').value = p.name_fr; $('slug').value = p.slug; slugTouched = true;
    $('desc_ar').value = p.description_ar || ''; $('desc_fr').value = p.description_fr || '';
    $('price').value = p.price; $('sale_price').value = p.sale_price != null ? p.sale_price : '';
    $('category').value = p.category_id || '';
    $('is_active').checked = p.is_active; $('is_new').checked = p.is_new;
    $('is_bestseller').checked = p.is_bestseller; $('is_featured').checked = p.is_featured;
  }

  Promise.resolve().then(function () {
    var q = params.qs, id = params.id;
    return sb.from('categories').select('id,name_ar').order('sort_order').then(function (r) {
      $('category').insertAdjacentHTML('beforeend', (r.data || []).map(function (c) {
        return '<option value="' + esc(c.id) + '">' + esc(c.name_ar) + '</option>';
      }).join(''));
      if (!id) { renderVariants(); return; }
      if (!/^[0-9a-f-]{36}$/i.test(id)) { location.replace('#/products'); return; }
      pid = id;
      return sb.from('products').select('*').eq('id', pid).maybeSingle().then(function (pr) {
        if (pr.error || !pr.data) { location.replace('#/products'); return; }
        fill(pr.data);
        $('img-hint').hidden = true; $('img-tools').hidden = false;
        if (q.get('saved')) A.toast('تم إنشاء المنتج. يمكنك الآن رفع الصور.');
        return Promise.all([loadVariants(), loadImages()]);
      });
    });
  }).catch(function (e) { A.toast(A.errText(e), true); });
}
};
