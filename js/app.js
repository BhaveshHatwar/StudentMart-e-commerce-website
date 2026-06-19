/* ==========================================================================
   STUDENTMART — app.js
   Core app logic: Navbar interactions, Search suggestions, Mobile menu,
   Toast notifications, Flash-sale countdown timer, Quick-view modal shell.
   Depends on: PRODUCTS array (from products.js) being loaded BEFORE this
   file runs its search/suggestion logic — but degrades gracefully if not.
   ========================================================================== */

/* ---------- 1. UTILITY HELPERS (shared across all pages) ---------- */

/**
 * Format a number as Indian Rupees, e.g. 1299 -> "₹1,299"
 */
function formatPrice(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

/**
 * Read a query-string parameter by name from the current URL.
 */
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Safe localStorage getter — returns fallback if key missing or JSON invalid.
 */
function storageGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn('storageGet failed for', key, err);
    return fallback;
  }
}

/**
 * Safe localStorage setter.
 */
function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('storageSet failed for', key, err);
  }
}

/* ---------- 2. TOAST NOTIFICATIONS ---------- */

/**
 * Show a toast notification.
 * @param {string} message - text to display
 * @param {'success'|'error'|'info'} type - visual style
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;

  container.appendChild(toast);

  // Auto-dismiss after 2.8s
  setTimeout(() => {
    toast.classList.add('is-leaving');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 2800);
}

/* ---------- 3. NAVBAR: MOBILE HAMBURGER MENU ---------- */

function initMobileMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburgerBtn || !mobileMenu) return;

  hamburgerBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    hamburgerBtn.classList.toggle('is-active', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when a link inside it is clicked (mobile UX)
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      hamburgerBtn.classList.remove('is-active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- 4. NAVBAR: CATEGORIES DROPDOWN ---------- */

function initCategoriesDropdown() {
  const wrapper = document.getElementById('categoriesDropdown');
  const btn = document.getElementById('categoriesBtn');
  if (!wrapper || !btn) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = wrapper.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      wrapper.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      wrapper.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---------- 5. SEARCH WITH SUGGESTIONS ---------- */

function initSearch() {
  const input = document.getElementById('searchInput');
  const suggestionsList = document.getElementById('searchSuggestions');
  const searchBtn = document.getElementById('searchBtn');
  if (!input || !suggestionsList) return;

  function renderSuggestions(query) {
    const trimmed = query.trim().toLowerCase();
    suggestionsList.innerHTML = '';

    if (!trimmed) {
      suggestionsList.classList.remove('is-visible');
      return;
    }

    // PRODUCTS comes from products.js — guard in case it's not loaded
    const list = (typeof PRODUCTS !== 'undefined') ? PRODUCTS : [];
    const matches = list
      .filter(p => p.name.toLowerCase().includes(trimmed) || p.category.toLowerCase().includes(trimmed))
      .slice(0, 6);

    if (matches.length === 0) {
      suggestionsList.innerHTML = `<li class="suggestion__empty">No products found for "${escapeHtml(query)}"</li>`;
      suggestionsList.classList.add('is-visible');
      return;
    }

    matches.forEach(p => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.innerHTML = `
        <span>${p.icon || '🛍️'}</span>
        <span>${escapeHtml(p.name)}</span>
        <span class="suggestion__category">${escapeHtml(p.categoryLabel)}</span>
      `;
      li.addEventListener('click', () => {
        window.location.href = `product.html?id=${p.id}`;
      });
      suggestionsList.appendChild(li);
    });

    suggestionsList.classList.add('is-visible');
  }

  input.addEventListener('input', (e) => renderSuggestions(e.target.value));

  input.addEventListener('focus', (e) => {
    if (e.target.value.trim()) renderSuggestions(e.target.value);
  });

  // Close suggestions on outside click
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !suggestionsList.contains(e.target)) {
      suggestionsList.classList.remove('is-visible');
    }
  });

  function goToSearchResults() {
    const query = input.value.trim();
    if (query) {
      window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
  }

  searchBtn?.addEventListener('click', goToSearchResults);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') goToSearchResults();
  });
}

/**
 * Escape HTML special characters to avoid injection when rendering
 * user-typed search queries back into the DOM.
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- 6. FLASH SALE COUNTDOWN TIMER ---------- */

function initFlashSaleTimer() {
  const hoursEl = document.getElementById('timerHours');
  const minutesEl = document.getElementById('timerMinutes');
  const secondsEl = document.getElementById('timerSeconds');
  if (!hoursEl || !minutesEl || !secondsEl) return;

  // Persist a single end-time in localStorage so the countdown is
  // consistent across page reloads instead of resetting every time.
  const STORAGE_KEY = 'sm_flash_sale_end';
  let endTime = storageGet(STORAGE_KEY, null);

  const now = Date.now();
  if (!endTime || endTime < now) {
    // Set a fresh 6-hour countdown window
    endTime = now + 6 * 60 * 60 * 1000;
    storageSet(STORAGE_KEY, endTime);
  }

  function pad(num) { return String(num).padStart(2, '0'); }

  function tick() {
    const remaining = endTime - Date.now();

    if (remaining <= 0) {
      // Reset for a new sale window once the timer hits zero
      endTime = Date.now() + 6 * 60 * 60 * 1000;
      storageSet(STORAGE_KEY, endTime);
    }

    const totalSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
}

/* ---------- 7. QUICK VIEW MODAL (shell — content filled by products.js) ---------- */

function initQuickViewModal() {
  const overlay = document.getElementById('quickViewOverlay');
  const closeBtn = document.getElementById('quickViewClose');
  if (!overlay || !closeBtn) return;

  function closeModal() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);

  // Close when clicking the dark overlay (but not the modal itself)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
  });

  // Expose open/close globally so products.js can trigger it
  window.openQuickView = function (contentHtml) {
    const content = document.getElementById('quickViewContent');
    if (content) content.innerHTML = contentHtml;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };
  window.closeQuickView = closeModal;
}

/* ---------- 8. TRENDING SLIDER ARROW CONTROLS ---------- */

function initTrendingSlider() {
  const track = document.getElementById('trendingTrack');
  const prevBtn = document.getElementById('trendingPrev');
  const nextBtn = document.getElementById('trendingNext');
  if (!track || !prevBtn || !nextBtn) return;

  const scrollAmount = 260;

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
}

/* ---------- 9. FOOTER YEAR ---------- */

function setFooterYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- 10. INIT ON LOAD ---------- */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initCategoriesDropdown();
  initSearch();
  initFlashSaleTimer();
  initQuickViewModal();
  initTrendingSlider();
  setFooterYear();

  // updateCartBadge() is defined in cart.js but called here so every
  // page (which all load cart.js) reflects the current cart count on load.
  if (typeof updateCartBadge === 'function') updateCartBadge();
});