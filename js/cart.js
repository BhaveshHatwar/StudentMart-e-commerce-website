/* ==========================================================================
   STUDENTMART — cart.js
   Cart + Wishlist persistence (LocalStorage), badge updates, and the
   cart-page rendering/coupon/quantity logic (active only on cart.html).
   Depends on: app.js (storageGet, storageSet, formatPrice, showToast)
   Depends on: products.js (PRODUCTS array) for cart-page line-item lookup
   ========================================================================== */

/* ---------- 1. STORAGE KEYS ---------- */

const CART_KEY = 'sm_cart';       // [{ id, qty }]
const WISHLIST_KEY = 'sm_wishlist'; // [id, id, ...]
const COUPON_KEY = 'sm_coupon';     // { code, percent } | null

/* ---------- 2. CART CORE FUNCTIONS ---------- */

function getCart() {
  return storageGet(CART_KEY, []);
}

function saveCart(cart) {
  storageSet(CART_KEY, cart);
  updateCartBadge();
}

/**
 * Add a product to the cart, or increase quantity if it already exists.
 */
function addToCart(productId, qty = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }

  saveCart(cart);
}

/**
 * Set an exact quantity for a cart line item (used by +/- controls on cart.html).
 * Removes the item entirely if qty drops to 0 or below.
 */
function updateCartQty(productId, qty) {
  let cart = getCart();

  if (qty <= 0) {
    cart = cart.filter(item => item.id !== productId);
  } else {
    const item = cart.find(i => i.id === productId);
    if (item) item.qty = qty;
  }

  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
}

function getCartCount() {
  return getCart().reduce((total, item) => total + item.qty, 0);
}

function clearCart() {
  saveCart([]);
  storageSet(COUPON_KEY, null);
}

/* ---------- 3. WISHLIST CORE FUNCTIONS ---------- */

function getWishlist() {
  return storageGet(WISHLIST_KEY, []);
}

function isInWishlist(productId) {
  return getWishlist().includes(productId);
}

/**
 * Toggle a product's wishlist state.
 * @returns {boolean} true if now wishlisted, false if removed
 */
function toggleWishlist(productId) {
  let wishlist = getWishlist();

  if (wishlist.includes(productId)) {
    wishlist = wishlist.filter(id => id !== productId);
    storageSet(WISHLIST_KEY, wishlist);
    return false;
  }

  wishlist.push(productId);
  storageSet(WISHLIST_KEY, wishlist);
  return true;
}

/* ---------- 4. NAVBAR CART BADGE ---------- */

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

/* ---------- 5. COUPON SYSTEM ---------- */

/**
 * Valid demo coupon codes. In a real backend these would be server-validated;
 * here they're hardcoded since StudentMart has no backend.
 */
const VALID_COUPONS = {
  STUDENT10: 10,
  WELCOME15: 15,
  CAMPUS20: 20
};

function applyCoupon(code) {
  const normalized = code.trim().toUpperCase();
  const percent = VALID_COUPONS[normalized];

  if (!percent) {
    storageSet(COUPON_KEY, null);
    return null;
  }

  const coupon = { code: normalized, percent };
  storageSet(COUPON_KEY, coupon);
  return coupon;
}

function getActiveCoupon() {
  return storageGet(COUPON_KEY, null);
}

function removeCoupon() {
  storageSet(COUPON_KEY, null);
}

/* ---------- 6. CART PAGE RENDERING (only runs if #cartItemsList exists) ---------- */

function renderCartPage() {
  const listEl = document.getElementById('cartItemsList');
  if (!listEl) return; // Not on cart.html — skip entirely

  const cart = getCart();
  const emptyState = document.getElementById('cartEmptyState');
  const summaryEl = document.getElementById('cartSummary');

  if (cart.length === 0) {
    listEl.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (summaryEl) summaryEl.style.display = 'none';
    renderCartTotals([]);
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (summaryEl) summaryEl.style.display = 'block';

  const lineItems = cart
    .map(item => {
      const product = (typeof PRODUCTS !== 'undefined') ? PRODUCTS.find(p => p.id === item.id) : null;
      return product ? { ...product, qty: item.qty } : null;
    })
    .filter(Boolean);

  listEl.innerHTML = lineItems.map(item => `
    <div class="cart-item" data-product-id="${item.id}">
      <div class="cart-item__media" aria-hidden="true">${item.icon}</div>
      <div class="cart-item__info">
        <h3 class="cart-item__name">${escapeHtml(item.name)}</h3>
        <span class="cart-item__category">${escapeHtml(item.categoryLabel)}</span>
        <div class="cart-item__price">${formatPrice(item.price)}</div>
      </div>
      <div class="cart-item__qty">
        <button class="qty-btn" data-action="qty-decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
        <span class="qty-value">${item.qty}</span>
        <button class="qty-btn" data-action="qty-increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
      </div>
      <div class="cart-item__subtotal">${formatPrice(item.price * item.qty)}</div>
      <button class="cart-item__remove" data-action="remove-item" data-id="${item.id}" aria-label="Remove ${escapeHtml(item.name)} from cart">🗑️</button>
    </div>
  `).join('');

  renderCartTotals(lineItems);
}

/**
 * Calculate and render subtotal, discount (coupon), delivery, and grand total.
 */
function renderCartTotals(lineItems) {
  const subtotalEl = document.getElementById('cartSubtotal');
  const discountEl = document.getElementById('cartDiscount');
  const deliveryEl = document.getElementById('cartDelivery');
  const totalEl = document.getElementById('cartTotal');
  const couponLabelEl = document.getElementById('activeCouponLabel');

  if (!subtotalEl || !totalEl) return;

  const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const coupon = getActiveCoupon();
  const discount = coupon ? Math.round(subtotal * (coupon.percent / 100)) : 0;
  const delivery = subtotal === 0 ? 0 : (subtotal >= 999 ? 0 : 49);
  const total = Math.max(0, subtotal - discount + delivery);

  subtotalEl.textContent = formatPrice(subtotal);
  if (discountEl) discountEl.textContent = discount > 0 ? `− ${formatPrice(discount)}` : formatPrice(0);
  if (deliveryEl) deliveryEl.textContent = delivery === 0 ? 'FREE' : formatPrice(delivery);
  totalEl.textContent = formatPrice(total);

  if (couponLabelEl) {
    couponLabelEl.textContent = coupon ? `Coupon "${coupon.code}" applied (${coupon.percent}% off)` : '';
  }
}

/* ---------- 7. CART PAGE EVENT DELEGATION ---------- */

function initCartPageActions() {
  const listEl = document.getElementById('cartItemsList');
  if (!listEl) return; // Only attach on cart.html

  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const productId = btn.dataset.id;
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    if (btn.dataset.action === 'qty-increase') {
      updateCartQty(productId, item.qty + 1);
    }
    if (btn.dataset.action === 'qty-decrease') {
      updateCartQty(productId, item.qty - 1);
    }
    if (btn.dataset.action === 'remove-item') {
      removeFromCart(productId);
      showToast('Item removed from cart', 'info');
    }

    renderCartPage();
  });

  // Coupon form
  const couponForm = document.getElementById('couponForm');
  const couponInput = document.getElementById('couponInput');

  couponForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const coupon = applyCoupon(couponInput.value);

    if (coupon) {
      showToast(`Coupon "${coupon.code}" applied — ${coupon.percent}% off!`, 'success');
    } else {
      showToast('Invalid coupon code', 'error');
    }
    renderCartPage();
  });

  document.getElementById('removeCouponBtn')?.addEventListener('click', () => {
    removeCoupon();
    showToast('Coupon removed', 'info');
    renderCartPage();
  });

  // Clear cart
  document.getElementById('clearCartBtn')?.addEventListener('click', () => {
    if (confirm('Remove all items from your cart?')) {
      clearCart();
      renderCartPage();
      showToast('Cart cleared', 'info');
    }
  });

  // Checkout (demo only — no backend/payment)
  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (getCart().length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    showToast('Order placed successfully! 🎉', 'success');
    clearCart();
    setTimeout(() => renderCartPage(), 600);
  });
}

/* ---------- 8. INIT ---------- */

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCartPage();
  initCartPageActions();
});