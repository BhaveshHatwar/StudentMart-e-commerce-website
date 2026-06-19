# 🎓 StudentMart

A portfolio-level, fully responsive e-commerce website concept for college students — inspired by Amazon + Flipkart. Built with **pure HTML, CSS, and Vanilla JavaScript**. No frameworks, no backend, no build step.

---

## 🚀 How to Run

No installation needed.

1. Download/copy the entire `studentmart` folder, keeping the structure intact (the `css/` and `js/` subfolders must sit next to the HTML files).
2. Double-click **`index.html`** (or right-click → Open With → your browser).
3. That's it — the whole site runs locally in your browser.

> 💡 Tip: For the smoothest experience (and to avoid any browser security warnings some browsers show for local files), you can also serve the folder with a simple local server, e.g. `npx serve .` or the VS Code "Live Server" extension. This is optional — plain double-click works fine too.

---

## 📁 Project Structure

```
studentmart/
├── index.html          → Homepage (hero, categories, featured/trending/flash-sale, benefits)
├── products.html        → Full catalog with search, category filter & sort
├── product.html          → Single product detail page (gallery, reviews, similar items)
├── cart.html            → Shopping cart (quantity, coupons, totals, checkout)
├── profile.html          → User profile (orders, wishlist, settings)
├── login.html            → Login / Signup with validation
├── css/
│   ├── style.css         → Design system, layout, components
│   └── responsive.css    → Mobile-first breakpoints
├── js/
│   ├── app.js             → Navbar, search, toasts, countdown timer, modal
│   ├── products.js        → Product catalog data + rendering
│   └── cart.js             → Cart, wishlist, coupon logic (LocalStorage)
└── assets/
    ├── images/            → (empty — see note below)
    └── icons/             → (empty — emoji icons used instead)
```

---

## ✨ Features

- **Home page** — sticky navbar with live search suggestions, animated hero, category grid, featured products, trending slider (snap-scroll), flash sale with a live countdown timer, and benefits section.
- **Products page** — category filter, sort by price/rating/popularity, and an in-page search box. Supports deep-linking via URL (`products.html?category=books` or `?search=lamp`).
- **Product detail page** — image gallery with thumbnails, quantity selector, Add to Cart / Buy Now / Wishlist, demo customer reviews, and similar-product recommendations.
- **Cart page** — quantity +/-, remove items, coupon codes, dynamic subtotal/discount/delivery/total, and a demo checkout flow.
- **Profile page** — avatar, tabbed navigation (Orders / Wishlist / Settings), demo order history, live wishlist, and an editable settings form.
- **Login/Signup page** — tab-based form switch, client-side validation, show/hide password toggle.
- **Persistence** — cart, wishlist, coupon, user session, and demo orders all persist across page reloads via `localStorage`.
- **Fully responsive** — mobile-first design with breakpoints at 1200px, 992px, 768px, 480px, and 360px, including a hamburger-menu mobile nav.

---

## 🛒 Try These Demo Coupon Codes (on `cart.html`)

| Code         | Discount |
|--------------|----------|
| `STUDENT10`  | 10% off  |
| `WELCOME15`  | 15% off  |
| `CAMPUS20`   | 20% off  |

---

## 🔐 Login / Signup

There's no real backend, so authentication is simulated:
- **Signup** stores your name/email in `localStorage` under the key `sm_user`.
- **Login** accepts any email (valid format) + password (6+ characters) and signs you in.
- Your session persists until you click **Logout** (on the navbar or profile sidebar).

---

## 🖼️ A Note on Images

Product visuals currently use **emoji icons** (📚 🎧 💻 💡 etc.) instead of photos. This keeps the project 100% self-contained and offline-friendly with zero external image dependencies.

To swap in real photos:
1. Drop your image files into `assets/images/`.
2. In `js/products.js`, add an `image: 'assets/images/yourfile.jpg'` field to a product object.
3. In `js/products.js`'s `renderProductCard()` function (and the gallery logic in `product.html`), replace the emoji `<span>` with an `<img src="${product.image}" alt="${product.name}">` tag.

---

## 🎨 Design System Reference

| Token              | Value      |
|---------------------|------------|
| Primary color        | `#2874F0`  |
| Secondary color       | `#1F2937`  |
| Background           | `#F7F9FC`  |
| Accent                | `#FFB800`  |
| Text                  | `#111827`  |
| Border radius         | `16px`     |
| Spacing system         | 8px scale  |
| Fonts                  | Poppins (headings), Inter (body) |

---

## 🧩 Browser Support

Works in all modern evergreen browsers (Chrome, Firefox, Edge, Safari). No polyfills included — uses standard ES6+ JavaScript, CSS Grid/Flexbox, and `localStorage`.

---

## 📜 License

This is a personal/portfolio demo project. Feel free to use, modify, and build on it for learning or showcase purposes.
