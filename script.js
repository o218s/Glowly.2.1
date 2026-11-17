/* =====================================
   GLOWLY - JAVASCRIPT
===================================== */
let cart = [];
try {
  const storedCart = JSON.parse(localStorage.getItem("glowlyCart") || "[]");
  if (Array.isArray(storedCart)) {
    cart = storedCart.filter(item =>
      item && typeof item.id === "string" &&
      typeof item.name === "string" &&
      Number.isFinite(Number(item.price)) && Number(item.price) >= 0 &&
      Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0
    ).map(item => ({ id:item.id, name:item.name, price:Number(item.price), quantity:Number(item.quantity) }));
  }
} catch (error) { cart = []; }

function toggleMenu() {
  const menu = document.getElementById("menu");
  const button = document.querySelector(".hamburger");
  if (menu) {
    menu.classList.toggle("active");
    if (button) button.setAttribute("aria-expanded", menu.classList.contains("active") ? "true" : "false");
  }
}
function fecharMenu() {
  const menu = document.getElementById("menu");
  const button = document.querySelector(".hamburger");
  if (menu) menu.classList.remove("active");
  if (button) button.setAttribute("aria-expanded", "false");
}

function selecionarFoto(event) {
  const ficheiro = event.target.files && event.target.files[0];
  const resultado = document.getElementById("resultado-foto");
  if (!ficheiro || !resultado) return;
  if (!ficheiro.type.startsWith("image/")) {
    resultado.textContent = "Por favor, seleciona uma imagem válida.";
    event.target.value = "";
    return;
  }
  resultado.textContent = "✓ Fotografia selecionada: " + ficheiro.name + ". A análise automática não está ligada e a imagem não é enviada.";
}

function responder(pergunta) {
  const respostas = {
    "Tenho pele oleosa, o que devo usar?": "Para pele oleosa, procura produtos suaves, não comedogénicos e hidratantes leves. Usa protetor solar diariamente.",
    "Posso combinar vários produtos?": "Depende dos ingredientes. Introduz novos produtos gradualmente e evita combinar ativos potencialmente irritantes sem orientação.",
    "Como faço a minha rotina de manhã?": "Uma rotina simples inclui limpeza suave, hidratante e protetor solar FPS 30 ou superior.",
    "Que produtos usar para pele sensível?": "Escolhe produtos sem perfume, com fórmulas suaves. Testa primeiro numa pequena área."
  };
  const elemento = document.getElementById("resposta");
  if (!elemento) return;
  elemento.textContent = "✦ Glowly: " + (respostas[pergunta] || "Obrigada pela tua pergunta! Posso partilhar informação geral. Para dúvidas persistentes ou irritação, pede aconselhamento a um profissional de saúde.");
}
function enviar() {
  const campo = document.getElementById("pergunta");
  if (!campo) return;
  const pergunta = campo.value.trim();
  if (!pergunta) return;
  responder(pergunta);
  campo.value = "";
}

const drawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("cartOverlay");
function openCart() {
  if (drawer) drawer.classList.add("active");
  if (overlay) overlay.classList.add("active");
  document.body.style.overflow = "hidden";
  const closeButton = document.getElementById("closeCart");
  if (closeButton) closeButton.focus();
}
function closeCart() {
  if (drawer) drawer.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
  document.body.style.overflow = "";
}
document.getElementById("openCart")?.addEventListener("click", openCart);
document.getElementById("closeCart")?.addEventListener("click", closeCart);
overlay?.addEventListener("click", closeCart);
document.addEventListener("keydown", event => { if (event.key === "Escape") closeCart(); });

function saveCart() {
  try { localStorage.setItem("glowlyCart", JSON.stringify(cart)); }
  catch (error) { console.warn("Não foi possível guardar o carrinho neste navegador."); }
  renderCart();
}
function addToCart(id, name, price) {
  if (!id || !name || !Number.isFinite(price) || price < 0) return;
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity++;
  else cart.push({ id, name, price, quantity:1 });
  saveCart();
  openCart();
}
function changeQuantity(id, amount) {
  const item = cart.find(item => item.id === id);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart = cart.filter(product => product.id !== id);
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
  if (!container) return;

  const count = cart.reduce((sum,item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum,item) => sum + item.price * item.quantity, 0);
  const shipping = count === 0 || subtotal >= 35 ? 0 : 3.90;
  const total = subtotal + shipping;
  const breakdown = document.getElementById("cartBreakdown");
  if (breakdown) breakdown.innerHTML = `<div><span>Subtotal</span><span>${subtotal.toFixed(2).replace(".", ",")} €</span></div><div><span>Envio demonstrativo</span><span>${shipping === 0 ? "Grátis" : shipping.toFixed(2).replace(".", ",") + " €"}</span></div><div class="grand"><span>Total estimado</span><span>${total.toFixed(2).replace(".", ",")} €</span></div>`;
  const paymentSummary = document.getElementById("paymentOrderSummary");
  if (paymentSummary) {
    paymentSummary.textContent = count === 0 ? "O carrinho está vazio." :
      "Resumo: " + cart.map(item => `${item.name} ×${item.quantity}`).join(", ") +
      ` · Subtotal ${subtotal.toFixed(2).replace(".", ",")} € · Envio ${shipping === 0 ? "grátis" : shipping.toFixed(2).replace(".", ",") + " €"} · Total ${total.toFixed(2).replace(".", ",")} € (valores demonstrativos).`;
  }
  if (countElement) countElement.textContent = count;
  if (subtitle) subtitle.textContent = `${count} ${count === 1 ? "produto selecionado" : "produtos selecionados"}`;
  if (totalElement) totalElement.textContent = total.toFixed(2).replace(".", ",") + " €";
  if (checkout) checkout.disabled = count === 0;
  container.replaceChildren();

  if (cart.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-cart";
    empty.textContent = "O teu carrinho está vazio ♡";
    container.appendChild(empty);
    return;
  }

  cart.forEach(item => {
    const product = document.createElement("div");
    product.className = "cart-product";
    const info = document.createElement("div");
    const name = document.createElement("h4");
    name.textContent = item.name;
    const price = document.createElement("p");
    price.textContent = (item.price * item.quantity).toFixed(2).replace(".", ",") + " €";
    const actions = document.createElement("div");
    actions.className = "cart-actions";

    const minus = document.createElement("button");
    minus.type = "button"; minus.textContent = "−";
    minus.setAttribute("aria-label", "Diminuir quantidade de " + item.name);
    minus.addEventListener("click", () => changeQuantity(item.id, -1));

    const quantity = document.createElement("span");
    quantity.textContent = item.quantity;

    const plus = document.createElement("button");
    plus.type = "button"; plus.textContent = "+";
    plus.setAttribute("aria-label", "Aumentar quantidade de " + item.name);
    plus.addEventListener("click", () => changeQuantity(item.id, 1));

    const remove = document.createElement("button");
    remove.type = "button"; remove.textContent = "Remover";
    remove.className = "remove-product";
    remove.addEventListener("click", () => removeProduct(item.id));

    actions.append(minus, quantity, plus, remove);
    info.append(name, price, actions);
    product.appendChild(info);
    container.appendChild(product);
  });
}

document.querySelectorAll("[data-add-cart]").forEach(button => {
  button.addEventListener("click", () => {
    addToCart(button.dataset.id, button.dataset.name, Number(button.dataset.price));
  });
});
document.getElementById("checkoutBtn")?.addEventListener("click", () => {
  if (cart.length === 0) return;
  closeCart();
  document.getElementById("pagamento")?.scrollIntoView({behavior:"smooth"});
});
renderCart();

/* Funcionalidades extra Glowly */
const glowlyProducts = [
  {id:"gel-limpeza", name:"Gel de Limpeza Suave", price:12.90, category:"Limpeza", description:"Limpeza suave para uso diário.", use:"Passo de limpeza da rotina; segue as instruções da embalagem."},
  {id:"creme-hidratante", name:"Creme Hidratante", price:16.50, category:"Hidratação", description:"Ajuda a manter a hidratação da pele.", use:"Aplicação conforme as indicações do fabricante."},
  {id:"serum-hidratante", name:"Sérum Hidratante", price:19.90, category:"Cuidado", description:"Um passo extra para complementar a rotina.", use:"Confirma a ordem de aplicação indicada pelo fabricante."},
  {id:"protetor-solar", name:"Protetor Solar FPS 50", price:18.00, category:"Proteção", description:"Proteção solar para o cuidado diário.", use:"Segue as instruções do rótulo e reaplica conforme indicado."},
  {id:"tonico-hidratante", name:"Tónico Hidratante", price:14.00, category:"Hidratação", description:"Um passo leve para complementar a rotina.", use:"Utiliza apenas de acordo com as instruções da embalagem."},
  {id:"creme-maos", name:"Creme de Mãos", price:8.50, category:"Cuidado", description:"Hidratação prática para as mãos.", use:"Aplicação conforme as indicações do fabricante."},
  {id:"balsamo-labial", name:"Bálsamo Labial", price:6.90, category:"Lábios", description:"Ajuda a manter os lábios confortáveis.", use:"Consulta as indicações do produto antes de utilizar."},
  {id:"mascara-hidratante", name:"Máscara Hidratante", price:11.50, category:"Hidratação", description:"Um cuidado ocasional para uma rotina simples.", use:"Respeita o tempo e a frequência indicados na embalagem."}
];
function readLocal(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
  catch (_) { return fallback; }
}
function writeLocal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (_) { /* A funcionalidade continua disponível durante esta sessão. */ }
}
let favorites = readLocal("glowlyFavorites", []);
let journal = readLocal("glowlyJournal", []);
let reviews = readLocal("glowlyReviews", []);
let compared = [];

function renderFavorites() {
  const box = document.getElementById("favoritesList");
  if (!box) return;
  box.replaceChildren();
  const valid = glowlyProducts.filter(p => favorites.includes(p.id));
  if (!valid.length) { box.textContent = "Ainda não tens favoritos."; return; }
  valid.forEach(p => {
    const row = document.createElement("div"); row.className = "favorite-item";
    row.textContent = p.name + " — " + p.price.toFixed(2).replace(".", ",") + " €";
    const add = document.createElement("button"); add.className = "secondary-action"; add.textContent = "Adicionar ao carrinho";
    add.addEventListener("click", () => addToCart(p.id, p.name, p.price));
    row.appendChild(add); box.appendChild(row);
  });
  document.querySelectorAll("[data-favorite]").forEach(btn => {
    const active = favorites.includes(btn.dataset.favorite);
    btn.classList.toggle("active", active); btn.textContent = active ? "♥ Guardado" : "♡ Favorito";
  });
}
document.querySelectorAll("[data-favorite]").forEach(btn => btn.addEventListener("click", () => {
  const id = btn.dataset.favorite;
  favorites = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
  writeLocal("glowlyFavorites", favorites); renderFavorites();
}));

document.querySelectorAll("[data-compare-toggle]").forEach(btn => btn.addEventListener("click", () => {
  const id = btn.dataset.compareToggle;
  if (compared.includes(id)) compared = compared.filter(x => x !== id);
  else if (compared.length < 2) compared.push(id);
  else compared = [compared[1], id];
  const a = document.getElementById("compareA"), b = document.getElementById("compareB");
  if (a && b) { a.value = compared[0] || glowlyProducts[0].id; b.value = compared[1] || glowlyProducts[1].id; }
  document.getElementById("comparador")?.scrollIntoView({behavior:"smooth",block:"center"});
  document.querySelectorAll("[data-compare-toggle]").forEach(x => x.classList.toggle("active", compared.includes(x.dataset.compareToggle)));
}));

const compareA = document.getElementById("compareA"), compareB = document.getElementById("compareB");
[compareA, compareB].forEach(select => {
  if (!select) return;
  glowlyProducts.forEach(p => { const opt = document.createElement("option"); opt.value = p.id; opt.textContent = p.name; select.appendChild(opt); });
});
if (compareB) compareB.value = "creme-hidratante";
document.getElementById("compareProducts")?.addEventListener("click", () => {
  const a = glowlyProducts.find(p => p.id === compareA.value), b = glowlyProducts.find(p => p.id === compareB.value);
  const result = document.getElementById("compareResult");
  if (!a || !b || a.id === b.id) { result.textContent = "Escolhe dois produtos diferentes."; return; }
  result.innerHTML = "";
  [a,b].forEach(p => {
    const item = document.createElement("p");
    item.textContent = p.name + " · " + p.category + " · " + p.price.toFixed(2).replace(".", ",") + " € — " + p.description;
    result.appendChild(item);
  });
});

document.getElementById("runQuiz")?.addEventListener("click", () => {
  const skin = document.getElementById("quizSkin").value, goal = document.getElementById("quizGoal").value;
  let advice = "Começa com limpeza suave, hidratante e protetor solar durante o dia.";
  if (skin === "seca") advice = "Podes preferir um produto de limpeza suave e um hidratante confortável. Evita lavar em excesso.";
  if (skin === "oleosa") advice = "Procura fórmulas leves e não comedogénicas. A pele oleosa também beneficia de hidratação.";
  if (skin === "sensivel") advice = "Dá prioridade a fórmulas simples e sem perfume. Introduz apenas um produto novo de cada vez.";
  if (skin === "mista") advice = "Uma rotina simples e equilibrada pode funcionar: limpeza suave, hidratação e proteção solar.";
  if (goal === "hidratacao") advice += " Dá atenção à hidratação e a ingredientes como glicerina ou ceramidas.";
  if (goal === "protecao") advice += " Inclui protetor solar de largo espetro, seguindo as indicações da embalagem.";
  if (goal === "simplicidade") advice += " Não precisas de muitos passos: consistência e conforto são mais importantes.";
  document.getElementById("quizResult").textContent = advice;
});

function updateRoutine() {
  const checks = [...document.querySelectorAll(".routine-check")];
  const done = checks.filter(c => c.checked).length;
  document.getElementById("routineProgress").textContent = `${done} de ${checks.length} passos marcados. Faz apenas o que for adequado para ti.`;
  writeLocal("glowlyRoutine", checks.filter(c => c.checked).map(c => c.dataset.routine + ":" + c.value));
}
const savedRoutine = readLocal("glowlyRoutine", []);
document.querySelectorAll(".routine-check").forEach(c => {
  c.checked = savedRoutine.includes(c.dataset.routine + ":" + c.value);
  c.addEventListener("change", updateRoutine);
});
updateRoutine();

function renderJournal() {
  const box = document.getElementById("journalEntries"); if (!box) return;
  box.replaceChildren();
  if (!journal.length) { box.textContent = "Ainda não tens notas guardadas."; return; }
  journal.slice().reverse().forEach((entry, reverseIndex) => {
    const index = journal.length - 1 - reverseIndex;
    const row = document.createElement("div"); row.className = "journal-entry";
    const strong = document.createElement("strong"); strong.textContent = entry.date;
    const p = document.createElement("p"); p.textContent = entry.note;
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "journal-delete"; remove.textContent = "Apagar esta nota";
    remove.addEventListener("click", () => { journal.splice(index,1); writeLocal("glowlyJournal",journal); renderJournal(); });
    row.append(strong,p,remove); box.appendChild(row);
  });
}
document.getElementById("journalDate").value = new Date().toISOString().slice(0,10);
document.getElementById("saveJournal")?.addEventListener("click", () => {
  const date = document.getElementById("journalDate").value;
  const note = document.getElementById("journalNote").value.trim();
  if (!date || !note) { alert("Escolhe uma data e escreve uma nota."); return; }
  journal.push({date,note}); journal = journal.slice(-30); writeLocal("glowlyJournal",journal);
  document.getElementById("journalNote").value = ""; renderJournal();
});
renderJournal();

document.getElementById("applyPromo")?.addEventListener("click", () => {
  const code = document.getElementById("promoCode").value.trim().toUpperCase();
  document.getElementById("promoResult").textContent = code === "GLOW10" ? "Código aceite na demonstração: 10% de desconto simulado." : "Código não reconhecido. Experimenta GLOW10.";
});

const kitNames = Object.fromEntries(glowlyProducts.map(p => [p.id,p]));
document.getElementById("createKit")?.addEventListener("click", () => {
  const ids = [...document.querySelectorAll(".kit-item:checked")].map(c => c.value);
  const result = document.getElementById("kitResult");
  if (!ids.length) { result.textContent = "Seleciona pelo menos um produto para criares o kit."; return; }
  const selected = ids.map(id => kitNames[id]).filter(Boolean);
  const total = selected.reduce((sum,p) => sum+p.price,0);
  selected.forEach(p => addToCart(p.id,p.name,p.price));
  result.textContent = "Kit criado com " + selected.map(p => p.name).join(", ") + ". Total demonstrativo: " + total.toFixed(2).replace(".", ",") + " €.";
});

document.getElementById("saveReview")?.addEventListener("click", () => {
  const product = document.getElementById("reviewProduct").value;
  const stars = Number(document.getElementById("reviewStars").value);
  const comment = document.getElementById("reviewText").value.trim();
  if (!comment) { alert("Escreve um comentário antes de guardar."); return; }
  reviews.push({product,stars,comment}); reviews = reviews.slice(-20); writeLocal("glowlyReviews",reviews);
  document.getElementById("reviewText").value = ""; renderReviews();
});
function renderReviews() {
  const box = document.getElementById("reviewList"); if (!box) return;
  box.replaceChildren();
  if (!reviews.length) { box.textContent = "Ainda não existem avaliações nesta demonstração."; return; }
  reviews.slice().reverse().forEach((r, reverseIndex) => {
    const index = reviews.length - 1 - reverseIndex;
    const row = document.createElement("div"); row.className = "review-item";
    const name = document.createElement("strong"); name.textContent = r.product + " ";
    const stars = document.createElement("span"); stars.className = "star-rating"; stars.textContent = "★".repeat(r.stars) + "☆".repeat(5-r.stars);
    const p = document.createElement("p"); p.textContent = r.comment;
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "review-delete"; remove.textContent = "Apagar esta avaliação";
    remove.addEventListener("click", () => { reviews.splice(index,1); writeLocal("glowlyReviews",reviews); renderReviews(); });
    row.append(name,stars,p,remove); box.appendChild(row);
  });
}
renderReviews();

const ingredientDescriptions = {
  "glicerina":"Ingrediente humectante que ajuda a atrair água para a camada superficial da pele.",
  "acido-hialuronico":"Humectante que ajuda a reter água e a manter a pele hidratada.",
  "ceramidas":"Lípidos que fazem parte da barreira cutânea e ajudam a mantê-la protegida.",
  "niacinamida":"Forma de vitamina B3 usada em cosméticos; pode apoiar a barreira cutânea e a aparência geral da pele.",
  "oxido-zinco":"Ingrediente mineral usado em alguns protetores solares para ajudar a proteger contra a radiação UV."
};
document.getElementById("ingredientSelect")?.addEventListener("change", event => {
  document.getElementById("ingredientInfo").textContent = ingredientDescriptions[event.target.value] || "";
});


/* Perfil local Glowly — não cria conta nem envia dados */
const profileFields = ["profileName","profileSkin","profileGoal"];
function loadGlowlyProfile() {
  let profile = {};
  try { profile = JSON.parse(localStorage.getItem("glowlyProfile") || "{}") || {}; } catch (_) {}
  profileFields.forEach(id => {
    const field = document.getElementById(id);
    if (field && typeof profile[id] === "string") field.value = profile[id];
  });
  updateGlowlyProfileSummary(profile);
}
function updateGlowlyProfileSummary(profile) {
  const name = (profile.profileName || "").trim();
  const skin = profile.profileSkin || "";
  const goal = profile.profileGoal || "";
  document.getElementById("profileDisplayName").textContent = name ? "Olá, " + name + "!" : "Olá!";
  const details = [skin, goal].filter(Boolean);
  document.getElementById("profileDisplayPreference").textContent = details.length ? details.join(" · ") : "Ainda não guardaste as tuas preferências.";
}
document.getElementById("saveProfile")?.addEventListener("click", () => {
  const profile = {};
  profileFields.forEach(id => profile[id] = document.getElementById(id).value.trim());
  try { localStorage.setItem("glowlyProfile", JSON.stringify(profile)); } catch (_) {}
  updateGlowlyProfileSummary(profile);
  document.getElementById("profileMessage").textContent = "Perfil guardado neste navegador.";
});
loadGlowlyProfile();


/* Demonstração de produtos */
const demoSelect = document.getElementById("demoSelect");
if (demoSelect) {
  glowlyProducts.forEach(product => {
    const option = document.createElement("option");
    option.value = product.id; option.textContent = product.name; demoSelect.appendChild(option);
  });
}
function showDemoProduct(id) {
  const product = glowlyProducts.find(item => item.id === id) || glowlyProducts[0];
  if (!product) return;
  if (demoSelect) demoSelect.value = product.id;
  document.getElementById("demoName").textContent = product.name;
  document.getElementById("demoDescription").textContent = product.description;
  document.getElementById("demoMeta").textContent = "Categoria: " + product.category + " · Preço demonstrativo: " + product.price.toFixed(2).replace(".", ",") + " €";
  document.getElementById("demoArt").textContent = product.category === "Proteção" ? "☼" : product.category === "Limpeza" ? "❋" : "✧";
  document.getElementById("demoAdd").onclick = () => addToCart(product.id, product.name, product.price);
}
demoSelect?.addEventListener("change", () => showDemoProduct(demoSelect.value));
document.querySelectorAll("[data-demo-product]").forEach(button => button.addEventListener("click", () => {
  showDemoProduct(button.dataset.demoProduct);
  document.getElementById("demonstracao").scrollIntoView({behavior:"smooth"});
}));
showDemoProduct(glowlyProducts[0]?.id);



const glowlyMoreTrigger = document.getElementById("glowlyMoreTrigger");
const glowlyMoreMenu = document.getElementById("glowlyMoreMenu");
glowlyMoreTrigger?.addEventListener("click", event => {
  event.stopPropagation();
  const opening = glowlyMoreMenu.hidden;
  glowlyMoreMenu.hidden = !opening;
  glowlyMoreTrigger.setAttribute("aria-expanded", String(opening));
});
glowlyMoreMenu?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  glowlyMoreMenu.hidden = true;
  glowlyMoreTrigger?.setAttribute("aria-expanded", "false");
}));
document.addEventListener("click", event => {
  if (!event.target.closest(".glowly-more-wrap")) {
    if (glowlyMoreMenu) glowlyMoreMenu.hidden = true;
    glowlyMoreTrigger?.setAttribute("aria-expanded", "false");
  }
  if (!event.target.closest(".product-more-wrap")) {
    document.querySelectorAll(".product-more-menu").forEach(menu => menu.hidden = true);
    document.querySelectorAll(".product-more-trigger").forEach(button => button.setAttribute("aria-expanded", "false"));
  }
});

/* Pesquisa, filtros, ordenação e fichas individuais de produto */
const productSearch = document.getElementById("productSearch");
const productCategory = document.getElementById("productCategory");
const productSort = document.getElementById("productSort");
const productGrid = document.querySelector(".product-grid");
const productCount = document.getElementById("productCount");
const detailBackdrop = document.getElementById("productDetailBackdrop");
let activeDetailProduct = null;

function setupProductCards() {
  document.querySelectorAll(".product").forEach(card => {
    const addButton = card.querySelector("[data-add-cart]");
    if (!addButton) return;
    const id = addButton.dataset.id;
    const product = glowlyProducts.find(item => item.id === id);
    if (!product) return;
    card.dataset.productId = id;
    if (!card.querySelector(".product-detail-btn")) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "product-detail-btn";
      button.textContent = "Ver detalhes";
      button.addEventListener("click", () => openProductDetail(id));
      card.querySelector(".product-extra-actions")?.appendChild(button);
    }
    const actions = card.querySelector(".product-extra-actions");
    if (actions && !actions.querySelector(".product-more-wrap")) {
      const wrap = document.createElement("div");
      wrap.className = "product-more-wrap";
      wrap.innerHTML = `<button type="button" class="product-more-trigger" aria-label="Mais opções para ${product.name}" aria-expanded="false">⋯</button>
        <div class="product-more-menu" hidden>
          <button type="button" data-more-action="details">Ver detalhes</button>
          <button type="button" data-more-action="demo">Ver demonstração</button>
          <button type="button" data-more-action="add">Adicionar ao carrinho</button>
        </div>`;
      const trigger = wrap.querySelector(".product-more-trigger");
      const menu = wrap.querySelector(".product-more-menu");
      trigger.addEventListener("click", event => {
        event.stopPropagation();
        const opening = menu.hidden;
        document.querySelectorAll(".product-more-menu").forEach(other => other.hidden = true);
        document.querySelectorAll(".product-more-trigger").forEach(other => other.setAttribute("aria-expanded", "false"));
        menu.hidden = !opening;
        trigger.setAttribute("aria-expanded", String(opening));
      });
      menu.addEventListener("click", event => {
        const action = event.target.closest("button")?.dataset.moreAction;
        if (!action) return;
        menu.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        if (action === "details") openProductDetail(id);
        if (action === "add") addToCart(product.id, product.name, product.price);
        if (action === "demo") {
          const demoButton = card.querySelector(`[data-demo-product="${id}"]`);
          if (demoButton) demoButton.click();
          else openProductDetail(id);
        }
      });
      actions.appendChild(wrap);
    }
  });
}
function openProductDetail(id) {
  const product = glowlyProducts.find(item => item.id === id);
  if (!product || !detailBackdrop) return;
  activeDetailProduct = product;
  const cardImage = document.querySelector(`.product [data-id="${id}"]`)?.closest(".product")?.querySelector("img");
  const detailImage = document.getElementById("detailImage");
  if (cardImage && detailImage) { detailImage.src = cardImage.src; detailImage.alt = cardImage.alt || product.name; }
  document.getElementById("detailTitle").textContent = product.name;
  document.getElementById("detailDescription").textContent = product.description;
  document.getElementById("detailUse").textContent = product.use || "Segue as indicações do fabricante.";
  document.getElementById("detailPrice").textContent = product.price.toFixed(2).replace(".", ",") + " €";
  document.getElementById("detailCategory").textContent = "Categoria: " + product.category;
  detailBackdrop.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeProductDetail() {
  detailBackdrop?.classList.remove("open");
  document.body.style.overflow = "";
}
document.getElementById("detailClose")?.addEventListener("click", closeProductDetail);
detailBackdrop?.addEventListener("click", event => { if (event.target === detailBackdrop) closeProductDetail(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeProductDetail(); });
document.getElementById("detailAdd")?.addEventListener("click", () => {
  if (!activeDetailProduct) return;
  addToCart(activeDetailProduct.id, activeDetailProduct.name, activeDetailProduct.price);
  closeProductDetail();
});
function filterAndSortProducts() {
  if (!productGrid) return;
  const query = (productSearch?.value || "").trim().toLocaleLowerCase("pt-PT");
  const category = productCategory?.value || "";
  const sort = productSort?.value || "featured";
  const cards = [...productGrid.querySelectorAll(".product")];
  cards.sort((a,b) => {
    const pa = glowlyProducts.find(p => p.id === a.dataset.productId);
    const pb = glowlyProducts.find(p => p.id === b.dataset.productId);
    if (!pa || !pb) return 0;
    if (sort === "low") return pa.price - pb.price;
    if (sort === "high") return pb.price - pa.price;
    if (sort === "az") return pa.name.localeCompare(pb.name, "pt");
    return 0;
  });
  let visible = 0;
  cards.forEach(card => {
    const p = glowlyProducts.find(item => item.id === card.dataset.productId);
    const matches = p && (!category || p.category === category) &&
      (!query || (p.name + " " + p.description + " " + p.category).toLocaleLowerCase("pt-PT").includes(query));
    card.hidden = !matches;
    if (matches) visible++;
    productGrid.appendChild(card);
  });
  if (productCount) productCount.textContent = visible + (visible === 1 ? " produto encontrado" : " produtos encontrados");
  let empty = productGrid.querySelector(".empty-search");
  if (!visible && !empty) {
    empty = document.createElement("p"); empty.className = "empty-search";
    empty.textContent = "Não encontrámos produtos com esses filtros.";
    productGrid.appendChild(empty);
  } else if (visible && empty) empty.remove();
}
setupProductCards();
filterAndSortProducts();
[productSearch, productCategory, productSort].forEach(control => control?.addEventListener("input", filterAndSortProducts));
[productCategory, productSort].forEach(control => control?.addEventListener("change", filterAndSortProducts));

/* Checkout e rastreio apenas demonstrativos — sem recolha de dados de pagamento */
let glowlyOrders = readLocal("glowlyOrders", []);
function renderTracking(order) {
  const result = document.getElementById("trackingResult");
  if (!result) return;
  if (!order) { result.textContent = "Não encontrámos uma encomenda com esse código."; return; }
  const itemsText = Array.isArray(order.items) ? " · Artigos: " + order.items.map(item => `${item.name} ×${item.quantity}`).join(", ") : "";
  const totalText = Number.isFinite(order.total) ? " · Total simulado: " + order.total.toFixed(2).replace(".", ",") + " €" : "";
  result.textContent = `Encomenda ${order.code} · Estado: ${order.status} · Método escolhido: ${order.method}${itemsText}${totalText}. Esta é uma simulação, não existe expedição real.`;
}
document.getElementById("trackOrderBtn")?.addEventListener("click", () => {
  const code = document.getElementById("trackingCode").value.trim().toUpperCase();
  const order = glowlyOrders.find(item => item.code === code);
  renderTracking(order);
});
document.getElementById("demoPaymentBtn")?.addEventListener("click", () => {
  if (!cart.length) {
    document.getElementById("paymentResult").textContent = "O carrinho está vazio. Adiciona produtos antes de criar a encomenda.";
    return;
  }
  const method = document.querySelector('input[name="paymentMethod"]:checked')?.value || "MB WAY";
  const code = "GLW-" + Math.floor(100000 + Math.random() * 900000);
  const subtotal = cart.reduce((sum,item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 35 ? 0 : 3.90;
  const total = subtotal + shipping;
  const order = {code, method, subtotal, shipping, total, items:cart.map(item => ({...item})), status:"Encomenda recebida (demonstração)", createdAt:new Date().toISOString()};
  glowlyOrders.push(order);
  glowlyOrders = glowlyOrders.slice(-20);
  writeLocal("glowlyOrders", glowlyOrders);
  document.getElementById("paymentResult").textContent = `Encomenda de demonstração criada! Código: ${code}. Subtotal: ${subtotal.toFixed(2).replace(".", ",")} €. Envio simulado: ${shipping === 0 ? "grátis" : shipping.toFixed(2).replace(".", ",") + " €"}. Total: ${total.toFixed(2).replace(".", ",")} €. Método selecionado: ${method}. Usa o código na secção de rastreio.`;
  document.getElementById("trackingCode").value = code;
  renderTracking(order);
  cart = [];
  saveCart();
});
