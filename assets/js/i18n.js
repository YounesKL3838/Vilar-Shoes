/* Vilar - i18n.js : arabe (RTL) / français (LTR) */
(function () {
  var D = {
    ar: {
      currency: 'د.ج', skip: 'تخطي إلى المحتوى', menu: 'القائمة', cart: 'السلة', lang_other: 'Français',
      nav_home: 'الرئيسية', nav_shop: 'المتجر', nav_new: 'وصل حديثاً', nav_sale: 'التخفيضات',
      hero_title: 'أحذية تمشين بها بثقة', hero_sub: 'تصاميم أنيقة ومريحة تصلك إلى باب بيتك، والدفع عند الاستلام.',
      hero_cta: 'تسوقي الآن', hero_eyebrow: 'مجموعة جديدة',
      sec_cats: 'تسوقي حسب الصنف', sec_new: 'وصل حديثاً', sec_best: 'الأكثر مبيعاً', sec_sale: 'عروض وتخفيضات',
      sec_reviews: 'آراء زبوناتنا', view_all: 'عرض الكل', store_soon: 'المتجر قيد التجهيز، عودي قريباً.',
      f1: 'توصيل إلى بيتك', f1d: 'نوصل طلبك إلى المنزل أو إلى مكتب التوصيل.',
      f2: 'الدفع عند الاستلام', f2d: 'تدفعين فقط بعد أن تستلمي طلبك.',
      f3: 'استبدال سهل', f3d: 'المقاس غير مناسب؟ تواصلي معنا لاستبدال الحذاء.',
      nl_title: 'اشتركي في نشرتنا', nl_sub: 'جديد التشكيلات والعروض قبل الجميع.',
      nl_email: 'بريدك الإلكتروني', nl_btn: 'اشتراك', nl_ok: 'تم الاشتراك، شكراً لك.',
      nl_err: 'أدخلي بريداً إلكترونياً صحيحاً.', nl_fail: 'تعذر الاشتراك الآن، حاولي لاحقاً.',
      foot_tag: 'أحذية نسائية أنيقة ومريحة.', foot_shop: 'المتجر', foot_contact: 'تواصل معنا',
      all: 'الكل', f_cat: 'الصنف', f_price: 'السعر', f_size: 'المقاس', f_color: 'اللون',
      f_min: 'من', f_max: 'إلى', f_reset: 'مسح الفلاتر', f_show: 'الفلاتر', sort: 'الترتيب',
      s_new: 'الأحدث', s_asc: 'السعر: من الأقل', s_desc: 'السعر: من الأعلى',
      results: '{n} منتج', no_results: 'لا توجد منتجات بهذه المواصفات.',
      badge_new: 'جديد', badge_sold: 'نفد', size_choose: 'اختاري المقاس',
      p_size: 'المقاس', p_color: 'اللون', p_qty: 'الكمية', p_add: 'أضيفي إلى السلة', p_buy: 'اشتري الآن',
      p_pick_size: 'اختاري المقاس أولاً.', p_pick_color: 'اختاري اللون أولاً.',
      p_in: 'متوفر', p_low: 'بقي {n} فقط', p_out: 'غير متوفر', p_added: 'أُضيف إلى السلة',
      p_similar: 'قد يعجبك أيضاً', p_notfound: 'هذا المنتج غير موجود.', p_back: 'العودة إلى المتجر',
      c_title: 'سلة التسوق', c_empty: 'سلتك فارغة.', c_sub: 'المجموع الفرعي',
      c_note: 'تكلفة التوصيل تُحسب في الخطوة التالية.', c_checkout: 'إتمام الطلب',
      c_remove: 'حذف', c_gone: 'لم يعد متوفراً', c_adjusted: 'تم تعديل بعض الكميات حسب المخزون.',
      c_less: 'تقليل الكمية', c_more: 'زيادة الكمية', c_total: 'المجموع',
      k_title: 'إتمام الطلب', k_name: 'الاسم واللقب', k_phone: 'رقم الهاتف', k_wilaya: 'الولاية',
      k_wilaya_ph: 'اختاري الولاية', k_commune: 'البلدية', k_address: 'العنوان', k_dtype: 'طريقة التوصيل',
      k_home: 'إلى المنزل', k_desk: 'إلى مكتب التوصيل', k_notes: 'ملاحظات إضافية (اختياري)',
      k_summary: 'ملخص الطلب', k_delivery: 'التوصيل', k_free: 'مجاني', k_submit: 'تأكيد الطلب',
      k_sending: 'جاري الإرسال...', k_cod: 'الدفع نقداً عند استلام الطلب.', k_no_zones: 'التوصيل غير متاح حالياً.',
      e_name: 'أدخلي اسمك الكامل.', e_phone: 'أدخلي رقم هاتف جزائري صحيح (مثال: 0555123456).',
      e_wilaya: 'اختاري الولاية.', e_commune: 'أدخلي اسم البلدية.', e_address: 'أدخلي عنواناً مفصلاً.',
      e_stock: 'بعض المنتجات لم تعد متوفرة بالكمية المطلوبة. راجعي السلة.',
      e_many: 'وصلنا عدد كبير من الطلبات من هذا الرقم، حاولي لاحقاً أو تواصلي معنا.',
      e_generic: 'تعذر إرسال الطلب. حاولي مرة أخرى.', go_cart: 'العودة إلى السلة',
      ty_title: 'تم استلام طلبك', ty_num: 'رقم الطلب', ty_total: 'المبلغ عند الاستلام',
      ty_msg: 'سنتصل بك قريباً لتأكيد الطلب.', ty_dup: 'هذا الطلب مسجل مسبقاً ولم يتم تكراره.',
      ty_more: 'متابعة التسوق',
      foot_info: 'معلومات', pol_delivery: 'سياسة التوصيل', pol_returns: 'الاستبدال والإرجاع', pol_privacy: 'سياسة الخصوصية',
      lp_ends: 'ينتهي العرض خلال', lp_expired: 'انتهى العرض', lp_d: 'يوم', lp_h: 'ساعة', lp_m: 'دقيقة', lp_s: 'ثانية',
      lp_pick: 'اختاري الموديل', lp_order_title: 'اطلبي الآن والدفع عند الاستلام', lp_soldout: 'غير متوفر حالياً',
      lp_notfound: 'هذه الصفحة غير متاحة.', lp_s1: 'اختاري المقاس والكمية', lp_s2: 'معلومات التوصيل', lp_s3: 'ملخص الطلب', lp_gallery: 'تفاصيل المنتج', lp_save: 'وفّري',
      err_load: 'تعذر تحميل البيانات. أعيدي المحاولة.', err_setup: 'المتجر غير مربوط بقاعدة البيانات بعد. عدّلي ملف assets/js/config.js.'
    },
    fr: {
      currency: 'DA', skip: 'Aller au contenu', menu: 'Menu', cart: 'Panier', lang_other: 'العربية',
      nav_home: 'Accueil', nav_shop: 'Boutique', nav_new: 'Nouveautés', nav_sale: 'Promotions',
      hero_title: 'Des chaussures qui vous accompagnent', hero_sub: 'Des modèles élégants et confortables, livrés chez vous. Paiement à la livraison.',
      hero_cta: 'Découvrir la collection', hero_eyebrow: 'Nouvelle collection',
      sec_cats: 'Parcourir par catégorie', sec_new: 'Nouveautés', sec_best: 'Meilleures ventes', sec_sale: 'Promotions',
      sec_reviews: 'Ce que disent nos clientes', view_all: 'Voir tout', store_soon: 'La boutique est en préparation, revenez bientôt.',
      f1: 'Livraison chez vous', f1d: 'À domicile ou en point de retrait.',
      f2: 'Paiement à la livraison', f2d: 'Vous payez uniquement à la réception.',
      f3: 'Échange facile', f3d: 'Pointure inadaptée ? Contactez-nous pour un échange.',
      nl_title: 'Rejoignez la newsletter', nl_sub: 'Nouveautés et offres en avant-première.',
      nl_email: 'Votre e-mail', nl_btn: "S'abonner", nl_ok: 'Inscription confirmée, merci.',
      nl_err: 'Saisissez une adresse e-mail valide.', nl_fail: "Inscription impossible pour le moment, réessayez plus tard.",
      foot_tag: 'Chaussures pour femme, élégantes et confortables.', foot_shop: 'Boutique', foot_contact: 'Contact',
      all: 'Tout', f_cat: 'Catégorie', f_price: 'Prix', f_size: 'Pointure', f_color: 'Couleur',
      f_min: 'Min', f_max: 'Max', f_reset: 'Réinitialiser', f_show: 'Filtres', sort: 'Trier',
      s_new: 'Plus récents', s_asc: 'Prix croissant', s_desc: 'Prix décroissant',
      results: '{n} produit(s)', no_results: 'Aucun produit ne correspond à ces critères.',
      badge_new: 'Nouveau', badge_sold: 'Épuisé', size_choose: 'Choisir la pointure',
      p_size: 'Pointure', p_color: 'Couleur', p_qty: 'Quantité', p_add: 'Ajouter au panier', p_buy: 'Acheter maintenant',
      p_pick_size: "Choisissez d'abord la pointure.", p_pick_color: "Choisissez d'abord la couleur.",
      p_in: 'En stock', p_low: 'Plus que {n} en stock', p_out: 'Épuisé', p_added: 'Ajouté au panier',
      p_similar: 'Vous aimerez aussi', p_notfound: "Ce produit n'existe pas.", p_back: 'Retour à la boutique',
      c_title: 'Panier', c_empty: 'Votre panier est vide.', c_sub: 'Sous-total',
      c_note: "Les frais de livraison sont calculés à l'étape suivante.", c_checkout: 'Passer la commande',
      c_remove: 'Supprimer', c_gone: 'Plus disponible', c_adjusted: 'Certaines quantités ont été ajustées selon le stock.',
      c_less: 'Diminuer la quantité', c_more: 'Augmenter la quantité', c_total: 'Total',
      k_title: 'Finaliser la commande', k_name: 'Nom et prénom', k_phone: 'Téléphone', k_wilaya: 'Wilaya',
      k_wilaya_ph: 'Choisir la wilaya', k_commune: 'Commune', k_address: 'Adresse', k_dtype: 'Mode de livraison',
      k_home: 'À domicile', k_desk: 'En point de retrait', k_notes: 'Notes (facultatif)',
      k_summary: 'Récapitulatif', k_delivery: 'Livraison', k_free: 'Gratuite', k_submit: 'Confirmer la commande',
      k_sending: 'Envoi en cours...', k_cod: 'Paiement en espèces à la réception.', k_no_zones: 'La livraison est momentanément indisponible.',
      e_name: 'Saisissez votre nom complet.', e_phone: 'Saisissez un numéro algérien valide (ex : 0555123456).',
      e_wilaya: 'Choisissez la wilaya.', e_commune: 'Saisissez la commune.', e_address: 'Saisissez une adresse détaillée.',
      e_stock: "Certains articles ne sont plus disponibles en quantité suffisante. Vérifiez le panier.",
      e_many: 'Trop de commandes depuis ce numéro. Réessayez plus tard ou contactez-nous.',
      e_generic: "L'envoi de la commande a échoué. Réessayez.", go_cart: 'Retour au panier',
      ty_title: 'Commande reçue', ty_num: 'Numéro de commande', ty_total: 'Montant à payer à la livraison',
      ty_msg: 'Nous vous appellerons bientôt pour confirmer votre commande.',
      ty_dup: "Cette commande était déjà enregistrée, elle n'a pas été dupliquée.",
      ty_more: 'Continuer vos achats',
      foot_info: 'Informations', pol_delivery: 'Politique de livraison', pol_returns: 'Échange et retour', pol_privacy: 'Politique de confidentialité',
      lp_ends: "L'offre se termine dans", lp_expired: 'Offre terminée', lp_d: 'j', lp_h: 'h', lp_m: 'min', lp_s: 's',
      lp_pick: 'Choisissez le modèle', lp_order_title: 'Commandez maintenant, paiement à la livraison', lp_soldout: 'Indisponible pour le moment',
      lp_notfound: "Cette page n'est pas disponible.", lp_s1: 'Choisissez pointure et quantité', lp_s2: 'Informations de livraison', lp_s3: 'Récapitulatif', lp_gallery: 'Détails du produit', lp_save: 'Économisez',
      err_load: 'Chargement impossible. Réessayez.', err_setup: "La boutique n'est pas encore reliée à la base de données. Modifiez assets/js/config.js."
    }
  };

  var lang = 'ar';
  try { lang = localStorage.getItem('vilar_lang') || (window.VILAR_CONFIG && VILAR_CONFIG.DEFAULT_LANG) || 'ar'; } catch (e) {}
  if (!D[lang]) lang = 'ar';
  var other = lang === 'ar' ? 'fr' : 'ar';

  function t(k, vars) {
    var s = D[lang][k];
    if (s === undefined) s = D[other][k];
    if (s === undefined) s = k;
    if (vars) for (var v in vars) s = s.replace('{' + v + '}', vars[v]);
    return s;
  }
  function tFor(l) {
    var o = l === 'ar' ? 'fr' : 'ar';
    return function (k, vars) {
      var s = D[l] && D[l][k];
      if (s === undefined) s = D[o][k];
      if (s === undefined) s = k;
      if (vars) for (var v in vars) s = s.replace('{' + v + '}', vars[v]);
      return s;
    };
  }
  function apply(root) {
    root = root || document;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    root.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.placeholder = t(el.dataset.i18nPh); });
    root.querySelectorAll('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  }
  function setLang(l) {
    try { localStorage.setItem('vilar_lang', l); } catch (e) {}
    location.reload();
  }
  var nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
  function money(n) { return nf.format(Math.round(Number(n) || 0)).replace(/[\u202f\u00a0\s]/g, '\u00a0') + '\u00a0' + t('currency'); }
  function pick(obj, field) { return (obj && (obj[field + '_' + lang] || obj[field + '_' + other])) || ''; }

  window.I18N = { tFor: tFor, t: t, apply: apply, setLang: setLang, money: money, pick: pick,
                  get lang() { return lang; }, get other() { return other; } };
  apply();
})();
