/* Vilar - landing.js : page d'atterrissage publicitaire (lp.html?s=slug)
   Tout vient de la base : landing_pages + landing_page_products + products. */
(function () {
  var esc = UI.esc, safeUrl = UI.safeUrl;
  var root = document.getElementById('lp-root');
  var slug = new URLSearchParams(location.search).get('s') || '';
  var T = I18N.t, lp = null, items = [], zones = [], settings = {};
  var sel = { pi: 0, color: null, size: null, qty: 1 };
  var busy = false, icFired = false, timerId = null;
  var nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
  var $ = function (id) { return document.getElementById(id); };

  function money(n) { return nf.format(Math.round(Number(n) || 0)).replace(/[\u202f\u00a0\s]/g, '\u00a0') + '\u00a0' + T('currency'); }
  function toast(m) {
    var el = $('toast'); if (!el) return;
    el.textContent = m; el.classList.add('show');
    setTimeout(function () { el.classList.remove('show'); }, 2600);
  }
  function notFound() {
    root.innerHTML = '<div class="wrap empty" style="padding-block:80px"><p>' + esc(T('lp_notfound')) + '</p><a class="btn" href="index.html">Vilar</a></div>';
  }

  /* ---------- Offre / prix ---------- */
  function offerOn() { return !lp.offer_ends_at || new Date(lp.offer_ends_at).getTime() > Date.now(); }
  function cur() { return items[sel.pi]; }
  function priceInfo(it) {
    var p = it.p, base = Number(p.price), now = p.sale_price != null ? Number(p.sale_price) : base;
    if (it.offer_price != null && offerOn()) now = Number(it.offer_price);
    return { now: now, was: now < base ? base : null };
  }
  function pct(pi) { return pi.was ? Math.round((1 - pi.now / pi.was) * 100) : 0; }

  /* ---------- Variantes ---------- */
  function colors() {
    var m = new Map();
    cur().p.variants.forEach(function (v) { if (!m.has(v.color_name)) m.set(v.color_name, v.color_hex); });
    return Array.from(m.entries());
  }
  function sizes() {
    var m = new Map();
    cur().p.variants.forEach(function (v) {
      if (sel.color && v.color_name !== sel.color) return;
      m.set(v.size, (m.get(v.size) || 0) + v.stock);
    });
    return Array.from(m.entries()).sort(function (a, b) { return parseFloat(a[0]) - parseFloat(b[0]) || String(a[0]).localeCompare(b[0]); });
  }
  function variant() {
    if (!sel.color || !sel.size) return null;
    return cur().p.variants.find(function (v) { return v.color_name === sel.color && v.size === sel.size; }) || null;
  }
  function resetSel() {
    sel.color = null; sel.size = null; sel.qty = 1;
    var cs = colors(); if (cs.length === 1) sel.color = cs[0][0];
  }

  /* ---------- Rendu des blocs dynamiques ---------- */
  function renderPrice() {
    var pi = priceInfo(cur()), pc = pct(pi);
    $('price-box').innerHTML = '<span class="now">' + money(pi.now) + '</span>' +
      (pi.was ? '<span class="was">' + money(pi.was) + '</span><span class="pct"><bdi dir="ltr">-' + pc + '%</bdi></span>' : '');
    var box = $('price-box'); box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
    var stk = $('stk-price'); if (stk) stk.textContent = money(pi.now);
  }

  // Ligne de commande présentée comme dans le panier : image | infos + options + quantité | total de la ligne
  function renderOptions(focusSel) {
    var it = cur(), p = it.p, pi = priceInfo(it), cs = colors(), ss = sizes(), v = variant(), h = '';
    var img = p.images[0], name = p['name_' + lp.lang] || p.name_fr;
    h += img ? '<img src="' + esc(img) + '" alt="" width="96" height="120">' : '<div class="ph"></div>';
    h += '<div class="lp-info"><h3>' + esc(name) + '</h3><div class="price"><span class="now">' + money(pi.now) + '</span>' +
         (pi.was ? '<span class="was">' + money(pi.was) + '</span>' : '') + '</div>';
    if (cs.length) {
      h += '<div><div class="lbl-row"><b>' + esc(T('p_color')) + '</b> <span class="muted">' + esc(sel.color || '') + '</span></div><div class="chips" style="margin-top:8px">' +
        cs.map(function (c) {
          var hex = /^#[0-9a-f]{6}$/i.test(c[1] || '') ? c[1] : '#cccccc';
          return '<button type="button" class="swatch" data-color="' + esc(c[0]) + '" style="background:' + hex + '" title="' + esc(c[0]) +
            '" aria-label="' + esc(c[0]) + '" aria-pressed="' + (sel.color === c[0]) + '"></button>';
        }).join('') + '</div></div>';
    }
    if (ss.length) {
      h += '<div><div class="lbl-row"><b>' + esc(T('p_size')) + '</b> <span class="muted">' + esc(sel.size || '') + '</span></div><div class="chips" style="margin-top:8px">' +
        ss.map(function (s) {
          return '<button type="button" class="chip" data-size="' + esc(s[0]) + '"' + (s[1] <= 0 ? ' disabled' : '') +
            ' aria-pressed="' + (sel.size === s[0]) + '">' + esc(s[0]) + '</button>';
        }).join('') + '</div></div>';
    }
    var txt, cls = 'stock';
    if (v) {
      if (v.stock <= 0) { txt = T('p_out'); cls += ' low'; }
      else if (v.stock <= 5) { txt = T('p_low', { n: v.stock }); cls += ' low'; }
      else { txt = T('p_in'); cls += ' ok'; }
    } else if (!p.available) { txt = T('lp_soldout'); cls += ' low'; }
    else { txt = T('p_in'); cls += ' ok'; }
    h += '<div class="' + cls + '" role="status" style="margin:0">' + esc(txt) + '</div>';
    h += '<div class="qty" style="justify-self:start">' +
      '<button type="button" data-q="-1" aria-label="' + esc(T('c_less')) + '">−</button><output>' + sel.qty + '</output>' +
      '<button type="button" data-q="1" aria-label="' + esc(T('c_more')) + '">+</button></div></div>';
    h += '<div class="tot">' + money(pi.now * sel.qty) + '</div>';
    $('line-box').innerHTML = h;
    if (focusSel) { var el = $('line-box').querySelector(focusSel); if (el) el.focus(); }
    var out = !p.available || (v && v.stock <= 0);
    $('submit').disabled = busy || !!out;
  }

  function zone() {
    var code = parseInt($('lp-form').wilaya.value, 10);
    return zones.find(function (z) { return z.wilaya_code === code; }) || null;
  }
  function dtype() { return $('lp-form').dtype.value === 'desk' ? 'desk' : 'home'; }
  function feeTxt(f) { return f === null ? '—' : (f === 0 ? T('k_free') : money(f)); }
  function renderSummary() {
    var it = cur(), pi = priceInfo(it), z = zone();
    var sub = pi.now * sel.qty, fh = z ? Number(z.home_fee) : null, fd = z ? Number(z.desk_fee) : null;
    var fee = dtype() === 'desk' ? fd : fh;
    if ($('fee-home')) $('fee-home').textContent = feeTxt(fh);
    if ($('fee-desk')) $('fee-desk').textContent = feeTxt(fd);
    $('sum-box').innerHTML =
      '<div class="row"><span>' + esc(T('c_sub')) + '</span><b>' + money(sub) + '</b></div>' +
      '<div class="row"><span>' + esc(T('k_delivery')) + '</span><b>' + esc(feeTxt(fee)) + '</b></div>' +
      '<div class="row total"><span>' + esc(T('c_total')) + '</span><span>' + money(sub + (fee || 0)) + '</span></div>' +
      '<div class="muted" style="font-size:.9rem;margin-top:8px">' + esc(T('k_cod')) + '</div>';
  }
  function refreshAll(focusSel) { renderPrice(); renderOptions(focusSel); renderSummary(); }

  /* ---------- Compte à rebours ---------- */
  function startTimer() {
    if (!lp.offer_ends_at) return;
    var box = $('timer');
    function tick() {
      var diff = new Date(lp.offer_ends_at).getTime() - Date.now();
      if (diff <= 0) {
        clearInterval(timerId);
        box.innerHTML = '<b>' + esc(T('lp_expired')) + '</b>'; refreshAll(); return;
      }
      var d = Math.floor(diff / 864e5), h = Math.floor(diff % 864e5 / 36e5), m = Math.floor(diff % 36e5 / 6e4), s = Math.floor(diff % 6e4 / 1e3);
      function b(n, k) { return '<div class="box"><b>' + String(n).padStart(2, '0') + '</b><span>' + esc(T(k)) + '</span></div>'; }
      box.innerHTML = '<span>' + esc(T('lp_ends')) + '</span>' + (d > 0 ? b(d, 'lp_d') : '') + b(h, 'lp_h') + b(m, 'lp_m') + b(s, 'lp_s');
    }
    if (new Date(lp.offer_ends_at).getTime() <= Date.now()) return;
    box.hidden = false; tick(); timerId = setInterval(tick, 1000);
  }

  /* ---------- Page ---------- */
  function build() {
    var heroImg = safeUrl(lp.hero_image_url) || (items[0].p.images[0] || '');
    var feats = Array.isArray(lp.features) ? lp.features.slice(0, 8) : [];
    var quotes = Array.isArray(lp.testimonials) ? lp.testimonials.slice(0, 6) : [];
    var gallery = (Array.isArray(lp.gallery) ? lp.gallery : []).map(safeUrl).filter(Boolean);
    if (!gallery.length) items.forEach(function (it) { gallery = gallery.concat(it.p.images); });
    gallery = gallery.slice(0, 8);
    var cta = lp.cta_text || 'Commander maintenant';

    var models = items.length > 1
      ? '<fieldset style="border:0;padding:0;margin:0"><legend style="font-weight:700;margin-bottom:8px">' + esc(T('lp_pick')) + '</legend><div class="lp-models">' +
        items.map(function (it, i) {
          var pi = priceInfo(it), img = it.p.images[0];
          return '<label class="lp-model"><input type="radio" name="model" value="' + i + '"' + (i === 0 ? ' checked' : '') + '>' +
            (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" width="64" height="80">' : '<div class="ph"></div>') +
            '<span><b>' + esc(it.p['name_' + lp.lang] || it.p.name_fr) + '</b><br><span class="muted">' + money(pi.now) + '</span></span></label>';
        }).join('') + '</div></fieldset>' : '';

    root.innerHTML =
      '<section class="lp-hero"><div class="in"><div>' +
      '<h1>' + esc(lp.headline) + '</h1>' + (lp.subheadline ? '<p class="sub">' + esc(lp.subheadline) + '</p>' : '') +
      '<div class="lp-price" id="price-box"></div><div class="lp-timer" id="timer" hidden></div>' +
      '<a class="btn lp-cta" href="#order">' + esc(cta) + '</a>' +
      '<div class="lp-trust"><span>' + esc(T('f2')) + '</span><span>' + esc(T('f1')) + '</span><span>' + esc(T('f3')) + '</span></div></div>' +
      '<div class="lp-media">' + (heroImg ? '<img src="' + esc(heroImg) + '" alt="' + esc(lp.title) + '" width="800" height="1000" fetchpriority="high">' : '') + '</div></div></section>' +

      (feats.length ? '<section class="lp-sec"><div class="wrap"><div class="lp-feats">' + feats.map(function (f) {
        return '<div class="lp-feat"><h3>' + esc(f.title) + '</h3><p>' + esc(f.text) + '</p></div>';
      }).join('') + '</div></div></section>' : '') +

      ((lp.description || gallery.length) ? '<section class="lp-sec" style="background:var(--bone)"><div class="wrap"><h2>' + esc(T('lp_gallery')) + '</h2>' +
        (lp.description ? '<p class="lp-desc">' + esc(lp.description) + '</p>' : '') +
        '<div class="lp-gallery">' + gallery.map(function (u) {
          return '<img src="' + esc(u) + '" alt="" loading="lazy" decoding="async" width="600" height="750">';
        }).join('') + '</div></div></section>' : '') +

      (quotes.length ? '<section class="lp-sec"><div class="wrap"><h2>' + esc(T('sec_reviews')) + '</h2><div class="lp-quotes">' + quotes.map(function (q) {
        var n = Math.max(1, Math.min(5, parseInt(q.rating, 10) || 5));
        return '<figure class="review" style="margin:0"><div class="stars" role="img" aria-label="' + n + '/5">' + '★★★★★'.slice(0, n) +
          '<span style="color:var(--sand)">' + '★★★★★'.slice(n) + '</span></div><p>' + esc(q.text) + '</p><figcaption><b>' + esc(q.name) + '</b></figcaption></figure>';
      }).join('') + '</div></div></section>' : '') +

      '<section class="lp-sec lp-order" id="order"><div class="wrap"><div class="lp-card"><h2>' + esc(T('lp_order_title')) + '</h2>' +
      '<form id="lp-form" novalidate>' +
      '<div class="lp-step"><span class="n">1</span><h3>' + esc(T('lp_s1')) + '</h3></div>' + models +
      '<div class="line lp-line" id="line-box"></div><div class="ferr" id="line-err" role="alert"></div>' +
      '<div class="lp-step"><span class="n">2</span><h3>' + esc(T('lp_s2')) + '</h3></div>' +
      '<div class="f"><label for="lp-fullname">' + esc(T('k_name')) + '</label><input class="field" id="lp-fullname" name="fullname" autocomplete="name" maxlength="100"><div class="ferr" data-for="fullname" role="alert"></div></div>' +
      '<div class="f"><label for="lp-phone">' + esc(T('k_phone')) + '</label><input class="field" id="lp-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" dir="ltr" placeholder="05XX XX XX XX"><div class="ferr" data-for="phone" role="alert"></div></div>' +
      '<div class="lp-2"><div class="f"><label for="lp-wilaya">' + esc(T('k_wilaya')) + '</label><select class="field" id="lp-wilaya" name="wilaya"></select><div class="ferr" data-for="wilaya" role="alert"></div></div>' +
      '<div class="f"><label for="lp-commune">' + esc(T('k_commune')) + '</label><input class="field" id="lp-commune" name="commune" autocomplete="address-level2" maxlength="100"><div class="ferr" data-for="commune" role="alert"></div></div></div>' +
      '<div class="f"><label for="lp-address">' + esc(T('k_address')) + '</label><textarea class="field" id="lp-address" name="address" rows="2" autocomplete="street-address" maxlength="300"></textarea><div class="ferr" data-for="address" role="alert"></div></div>' +
      '<fieldset class="f dtype"><legend>' + esc(T('k_dtype')) + '</legend><div class="lp-dopts">' +
      '<label class="lp-dopt"><input type="radio" name="dtype" value="home" checked><span class="t">' + esc(T('k_home')) + '</span><span class="p" id="fee-home">—</span></label>' +
      '<label class="lp-dopt"><input type="radio" name="dtype" value="desk"><span class="t">' + esc(T('k_desk')) + '</span><span class="p" id="fee-desk">—</span></label></div></fieldset>' +
      '<details class="lp-notes"><summary>' + esc(T('k_notes')) + '</summary><textarea class="field" id="lp-notes" name="notes" rows="2" maxlength="500"></textarea></details>' +
      '<div class="lp-step"><span class="n">3</span><h3>' + esc(T('lp_s3')) + '</h3></div>' +
      '<div class="lp-sum" id="sum-box"></div>' +
      '<div class="msg err" id="form-msg" role="alert"></div>' +
      '<button class="btn btn-block lp-cta" id="submit" type="submit">' + esc(cta) + '</button></form></div></div></section>' +
      '<div class="lp-foot">© ' + new Date().getFullYear() + ' Vilar</div>' +
      '<div class="lp-sticky"><span class="p" id="stk-price"></span><a class="btn" href="#order">' + esc(cta) + '</a></div>';

    var form = $('lp-form');
    form.wilaya.innerHTML = '<option value="">' + esc(T('k_wilaya_ph')) + '</option>' + zones.map(function (z) {
      return '<option value="' + z.wilaya_code + '">' + String(z.wilaya_code).padStart(2, '0') + ' - ' + esc(z.name_fr) + '</option>';
    }).join('');
    resetSel(); refreshAll(); startTimer();
    bind(form);
  }

  /* ---------- Interactions ---------- */
  function bind(form) {
    form.addEventListener('focusin', function () {
      if (icFired) return; icFired = true;
      Tracking.track('InitiateCheckout', { content_name: lp.title, currency: 'DZD', value: priceInfo(cur()).now * sel.qty });
    });
    form.addEventListener('change', function (e) {
      if (e.target.name === 'model') { sel.pi = parseInt(e.target.value, 10) || 0; resetSel(); refreshAll(); }
      else if (e.target.name === 'wilaya' || e.target.name === 'dtype') renderSummary();
    });
    $('line-box').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $('line-err').textContent = '';
      if (b.dataset.color !== undefined) {
        sel.color = b.dataset.color;
        var ok = sizes().some(function (s) { return s[0] === sel.size && s[1] > 0; });
        if (!ok) sel.size = null;
        refreshAll('[data-color="' + CSS.escape(sel.color) + '"]');
      } else if (b.dataset.size !== undefined) {
        sel.size = b.dataset.size; refreshAll('[data-size="' + CSS.escape(sel.size) + '"]');
      } else if (b.dataset.q) {
        var v = variant(), max = Math.min(10, v ? Math.max(v.stock, 1) : 10);
        sel.qty = Math.max(1, Math.min(max, sel.qty + parseInt(b.dataset.q, 10)));
        refreshAll();
      }
    });
    form.addEventListener('submit', submit);
  }

  function normalizePhone(p) {
    var s = String(p || '').replace(/[\s.\-()]/g, '');
    if (s.indexOf('+213') === 0) s = '0' + s.slice(4);
    else if (s.indexOf('00213') === 0) s = '0' + s.slice(5);
    else if (s.indexOf('213') === 0) s = '0' + s.slice(3);
    return s;
  }
  function uuid() {
    return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  }
  function idemKey() {
    try {
      var k = sessionStorage.getItem('vilar_idem_lp');
      if (!k) { k = uuid(); sessionStorage.setItem('vilar_idem_lp', k); }
      return k;
    } catch (e) { return uuid(); }
  }
  function setErr(name, key) {
    var el = document.querySelector('#lp-form .ferr[data-for="' + name + '"]');
    if (el) el.textContent = key ? T(key) : '';
  }
  function errorKey(err) {
    var m = String((err && (err.message || err.details)) || '');
    if (/INVALID_NAME/.test(m)) return 'e_name';
    if (/INVALID_PHONE/.test(m)) return 'e_phone';
    if (/INVALID_WILAYA/.test(m)) return 'e_wilaya';
    if (/INVALID_COMMUNE/.test(m)) return 'e_commune';
    if (/INVALID_ADDRESS/.test(m)) return 'e_address';
    if (/OUT_OF_STOCK|VARIANT_NOT_FOUND|INVALID_QTY|INVALID_ITEMS/.test(m)) return 'e_stock';
    if (/TOO_MANY_ORDERS/.test(m)) return 'e_many';
    return 'e_generic';
  }
  function setBusy(b) {
    busy = b; var btn = $('submit');
    btn.disabled = b; btn.textContent = b ? T('k_sending') : (lp.cta_text || 'Commander maintenant');
  }

  function submit(e) {
    e.preventDefault();
    if (busy) return;
    var form = $('lp-form'), msg = $('form-msg'), first = null, ok = true;
    msg.textContent = ''; $('line-err').textContent = '';
    var lineBad = false, le = $('line-err');
    ['fullname', 'phone', 'wilaya', 'commune', 'address'].forEach(function (f) { setErr(f, ''); });
    function bad(f, k) { setErr(f, k); if (!first) first = form[f]; ok = false; }

    var cs = colors();
    if (cs.length > 1 && !sel.color) { le.textContent = T('p_pick_color'); ok = false; lineBad = true; }
    else if (!sel.size) { le.textContent = T('p_pick_size'); ok = false; lineBad = true; }
    var v = variant();
    if (ok && (!v || v.stock <= 0)) { le.textContent = T('p_out'); ok = false; lineBad = true; }

    if (form.fullname.value.trim().length < 2) bad('fullname', 'e_name');
    if (!/^0[567][0-9]{8}$/.test(normalizePhone(form.phone.value))) bad('phone', 'e_phone');
    if (!zone()) bad('wilaya', 'e_wilaya');
    if (form.commune.value.trim().length < 2) bad('commune', 'e_commune');
    if (form.address.value.trim().length < 5) bad('address', 'e_address');
    if (lineBad) $('line-box').scrollIntoView({ behavior: 'smooth', block: 'center' });
    else if (first) first.focus();
    if (!ok) return;

    setBusy(true);
    var utm = null; try { utm = JSON.parse(sessionStorage.getItem('vilar_utm') || 'null'); } catch (x) {}
    var payload = {
      idempotency_key: idemKey(),
      name: form.fullname.value.trim(), phone: normalizePhone(form.phone.value),
      wilaya_code: zone().wilaya_code, commune: form.commune.value.trim(), address: form.address.value.trim(),
      notes: form.notes.value.trim(), delivery_type: dtype(),
      source: 'landing', landing_slug: lp.slug, utm: utm,
      items: [{ variant_id: v.id, qty: Math.min(sel.qty, v.stock) }]
    };
    sb.rpc('create_order', { p: payload }).then(function (r) {
      if (r.error) throw r.error;
      var d = r.data || {};
      try { sessionStorage.removeItem('vilar_idem_lp'); localStorage.setItem('vilar_lang', lp.lang); } catch (x) {}
      location.href = 'index.html#/thanks?o=' + encodeURIComponent(d.order_number) + '&t=' + encodeURIComponent(d.total) +
        (d.duplicate ? '&d=1' : '') + '&lp=' + encodeURIComponent(lp.slug);
    }).catch(function (err) {
      setBusy(false);
      var k = errorKey(err);
      msg.textContent = T(k);
      if (/^e_(name|phone|wilaya|commune|address)$/.test(k)) setErr(k === 'e_name' ? 'fullname' : k.slice(2), k);
      if (k === 'e_stock') toast(T('e_stock'));
    });
  }

  /* ---------- Démarrage ---------- */
  function sessionId() {
    try {
      var s = sessionStorage.getItem('vilar_sid');
      if (!s) { s = uuid(); sessionStorage.setItem('vilar_sid', s); }
      return s;
    } catch (e) { return uuid(); }
  }
  function norm(p) {
    p.images = (p.product_images || []).slice().sort(function (a, b) { return a.sort_order - b.sort_order; })
      .map(function (i) { return safeUrl(i.url); }).filter(Boolean);
    p.variants = (p.product_variants || []).filter(function (v) { return v.is_active; });
    p.available = p.variants.some(function (v) { return v.stock > 0; });
    return p;
  }

  if (!window.VILAR_CONFIGURED || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) { notFound(); return; }
  UI.captureUtm();

  sb.from('landing_pages').select('*').eq('slug', slug).eq('is_published', true).maybeSingle().then(function (r) {
    if (r.error || !r.data) { notFound(); return; }
    lp = r.data;
    T = I18N.tFor(lp.lang === 'fr' ? 'fr' : 'ar');
    document.documentElement.lang = lp.lang; document.documentElement.dir = lp.lang === 'ar' ? 'rtl' : 'ltr';
    document.title = lp.title + ' | Vilar';
    var md = document.querySelector('meta[name=description]'); if (md) md.content = (lp.subheadline || lp.headline || '').slice(0, 155);

    return Promise.all([
      sb.from('landing_page_products')
        .select('offer_price,sort_order,products(*, product_images(url,sort_order), product_variants(id,size,color_name,color_hex,stock,is_active))')
        .eq('landing_page_id', lp.id).order('sort_order'),
      sb.from('delivery_zones').select('wilaya_code,name_fr,home_fee,desk_fee').eq('is_active', true).order('wilaya_code'),
      UI.settings()
    ]).then(function (res) {
      items = (res[0].data || []).filter(function (row) { return row.products; })
        .map(function (row) { return { offer_price: row.offer_price, p: norm(row.products) }; });
      zones = res[1].data || []; settings = res[2] || {};
      UI.applyTheme(settings.theme);
      if (!items.length) { notFound(); return; }
      build();
      UI.applyBranding(settings.store);
      Tracking.init(settings.tracking);
      Tracking.track('ViewContent', { content_name: lp.title, content_ids: items.map(function (i) { return i.p.id; }),
                                       content_type: 'product', currency: 'DZD', value: priceInfo(items[0]).now });
      sb.rpc('track_view', { p_slug: lp.slug, p_session: sessionId(), p_utm: (function () {
        try { return JSON.parse(sessionStorage.getItem('vilar_utm') || 'null'); } catch (x) { return null; }
      })() });
    });
  }).catch(function () { notFound(); });
})();
