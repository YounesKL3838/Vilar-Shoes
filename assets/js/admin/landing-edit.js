/* Vilar admin - landing-edit.js : écran affiché dans admin.html */
Admin.views["landing-edit"] = {
  tpl: "<div class=\"page-title\">\n          <h1 id=\"title\">صفحة هبوط جديدة</h1>\n          <a class=\"btn ghost\" href=\"#/landing\">← كل الصفحات</a>\n        </div>\n\n        <form id=\"lform\" novalidate>\n          <div class=\"card stack\">\n            <h2>الأساسيات</h2>\n            <div class=\"row2\">\n              <div><label class=\"lbl\" for=\"f-title\">اسم داخلي للصفحة *</label><input class=\"field\" id=\"f-title\" maxlength=\"120\" placeholder=\"حملة الصنادل - نوفمبر\"></div>\n              <div><label class=\"lbl\" for=\"f-slug\">الرابط (slug) *</label><input class=\"field\" id=\"f-slug\" maxlength=\"80\" dir=\"ltr\" placeholder=\"sandale-beige\"></div>\n            </div>\n            <div class=\"row2\">\n              <div><label class=\"lbl\" for=\"f-lang\">لغة الصفحة</label>\n                <select class=\"field\" id=\"f-lang\"><option value=\"ar\">العربية (RTL)</option><option value=\"fr\">Français</option></select></div>\n              <div style=\"display:flex;align-items:end\"><label class=\"check\"><input type=\"checkbox\" id=\"f-pub\"> منشورة (ظاهرة للزوار)</label></div>\n            </div>\n          </div>\n\n          <div class=\"card stack\">\n            <h2>النص التسويقي</h2>\n            <div><label class=\"lbl\" for=\"f-headline\">العنوان الرئيسي *</label><input class=\"field\" id=\"f-headline\" maxlength=\"160\"></div>\n            <div><label class=\"lbl\" for=\"f-sub\">عنوان فرعي</label><input class=\"field\" id=\"f-sub\" maxlength=\"240\"></div>\n            <div><label class=\"lbl\" for=\"f-desc\">وصف المنتج</label><textarea class=\"field\" id=\"f-desc\" rows=\"4\" maxlength=\"2000\"></textarea></div>\n            <div class=\"row2\">\n              <div><label class=\"lbl\" for=\"f-cta\">نص زر الطلب</label><input class=\"field\" id=\"f-cta\" maxlength=\"40\" value=\"Commander maintenant\"></div>\n              <div><label class=\"lbl\" for=\"f-ends\">نهاية العرض (اختياري)</label><input class=\"field\" id=\"f-ends\" type=\"datetime-local\" dir=\"ltr\">\n                <span class=\"muted\" style=\"font-size:.85rem\">بعد هذا الوقت يعود السعر العادي تلقائياً ويتوقف المؤقت.</span></div>\n            </div>\n          </div>\n\n          <div class=\"card\">\n            <h2>المنتجات المرتبطة</h2>\n            <p class=\"muted\">اختر منتجاً أو أكثر. «سعر العرض» يُطبَّق على هذه الصفحة فقط (اتركه فارغاً لاستعمال سعر المنتج العادي). عند اختيار أكثر من منتج تختار الزبونة الموديل داخل الصفحة.</p>\n            <div class=\"tablewrap\">\n              <table style=\"min-width:560px\">\n                <thead><tr><th>إدراج</th><th>المنتج</th><th>سعره</th><th>سعر العرض (د.ج)</th><th>الترتيب</th></tr></thead>\n                <tbody id=\"prows\"></tbody>\n              </table>\n            </div>\n          </div>\n\n          <div class=\"card\">\n            <h2>صورة إضافية (اختياري)</h2>\n            <div style=\"display:flex;gap:12px;align-items:center;flex-wrap:wrap\">\n              <img id=\"hero-prev\" alt=\"\" hidden style=\"width:90px;aspect-ratio:4/5;object-fit:cover;border-radius:2px\">\n              <input type=\"file\" id=\"hero-file\" accept=\"image/jpeg,image/png,image/webp\" hidden>\n              <button class=\"btn ghost sm\" type=\"button\" id=\"hero-pick\">اختيار صورة</button>\n              <button class=\"btn ghost sm\" type=\"button\" id=\"hero-clear\" hidden>إزالة</button>\n              <span class=\"muted\" id=\"hero-msg\" role=\"status\"></span>\n            </div>\n            <p class=\"muted\" style=\"margin:8px 0 0\">تظهر أولاً مع صور المنتج الموجودة في الموقع. إن تركتها فارغة تظهر صور المنتج فقط. تُحوَّل تلقائياً إلى بورتريه 4:5.</p>\n          </div>\n\n          <div class=\"msg\" id=\"msg\" role=\"alert\"></div>\n          <button class=\"btn\" type=\"submit\" id=\"save\">حفظ الصفحة</button>\n        </form>",
  run: function (params) {
  var A = Admin, esc = A.esc;
  var $ = function (id) { return document.getElementById(id); };
  var MARK = '/storage/v1/object/public/landing/';
  var id = null, heroUrl = '', plist = [], removed = [], slugTouched = false;

  function storagePath(url) {
    var i = String(url || '').indexOf(MARK);
    return i === -1 ? null : decodeURIComponent(String(url).slice(i + MARK.length));
  }
  function upload(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 20 * 1024 * 1024) return Promise.reject(new Error('ملف غير صالح: ' + file.name));
    return A.resizeImage(file, 1350, 4 / 5).then(function (blob) {
      var path = 'pages/' + A.uuid() + (blob.type === 'image/webp' ? '.webp' : '.jpg');
      return sb.storage.from('landing').upload(path, blob, { contentType: blob.type, cacheControl: '31536000' }).then(function (u) {
        if (u.error) throw u.error;
        return sb.storage.from('landing').getPublicUrl(path).data.publicUrl;
      });
    });
  }

  /* ---------- Produits ---------- */
  function renderProducts() {
    $('prows').innerHTML = plist.length ? plist.map(function (p, i) {
      var price = p.sale_price != null ? A.money(p.sale_price) + ' <s class="muted">' + A.money(p.price) + '</s>' : A.money(p.price);
      return '<tr data-i="' + i + '"><td><input type="checkbox" data-f="include"' + (p.include ? ' checked' : '') + ' aria-label="إدراج" style="width:18px;height:18px"></td>' +
        '<td>' + esc(p.name_ar) + (p.is_active ? '' : ' <span class="pill">مخفي</span>') + '</td><td>' + price + '</td>' +
        '<td><input class="field sm" type="number" min="0" step="1" data-f="offer" dir="ltr" value="' + esc(p.offer) + '"' + (p.include ? '' : ' disabled') + ' aria-label="سعر العرض"></td>' +
        '<td style="white-space:nowrap"><button class="btn ghost sm" type="button" data-act="up" aria-label="للأعلى">↑</button> ' +
        '<button class="btn ghost sm" type="button" data-act="down" aria-label="للأسفل">↓</button></td></tr>';
    }).join('') : '<tr><td colspan="5" class="empty">لا توجد منتجات. أضف منتجات أولاً.</td></tr>';
  }
  $('prows').addEventListener('change', function (e) {
    if (e.target.dataset.f !== 'include') return;
    plist[+e.target.closest('tr').dataset.i].include = e.target.checked; renderProducts();
  });
  $('prows').addEventListener('input', function (e) {
    if (e.target.dataset.f === 'offer') plist[+e.target.closest('tr').dataset.i].offer = e.target.value;
  });
  $('prows').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]'); if (!b) return;
    var i = +b.closest('tr').dataset.i, j = b.dataset.act === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= plist.length) return;
    var t = plist[i]; plist[i] = plist[j]; plist[j] = t; renderProducts();
  });

  /* ---------- Image principale ---------- */
  function renderHero() {
    $('hero-prev').hidden = !heroUrl; if (heroUrl) $('hero-prev').src = heroUrl;
    $('hero-clear').hidden = !heroUrl;
  }
  $('hero-pick').addEventListener('click', function () { $('hero-file').click(); });
  $('hero-clear').addEventListener('click', function () { if (heroUrl) removed.push(heroUrl); heroUrl = ''; renderHero(); });
  $('hero-file').addEventListener('change', function () {
    var f = this.files[0], input = this; if (!f) return;
    $('hero-msg').textContent = 'جاري الرفع…';
    upload(f).then(function (url) { if (heroUrl) removed.push(heroUrl); heroUrl = url; renderHero(); })
      .catch(function (e) { A.toast(A.errText(e), true); })
      .then(function () { $('hero-msg').textContent = ''; input.value = ''; });
  });

  /* ---------- Sauvegarde ---------- */
  function toLocal(iso) {
    if (!iso) return '';
    var d = new Date(iso), p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function collect() {
    var title = $('f-title').value.trim(), slug = $('f-slug').value.trim().toLowerCase(), headline = $('f-headline').value.trim();
    if (!title) return { err: 'الاسم الداخلي مطلوب.' };
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return { err: 'الرابط: أحرف لاتينية صغيرة وأرقام وشرطات فقط.' };
    if (!headline) return { err: 'العنوان الرئيسي مطلوب.' };
    var sel = plist.filter(function (p) { return p.include; });
    if (!sel.length) return { err: 'اختر منتجاً واحداً على الأقل.' };
    for (var i = 0; i < sel.length; i++) {
      var o = String(sel[i].offer).trim();
      if (o !== '' && !(parseFloat(o) >= 0)) return { err: 'سعر العرض يجب أن يكون رقماً ≥ 0.' };
    }
    var ends = $('f-ends').value ? new Date($('f-ends').value) : null;
    if (ends && isNaN(ends.getTime())) return { err: 'تاريخ نهاية العرض غير صالح.' };
    return {
      sel: sel,
      payload: {
        slug: slug, title: title, headline: headline, subheadline: $('f-sub').value.trim() || null,
        lang: $('f-lang').value, hero_image_url: heroUrl || null, description: $('f-desc').value.trim() || null,
        cta_text: $('f-cta').value.trim() || 'Commander maintenant',
        offer_ends_at: ends ? ends.toISOString() : null, is_published: $('f-pub').checked
      }
    };
  }

  $('lform').addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = $('msg'), btn = $('save'); msg.className = 'msg'; msg.textContent = '';
    var c = collect();
    if (c.err) { msg.className = 'msg err'; msg.textContent = c.err; return; }
    btn.disabled = true;
    var wasNew = !id;
    var req = id ? sb.from('landing_pages').update(c.payload).eq('id', id).select('id').single()
                 : sb.from('landing_pages').insert(c.payload).select('id').single();
    req.then(function (r) {
      if (r.error) throw r.error;
      id = r.data.id;
      var rows = c.sel.map(function (p, i) {
        var o = String(p.offer).trim();
        return { landing_page_id: id, product_id: p.id, offer_price: o === '' ? null : parseFloat(o), sort_order: i };
      });
      return sb.from('landing_page_products').upsert(rows, { onConflict: 'landing_page_id,product_id' }).then(function (u) {
        if (u.error) throw u.error;
        return sb.from('landing_page_products').delete().eq('landing_page_id', id)
          .not('product_id', 'in', '(' + c.sel.map(function (p) { return p.id; }).join(',') + ')');
      }).then(function (d) { if (d.error) throw d.error; });
    }).then(function () {
      // Nettoyage des images retirées (jamais celles encore utilisées)
      var used = heroUrl ? [heroUrl] : [];
      var paths = removed.filter(function (u) { return used.indexOf(u) === -1; }).map(storagePath).filter(Boolean);
      removed = [];
      return paths.length ? sb.storage.from('landing').remove(paths) : null;
    }).then(function () {
      if (wasNew) { location.replace('#/landing/' + id + '?saved=1'); return; }
      A.toast('تم حفظ الصفحة.');
    }).catch(function (err) {
      msg.className = 'msg err'; msg.textContent = A.errText(err);
    }).then(function () { btn.disabled = false; });
  });

  $('f-title').addEventListener('input', function () { if (!slugTouched && !id) $('f-slug').value = A.slugify($('f-title').value); });
  $('f-slug').addEventListener('input', function () { slugTouched = true; });

  /* ---------- Démarrage ---------- */
  Promise.resolve().then(function () {
    var q = params.qs, pid = params.id;
    return Promise.all([
      sb.from('products').select('id,name_ar,name_fr,price,sale_price,is_active').order('created_at', { ascending: false }),
      pid && /^[0-9a-f-]{36}$/i.test(pid) ? sb.from('landing_pages').select('*').eq('id', pid).maybeSingle() : Promise.resolve({ data: null }),
      pid && /^[0-9a-f-]{36}$/i.test(pid) ? sb.from('landing_page_products').select('product_id,offer_price,sort_order').eq('landing_page_id', pid) : Promise.resolve({ data: [] })
    ]).then(function (res) {
      var prods = res[0].data || [], page = res[1].data, links = res[2].data || [];
      if (pid && !page) { location.replace('#/landing'); return; }
      var map = {}; links.forEach(function (l) { map[l.product_id] = l; });
      plist = prods.map(function (p) {
        var l = map[p.id];
        return { id: p.id, name_ar: p.name_ar, name_fr: p.name_fr, price: p.price, sale_price: p.sale_price, is_active: p.is_active,
                 include: !!l, offer: l && l.offer_price != null ? l.offer_price : '', _o: l ? l.sort_order : 1e9 };
      }).sort(function (a, b) { return a._o - b._o; });

      if (page) {
        id = page.id; slugTouched = true;
        $('title').textContent = page.title;
        $('f-title').value = page.title; $('f-slug').value = page.slug; $('f-lang').value = page.lang;
        $('f-pub').checked = page.is_published; $('f-headline').value = page.headline; $('f-sub').value = page.subheadline || '';
        $('f-desc').value = page.description || ''; $('f-cta').value = page.cta_text || 'Commander maintenant';
        $('f-ends').value = toLocal(page.offer_ends_at);
        heroUrl = page.hero_image_url || '';
        if (q.get('saved')) A.toast('تم إنشاء الصفحة.');
      }
      renderProducts(); renderHero();
    });
  }).catch(function (e) { A.toast(A.errText(e), true); });
}
};
