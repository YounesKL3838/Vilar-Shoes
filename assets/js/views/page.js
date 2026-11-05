/* Vilar - views/page.js : pages de politiques (livraison, échange, confidentialité) */
window.Views = window.Views || {};
Views["page"] = {
  tpl: "<div class=\"wrap\"><div class=\"page-head\"><h1 id=\"pg-title\"></h1></div><div class=\"prose\" id=\"pg-body\"></div></div>",
  run: function (params) {
    var key = params.slug, t = I18N.t;
    document.getElementById('pg-title').textContent = t('pol_' + key);
    document.title = t('pol_' + key) + ' | Vilar';
    UI.settings().then(function (s) {
      var po = (s && s.policies) || {}, txt = po[key + '_' + I18N.lang] || po[key + '_' + I18N.other] || '';
      var box = document.getElementById('pg-body');
      if (!txt) { box.textContent = t('p_notfound'); return; }
      box.textContent = txt;   // textContent : le texte saisi dans l'admin n'est jamais interprété comme du HTML
    });
  }
};
