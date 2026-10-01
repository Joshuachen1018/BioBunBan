/* BioBunBan cart — localStorage store + a drawer web component.
   Loaded as a classic script; self-mounts <bb-cart> into <body>. */
(function () {
  if (window.BBCart) return;

  var KEY = 'bb-cart-v1';
  var listeners = [];

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function write(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
    emit();
  }
  function emit() {
    var items = read();
    listeners.forEach(function (fn) { try { fn(items); } catch (e) {} });
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = String(BBCart.count());
    });
    window.dispatchEvent(new CustomEvent('bb-cart:change', { detail: { items: items } }));
  }

  var BBCart = {
    items: read,
    count: function () { return read().reduce(function (n, i) { return n + i.qty; }, 0); },
    total: function () { return read().reduce(function (n, i) { return n + i.price * i.qty; }, 0); },
    add: function (item, qty) {
      var q = Math.max(1, qty || 1);
      var items = read();
      var key = item.key || item.id;
      var hit = items.filter(function (i) { return i.key === key; })[0];
      if (hit) hit.qty = Math.min(99, hit.qty + q);
      else items.push({
        key: key, id: item.id, name: item.name, price: item.price,
        qty: q, img: item.img || '', note: item.note || '', spec: item.spec || ''
      });
      write(items);
      BBCart.open();
    },
    setQty: function (key, qty) {
      var items = read().map(function (i) { return i.key === key ? Object.assign({}, i, { qty: Math.min(99, Math.max(1, qty)) }) : i; });
      write(items);
    },
    remove: function (key) { write(read().filter(function (i) { return i.key !== key; })); },
    clear: function () { write([]); },
    subscribe: function (fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; },
    open: function () { var el = document.querySelector('bb-cart'); if (el) el.setAttribute('open', ''); },
    close: function () { var el = document.querySelector('bb-cart'); if (el) el.removeAttribute('open'); }
  };
  window.BBCart = BBCart;

  window.addEventListener('storage', function (e) { if (e.key === KEY) emit(); });

  var COPY = {
    zh: {
      title: '購物車', close: '關閉', empty: '購物車目前是空的。', browse: '去看商品',
      subtotal: '小計', shipNote: '運費與發票資訊於結帳時計算。', checkout: '前往結帳',
      demo: '此為設計稿示意，結帳尚未接上金流。', remove: '移除', items: '件'
    },
    en: {
      title: 'Cart', close: 'Close', empty: 'Your cart is empty.', browse: 'Browse products',
      subtotal: 'Subtotal', shipNote: 'Shipping and invoice details are calculated at checkout.', checkout: 'Checkout',
      demo: 'Design prototype — checkout is not connected to payment.', remove: 'Remove', items: 'items'
    }
  };
  function lang() {
    try { return localStorage.getItem('bb-lang') === 'en' ? 'en' : 'zh'; } catch (e) { return 'zh'; }
  }
  function money(n) { return 'NT$' + Number(n).toLocaleString('en-US'); }

  var CSS = [
    ':host{position:fixed;inset:0;z-index:200;pointer-events:none;font-family:"Space Grotesk","Noto Sans TC",-apple-system,sans-serif;color:#14202b}',
    ':host(:not([open])) .scrim{opacity:0}',
    ':host([open]){pointer-events:auto}',
    '.scrim{position:absolute;inset:0;background:rgba(10,12,16,0.35);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:1;transition:opacity 320ms ease}',
    '.panel{position:absolute;top:12px;right:12px;bottom:12px;width:min(440px,calc(100% - 24px));background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 28px 64px rgba(0,0,0,0.28);display:flex;flex-direction:column;transform:translateX(calc(100% + 24px));transition:transform 420ms cubic-bezier(0.22,0.7,0.25,1)}',
    ':host([open]) .panel{transform:translateX(0)}',
    '.head{display:flex;align-items:center;gap:12px;padding:20px 22px;background:rgba(10,12,16,0.92);color:#fff}',
    '.head b{font-size:17px;font-weight:700}',
    '.head span{font-family:"Space Grotesk",sans-serif;font-size:13px;color:rgba(255,255,255,0.6);margin-right:auto}',
    '.x{width:36px;height:36px;border-radius:12px;background:transparent;border:0;color:#fff;font-size:20px;line-height:1;cursor:pointer;transition:background .2s,color .2s}',
    '.x:hover{background:rgba(255,255,255,0.12);color:#F08335}',
    '.list{flex:1;overflow:auto;display:flex;flex-direction:column;padding:6px 22px}',
    '.row{display:grid;grid-template-columns:80px minmax(0,1fr);gap:16px;padding:18px 0;border-bottom:1px solid #eeece9}',
    '.thumb{aspect-ratio:1/1;background:#f4f3f1 center/cover no-repeat;border-radius:3px}',
    '.nm{font-size:14.5px;line-height:1.55;margin:0 0 6px}',
    '.pr{font-family:"Space Grotesk",sans-serif;font-size:15px;font-weight:600}',
    '.ctl{display:flex;align-items:center;gap:14px;margin-top:12px}',
    '.step{display:flex;align-items:center;background:#f4f3f1;border-radius:3px}',
    '.step button{width:34px;height:34px;background:transparent;border:0;font-size:16px;cursor:pointer;font-family:inherit;color:#14202b}',
    '.step button:hover{color:#F08335}',
    '.step span{font-family:"Space Grotesk",sans-serif;width:30px;text-align:center;font-size:14px;font-weight:600}',
    '.rm{background:transparent;border:0;font-family:inherit;font-size:13px;color:#8a8785;cursor:pointer;padding:0}',
    '.rm:hover{color:#F08335}',
    '.empty{flex:1;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:16px;padding:32px 22px;color:#6b6866;font-size:15px}',
    '.foot{padding:20px 22px 22px;display:flex;flex-direction:column;gap:14px;background:#f4f3f1}',
    '.sub{display:flex;align-items:baseline;justify-content:space-between;gap:12px}',
    '.sub i{font-style:normal;font-size:14px;color:#6b6866}',
    '.sub b{font-family:"Space Grotesk",sans-serif;font-size:24px;font-weight:700}',
    '.note{font-size:12.5px;line-height:1.7;color:#8a8785}',
    '.go{display:flex;align-items:center;justify-content:center;gap:10px;background:#2B4CA8;color:#fff;border:0;border-radius:3px;font-family:"Space Grotesk",sans-serif;font-size:14px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;padding:16px 20px;cursor:pointer;text-decoration:none;transition:background .2s,transform .2s}',
    '.go:hover{background:#223f8f;transform:translateY(-2px)}',
    '.link{align-self:flex-start;font-family:"Space Grotesk",sans-serif;font-size:14px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#fff;background:#2B4CA8;padding:14px 24px;border-radius:3px;text-decoration:none}',
    '.link:hover{background:#223f8f}'
  ].join('');

  class CartEl extends HTMLElement {
    static get observedAttributes() { return ['open']; }
  }
  CartEl.prototype.connectedCallback = function () {
    if (this._wired) return;
    this._wired = true;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = '<style>' + CSS + '</style><div class="scrim"></div><aside class="panel" role="dialog" aria-modal="true"></aside>';
    this.shadowRoot.querySelector('.scrim').addEventListener('click', function () { BBCart.close(); });
    this._off = BBCart.subscribe(this.render.bind(this));
    this._esc = function (e) { if (e.key === 'Escape') BBCart.close(); };
    document.addEventListener('keydown', this._esc);
    this.render();
  };
  CartEl.prototype.disconnectedCallback = function () {
    if (this._off) this._off();
    document.removeEventListener('keydown', this._esc);
  };
  CartEl.prototype.attributeChangedCallback = function () { this.render(); };

  CartEl.prototype.render = function () {
    if (!this.shadowRoot) return;
    var panel = this.shadowRoot.querySelector('.panel');
    if (!panel) return;
    var c = COPY[lang()];
    var items = BBCart.items();
    var html = '<div class="head"><b>' + c.title + '</b><span>' + BBCart.count() + ' ' + c.items + '</span>'
      + '<button class="x" type="button" aria-label="' + c.close + '">&times;</button></div>';

    if (!items.length) {
      html += '<div class="empty"><span>' + c.empty + '</span><a class="link" href="Products.dc.html">' + c.browse + '</a></div>';
    } else {
      html += '<div class="list">';
      items.forEach(function (i) {
        html += '<div class="row" data-key="' + i.key + '">'
          + '<div class="thumb" style="background-image:' + (i.img ? "url('" + i.img + "')" : 'none') + '"></div>'
          + '<div><p class="nm">' + i.name + '</p><span class="pr">' + money(i.price) + '</span>'
          + '<div class="ctl"><span class="step"><button type="button" data-act="dec" aria-label="minus">&minus;</button>'
          + '<span>' + i.qty + '</span><button type="button" data-act="inc" aria-label="plus">+</button></span>'
          + '<button class="rm" type="button" data-act="rm">' + c.remove + '</button></div></div></div>';
      });
      html += '</div><div class="foot"><div class="sub"><i>' + c.subtotal + '</i><b>' + money(BBCart.total()) + '</b></div>'
        + '<span class="note">' + c.shipNote + ' ' + c.demo + '</span>'
        + '<a class="go" href="Checkout.dc.html">' + c.checkout + ' →</a></div>';
    }
    panel.innerHTML = html;

    panel.querySelector('.x').addEventListener('click', function () { BBCart.close(); });
    panel.querySelectorAll('[data-act]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var row = btn.closest('.row');
        var key = row && row.getAttribute('data-key');
        if (!key) return;
        var cur = BBCart.items().filter(function (i) { return i.key === key; })[0];
        var act = btn.getAttribute('data-act');
        if (act === 'rm') BBCart.remove(key);
        else if (cur && act === 'inc') BBCart.setQty(key, cur.qty + 1);
        else if (cur && act === 'dec') { if (cur.qty <= 1) BBCart.remove(key); else BBCart.setQty(key, cur.qty - 1); }
      });
    });
  };

  if (!customElements.get('bb-cart')) customElements.define('bb-cart', CartEl);

  function mount() {
    if (!document.querySelector('bb-cart')) document.body.appendChild(document.createElement('bb-cart'));
    emit();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
  // Header counters mount after the page streams in — keep them in sync.
  setTimeout(emit, 600);
  setTimeout(emit, 1800);
})();
