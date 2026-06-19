/* ==========================================================================
   STUDENTMART — products.js
   Product catalog data + rendering logic for product cards across
   index.html (featured/trending/flash-sale) and products.html (full grid).
   Depends on: app.js (formatPrice, showToast, escapeHtml, openQuickView)
   Depends on: cart.js (addToCart, toggleWishlist, isInWishlist) — loaded after
   ========================================================================== */

/* ---------- 1. PRODUCT CATALOG ---------- */

const PRODUCTS = [
  {
    id: 'p01',
    name: 'Engineering Mathematics — Vol. 1 (4th Edition)',
    category: 'books',
    categoryLabel: 'Books',
    icon: '📘',
    price: 349,
    originalPrice: 599,
    rating: 4.5,
    ratingCount: 312,
    description: 'A complete reference for first-year engineering mathematics, covering calculus, linear algebra and differential equations with solved examples.',
    trending: true,
    flashSale: true
  },
  {
    id: 'p02',
    name: 'Wireless Over-Ear Headphones — BassPro X2',
    category: 'headphones',
    categoryLabel: 'Headphones',
    icon: '🎧',
    price: 1499,
    originalPrice: 2999,
    rating: 4.3,
    ratingCount: 845,
    description: '40mm drivers, 30-hour battery life and active noise cancellation — built for long study sessions and longer commutes.',
    trending: true,
    flashSale: true
  },
  {
    id: 'p03',
    name: 'USB-C Hub — 7-in-1 Laptop Adapter',
    category: 'laptop',
    categoryLabel: 'Laptop Accessories',
    icon: '💻',
    price: 899,
    originalPrice: 1499,
    rating: 4.4,
    ratingCount: 201,
    description: 'HDMI, USB 3.0, SD card reader and 100W PD charging in one compact hub. Essential for hostel-room multitasking.',
    trending: false,
    flashSale: true
  },
  {
    id: 'p04',
    name: 'LED Study Lamp with Wireless Charger',
    category: 'lamps',
    categoryLabel: 'Study Lamps',
    icon: '💡',
    price: 749,
    originalPrice: 1299,
    rating: 4.6,
    ratingCount: 530,
    description: 'Adjustable brightness LED lamp with a built-in Qi wireless charging pad — light up your desk and your phone together.',
    trending: true,
    flashSale: false
  },
  {
    id: 'p05',
    name: 'Premium Notebook Set (Pack of 5)',
    category: 'stationery',
    categoryLabel: 'Stationery',
    icon: '📒',
    price: 299,
    originalPrice: 450,
    rating: 4.2,
    ratingCount: 178,
    description: '200-page ruled notebooks with sturdy binding — survives an entire semester of lecture notes without falling apart.',
    trending: false,
    flashSale: false
  },
  {
    id: 'p06',
    name: 'College Backpack — Anti-Theft Laptop Edition',
    category: 'essentials',
    categoryLabel: 'College Essentials',
    icon: '🎒',
    price: 1199,
    originalPrice: 1999,
    rating: 4.5,
    ratingCount: 612,
    description: 'Water-resistant backpack with a padded 15.6" laptop sleeve and a hidden anti-theft zip pocket.',
    trending: true,
    flashSale: false
  },
  {
    id: 'p07',
    name: 'Data Structures & Algorithms — Concepts Simplified',
    category: 'books',
    categoryLabel: 'Books',
    icon: '📗',
    price: 399,
    originalPrice: 650,
    rating: 4.7,
    ratingCount: 920,
    description: 'A placement-prep favorite — breaks down DSA concepts with diagrams, code snippets and practice problems.',
    trending: true,
    flashSale: false
  },
  {
    id: 'p08',
    name: 'Mechanical Keyboard — Compact 60% Layout',
    category: 'laptop',
    categoryLabel: 'Laptop Accessories',
    icon: '⌨️',
    price: 1799,
    originalPrice: 2799,
    rating: 4.4,
    ratingCount: 264,
    description: 'Tactile blue switches in a desk-friendly compact frame — built for late-night coding assignments.',
    trending: false,
    flashSale: true
  },
  {
    id: 'p09',
    name: 'Scientific Calculator — FX-991 Series',
    category: 'stationery',
    categoryLabel: 'Stationery',
    icon: '🧮',
    price: 899,
    originalPrice: 1150,
    rating: 4.8,
    ratingCount: 1024,
    description: '417 functions including matrices, vectors and equation solving — the standard calculator for every engineering exam.',
    trending: true,
    flashSale: false
  },
  {
    id: 'p10',
    name: 'Insulated Steel Water Bottle — 1L',
    category: 'essentials',
    categoryLabel: 'College Essentials',
    icon: '🍶',
    price: 449,
    originalPrice: 699,
    rating: 4.3,
    ratingCount: 389,
    description: 'Double-wall insulated steel bottle that keeps water cold through a full day of back-to-back classes.',
    trending: false,
    flashSale: false
  },
  {
    id: 'p11',
    name: 'Desk Organizer with Built-in Lamp Stand',
    category: 'lamps',
    categoryLabel: 'Study Lamps',
    icon: '🗂️',
    price: 599,
    originalPrice: 999,
    rating: 4.1,
    ratingCount: 142,
    description: 'Keep pens, sticky notes and your study lamp in one tidy footprint — designed for small hostel desks.',
    trending: false,
    flashSale: false
  },
  {
    id: 'p12',
    name: 'Wired Earphones with Mic — ClearCall',
    category: 'headphones',
    categoryLabel: 'Headphones',
    icon: '🎙️',
    price: 299,
    originalPrice: 599,
    rating: 4.0,
    ratingCount: 455,
    description: 'Reliable wired earphones with an inline mic — perfect for online classes and quick calls between lectures.',
    trending: false,
    flashSale: true
  }
];

/* ---------- 2. HELPER: DISCOUNT PERCENT ---------- */

function getDiscountPercent(product) {
  if (!product.originalPrice || product.originalPrice <= product.price) return 0;
  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
}

/* ---------- 3. HELPER: STAR RATING (visual) ---------- */

function renderStars(rating) {
  const fullStars = Math.round(rating);
  return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
}

/* ---------- 4. PRODUCT CARD TEMPLATE ---------- */

/**
 * Build the HTML string for a single product card.
 * Used across home (featured/trending/flash-sale) and products.html grid.
 */
function renderProductCard(product) {
  const discount = getDiscountPercent(product);
  const wishlisted = (typeof isInWishlist === 'function') && isInWishlist(product.id);

  return `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-card__media">
        ${discount > 0 ? `<span class="product-card__discount">${discount}% OFF</span>` : ''}
        <button
          class="product-card__wishlist ${wishlisted ? 'is-active' : ''}"
          aria-label="${wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}"
          data-action="wishlist"
          data-id="${product.id}"
        >${wishlisted ? '❤️' : '🤍'}</button>
        <span aria-hidden="true">${product.icon}</span>
        <button class="product-card__quickview" data-action="quickview" data-id="${product.id}">Quick View</button>
      </div>
      <div class="product-card__body">
        <span class="product-card__category">${escapeHtml(product.categoryLabel)}</span>
        <h3 class="product-card__name">
          <a href="product.html?id=${product.id}" style="color:inherit;">${escapeHtml(product.name)}</a>
        </h3>
        <div class="product-card__rating">
          <span class="product-card__rating-badge">${product.rating} ★</span>
          <span class="product-card__rating-count">(${product.ratingCount})</span>
        </div>
        <div class="product-card__price">
          <span class="product-card__price-current">${formatPrice(product.price)}</span>
          ${product.originalPrice ? `<span class="product-card__price-original">${formatPrice(product.originalPrice)}</span>` : ''}
          ${discount > 0 ? `<span class="product-card__price-percent">${discount}% off</span>` : ''}
        </div>
        <div class="product-card__cta">
          <button class="btn btn--primary" data-action="add-to-cart" data-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `;
}

/* ---------- 5. RENDER A LIST OF PRODUCTS INTO A CONTAINER ---------- */

function renderProductGrid(containerId, productList) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (productList.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🔍</div>
        <h3 class="empty-state__title">No products found</h3>
        <p class="empty-state__text">Try adjusting your search or filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = productList.map(renderProductCard).join('');
}

/* ---------- 6. QUICK VIEW CONTENT BUILDER ---------- */

function buildQuickViewHtml(product) {
  const discount = getDiscountPercent(product);
  return `
    <div class="quick-view__media" aria-hidden="true">${product.icon}</div>
    <div class="quick-view__info">
      <span class="quick-view__category">${escapeHtml(product.categoryLabel)}</span>
      <h2 class="quick-view__title" id="quickViewTitle">${escapeHtml(product.name)}</h2>
      <div class="product-card__rating">
        <span class="product-card__rating-badge">${product.rating} ★</span>
        <span class="product-card__rating-count">(${product.ratingCount} ratings)</span>
      </div>
      <div class="quick-view__price">
        <span class="quick-view__price-current">${formatPrice(product.price)}</span>
        ${product.originalPrice ? `<span class="quick-view__price-original">${formatPrice(product.originalPrice)}</span>` : ''}
        ${discount > 0 ? `<span class="tag tag--success">${discount}% OFF</span>` : ''}
      </div>
      <p class="quick-view__desc">${escapeHtml(product.description)}</p>
      <div class="quick-view__actions">
        <button class="btn btn--primary" data-action="add-to-cart" data-id="${product.id}">Add to Cart</button>
        <a href="product.html?id=${product.id}" class="btn btn--ghost">View Full Details</a>
      </div>
    </div>
  `;
}

/* ---------- 7. EVENT DELEGATION FOR PRODUCT CARD ACTIONS ---------- */

/**
 * A single delegated listener handles add-to-cart, wishlist toggle and
 * quick-view triggers for ALL product cards on the page — including
 * cards rendered dynamically after this listener is attached.
 */
function initProductCardActions() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const productId = btn.dataset.id;
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    if (action === 'add-to-cart' && typeof addToCart === 'function') {
      addToCart(product.id, 1);
      showToast(`${product.name} added to cart`, 'success');
    }

    if (action === 'wishlist' && typeof toggleWishlist === 'function') {
      const nowWishlisted = toggleWishlist(product.id);
      btn.classList.toggle('is-active', nowWishlisted);
      btn.textContent = nowWishlisted ? '❤️' : '🤍';
      btn.setAttribute('aria-label', nowWishlisted ? 'Remove from wishlist' : 'Add to wishlist');
      showToast(
        nowWishlisted ? `${product.name} added to wishlist` : `${product.name} removed from wishlist`,
        'info'
      );
    }

    if (action === 'quickview' && typeof window.openQuickView === 'function') {
      window.openQuickView(buildQuickViewHtml(product));
    }
  });
}

/* ---------- 8. HOME PAGE SECTION RENDERERS ---------- */

function renderHomePageSections() {
  // Featured Products: first 8 products in catalog
  if (document.getElementById('featuredProductsGrid')) {
    renderProductGrid('featuredProductsGrid', PRODUCTS.slice(0, 8));
  }

  // Trending Products: flagged trending: true
  if (document.getElementById('trendingTrack')) {
    renderProductGrid('trendingTrack', PRODUCTS.filter(p => p.trending));
  }

  // Flash Sale Products: flagged flashSale: true
  if (document.getElementById('flashSaleGrid')) {
    renderProductGrid('flashSaleGrid', PRODUCTS.filter(p => p.flashSale));
  }
}

/* ---------- 9. INIT ---------- */

document.addEventListener('DOMContentLoaded', () => {
  initProductCardActions();
  renderHomePageSections();
});