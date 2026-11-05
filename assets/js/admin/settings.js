/* Vilar admin - settings.js : identité, couleurs, hero, annonce, contact, politiques, SEO */
(function () {
  var TPL = [
    '<div class="page-title"><h1>الإعدادات العامة</h1><button class="btn" type="button" id="s-save-top">حفظ كل الإعدادات</button></div>',
    '<form id="sform" novalidate>',

    '<div class="card stack"><h2>هوية المتجر</h2>',
    '<div class="row2"><div><label class="lbl" for="s-name">اسم المتجر</label><input class="field" id="s-name" maxlength="60"></div>',
    '<div><label class="lbl">الشعار (اختياري)</label><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">',
    '<img id="logo-prev" alt="" hidden style="height:44px;max-width:140px;object-fit:contain;background:var(--bone);padding:4px;border-radius:2px">',
    '<input type="file" id="logo-file" accept="image/jpeg,image/png,image/webp" hidden>',
    '<button class="btn ghost sm" type="button" id="logo-pick">اختيار صورة</button>',
    '<button class="btn ghost sm" type="button" id="logo-clear" hidden>إزالة</button><span class="muted" id="logo-msg" role="status"></span></div>',
    '<span class="muted" style="font-size:.85rem">إن لم تضع شعاراً يظهر اسم المتجر نصاً.</span></div></div></div>',

    '<div class="card"><h2>الألوان</h2><div class="row3" style="grid-template-columns:repeat(4,1fr)">',
    '<div><label class="lbl" for="c-bg">الخلفية</label><input class="field" type="color" id="c-bg" style="padding:2px"></div>',
    '<div><label class="lbl" for="c-text">النص والأزرار</label><input class="field" type="color" id="c-text" style="padding:2px"></div>',
    '<div><label class="lbl" for="c-accent">اللون الوردي</label><input class="field" type="color" id="c-accent" style="padding:2px"></div>',
    '<div><label class="lbl" for="c-beige">البيج</label><input class="field" type="color" id="c-beige" style="padding:2px"></div></div>',
    '<p class="muted" style="margin:10px 0">اختر ألواناً متباينة ليبقى النص مقروءاً. تُطبَّق على المتجر وصفحات الهبوط.</p>',
    '<button class="btn ghost sm" type="button" id="c-reset">استرجاع الألوان الافتراضية</button></div>',

    '<div class="card stack"><h2>الصفحة الرئيسية (الهيرو)</h2>',
    '<div><label class="lbl">الصورة الرئيسية</label><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">',
    '<img id="hero-prev" alt="" hidden style="width:70px;aspect-ratio:4/5;object-fit:cover;border-radius:2px">',
    '<input type="file" id="hero-file" accept="image/jpeg,image/png,image/webp" hidden>',
    '<button class="btn ghost sm" type="button" id="hero-pick">اختيار صورة</button>',
    '<button class="btn ghost sm" type="button" id="hero-clear" hidden>إزالة</button><span class="muted" id="hero-msg" role="status"></span></div></div>',
    '<div class="row2"><div><label class="lbl" for="h-t-ar">العنوان بالعربية</label><input class="field" id="h-t-ar" maxlength="90"></div>',
    '<div><label class="lbl" for="h-t-fr">Titre en français</label><input class="field" id="h-t-fr" maxlength="90" dir="ltr"></div></div>',
    '<div class="row2"><div><label class="lbl" for="h-s-ar">النص الفرعي بالعربية</label><input class="field" id="h-s-ar" maxlength="200"></div>',
    '<div><label class="lbl" for="h-s-fr">Sous-titre en français</label><input class="field" id="h-s-fr" maxlength="200" dir="ltr"></div></div>',
    '<p class="muted" style="margin:0">اترك الحقول فارغة لاستعمال النصوص الافتراضية.</p></div>',

    '<div class="card stack"><h2>شريط الإعلانات (أعلى الموقع)</h2>',
    '<label class="check"><input type="checkbox" id="a-on"> إظهار الشريط</label>',
    '<div class="row2"><div><label class="lbl" for="a-ar">النص بالعربية</label><input class="field" id="a-ar" maxlength="160"></div>',
    '<div><label class="lbl" for="a-fr">Texte en français</label><input class="field" id="a-fr" maxlength="160" dir="ltr"></div></div></div>',

    '<div class="card stack"><h2>التواصل والشبكات الاجتماعية</h2>',
    '<div class="row3"><div><label class="lbl" for="k-phone">الهاتف</label><input class="field" id="k-phone" dir="ltr" maxlength="25"></div>',
    '<div><label class="lbl" for="k-wa">واتساب (مع رمز الدولة)</label><input class="field" id="k-wa" dir="ltr" maxlength="25" placeholder="+213555123456"></div>',
    '<div><label class="lbl" for="k-email">البريد الإلكتروني</label><input class="field" id="k-email" type="email" dir="ltr" maxlength="120"></div></div>',
    '<div class="row3"><div><label class="lbl" for="k-ig">رابط إنستغرام</label><input class="field" id="k-ig" dir="ltr" maxlength="200" placeholder="https://instagram.com/..."></div>',
    '<div><label class="lbl" for="k-fb">رابط فيسبوك</label><input class="field" id="k-fb" dir="ltr" maxlength="200" placeholder="https://facebook.com/..."></div>',
    '<div><label class="lbl" for="k-tt">رابط تيك توك</label><input class="field" id="k-tt" dir="ltr" maxlength="200" placeholder="https://tiktok.com/@..."></div></div></div>',

    '<div class="card stack"><h2>السياسات (تظهر في أسفل الموقع)</h2>',
    '<p class="muted" style="margin:0">اكتب نصوصك أنت. لا يظهر رابط السياسة في الموقع إلا إذا كتبت لها نصاً.</p>',
    '<div class="row2"><div><label class="lbl" for="p-delivery_ar">سياسة التوصيل (عربي)</label><textarea class="field" id="p-delivery_ar" rows="5" maxlength="4000"></textarea></div>',
    '<div><label class="lbl" for="p-delivery_fr">Politique de livraison (FR)</label><textarea class="field" id="p-delivery_fr" rows="5" maxlength="4000" dir="ltr"></textarea></div></div>',
    '<div class="row2"><div><label class="lbl" for="p-returns_ar">الاستبدال والإرجاع (عربي)</label><textarea class="field" id="p-returns_ar" rows="5" maxlength="4000"></textarea></div>',
    '<div><label class="lbl" for="p-returns_fr">Échange et retour (FR)</label><textarea class="field" id="p-returns_fr" rows="5" maxlength="4000" dir="ltr"></textarea></div></div>',
    '<div class="row2"><div><label class="lbl" for="p-privacy_ar">سياسة الخصوصية (عربي)</label><textarea class="field" id="p-privacy_ar" rows="5" maxlength="4000"></textarea></div>',
    '<div><label class="lbl" for="p-privacy_fr">Politique de confidentialité (FR)</label><textarea class="field" id="p-privacy_fr" rows="5" maxlength="4000" dir="ltr"></textarea></div></div></div>',

    '<div class="card stack"><h2>محركات البحث (SEO)</h2>',
    '<div class="row2"><div><label class="lbl" for="o-t-ar">عنوان الموقع (عربي)</label><input class="field" id="o-t-ar" maxlength="70"></div>',
    '<div><label class="lbl" for="o-t-fr">Titre du site (FR)</label><input class="field" id="o-t-fr" maxlength="70" dir="ltr"></div></div>',
    '<div class="row2"><div><label class="lbl" for="o-d-ar">الوصف (عربي، حتى 155 حرفاً)</label><textarea class="field" id="o-d-ar" rows="2" maxlength="160"></textarea></div>',
    '<div><label class="lbl" for="o-d-fr">Description (FR, 155 caractères max)</label><textarea class="field" id="o-d-fr" rows="2" maxlength="160" dir="ltr"></textarea></div></div></div>',

    '<div class="msg" id="s-msg" role="alert"></div>',
    '<button class="btn" type="submit" id="s-save">حفظ كل الإعدادات</button>',
    '</form>'
  ].join('');

  Admin.views['settings'] = {
    tpl: TPL,
    run: function () {
      var A = Admin, $ = function (id) { return document.getElementById(id); };
      var MARK = '/storage/v1/object/public/site/';
      var DEF = { bg: '#FAF7F2', text: '#1B1917', accent: '#E9CFCB', beige: '#D9C7B0' };
      var cur = {}, logoUrl = '', heroUrl = '', removed = [];
      var POL = ['delivery_ar', 'delivery_fr', 'returns_ar', 'returns_fr', 'privacy_ar', 'privacy_fr'];

      function storagePath(u) {
        var i = String(u || '').indexOf(MARK);
        return i === -1 ? null : decodeURIComponent(String(u).slice(i + MARK.length));
      }
      function upload(file, folder, max) {
        if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 20 * 1024 * 1024) return Promise.reject(new Error('ملف غير صالح.'));
        return A.resizeImage(file, max).then(function (blob) {
          var path = folder + '/' + A.uuid() + (blob.type === 'image/webp' ? '.webp' : '.jpg');
          return sb.storage.from('site').upload(path, blob, { contentType: blob.type, cacheControl: '31536000' }).then(function (u) {
            if (u.error) throw u.error;
            return sb.storage.from('site').getPublicUrl(path).data.publicUrl;
          });
        });
      }
      function showImgs() {
        $('logo-prev').hidden = !logoUrl; if (logoUrl) $('logo-prev').src = logoUrl; $('logo-clear').hidden = !logoUrl;
        $('hero-prev').hidden = !heroUrl; if (heroUrl) $('hero-prev').src = heroUrl; $('hero-clear').hidden = !heroUrl;
      }
      function wireUpload(pickId, fileId, msgId, folder, max, getSet) {
        $(pickId).addEventListener('click', function () { $(fileId).click(); });
        $(fileId).addEventListener('change', function () {
          var f = this.files[0], input = this; if (!f) return;
          $(msgId).textContent = 'جاري الرفع…';
          upload(f, folder, max).then(function (url) {
            var old = getSet(); if (old) removed.push(old);
            getSet(url); showImgs();
          }).catch(function (e) { A.toast(A.errText(e), true); })
            .then(function () { $(msgId).textContent = ''; input.value = ''; });
        });
      }
      wireUpload('logo-pick', 'logo-file', 'logo-msg', 'branding', 600, function (v) { if (v === undefined) return logoUrl; logoUrl = v; });
      wireUpload('hero-pick', 'hero-file', 'hero-msg', 'hero', 1600, function (v) { if (v === undefined) return heroUrl; heroUrl = v; });
      $('logo-clear').addEventListener('click', function () { if (logoUrl) removed.push(logoUrl); logoUrl = ''; showImgs(); });
      $('hero-clear').addEventListener('click', function () { if (heroUrl) removed.push(heroUrl); heroUrl = ''; showImgs(); });
      $('c-reset').addEventListener('click', function () {
        $('c-bg').value = DEF.bg; $('c-text').value = DEF.text; $('c-accent').value = DEF.accent; $('c-beige').value = DEF.beige;
      });

      function fill() {
        var st = cur.store || {}, th = cur.theme || {}, hr = cur.hero || {}, an = cur.announcement || {},
            ct = cur.contact || {}, po = cur.policies || {}, se = cur.seo || {};
        $('s-name').value = st.name || ''; logoUrl = st.logo_url || '';
        $('c-bg').value = th.bg || DEF.bg; $('c-text').value = th.text || DEF.text;
        $('c-accent').value = th.accent || DEF.accent; $('c-beige').value = th.beige || DEF.beige;
        heroUrl = hr.image_url || '';
        $('h-t-ar').value = hr.title_ar || ''; $('h-t-fr').value = hr.title_fr || '';
        $('h-s-ar').value = hr.subtitle_ar || ''; $('h-s-fr').value = hr.subtitle_fr || '';
        $('a-on').checked = !!an.enabled; $('a-ar').value = an.ar || ''; $('a-fr').value = an.fr || '';
        $('k-phone').value = ct.phone || ''; $('k-wa').value = ct.whatsapp || ''; $('k-email').value = ct.email || '';
        $('k-ig').value = ct.instagram || ''; $('k-fb').value = ct.facebook || ''; $('k-tt').value = ct.tiktok || '';
        POL.forEach(function (k) { $('p-' + k).value = po[k] || ''; });
        $('o-t-ar').value = se.title_ar || ''; $('o-t-fr').value = se.title_fr || '';
        $('o-d-ar').value = se.description_ar || ''; $('o-d-fr').value = se.description_fr || '';
        showImgs();
      }

      function collect() {
        var name = $('s-name').value.trim();
        if (!name) return { err: 'اسم المتجر مطلوب.' };
        var hex = /^#[0-9a-f]{6}$/i;
        var theme = { bg: $('c-bg').value, text: $('c-text').value, accent: $('c-accent').value, beige: $('c-beige').value };
        for (var k in theme) if (!hex.test(theme[k])) return { err: 'لون غير صالح.' };
        var email = $('k-email').value.trim();
        if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { err: 'البريد الإلكتروني غير صالح.' };
        var phone = $('k-phone').value.trim(), wa = $('k-wa').value.trim();
        if ((phone && !/^[0-9+\s().-]{6,25}$/.test(phone)) || (wa && !/^[0-9+\s().-]{6,25}$/.test(wa))) return { err: 'رقم الهاتف أو الواتساب غير صالح.' };
        var socials = { instagram: $('k-ig').value.trim(), facebook: $('k-fb').value.trim(), tiktok: $('k-tt').value.trim() };
        for (var s in socials) if (socials[s] && !/^https:\/\//i.test(socials[s])) return { err: 'روابط الشبكات الاجتماعية يجب أن تبدأ بـ https://' };
        var pol = {}; POL.forEach(function (key) { pol[key] = $('p-' + key).value.trim(); });
        function merge(key, patch) { return { key: key, value: Object.assign({}, cur[key] || {}, patch) }; }
        return {
          rows: [
            merge('store', { name: name, logo_url: logoUrl }),
            merge('theme', theme),
            merge('hero', { image_url: heroUrl, title_ar: $('h-t-ar').value.trim(), title_fr: $('h-t-fr').value.trim(),
                            subtitle_ar: $('h-s-ar').value.trim(), subtitle_fr: $('h-s-fr').value.trim() }),
            merge('announcement', { enabled: $('a-on').checked, ar: $('a-ar').value.trim(), fr: $('a-fr').value.trim() }),
            merge('contact', { phone: phone, whatsapp: wa, email: email, instagram: socials.instagram, facebook: socials.facebook, tiktok: socials.tiktok }),
            merge('policies', pol),
            merge('seo', { title_ar: $('o-t-ar').value.trim(), title_fr: $('o-t-fr').value.trim(),
                           description_ar: $('o-d-ar').value.trim(), description_fr: $('o-d-fr').value.trim() })
          ]
        };
      }

      function save() {
        var msg = $('s-msg'), btn = $('s-save'); msg.className = 'msg'; msg.textContent = '';
        var c = collect();
        if (c.err) { msg.className = 'msg err'; msg.textContent = c.err; return; }
        btn.disabled = true;
        sb.from('site_settings').upsert(c.rows).then(function (r) {
          if (r.error) throw r.error;
          c.rows.forEach(function (row) { cur[row.key] = row.value; });
          var used = [logoUrl, heroUrl];
          var paths = removed.filter(function (u) { return used.indexOf(u) === -1; }).map(storagePath).filter(Boolean);
          removed = [];
          if (paths.length) return sb.storage.from('site').remove(paths);
        }).then(function () { A.toast('تم حفظ الإعدادات.'); })
          .catch(function (e) { msg.className = 'msg err'; msg.textContent = A.errText(e); })
          .then(function () { btn.disabled = false; });
      }
      $('sform').addEventListener('submit', function (e) { e.preventDefault(); save(); });
      $('s-save-top').addEventListener('click', save);

      sb.from('site_settings').select('key,value').then(function (r) {
        if (r.error) { A.toast(A.errText(r.error), true); return; }
        (r.data || []).forEach(function (row) { cur[row.key] = row.value; });
        fill();
      });
    }
  };
})();
