// GLOWLY — funcionalidades do site

let cart = [];

try {
  const savedCart = JSON.parse(localStorage.getItem("glowlyCart") || "[]");
  cart = Array.isArray(savedCart) ? savedCart : [];
} catch {
  cart = [];
}

function toggleMenu() {
  document.getElementById("menu")?.classList.toggle("active");
}

// Seleção de fotografia
function selecionarFoto(event) {
  const ficheiro = event.target.files?.[0];
  const resultado = document.getElementById("resultado-foto");

  if (!ficheiro || !resultado) return;

  if (!ficheiro.type.startsWith("image/")) {
    resultado.textContent = "Seleciona um ficheiro de imagem válido.";
    return;
  }

  resultado.textContent =
    `Fotografia selecionada: ${ficheiro.name}. A análise automática ainda não está disponível.`;
}

// Assistente Glowly
function responder(pergunta) {
  const respostas = {
    "Tenho pele oleosa, o que devo usar?":
      "Para pele oleosa, procura produtos suaves, não comedogénicos e hidratantes leves. Usa protetor solar diariamente.",

    "Posso combinar vários produtos?":
      "A compatibilidade depende dos ingredientes. Introduz novos produtos gradualmente e evita combinar ativos irritantes sem orientação.",

    "Como faço a minha rotina de manhã?":
      "Uma rotina simples pode incluir limpeza suave, hidratante e protetor solar FPS 30 ou superior.",

    "Que produtos usar para pele sensível?":
      "Considera fórmulas suaves e sem perfume. Testa primeiro numa pequena área da pele."
  };

  const elemento = document.getElementById("resposta");
  if (!elemento) return;

  elemento.textContent = respostas[pergunta] ||
    "Conta-nos um pouco mais sobre a tua rotina e as necessidades da tua pele para receberes uma orientação mais adequada.";
}

function enviar() {
  const campo = document.getElementById("pergunta");
  if (!campo) return;

  const pergunta = campo.value.trim();
  if (!pergunta) return;

  responder(pergunta);
  campo.value = "";
}

// Carrinho
const drawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("cartOverlay");

function openCart() {
  drawer?.classList.add("active");
  overlay?.classList.add("active");
}

function closeCart() {
  drawer?.classList.remove("active");
  overlay?.classList.remove("active");
}

document.getElementById("openCart")?.addEventListener("click", openCart);
document.getElementById("closeCart")?.addEventListener("click", closeCart);
overlay?.addEventListener("click", closeCart);

function saveCart() {
  try {
    localStorage.setItem("glowlyCart", JSON.stringify(cart));
  } catch (error) {
    console.error("Não foi possível guardar o carrinho.", error);
  }

  renderCart();
}

function addToCart(id, name, price) {
  if (!id || !name || !Number.isFinite(price) || price < 0) {
    console.error("Dados do produto inválidos.");
    return;
  }

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }

  saveCart();
  openCart();
}

function changeQuantity(id, amount) {
  const item = cart.find(product => product.id === id);
  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(product => product.id !== id);
  }

  saveCart();
}

function removeProduct(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const countElement = document.getElementById("cartCount");
  const subtitle = document.getElementById("cartSubtitle");
  const totalElement = document.getElementById("cartTotal");
  const checkout = document.getElementById("checkoutBtn");

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (countElement) countElement.textContent = count;
  if (subtitle) subtitle.textContent = `${count} artigos`;
  if (totalElement) {
    totalElement.textContent = `${total.toFixed(2).replace(".", ",")} €`;
  }
  if (checkout) checkout.disabled = count === 0;
  if (!container) return;

  container.replaceChildren();

  if (cart.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-cart";
    empty.textContent = "O teu carrinho está vazio.";
    container.appendChild(empty);
    return;
  }

  cart.forEach(item => {
    const product = document.createElement("div");
    product.className = "cart-product";

    const name = document.createElement("h4");
    name.textContent = item.name;

    const price = document.createElement("p");
    price.textContent =
      `${(item.price * item.quantity).toFixed(2).replace(".", ",")} €`;

    const actions = document.createElement("div");
    actions.className = "cart-actions";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute("aria-label", `Diminuir quantidade de ${item.name}`);
    minus.addEventListener("click", () => changeQuantity(item.id, -1));

    const quantity = document.createElement("span");
    quantity.textContent = item.quantity;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute("aria-label", `Aumentar quantidade de ${item.name}`);
    plus.addEventListener("click", () => changeQuantity(item.id, 1));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remover";
    remove.className = "remove-product";
    remove.addEventListener("click", () => removeProduct(item.id));

    actions.append(minus, quantity, plus, remove);
    product.append(name, price, actions);
    container.appendChild(product);
  });
}

// Botões de adicionar ao carrinho
document.querySelectorAll("[data-add-cart]").forEach(button => {
  button.addEventListener("click", () => {
    addToCart(
      button.dataset.id,
      button.dataset.name,
      Number(button.dataset.price)
    );
  });
});

// Checkout
document.getElementById("checkoutBtn")?.addEventListener("click", () => {
  if (cart.length === 0) return;
  alert("O checkout ainda precisa de ser ligado ao sistema de pagamentos.");
});

// Acompanhamento demonstrativo
document.getElementById("trackingForm")?.addEventListener("submit", event => {
  event.preventDefault();

  const code = document.getElementById("trackingCode")?.value.trim();
  const result = document.getElementById("trackingResult");

  if (!code || !result) return;

  result.replaceChildren();

  const card = document.createElement("div");
  card.className = "tracking-card";

  const title = document.createElement("h3");
  title.textContent = `Encomenda ${code}`;

  const message = document.createElement("p");
  message.textContent =
    "Estado demonstrativo. A ligação ao sistema de encomendas ainda não está configurada.";

  const steps = document.createElement("ol");
  const statuses = [
    "Encomenda recebida",
    "Em preparação",
    "Enviada",
    "Entregue"
  ];

  statuses.forEach((status, index) => {
    const step = document.createElement("li");
    step.textContent = status;
    if (index === 0) step.classList.add("is-complete");
    steps.appendChild(step);
  });

  card.append(title, message, steps);
  result.appendChild(card);
});

renderCart();