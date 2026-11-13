const products = [
  { id: 1, name: "The Sunday Shirt", detail: "Organic cotton · Cloud", price: 78, category: "Clothing", badge: "Bestseller", image: "photo-1598554747436-c9293d6a588f" },
  { id: 2, name: "Everyday Trouser", detail: "Relaxed linen · Olive", price: 112, category: "Clothing", badge: "New", image: "photo-1594633312681-425c7b97ccd1" },
  { id: 3, name: "Soft Form Tote", detail: "Recycled canvas · Natural", price: 48, category: "Accessories", badge: "", image: "photo-1590874103328-eac38a683ce7" },
  { id: 4, name: "The Weekend Knit", detail: "Cotton blend · Oat", price: 96, category: "Clothing", badge: "Almost gone", image: "photo-1576566588028-4147f3842f27" },
  { id: 5, name: "Daily Leather Belt", detail: "Responsibly made · Tan", price: 54, category: "Accessories", badge: "", image: "photo-1553062407-98eeb64c6a62" },
  { id: 6, name: "Easy Day Dress", detail: "TENCEL™ · Washed black", price: 128, category: "Clothing", badge: "New", image: "photo-1539109136881-3be0616acf4b" },
  { id: 7, name: "The Everyday Cap", detail: "Cotton twill · Sand", price: 38, category: "Accessories", badge: "", image: "photo-1588850561407-ed78c282e89b" },
  { id: 8, name: "Sunday Market Bag", detail: "Organic cotton · Stripe", price: 42, category: "Accessories", badge: "", image: "photo-1544816155-12df9643f363" },
];

const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const resultsCount = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty-state");
const cartDrawer = document.querySelector("#cart-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const cartItems = document.querySelector("#cart-items");
const toast = document.querySelector("#toast");

let activeFilter = "All";
let cart = [];
let toastTimer;

const formatPrice = (price) => `$${price.toFixed(2)}`;
const imageUrl = (image, width = 700) =>
  `https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=80`;

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  let visibleProducts = products.filter((product) => {
    const matchesCategory = activeFilter === "All" || product.category === activeFilter;
    const matchesSearch = `${product.name} ${product.detail} ${product.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  if (sortSelect.value === "low") visibleProducts = [...visibleProducts].sort((a, b) => a.price - b.price);
  if (sortSelect.value === "high") visibleProducts = [...visibleProducts].sort((a, b) => b.price - a.price);

  resultsCount.textContent = `${visibleProducts.length} thoughtfully made ${visibleProducts.length === 1 ? "piece" : "pieces"}`;
  emptyState.hidden = visibleProducts.length > 0;
  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${imageUrl(product.image)}" alt="${product.name} — ${product.detail}" loading="lazy" />
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
        <button class="quick-add" type="button" data-add="${product.id}" aria-label="Add ${product.name} to bag">Add to bag <span aria-hidden="true">+</span></button>
      </div>
      <div class="product-info">
        <div><h3 class="product-name">${product.name}</h3><p class="product-detail">${product.detail}</p></div>
        <p class="product-price">${formatPrice(product.price)}</p>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelector("#cart-count").textContent = itemCount;
  document.querySelector("#drawer-count").textContent = `(${itemCount})`;
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  document.querySelector("#cart-subtotal").textContent = formatPrice(subtotal);
  document.querySelector("#checkout-button").disabled = cart.length === 0;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Your bag is taking a little breather.</p>';
    return;
  }

  cartItems.innerHTML = cart.map((item) => `
    <article class="cart-item">
      <img src="${imageUrl(item.image, 180)}" alt="" />
      <div>
        <h3 class="cart-item-name">${item.name}</h3>
        <p class="cart-item-detail">${item.detail}</p>
        <div class="quantity-control" aria-label="Quantity for ${item.name}">
          <button type="button" data-quantity="${item.id}" data-change="-1" aria-label="Remove one ${item.name}">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-quantity="${item.id}" data-change="1" aria-label="Add one ${item.name}">+</button>
        </div>
      </div>
      <div><p class="cart-item-price">${formatPrice(item.price * item.quantity)}</p><button class="remove-item" type="button" data-remove="${item.id}">Remove</button></div>
    </article>
  `).join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function openCart() {
  cartDrawer.classList.add("is-open");
  drawerBackdrop.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
  document.querySelector("#close-cart").focus();
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  drawerBackdrop.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
  document.querySelector("#open-cart").focus();
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const product = products.find((item) => item.id === Number(button.dataset.add));
  const existingItem = cart.find((item) => item.id === product.id);
  if (existingItem) existingItem.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  renderCart();
  showToast(`${product.name} added to your bag`);
});

cartItems.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) {
    const item = cart.find((product) => product.id === Number(quantityButton.dataset.quantity));
    item.quantity += Number(quantityButton.dataset.change);
    if (item.quantity <= 0) cart = cart.filter((product) => product.id !== item.id);
    renderCart();
  }
  if (removeButton) {
    cart = cart.filter((product) => product.id !== Number(removeButton.dataset.remove));
    renderCart();
  }
});

document.querySelectorAll(".filter-chip").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.toggle("is-active", chip === button));
    renderProducts();
  });
});

document.querySelectorAll("[data-nav-filter]").forEach((link) => {
  link.addEventListener("click", () => {
    activeFilter = link.dataset.navFilter;
    document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.toggle("is-active", chip.dataset.filter === activeFilter));
    renderProducts();
  });
});

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
document.querySelector("#open-cart").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
drawerBackdrop.addEventListener("click", closeCart);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) closeCart();
});
document.querySelector("#checkout-button").addEventListener("click", () => {
  showToast("Checkout is coming soon. Thanks for stopping by!");
});
document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("#newsletter-message").textContent = "You're on the list. Talk soon!";
  event.currentTarget.reset();
});

renderProducts();
renderCart();
