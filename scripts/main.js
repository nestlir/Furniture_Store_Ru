const STORAGE_PRODUCTS = "rus-products-v1";
const STORAGE_CART = "rus-cart-v1";
const SELLER_PASSWORD_HASH = "633e0ae6a9a36f75cbd960f0c75fe7b4fe1cbae6e9205e8af203bcd33a52fb8c";

document.body.classList.add("is-animated");

const defaultProducts = [
  {
    id: "sofa-porto",
    title: "Диван Porto",
    category: "Мягкая мебель",
    price: 89900,
    size: "245 x 105 x 82 см",
    image: "images/hero.jpg",
    description: "Светлый модульный диван для гостиной, мягкая посадка, спокойная фактура ткани.",
    tag: "Хит"
  },
  {
    id: "table-livia",
    title: "Обеденная группа Livia",
    category: "Столы и стулья",
    price: 126000,
    size: "Стол 180 x 90 см, 6 стульев",
    image: "images/about.jpg",
    description: "Деревянный стол и мягкие стулья для кухни-гостиной, кафе или апартаментов.",
    tag: "Премиум"
  },
  {
    id: "chair-nord",
    title: "Кресло Nord",
    category: "Мягкая мебель",
    price: 46200,
    size: "92 x 88 x 96 см",
    image: "images/contact.jpg",
    description: "Уютное кресло с высокой спинкой и фактурной тканью для спальни или зоны отдыха.",
    tag: "В наличии"
  },
  {
    id: "bed-rimini",
    title: "Спальня Rimini",
    category: "Спальни",
    price: 154000,
    size: "Кровать 160/180, тумбы, комод",
    image: "images/hero.jpg",
    description: "Комплект для спокойной спальни: мягкое изголовье, натуральные оттенки, хранение.",
    tag: "Под заказ"
  },
  {
    id: "wardrobe-line",
    title: "Шкаф Line",
    category: "Корпусная мебель",
    price: 73500,
    size: "220 x 60 x 240 см",
    image: "images/about.jpg",
    description: "Лаконичный шкаф для прихожей или спальни с продуманной внутренней организацией.",
    tag: "Новинка"
  },
  {
    id: "hotel-set",
    title: "Комплектация гостиниц",
    category: "Проекты",
    price: 0,
    size: "Расчёт по проекту",
    image: "images/contact.jpg",
    description: "Подбор мебели для отелей, апартаментов и гостевых домов Сочи, Адлера и Абхазии.",
    tag: "B2B"
  }
];

let products = readJSON(STORAGE_PRODUCTS, defaultProducts);
let cart = readJSON(STORAGE_CART, []);
let activeCategory = "all";
let activePrice = "all";
let searchTerm = "";

const productGrid = document.querySelector("[data-products]");
const categoryFilter = document.querySelector("[data-category-filter]");
const searchInput = document.querySelector("[data-search]");
const cartCount = document.querySelector("[data-cart-count]");
const productDialog = document.querySelector("[data-product-dialog]");
const productDetail = document.querySelector("[data-product-detail]");
const cartDialog = document.querySelector("[data-cart-dialog]");
const cartList = document.querySelector("[data-cart-list]");
const sendRequest = document.querySelector("[data-send-request]");
const toast = document.querySelector("[data-toast]");

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function formatPrice(price) {
  if (!Number(price)) return "по запросу";
  return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function priceMatches(product) {
  const price = Number(product.price);
  if (activePrice === "economy") return price > 0 && price < 50000;
  if (activePrice === "middle") return price >= 50000 && price <= 120000;
  if (activePrice === "premium") return price > 120000;
  return true;
}

function filteredProducts() {
  return products.filter((product) => {
    const text = [product.title, product.category, product.description].join(" ").toLowerCase();
    const categoryMatches = activeCategory === "all" || product.category === activeCategory;
    return categoryMatches && priceMatches(product) && text.includes(searchTerm);
  });
}

function renderCategories() {
  const categories = [...new Set(products.map((product) => product.category))].sort();
  categoryFilter.innerHTML = '<option value="all">Все категории</option>' +
    categories.map((category) => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join("");
  categoryFilter.value = activeCategory;
}

function renderProducts() {
  const items = filteredProducts();
  productGrid.innerHTML = items.length
    ? items.map((product) => `
      <article class="product-card reveal is-visible">
        <button class="product-card__image" type="button" data-view-product="${product.id}">
          <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.title)}" loading="lazy">
          <span>${escapeHTML(product.tag || "В каталоге")}</span>
        </button>
        <div class="product-card__body">
          <div>
            <p>${escapeHTML(product.category)}</p>
            <h3>${escapeHTML(product.title)}</h3>
          </div>
          <strong>${formatPrice(product.price)}</strong>
          <span>${escapeHTML(product.size || "Размер уточняется")}</span>
          <div class="product-card__actions">
            <button class="button button_primary" type="button" data-add-cart="${product.id}">В заявку</button>
            <button class="button button_icon" type="button" aria-label="Подробнее" data-view-product="${product.id}">
              <i class="bi bi-arrow-up-right"></i>
            </button>
            ${product.custom ? `<button class="button button_icon" type="button" aria-label="Удалить товар" data-delete-product="${product.id}"><i class="bi bi-trash"></i></button>` : ""}
          </div>
        </div>
      </article>
    `).join("")
    : '<div class="empty-state">По этим фильтрам ничего не найдено. Попробуйте изменить запрос.</div>';
}

function updateCartCount() {
  cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

function addToCart(id) {
  const existing = cart.find((item) => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  writeJSON(STORAGE_CART, cart);
  updateCartCount();
  showToast("Товар добавлен в заявку");
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  writeJSON(STORAGE_CART, cart);
  renderCart();
  updateCartCount();
}

function openProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  productDetail.innerHTML = `
    <div class="product-detail">
      <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.title)}">
      <div>
        <p>${escapeHTML(product.category)}</p>
        <h2>${escapeHTML(product.title)}</h2>
        <strong>${formatPrice(product.price)}</strong>
        <span>${escapeHTML(product.size || "Размер уточняется")}</span>
        <p>${escapeHTML(product.description)}</p>
        <button class="button button_primary" type="button" data-add-cart="${product.id}">Добавить в заявку</button>
      </div>
    </div>
  `;
  productDialog.showModal();
}

function renderCart() {
  const detailed = cart
    .map((cartItem) => ({ ...products.find((product) => product.id === cartItem.id), qty: cartItem.qty }))
    .filter((item) => item.id);

  cartList.innerHTML = detailed.length
    ? detailed.map((item) => `
      <div class="cart-item">
        <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title)}">
        <div>
          <h3>${escapeHTML(item.title)}</h3>
          <span>${item.qty} шт. · ${formatPrice(item.price)}</span>
        </div>
        <button type="button" aria-label="Удалить из заявки" data-remove-cart="${item.id}">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    `).join("")
    : '<p class="empty-state">Заявка пока пустая. Добавьте товары из каталога.</p>';

  const message = detailed.length
    ? "Заявка для MAX на номер +7 (906) 435-18-43: " +
      detailed.map((item) => `${item.title} (${item.qty} шт.)`).join(", ")
    : "Напишите в MAX на номер +7 (906) 435-18-43, чтобы получить консультацию по мебели.";
  sendRequest.href = "https://max.ru/";
  sendRequest.setAttribute("aria-label", message);
  sendRequest.title = message;
}

function deleteProduct(id) {
  products = products.filter((product) => product.id !== id);
  cart = cart.filter((item) => item.id !== id);
  writeJSON(STORAGE_PRODUCTS, products);
  writeJSON(STORAGE_CART, cart);
  renderCategories();
  renderProducts();
  updateCartCount();
  showToast("Товар удалён");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button, a");
  if (!target) return;

  if (target.matches("[data-add-cart]")) addToCart(target.dataset.addCart);
  if (target.matches("[data-view-product]")) openProduct(target.dataset.viewProduct);
  if (target.matches("[data-delete-product]")) deleteProduct(target.dataset.deleteProduct);
  if (target.matches("[data-open-cart]")) {
    renderCart();
    cartDialog.showModal();
  }
  if (target.matches("[data-close-dialog]")) productDialog.close();
  if (target.matches("[data-close-cart]")) cartDialog.close();
  if (target.matches("[data-remove-cart]")) removeFromCart(target.dataset.removeCart);
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderProducts();
});

categoryFilter.addEventListener("change", (event) => {
  activeCategory = event.target.value;
  renderProducts();
});

document.querySelector("[data-price-filter]").addEventListener("click", (event) => {
  const button = event.target.closest("[data-price]");
  if (!button) return;
  activePrice = button.dataset.price;
  document.querySelectorAll("[data-price]").forEach((item) => item.classList.toggle("is-active", item === button));
  renderProducts();
});

const header = document.querySelector("[data-header]");
window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
});

const burger = document.querySelector("[data-burger]");
const nav = document.querySelector("[data-nav]");
burger.addEventListener("click", () => {
  const expanded = burger.getAttribute("aria-expanded") === "true";
  burger.setAttribute("aria-expanded", String(!expanded));
  nav.classList.toggle("is-open");
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    burger.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".site-nav a")];
const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle("is-active", link.hash === `#${entry.target.id}`));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
sections.forEach((section) => activeObserver.observe(section));

document.querySelector("[data-logo-link]").addEventListener("click", (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const sellerLogin = document.querySelector("[data-seller-login]");
const sellerFields = document.querySelector("[data-seller-fields]");
document.querySelector("[data-seller-login-button]").addEventListener("click", async () => {
  const password = document.querySelector("[data-seller-password]").value;
  if (await sha256(password) !== SELLER_PASSWORD_HASH) {
    showToast("Неверный пароль");
    return;
  }
  sellerLogin.hidden = true;
  sellerFields.hidden = false;
  showToast("Кабинет продавца открыт");
});

document.querySelector("[data-reset-products]").addEventListener("click", () => {
  products = defaultProducts;
  cart = [];
  writeJSON(STORAGE_PRODUCTS, products);
  writeJSON(STORAGE_CART, cart);
  renderCategories();
  renderProducts();
  updateCartCount();
  showToast("Демо-каталог восстановлен");
});

document.querySelector("[data-seller-form]").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const file = data.get("imageFile");
  let image = data.get("imageUrl") || "images/hero.jpg";

  if (file && file.size) {
    image = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  const product = {
    id: `custom-${Date.now()}`,
    title: data.get("title").trim(),
    category: data.get("category").trim(),
    price: Number(data.get("price")),
    size: data.get("size").trim(),
    description: data.get("description").trim(),
    image,
    tag: "Добавлено",
    custom: true
  };

  products = [product, ...products];
  writeJSON(STORAGE_PRODUCTS, products);
  form.reset();
  sellerLogin.hidden = true;
  sellerFields.hidden = false;
  renderCategories();
  renderProducts();
  showToast("Карточка товара опубликована");
});

renderCategories();
renderProducts();
updateCartCount();
