/* Vilar - cart.js : panier côté navigateur.
   Les prix stockés ici ne servent qu'à l'affichage : le serveur
   (create_order) recalcule toujours les prix depuis la base. */
(function () {
  var KEY = 'vilar_cart_v1';
  var MAX_QTY = 10;

  function read() {
    try {
      var a = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }
  function write(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('vilar:cart'));
  }

  var Cart = {
    get: read,
    replace: write,
    count: function () { return read().reduce(function (n, i) { return n + i.qty; }, 0); },
    subtotal: function () { return read().reduce(function (s, i) { return s + i.price * i.qty; }, 0); },
    add: function (item) {
      var items = read();
      var found = items.find(function (i) { return i.variant_id === item.variant_id; });
      if (found) {
        found.qty = Math.min(MAX_QTY, found.qty + item.qty);
        found.price = item.price;
      } else {
        item.qty = Math.min(MAX_QTY, item.qty);
        items.push(item);
      }
      write(items);
    },
    setQty: function (variantId, qty) {
      var items = read().map(function (i) {
        if (i.variant_id === variantId) i.qty = Math.max(1, Math.min(MAX_QTY, qty));
        return i;
      });
      write(items);
    },
    remove: function (variantId) {
      write(read().filter(function (i) { return i.variant_id !== variantId; }));
    },
    clear: function () { write([]); },
    MAX_QTY: MAX_QTY
  };
  window.Cart = Cart;
})();
