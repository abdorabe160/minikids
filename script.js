let allProducts = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

let currentLanguage = localStorage.getItem("language") || "ar";

let currentPage = 1;
const productsPerPage = 8;

let searchValue = "";
let selectedCategory = "all";
let selectedSort = "default";

const translations = {
  ar: {
    cartTitle: "سلة التسوق",
    viewAll: "عرض الكل",
    checkout: "إتمام الطلب ←",
    securePayment: "الدفع آمن 🔒",
    total: "الإجمالي",
    products: "منتجات",
    category: "ملابس أطفال",
    emptyCart: "السلة فارغة",
    noProducts: "لا توجد منتجات مطابقة للبحث."
  },
  en: {
    cartTitle: "Shopping Cart",
    viewAll: "View all",
    checkout: "Checkout →",
    securePayment: "Secure payment 🔒",
    total: "Total",
    products: "items",
    category: "Kids clothing",
    emptyCart: "Your cart is empty",
    noProducts: "No products found."
  }
};

async function loadNavbar() {
  const navbarContainer = document.getElementById("navbar");
  if (!navbarContainer) return;

 
    const response = await fetch("navbar.html");
    const data = await response.text();
    navbarContainer.innerHTML = data;

    setupLanguage();
    
    if (document.querySelector(".top-slider")) {
      new Swiper(".top-slider", {
        loop: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false
        }
      });
    }

    const closeTopBar = document.getElementById("close-top-bar");
    const topBar = document.getElementById("top-bar");
    const cartOpen = document.getElementById("cart-open");
    
    if (closeTopBar && topBar) {
      closeTopBar.addEventListener("click", () => {
        topBar.style.display = "none";
      });
    }
    
    if (cartOpen) {
      cartOpen.addEventListener("click", openCart);
    }
    
    updateCart();
  

  const serchBtn = document.getElementById('serchBtn');
  const topSerch = document.getElementById('topSerch');
  const closeSerch = document.getElementById('closeSerch');
  const searchInput = topSerch ? topSerch.querySelector('input') : null;
  
 
  let searchOverlay = document.getElementById('search-overlay');
  if (!searchOverlay) {
    searchOverlay = document.createElement('div');
    searchOverlay.id = 'search-overlay';
    searchOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 998;
      display: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(searchOverlay);
  }


  let resultsContainer = document.getElementById('live-search-results');
  if (!resultsContainer && topSerch) {
    resultsContainer = document.createElement('div');
    resultsContainer.id = 'live-search-results';
    resultsContainer.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      max-height: 380px;
      overflow-y: auto;
      background: #ffffff;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      border-radius: 0 0 12px 12px;
      display: none;
      z-index: 10000;
      padding: 12px;
      direction: rtl;
    `;
    topSerch.style.position = 'relative';
    topSerch.appendChild(resultsContainer);
  }
  
  if (serchBtn && topSerch) {
    serchBtn.addEventListener('click', () => {
      topSerch.classList.add('viweSerch');
      if (closeSerch) closeSerch.style.display = 'flex';
      searchOverlay.style.display = 'block';
      setTimeout(() => searchOverlay.style.opacity = '1', 10);
      document.body.style.overflow = 'hidden';
      if (searchInput) searchInput.focus();
    });
  }
  

  if (closeSerch && topSerch) {
    closeSerch.addEventListener('click', closeSearchBox);
  }
  
  if (searchOverlay) {
    searchOverlay.addEventListener('click', closeSearchBox);
  }
  
  function closeSearchBox() {
    if (topSerch) topSerch.classList.remove('viweSerch');
    if (closeSerch) closeSerch.style.display = 'none';
    if (searchOverlay) {
      searchOverlay.style.opacity = '0';
      setTimeout(() => {
        searchOverlay.style.display = 'none';
      }, 300);
    }
    if (resultsContainer) resultsContainer.style.display = 'none';
    document.body.style.overflow = '';
  }

 
  if (searchInput && resultsContainer) {
    searchInput.addEventListener('input', function() {
      const query = this.value.trim().toLowerCase();

      if (query.length > 0) {
        const matchedProducts = allProducts.filter(product => 
          product.title.toLowerCase().includes(query) || 
          product.category.toLowerCase().includes(query)
        ).slice(0, 5); 

        resultsContainer.style.display = 'block';

        if (matchedProducts.length > 0) {
          resultsContainer.innerHTML = `
            <div style="padding: 8px 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #44v; font-size: 0.9rem;">
              نتائج البحث (${matchedProducts.length}):
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
              ${matchedProducts.map(prod => `
                <a href="product.html?id=${prod.id}" style="display: flex; align-items: center; gap: 10px; text-decoration: none; padding: 6px; border-radius: 6px; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'">
                  <img src="${prod.image}" alt="${prod.title}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 4px; border: 1px solid #eee;">
                  <div style="flex-grow: 1; overflow: hidden;">
                    <h4 style="font-size: 0.85rem; color: #333; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${prod.title}</h4>
                    <span style="font-size: 0.75rem; color: #d63384; font-weight: bold;">${prod.price} ج.م</span>
                  </div>
                </a>
              `)}
            </div>
          `;
        } else {
          resultsContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #777; font-size: 0.9rem;">
              لا توجد منتجات مطابقة لـ "${query}"
            </div>
          `;
        }
      } else {
        resultsContainer.style.display = 'none';
      }
    });
  }
}

loadNavbar();

function setupLanguage() {
  const languageToggle = document.getElementById("language-toggle");
  const languageDropdown = document.getElementById("language-dropdown");
  const languageOptions = document.querySelectorAll(".language-option");

  if (!languageToggle || !languageDropdown) return;

  languageToggle.addEventListener("click", () => {
    languageDropdown.classList.toggle("open");
  });

  languageOptions.forEach(option => {
    option.addEventListener("click", () => {
      changeLanguage(option.dataset.lang);
      languageDropdown.classList.remove("open");
    });
  });

  changeLanguage(currentLanguage);
}

function changeLanguage(language) {
  currentLanguage = language;
  localStorage.setItem("language", language);

  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;
    if (translations[language] && translations[language][key]) {
      element.textContent = translations[language][key];
    }
  });

  if (allProducts.length > 0) {
    if (document.getElementById("products")) {
      renderProducts();
    }
    if (document.getElementById("single-product")) {
      renderSingleProduct();
    }
  }

  updateCart();
}

async function loadFooter() {
  const footer = document.getElementById("footer");
  if (!footer) return;

  try {
    const response = await fetch("footer.html");
    const data = await response.text();
    footer.innerHTML = data;
  } catch (error) {
    console.error("خطأ في تحميل الفوتر:", error);
  }
}

loadFooter();

async function getProducts() {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    const data = await response.json();

    allProducts = data;

    if (document.getElementById("products")) {
      fillCategories();
      setupShopTools();
      renderProducts();
    }

    if (document.getElementById("single-product")) {
      renderSingleProduct();
    }

    updateCart();
  } catch (error) {
    console.error("خطأ في جلب المنتجات:", error);
  }
}

getProducts();

function renderSingleProduct() {
  const container = document.getElementById("single-product");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const productId = Number(params.get("id"));

  const product = allProducts.find(p => Number(p.id) === productId);

  if (!product) {
    container.innerHTML = "<h2 style='text-align:center; padding: 60px;'>جاري التحميل أو المنتج غير موجود...</h2>";
    return;
  }

  const rate = product.rating?.rate || 4.5;
  const count = product.rating?.count || 12;

  const related = allProducts
    .filter(p => p.category === product.category && Number(p.id) !== productId)
    .slice(0, 4);

  container.innerHTML = `
    <div class="breadcrumb-section">
      <ul class="breadcrumb">
        <li><a href="index.html">الرئيسية</a></li>
        <li><a href="shop.html">المتجر</a></li>
        <li class="active">${product.title}</li>
      </ul>
    </div>

    <div class="single-product-wrapper">
      <div class="product-gallery">
        <div class='sticky'>
          <div class="main-image-box">
            <span class="discount-tag">خصم مميز</span>
            <img id="main-product-img" src="${product.image}" alt="${product.title}" />
          </div>
          <div class="thumbnails-grid">
            <img class="thumbnail active" src="${product.image}" alt="صورة 1" onclick="changeMainImage(this.src, this)" />
            <img class="thumbnail" src="${product.image}" alt="صورة 2" onclick="changeMainImage(this.src, this)" />
            <img class="thumbnail" src="${product.image}" alt="صورة 3" onclick="changeMainImage(this.src, this)" />
          </div>
        </div>
      </div>

      <div class="product-details-info">
        <span class="product-category-badge">${product.category}</span>
        <h1 class="product-title">${product.title}</h1>
        
        <div class="rating-stock-row">
          <div class="rating-stars">
            <i class="fa-solid fa-star"></i>
            <span>${rate} (${count} تقييم)</span>
          </div>
          <span class="stock-badge in-stock">
            <i class="fa-solid fa-circle-check"></i> متوفر في المخزون
          </span>
        </div>

        <div class="product-price-box">
          <span class="current-price">${product.price} ج.م</span>
        </div>

        <p class="product-short-desc">${product.description}</p>

        <div class="product-options">
          <label>المقاس:</label>
          <div class="size-options">
            <button type="button" class="size-btn active">S</button>
            <button type="button" class="size-btn">M</button>
            <button type="button" class="size-btn">L</button>
            <button type="button" class="size-btn">XL</button>
          </div>
        </div>

        <div class="purchase-action-row">
          <div class="quantity-selector">
            <button type="button" class="qty-btn" onclick="adjustDetailQty(-1)">-</button>
            <input type="number" id="detail-qty" value="1" min="1" readonly />
            <button type="button" class="qty-btn" onclick="adjustDetailQty(1)">+</button>
          </div>

          <button class="add-cart btn-add-to-cart-lg" 
                  data-id="${product.id}" 
                  data-title="${encodeURIComponent(product.title)}" 
                  data-price="${product.price}" 
                  data-image="${product.image}" 
                  data-category="${product.category}">
            <i class="fa-solid fa-bag-shopping"></i> إضافة إلى السلة
          </button>
        </div>

        <div class="trust-features">
          <div class="trust-item">
            <i class="fa-solid fa-truck-fast"></i>
            <span>شحن سريع لجميع المحافظات</span>
          </div>
          <div class="trust-item">
            <i class="fa-solid fa-shield-halved"></i>
            <span>ضمان إرجاع خلال 14 يوم</span>
          </div>
          <div class="trust-item">
            <i class="fa-solid fa-money-bill-wave"></i>
            <span>الدفع عند الاستلام</span>
          </div>
        </div>
      </div>
    </div>

    <section class="product-tabs-section">
      <div class="tabs-header">
        <button type="button" class="tab-btn active" onclick="switchTab('tab-desc', this)">الوصف التفصيلي</button>
        <button type="button" class="tab-btn" onclick="switchTab('tab-specs', this)">المواصفات</button>
        <button type="button" class="tab-btn" onclick="switchTab('tab-reviews', this)">التقييمات (${count})</button>
      </div>

      <div class="tabs-content">
        <div id="tab-desc" class="tab-pane active">
          <p>${product.description}</p>
        </div>

        <div id="tab-specs" class="tab-pane">
          <table class="specs-table">
            <tr>
              <th>التصنيف</th>
              <td>${product.category}</td>
            </tr>
            <tr>
              <th>التقييم العام</th>
              <td>${rate} من 5</td>
            </tr>
            <tr>
              <th>حالة التوفر</th>
              <td>متوفر في المخزون جاهز للشحن</td>
            </tr>
          </table>
        </div>

        <div id="tab-reviews" class="tab-pane">
          <div class="reviews-list">
            <div class="review-item">
              <div class="review-header">
                <strong>عميل مصدق</strong>
                <span class="stars">★★★★★</span>
              </div>
              <p>منتج ممتاز وجودة عالية جداً، والتوصيل كان سريع جداً.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    ${related.length > 0 ? `
      <section class="related-products-section">
        <h2>منتجات ذات صلة</h2>
        <div class="products-grid-related">
          ${related.map(rel => `
            <div class="product-card">
              <a href="product.html?id=${rel.id}">
                <div class="product-image">
                  <img src="${rel.image}" alt="${rel.title}">
                </div>
              </a>
              <div class="product-info">
                <p class="category">${rel.category}</p>
                <a href="product.html?id=${rel.id}">
                  <h3>${rel.title}</h3>
                </a>
                <div class="product-bottom">
                  <div class="price">
                    <span class="new-price">${rel.price} ج.م</span>
                  </div>
                  <button class="add-cart" 
                          data-id="${rel.id}" 
                          data-title="${encodeURIComponent(rel.title)}" 
                          data-price="${rel.price}" 
                          data-image="${rel.image}" 
                          data-category="${rel.category}">
                    <i class="fa-solid fa-bag-shopping"></i> اضف إلى السلة
                  </button>
                </div>
              </div>
            </div>
          `)}
        </div>
      </section>
    ` : ''}
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("cart.html")) {
    renderCartPage();
  }
  if (window.location.pathname.includes("checkout.html")) {
    renderCheckoutSummary();
  }
  updateCartCount();
});

function renderCartPage() {
  const cartItemsContainer = document.querySelector(".cart-items-section");
  const cartCountLabel = document.querySelector(".cart-items-count-label");
  const subtotalElement = document.querySelector(".summary-row span:nth-child(2)");
  const totalPriceElement = document.querySelector(".total-price"); 
  
  let cartData = JSON.parse(localStorage.getItem("cart")) || [];

  if (cartData.length === 0) {
    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart-message" style="text-align: center; padding: 30px;">
          <p>سلتك فارغة، لم تقم بإضافة أي منتجات بعد.</p>
          <a href="shop.html" class="checkout-page-btn" style="display: inline-block; width: auto; padding: 10px 20px; margin-top: 15px;">متابعة التسوق</a>
        </div>
      `;
    }
    if (cartCountLabel) cartCountLabel.textContent = "0 منتجات";
    if (subtotalElement) subtotalElement.textContent = "0.00 ج.م";
    if (totalPriceElement) totalPriceElement.textContent = "0.00 ج.م";
    return;
  }

  if (cartCountLabel) cartCountLabel.textContent = `${cartData.reduce((sum, item) => sum + (item.quantity || 1), 0)} منتج`;

  let subtotal = 0;
  let htmlContent = "";

  cartData.forEach((item, index) => {
    let itemTotal = Number(item.price) * (item.quantity || 1);
    subtotal += itemTotal;

    htmlContent += `
      <div class="cart-page-item" data-index="${index}">
        <div class="item-info-right">
          <img src="${item.image || 'image-missing-svgrepo-com.svg'}" alt="${item.title}">
          <div class="item-text-details">
            <h3>${item.title}</h3>
          </div>
        </div>

        <div class="item-price-quantity">
          <span class="item-price">${itemTotal.toFixed(2)} ج.م</span>
          <div class="quantity-controls">
            <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
            <span class="qty-num">${item.quantity || 1}</span>
            <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
          </div>
          <button class="delete-item-btn" onclick="removeItem(${index})">
            <i class="fa-regular fa-trash-can"></i> حذف
          </button>
        </div>
      </div>
    `;
  });

  if (cartItemsContainer) {
    cartItemsContainer.innerHTML = htmlContent;
  }

  let shippingCost = 0;
  let total = subtotal + shippingCost;

  if (subtotalElement) subtotalElement.textContent = `${subtotal.toFixed(2)} ج.م`;
  if (totalPriceElement) totalPriceElement.textContent = `${total.toFixed(2)} ج.م`;
}

function updateQuantity(index, change) {
  let cartData = JSON.parse(localStorage.getItem("cart")) || [];
  if (cartData[index]) {
    cartData[index].quantity = (cartData[index].quantity || 1) + change;
    if (cartData[index].quantity <= 0) {
      cartData[index].quantity = 1;
    }
    localStorage.setItem("cart", JSON.stringify(cartData));
    cart = cartData;
    renderCartPage();
    updateCart();
    updateCartCount();
  }
}

function removeItem(index) {
  let cartData = JSON.parse(localStorage.getItem("cart")) || [];
  cartData.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cartData));
  cart = cartData;
  renderCartPage();
  updateCart();
  updateCartCount();
}

function changeMainImage(src, element) {
  const mainImg = document.getElementById("main-product-img");
  if (mainImg) mainImg.src = src;
  
  document.querySelectorAll(".thumbnail").forEach(thumb => thumb.classList.remove("active"));
  element.classList.add("active");
}

function adjustDetailQty(amount) {
  const qtyInput = document.getElementById("detail-qty");
  if (!qtyInput) return;
  
  let currentVal = parseInt(qtyInput.value) || 1;
  currentVal += amount;
  if (currentVal < 1) currentVal = 1;
  qtyInput.value = currentVal;
}

function switchTab(tabId, element) {
  document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));

  const selectedPane = document.getElementById(tabId);
  if (selectedPane) selectedPane.classList.add("active");
  element.classList.add("active");
}

function fillCategories() {
  const categoryFilter = document.getElementById("category-filter");
  if (!categoryFilter) return;

  const categories = [...new Set(
    allProducts.map(product => product.category)
  )];

  categoryFilter.innerHTML = `
    <option value="all">كل التصنيفات</option>
  `;

  categories.forEach(category => {
    categoryFilter.innerHTML += `
      <option value="${category}">${category}</option>
    `;
  });
}

function setupShopTools() {
  const searchInput = document.getElementById("product-search");
  const categoryFilter = document.getElementById("category-filter");
  const sortFilter = document.getElementById("sort-filter");

  if (!searchInput || !categoryFilter || !sortFilter) return;

  searchInput.addEventListener("input", event => {
    searchValue = event.target.value;
    currentPage = 1;
    renderProducts();
  });

  categoryFilter.addEventListener("change", event => {
    selectedCategory = event.target.value;
    currentPage = 1;
    renderProducts();
  });

  sortFilter.addEventListener("change", event => {
    selectedSort = event.target.value;
    currentPage = 1;
    renderProducts();
  });
}

function renderProducts() {
  const productsContainer = document.getElementById("products");
  const pagination = document.getElementById("pagination");

  if (!productsContainer) return;

  let filteredProducts = [...allProducts];

  filteredProducts = filteredProducts.filter(product => {
    return product.title
      .toLowerCase()
      .includes(searchValue.toLowerCase());
  });

  if (selectedCategory !== "all") {
    filteredProducts = filteredProducts.filter(product => {
      return product.category === selectedCategory;
    });
  }

  if (selectedSort === "low-price") {
    filteredProducts.sort((a, b) => a.price - b.price);
  }

  if (selectedSort === "high-price") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  const totalPages = Math.ceil(
    filteredProducts.length / productsPerPage
  );

  if (currentPage > totalPages) {
    currentPage = 1;
  }

  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;

  const visibleProducts = filteredProducts.slice(start, end);

  if (visibleProducts.length === 0) {
    productsContainer.innerHTML = `
      <p>${translations[currentLanguage]?.noProducts || "لا توجد منتجات."}</p>
    `;

    if (pagination) {
      pagination.innerHTML = "";
    }
    return;
  }

  productsContainer.innerHTML = visibleProducts.map(product => `
    <div class="product-card">
      <a href="product.html?id=${product.id}">
        <div class="product-image">
          <img src="${product.image}" alt="${product.title}">
        </div>
      </a>

      <div class="product-info">
        <p class="category">${product.category}</p>
        <a href="product.html?id=${product.id}">
          <h3>${product.title}</h3>
        </a>

        <div class="product-bottom">
          <div class="price">
            <span class="new-price">${product.price} ج.م</span>
          </div>

          <button class="add-cart" 
                  data-id="${product.id}" 
                  data-title="${encodeURIComponent(product.title)}" 
                  data-price="${product.price}" 
                  data-image="${product.image}" 
                  data-category="${product.category}">
            <i class="fa-solid fa-bag-shopping"></i> اضف إلى السلة
          </button>
        </div>
      </div>
    </div>
  `);

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  pagination.innerHTML = "";

  for (let page = 1; page <= totalPages; page++) {
    pagination.innerHTML += `
      <button
        class="page-button ${page === currentPage ? "active" : ""}"
        data-page="${page}"
      >
        ${page}
      </button>
    `;
  }
}

function openCart() {
  const cartDrawer = document.getElementById("cart-drawer");
  const cartOverlay = document.getElementById("cart-overlay");

  if (!cartDrawer || !cartOverlay) return;

  cartDrawer.classList.add("active");
  cartOverlay.classList.add("active");

  document.body.style.overflow = "hidden";
}

function closeCart() {
  const cartDrawer = document.getElementById("cart-drawer");
  const cartOverlay = document.getElementById("cart-overlay");

  if (!cartDrawer || !cartOverlay) return;

  cartDrawer.classList.remove("active");
  cartOverlay.classList.remove("active");

  document.body.style.overflow = "";
}

function renderCheckoutSummary() {
  const itemsContainer = document.getElementById("checkout-cart-items");
  const subtotalElement = document.getElementById("checkout-subtotal");
  const shippingElement = document.getElementById("checkout-shipping");
  const totalElement = document.getElementById("checkout-total");

  if (!itemsContainer) return;

  let cartData = JSON.parse(localStorage.getItem("cart")) || [];

  if (cartData.length === 0) {
    itemsContainer.innerHTML = `<p style="text-align: center; color: #777; padding: 15px;">السلة فارغة</p>`;
    if (subtotalElement) subtotalElement.textContent = "0.00 ج.م";
    if (shippingElement) shippingElement.textContent = "0.00 ج.م";
    if (totalElement) totalElement.textContent = "0.00 ج.م";
    return;
  }

  let subtotal = 0;
  let html = "";

  cartData.forEach(item => {
    let itemTotal = Number(item.price) * (item.quantity || 1);
    subtotal += itemTotal;

    html += `
      <div class="checkout-mini-item">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${item.image || 'image-missing-svgrepo-com.svg'}" alt="${item.title}">
          <div>
            <h4 style="font-size: 0.85rem; color: #333; margin-bottom: 3px;">${item.title}</h4>
            <span style="font-size: 0.75rem; color: #777;">الكمية: ${item.quantity || 1}</span>
          </div>
        </div>
        <span style="font-weight: bold; font-size: 0.9rem; color: #2f3542;">${itemTotal.toFixed(2)} ج.م</span>
      </div>
    `;
  });

  itemsContainer.innerHTML = html;

  let shippingCost = 0;
  let total = subtotal + shippingCost;

  if (subtotalElement) subtotalElement.textContent = `${subtotal.toFixed(2)} ج.م`;
  if (shippingElement) shippingElement.textContent = shippingCost === 0 ? "مجاني" : `${shippingCost.toFixed(2)} ج.م`;
  if (totalElement) totalElement.textContent = `${total.toFixed(2)} ج.م`;
}

function updateCartCount() {
  let cartData = JSON.parse(localStorage.getItem("cart")) || [];
  let totalCount = cartData.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartCountEl = document.getElementById("cart-count");
  if (cartCountEl) {
    cartCountEl.textContent = totalCount;
  }
}

function updateCart() {
  localStorage.setItem("cart", JSON.stringify(cart));

  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");
  const cartProductsCount = document.getElementById("cart-products-count");
  const cartTableBody = document.getElementById("cart-table-body");

  const totalQuantity = cart.reduce((total, product) => total + Number(product.quantity || 1), 0);
  const totalPrice = cart.reduce((total, product) => total + (Number(product.price) * Number(product.quantity || 1)), 0);

  if (cartCount) cartCount.textContent = totalQuantity;
  if (cartProductsCount) cartProductsCount.textContent = `${totalQuantity} ${translations[currentLanguage]?.products || "منتجات"}`;
  if (cartTotal) cartTotal.textContent = `${totalPrice.toFixed(2)} ج.م`;

  if (cartItems) {
    if (cart.length === 0) {
      cartItems.innerHTML = `
        <p style="padding: 20px; text-align: center;">
          ${translations[currentLanguage]?.emptyCart || "السلة فارغة"}
        </p>
      `;
    } else {
      cartItems.innerHTML = cart.map(product => `
        <div class="cart-item">
          <button class="remove-item" data-id="${product.id}">×</button>

          <img src="${product.image}" alt="${product.title}">

          <div class="item-details">
            <h3>${product.title}</h3>

            <div class="quantity">
              <button class="plus" data-id="${product.id}">+</button>

              <span class="quantity-number">${product.quantity || 1}</span>

              <button class="minus" data-id="${product.id}">−</button>
            </div>
          </div>

          <strong class="item-price">
            ${(Number(product.price) * Number(product.quantity || 1)).toFixed(2)} ج.م
          </strong>
        </div>
      `).join('');
    }
  }

  if (cartTableBody) {
    if (cart.length === 0) {
      cartTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">السلة فارغة</td></tr>`;
    } else {
      cartTableBody.innerHTML = cart.map(product => `
        <tr>
          <td><img src="${product.image}" width="50" alt="${product.title}"></td>
          <td>${product.title}</td>
          <td>
            <button class="minus" data-id="${product.id}">-</button>
            <span>${product.quantity || 1}</span>
            <button class="plus" data-id="${product.id}">+</button>
          </td>
          <td>${(Number(product.price) * Number(product.quantity || 1)).toFixed(2)} ج.م</td>
          <td><button class="remove-item" data-id="${product.id}">إزالة</button></td>
        </tr>
      `).join('');
    }
  }
}

document.addEventListener("click", event => {
  const addButton = event.target.closest(".add-cart");
  const plusButton = event.target.closest(".plus");
  const minusButton = event.target.closest(".minus");
  const removeButton = event.target.closest(".remove-item");
  const closeButton = event.target.closest("#cart-close");
  const overlay = event.target.closest("#cart-overlay");
  const pageButton = event.target.closest(".page-button");
  const sizeButton = event.target.closest(".size-btn");

  if (sizeButton) {
    document.querySelectorAll(".size-btn").forEach(btn => btn.classList.remove("active"));
    sizeButton.classList.add("active");
  }

  if (addButton) {
    event.preventDefault();
    event.stopPropagation();

    const productId = Number(addButton.dataset.id);
    const qtyInput = document.getElementById("detail-qty");
    const quantityToAdd = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

    const existingProduct = cart.find(product => Number(product.id) === productId);

    if (existingProduct) {
      existingProduct.quantity = (existingProduct.quantity || 1) + quantityToAdd;
    } else {
      const selectedProduct = allProducts.find(product => Number(product.id) === productId);

      const productToAdd = selectedProduct ? {
        id: Number(selectedProduct.id),
        title: selectedProduct.title,
        price: Number(selectedProduct.price),
        image: selectedProduct.image,
        category: selectedProduct.category
      } : {
        id: productId,
        title: decodeURIComponent(addButton.dataset.title || ""),
        price: Number(addButton.dataset.price),
        image: addButton.dataset.image,
        category: addButton.dataset.category
      };

      cart.push({
        ...productToAdd,
        quantity: quantityToAdd
      });
    }

    updateCart();
    openCart();
  }

  if (plusButton) {
    const productId = Number(plusButton.dataset.id);
    const product = cart.find(product => Number(product.id) === productId);

    if (product) {
      product.quantity = (product.quantity || 1) + 1;
      updateCart();
    }
  }

  if (minusButton) {
    const productId = Number(minusButton.dataset.id);
    const product = cart.find(product => Number(product.id) === productId);

    if (!product) return;

    if ((product.quantity || 1) > 1) {
      product.quantity--;
    } else {
      cart = cart.filter(product => Number(product.id) !== productId);
    }

    updateCart();
  }

  if (removeButton) {
    const productId = Number(removeButton.dataset.id);
    cart = cart.filter(product => Number(product.id) !== productId);
    updateCart();
  }

  if (closeButton || overlay) {
    closeCart();
  }

  if (pageButton) {
    currentPage = Number(pageButton.dataset.page);
    renderProducts();
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
});

if (document.querySelector(".hero-slider")) {
  new Swiper(".hero-slider", {
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false
    },
    navigation: {
      nextEl: ".hero-slider .swiper-button-next",
      prevEl: ".hero-slider .swiper-button-prev"
    }
  });
}

if (document.querySelector(".testimonials-slider")) {
  new Swiper(".testimonials-slider", {
    loop: true,
    spaceBetween: 20,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false
    },
    pagination: {
      el: ".testimonials-slider .swiper-pagination",
      clickable: true
    },
    breakpoints: {
      0: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1100: { slidesPerView: 3 }
    }
  });
}

if (document.querySelector(".brands-slider")) {
  new Swiper(".brands-slider", {
    loop: true,
    spaceBetween: 20,
    speed: 5000,
    autoplay: {
      delay: 0,
      disableOnInteraction: false
    },
    allowTouchMove: false,
    breakpoints: {
      0: { slidesPerView: 2 },
      576: { slidesPerView: 3 },
      768: { slidesPerView: 4 },
      1100: { slidesPerView: 5 }
    }
  });
}