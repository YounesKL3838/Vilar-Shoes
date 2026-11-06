/* Vilar - motion.js : couche d'animation (boutique + landing pages)
   - révélation au défilement avec décalage entre éléments voisins
   - léger effet de profondeur (parallaxe) sur l'image du hero
   - en-tête : ombre au défilement, masqué en descendant, visible en remontant
   - pastille du panier qui « rebondit » à chaque ajout
   Tout est désactivé si l'utilisateur a demandé moins d'animations. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Éléments révélés. Les cartes/catégories se décalent par colonne (4 max), les autres par rang.
  var SEL = '.sec-head, .card, .cat, .feature, .review, .newsletter, .page-head, .product .gallery, ' +
            '.product .info > *, .line, .summary, .checkout form > .f, .thanks > *, ' +
            '.lp-feat, .lp-sec h2, .lp-desc, .lp-gallery img, .lp-card';
  var GRID = /(^|\s)(card|cat)(\s|$)/;
  var IMGS = '.card-media img, .gallery-main img, .cat-img img, .arch img, .lp-media img, .lp-gallery img';

  var io = null;
  if (!reduce && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  }

  function scan(root) {
    root = root || document;
    if (io) {
      root.querySelectorAll(SEL).forEach(function (el) {
        if (el.dataset.rv) return;
        el.dataset.rv = '1';
        var i = Array.prototype.indexOf.call(el.parentNode.children, el);
        var step = GRID.test(el.className) ? (i % 4) : Math.min(i, 5);
        el.style.setProperty('--d', step * 80 + 'ms');
        el.classList.add('reveal');
        io.observe(el);
      });
    }
    // Images : fondu à l'apparition (seulement si elles ne sont pas déjà chargées)
    root.querySelectorAll(IMGS).forEach(function (img) {
      if (img.dataset.iw) return;
      img.dataset.iw = '1';
      if (img.complete && img.naturalWidth) return;
      img.classList.add('img-wait');
      var done = function () { img.classList.remove('img-wait'); };
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }

  /* ---------- Défilement : en-tête, parallaxe, barre collante ---------- */
  var last = 0, ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.pageYOffset || 0;

      var h = document.getElementById('site-header');
      if (h) {
        h.classList.toggle('is-scrolled', y > 8);
        var menuOpen = !!document.querySelector('.nav.open');
        if (menuOpen || y < 120 || y < last) h.classList.remove('is-hidden');
        else if (y > last + 4) h.classList.add('is-hidden');
      }
      last = y;

      if (!reduce) {
        var img = document.querySelector('.hero-art .arch img');
        if (img && img.parentNode) {
          var r = img.parentNode.getBoundingClientRect();
          if (r.bottom > 0 && r.top < window.innerHeight) {
            var py = Math.max(-22, Math.min(22, r.top * -0.05));
            img.style.setProperty('--py', py.toFixed(1) + 'px');
          }
        }
      }

      var stk = document.querySelector('.lp-sticky');
      if (stk) {
        var order = document.getElementById('order'), hide = false;
        if (order) {
          var o = order.getBoundingClientRect();
          hide = o.top < window.innerHeight * 0.75 && o.bottom > 0;
        }
        stk.classList.toggle('show', y > 380 && !hide);
      }
    });
  }

  /* ---------- Panier : petit rebond de la pastille ---------- */
  document.addEventListener('vilar:cart', function () {
    if (reduce) return;
    var el = document.querySelector('.cart-count');
    if (!el) return;
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  });

  /* ---------- Démarrage + contenu injecté plus tard ---------- */
  var host = document.getElementById('main') || document.getElementById('lp-root');
  var timer = null;
  function later() {
    clearTimeout(timer);
    timer = setTimeout(function () { scan(host); onScroll(); }, 40);
  }
  if (host) {
    new MutationObserver(later).observe(host, { childList: true, subtree: true });
    scan(host);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
