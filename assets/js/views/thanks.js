/* Vilar - views/thanks.js : vue de la boutique (affichée dans index.html) */
window.Views = window.Views || {};
Views["thanks"] = {
  tpl: "<div class=\"wrap\">\n      <section class=\"thanks\">\n        <div class=\"tick\" aria-hidden=\"true\">✓</div>\n        <h1 data-i18n=\"ty_title\"></h1>\n        <p class=\"muted\" id=\"ty-dup\" data-i18n=\"ty_dup\" hidden></p>\n        <dl class=\"ty-box\">\n          <div><dt data-i18n=\"ty_num\"></dt><dd id=\"ty-num\" dir=\"ltr\"></dd></div>\n          <div><dt data-i18n=\"ty_total\"></dt><dd id=\"ty-total\"></dd></div>\n        </dl>\n        <p data-i18n=\"ty_msg\"></p>\n        <a class=\"btn\" href=\"#/shop\" data-i18n=\"ty_more\"></a>\n      </section>\n    </div>",
  run: function (params) {
    var q = params.qs;
    var num = q.get('o') || '', total = parseFloat(q.get('t'));
    if (!/^VL-\d{1,10}$/.test(num)) { location.replace('#/'); return; }
    document.getElementById('ty-num').textContent = num;
    document.getElementById('ty-total').textContent = isFinite(total) ? I18N.money(total) : '';
    if (q.get('d') === '1') document.getElementById('ty-dup').hidden = false;

    // Suivi publicitaire : un seul événement Purchase par commande
    if (q.get('d') !== '1' && isFinite(total) && window.VILAR_CONFIGURED) {
      var k = 'vilar_purchase_' + num, done = false;
      try { done = !!sessionStorage.getItem(k); } catch (e) {}
      if (!done) {
        UI.settings().then(function (s) {
          Tracking.init(s && s.tracking);
          Tracking.track('Purchase', { value: total, currency: 'DZD', content_type: 'product' });
          try { sessionStorage.setItem(k, '1'); } catch (e) {}
        });
      }
    }
  }
};
