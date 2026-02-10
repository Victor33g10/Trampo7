// Credenciais administrativas simples para ambiente local.
const ADMIN_USER = "admin";
const ADMIN_PASS = "123456";

// Link fixo de pagamento solicitado. Todos os botões de comprar usam esse endereço.
const FIXED_PAYMENT_LINK = "https://pay.sunize.com.br/cstEdUUA";

const STORAGE_KEYS = {
  products: "vt_store_products_v2",
  orders: "vt_store_orders_v2",
  adminSession: "vt_store_admin_session_v2",
  users: "vt_store_users_v2",
  customerSession: "vt_store_customer_session_v2",
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80";

const state = {
  products: [],
  orders: [],
  users: [],
};

const el = {
  views: {
    store: document.getElementById("storeView"),
    auth: document.getElementById("authView"),
    detail: document.getElementById("detailView"),
    checkout: document.getElementById("checkoutView"),
    thanks: document.getElementById("thanksView"),
    adminLogin: document.getElementById("adminLoginView"),
    adminPanel: document.getElementById("adminPanelView"),
  },
  goStoreBtn: document.getElementById("goStoreBtn"),
  goAuthBtn: document.getElementById("goAuthBtn"),
  goAdminBtn: document.getElementById("goAdminBtn"),
  productGrid: document.getElementById("productGrid"),
  detailContent: document.getElementById("detailContent"),
  checkoutContent: document.getElementById("checkoutContent"),
  backToStoreBtn: document.getElementById("backToStoreBtn"),
  backFromCheckoutBtn: document.getElementById("backFromCheckoutBtn"),
  thanksBackStore: document.getElementById("thanksBackStore"),
  customerLoginForm: document.getElementById("customerLoginForm"),
  customerRegisterForm: document.getElementById("customerRegisterForm"),
  customerLoginFeedback: document.getElementById("customerLoginFeedback"),
  customerRegisterFeedback: document.getElementById("customerRegisterFeedback"),
  adminLoginForm: document.getElementById("adminLoginForm"),
  loginFeedback: document.getElementById("loginFeedback"),
  adminLogoutBtn: document.getElementById("adminLogoutBtn"),
  productForm: document.getElementById("productForm"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  formTitle: document.getElementById("formTitle"),
  adminProductList: document.getElementById("adminProductList"),
  ordersList: document.getElementById("ordersList"),
  statsCards: document.getElementById("statsCards"),
  fixedPaymentLink: document.getElementById("fixedPaymentLink"),
};

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function setView(viewName) {
  Object.values(el.views).forEach((view) => view.classList.remove("active"));
  el.views[viewName].classList.add("active", "fade-in");
  setTimeout(() => el.views[viewName].classList.remove("fade-in"), 500);
}

function attachRipple(button) {
  if (!button || button.dataset.rippleBound === "1") return;

  button.dataset.rippleBound = "1";
  button.addEventListener("click", (event) => {
    const circle = document.createElement("span");
    circle.className = "ripple";

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    circle.style.width = circle.style.height = `${size}px`;
    circle.style.left = `${event.clientX - rect.left - size / 2}px`;
    circle.style.top = `${event.clientY - rect.top - size / 2}px`;

    const oldRipple = button.querySelector(".ripple");
    if (oldRipple) oldRipple.remove();

    button.appendChild(circle);
    setTimeout(() => circle.remove(), 550);
  });
}

function bindRippleToAllButtons() {
  document.querySelectorAll(".btn").forEach(attachRipple);
}

function getCustomerSession() {
  return localStorage.getItem(STORAGE_KEYS.customerSession);
}

function setCustomerSession(email) {
  localStorage.setItem(STORAGE_KEYS.customerSession, email);
  el.goAuthBtn.textContent = `Conta: ${email}`;
}

function clearCustomerSession() {
  localStorage.removeItem(STORAGE_KEYS.customerSession);
  el.goAuthBtn.textContent = "Entrar";
}

function seedProducts() {
  return [
    ["Smartphone X Pro", "Tela OLED 120Hz e câmera tripla.", 3199, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80"],
    ["Notebook Slim", "Notebook leve para trabalho e estudos.", 4599, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80"],
    ["Headset Gamer", "Áudio imersivo e microfone com redução de ruído.", 399, "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=1000&q=80"],
    ["Smartwatch Fit", "Monitoramento de saúde e notificações.", 799, "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=1000&q=80"],
    ["Mouse Sem Fio", "Alta precisão e bateria duradoura.", 189, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80"],
    ["Teclado Mecânico", "Switches rápidos com iluminação RGB.", 429, "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1000&q=80"],
    ["Caixa de Som BT", "Som potente com graves reforçados.", 349, "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=1000&q=80"],
    ["Câmera Action", "Gravação 4K para esportes e viagens.", 1299, "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80"],
    ["Monitor 27\"", "Painel IPS com excelente fidelidade de cor.", 1599, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80"],
    ["SSD 1TB", "Velocidade alta para sistema e jogos.", 599, "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1000&q=80"],
  ].map(([name, description, price, image]) => ({
    id: crypto.randomUUID(),
    name,
    description,
    price,
    image,
    status: "ativo",
    createdAt: new Date().toISOString(),
  }));
}

function initData() {
  state.products = readJSON(STORAGE_KEYS.products, seedProducts());
  state.orders = readJSON(STORAGE_KEYS.orders, []);
  state.users = readJSON(STORAGE_KEYS.users, []);

  saveJSON(STORAGE_KEYS.products, state.products);
  saveJSON(STORAGE_KEYS.orders, state.orders);
  saveJSON(STORAGE_KEYS.users, state.users);

  const sessionEmail = getCustomerSession();
  if (sessionEmail) setCustomerSession(sessionEmail);
  el.fixedPaymentLink.textContent = FIXED_PAYMENT_LINK;
}

function findProduct(id) {
  return state.products.find((p) => p.id === id);
}

function renderStore() {
  const activeProducts = state.products.filter((p) => p.status === "ativo");
  if (!activeProducts.length) {
    el.productGrid.innerHTML = '<p class="empty">Nenhum produto ativo disponível no momento.</p>';
    return;
  }

  el.productGrid.innerHTML = activeProducts
    .map(
      (p) => `
      <article class="card product-card">
        <img src="${p.image || PLACEHOLDER_IMAGE}" alt="${p.name}" />
        <h3>${p.name}</h3>
        <p class="desc">${p.description}</p>
        <p class="price">${formatCurrency(p.price)}</p>
        <div class="form-actions">
          <button class="btn btn-ghost" data-action="details" data-id="${p.id}">Detalhes</button>
          <button class="btn btn-primary" data-action="checkout" data-id="${p.id}">Comprar</button>
        </div>
      </article>`
    )
    .join("");

  bindRippleToAllButtons();
}

function renderDetail(productId) {
  const p = findProduct(productId);
  if (!p || p.status !== "ativo") return setView("store");

  el.detailContent.innerHTML = `
    <article class="card detail-layout">
      <img src="${p.image || PLACEHOLDER_IMAGE}" alt="${p.name}" />
      <div>
        <h2>${p.name}</h2>
        <p class="desc">${p.description}</p>
        <p class="price">${formatCurrency(p.price)}</p>
        <button id="buyFromDetail" class="btn btn-primary">Comprar agora</button>
      </div>
    </article>
  `;

  document.getElementById("buyFromDetail").addEventListener("click", () => {
    renderCheckout(p.id);
    setView("checkout");
  });

  bindRippleToAllButtons();
}

function registerOrder(product) {
  const customerEmail = getCustomerSession();
  if (!customerEmail) return false;

  state.orders.push({
    id: crypto.randomUUID(),
    productId: product.id,
    productName: product.name,
    price: Number(product.price),
    customerEmail,
    date: new Date().toISOString(),
  });

  saveJSON(STORAGE_KEYS.orders, state.orders);
  renderOrders();
  renderStats();
  return true;
}

function renderCheckout(productId) {
  const p = findProduct(productId);
  if (!p || p.status !== "ativo") return setView("store");

  el.checkoutContent.innerHTML = `
    <article class="card checkout-layout">
      <div>
        <h2>Resumo da compra</h2>
        <p><strong>Produto:</strong> ${p.name}</p>
        <p><strong>Valor:</strong> ${formatCurrency(p.price)}</p>
        <p class="desc">${p.description}</p>
      </div>
      <div>
        <h3>Pagamento</h3>
        <p class="desc">Para finalizar, faça login/cadastro e clique em pagar agora.</p>
        <a href="${FIXED_PAYMENT_LINK}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" id="payNowBtn">Pagar agora</a>
        <p id="paymentFeedback" class="feedback" style="margin-top:0.8rem;"></p>
      </div>
    </article>
  `;

  document.getElementById("payNowBtn").addEventListener("click", (event) => {
    const feedback = document.getElementById("paymentFeedback");
    if (!registerOrder(p)) {
      event.preventDefault();
      feedback.textContent = "Faça login/cadastro para salvar a compra antes do pagamento.";
      feedback.style.color = "var(--danger)";
      return;
    }
    feedback.textContent = "Pedido salvo com sucesso. Redirecionando para pagamento externo...";
    feedback.style.color = "var(--success)";
    setTimeout(() => setView("thanks"), 700);
  });

  bindRippleToAllButtons();
}

function renderAdminList() {
  if (!state.products.length) {
    el.adminProductList.innerHTML = '<p class="empty">Nenhum produto cadastrado.</p>';
    return;
  }

  el.adminProductList.innerHTML = `
    <table>
      <thead><tr><th>Produto</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead>
      <tbody>
        ${state.products
          .map(
            (p) => `<tr>
              <td>${p.name}</td>
              <td>${formatCurrency(p.price)}</td>
              <td><span class="tag ${p.status === "ativo" ? "active" : "inactive"}">${p.status}</span></td>
              <td>
                <button class="btn btn-ghost" data-admin-action="edit" data-id="${p.id}">Editar</button>
                <button class="btn btn-danger" data-admin-action="delete" data-id="${p.id}">Excluir</button>
              </td>
            </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;

  bindRippleToAllButtons();
}

function renderOrders() {
  if (!state.orders.length) {
    el.ordersList.innerHTML = '<p class="empty">Nenhuma compra registrada.</p>';
    return;
  }

  el.ordersList.innerHTML = state.orders
    .slice()
    .reverse()
    .map(
      (o) => `<div class="order-item">
        <p><strong>Cliente:</strong> ${o.customerEmail}</p>
        <p><strong>Produto:</strong> ${o.productName}</p>
        <p><strong>Valor:</strong> ${formatCurrency(o.price)}</p>
        <p><strong>Data:</strong> ${new Date(o.date).toLocaleString("pt-BR")}</p>
      </div>`
    )
    .join("");
}

function renderStats() {
  const totalProdutos = state.products.length;
  const ativos = state.products.filter((p) => p.status === "ativo").length;
  const totalCompras = state.orders.length;
  const faturamento = state.orders.reduce((acc, cur) => acc + Number(cur.price), 0);

  el.statsCards.innerHTML = `
    <div class="stat-card"><h4>Produtos</h4><p>${totalProdutos}</p></div>
    <div class="stat-card"><h4>Ativos</h4><p>${ativos}</p></div>
    <div class="stat-card"><h4>Compras</h4><p>${totalCompras}</p></div>
    <div class="stat-card"><h4>Faturamento</h4><p>${formatCurrency(faturamento)}</p></div>
  `;
}

function resetProductForm() {
  el.productForm.reset();
  document.getElementById("productId").value = "";
  el.formTitle.textContent = "Cadastrar novo produto";
}

async function resolveImageInput() {
  const url = document.getElementById("productImage").value.trim();
  const fileInput = document.getElementById("productImageFile");

  if (fileInput.files?.[0]) {
    const file = fileInput.files[0];
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
  return url || PLACEHOLDER_IMAGE;
}

function bindEvents() {
  bindRippleToAllButtons();
  el.goStoreBtn.addEventListener("click", () => {
    renderStore();
    setView("store");
  });

  el.goAuthBtn.addEventListener("click", () => {
    if (getCustomerSession()) {
      clearCustomerSession();
      return;
    }
    setView("auth");
  });

  el.goAdminBtn.addEventListener("click", () => {
    const logged = localStorage.getItem(STORAGE_KEYS.adminSession) === "1";
    if (logged) {
      renderAdminList();
      renderOrders();
      renderStats();
      return setView("adminPanel");
    }
    setView("adminLogin");
  });

  el.customerRegisterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("customerRegisterName").value.trim();
    const email = document.getElementById("customerRegisterEmail").value.trim().toLowerCase();
    const pass = document.getElementById("customerRegisterPass").value;

    if (state.users.some((u) => u.email === email)) {
      el.customerRegisterFeedback.textContent = "Email já cadastrado.";
      el.customerRegisterFeedback.style.color = "var(--danger)";
      return;
    }

    state.users.push({ id: crypto.randomUUID(), name, email, pass });
    saveJSON(STORAGE_KEYS.users, state.users);
    setCustomerSession(email);
    el.customerRegisterFeedback.textContent = "Cadastro criado e login efetuado.";
    el.customerRegisterFeedback.style.color = "var(--success)";
  });

  el.customerLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("customerLoginEmail").value.trim().toLowerCase();
    const pass = document.getElementById("customerLoginPass").value;

    const user = state.users.find((u) => u.email === email && u.pass === pass);
    if (!user) {
      el.customerLoginFeedback.textContent = "Credenciais inválidas.";
      el.customerLoginFeedback.style.color = "var(--danger)";
      return;
    }

    setCustomerSession(user.email);
    el.customerLoginFeedback.textContent = "Login realizado com sucesso.";
    el.customerLoginFeedback.style.color = "var(--success)";
    setView("store");
  });

  el.backToStoreBtn.addEventListener("click", () => setView("store"));
  el.backFromCheckoutBtn.addEventListener("click", () => setView("store"));
  el.thanksBackStore.addEventListener("click", () => setView("store"));

  el.productGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const productId = button.dataset.id;

    if (button.dataset.action === "details") {
      renderDetail(productId);
      return setView("detail");
    }

    renderCheckout(productId);
    setView("checkout");
  });

  el.adminLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const user = document.getElementById("adminUser").value.trim();
    const pass = document.getElementById("adminPass").value.trim();

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      localStorage.setItem(STORAGE_KEYS.adminSession, "1");
      el.loginFeedback.textContent = "Login efetuado com sucesso.";
      el.loginFeedback.style.color = "var(--success)";
      renderAdminList();
      renderOrders();
      renderStats();
      return setView("adminPanel");
    }

    el.loginFeedback.textContent = "Credenciais inválidas.";
    el.loginFeedback.style.color = "var(--danger)";
  });

  el.adminLogoutBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEYS.adminSession);
    setView("store");
  });

  el.productForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = document.getElementById("productId").value;
    const name = document.getElementById("productName").value.trim();
    const description = document.getElementById("productDescription").value.trim();
    const price = Number(document.getElementById("productPrice").value);
    const status = document.getElementById("productStatus").value;
    const image = await resolveImageInput();

    if (id) {
      const current = findProduct(id);
      if (!current) return;
      Object.assign(current, { name, description, price, status, image: image || current.image });
    } else {
      state.products.push({ id: crypto.randomUUID(), name, description, price, image, status, createdAt: new Date().toISOString() });
    }

    saveJSON(STORAGE_KEYS.products, state.products);
    renderStore();
    renderAdminList();
    renderStats();
    resetProductForm();
  });

  el.cancelEditBtn.addEventListener("click", resetProductForm);

  el.adminProductList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-admin-action]");
    if (!button) return;

    const id = button.dataset.id;
    const product = findProduct(id);
    if (!product) return;

    if (button.dataset.adminAction === "delete") {
      state.products = state.products.filter((p) => p.id !== id);
      saveJSON(STORAGE_KEYS.products, state.products);
      renderStore();
      renderAdminList();
      renderStats();
      return;
    }

    el.formTitle.textContent = `Editando: ${product.name}`;
    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productDescription").value = product.description;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productImage").value = product.image.startsWith("http") ? product.image : "";
    document.getElementById("productStatus").value = product.status;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function startApp() {
  initData();
  bindEvents();
  renderStore();
  renderStats();
  setView("store");
}

startApp();
