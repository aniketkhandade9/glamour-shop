/* ---------------- CONFIG ---------------- */
const API_BASE_URL = 'http://localhost:8080'; // CHANGE to your backend base

/* -------------- Common Elements ---------- */
const navLinks = document.querySelector('.nav-links');
const loginBtn = document.getElementById('login-btn');
const shopNowBtn = document.getElementById('shop-now-btn');
const productsSection = document.querySelector('.products-grid');

/* ------------ Login Modal Elements ------- */
const loginModal = document.getElementById('login-modal');
const openRegisterLink = document.getElementById('open-register-link');
const closeLoginBtn = document.getElementById('close-login-modal-btn');
const loginForm = document.getElementById('login-form');
const loginEmailInput = document.getElementById('login-email-input');
const loginPasswordInput = document.getElementById('login-password-input');
const loginEmailError = document.getElementById('login-email-error');
const loginPasswordError = document.getElementById('login-password-error');
const loginError = document.getElementById('login-error');

/* ----------- Register Modal Elements ----- */
const registerModal = document.getElementById('register-modal');
const openLoginLink = document.getElementById('open-login-link');
const closeRegisterBtn = document.getElementById('close-register-modal-btn');
const registerForm = document.getElementById('register-form');
const regNameInput = document.getElementById('reg-name-input');
const regEmailInput = document.getElementById('reg-email-input');
const regPasswordInput = document.getElementById('reg-password-input');
const regConfirmInput = document.getElementById('reg-confirm-input');
const regNameError = document.getElementById('reg-name-error');
const regEmailError = document.getElementById('reg-email-error');
const regPasswordError = document.getElementById('reg-password-error');
const regConfirmError = document.getElementById('reg-confirm-error');
const registerError = document.getElementById('register-error');

/* -------------- Utility ------------------ */
const emailRegex = /^\S+@\S+\.\S+$/;
function clearLoginErrors() {
  loginEmailError.textContent = '';
  loginPasswordError.textContent = '';
  loginError.textContent = '';
}
function clearRegisterErrors() {
  regNameError.textContent = '';
  regEmailError.textContent = '';
  regPasswordError.textContent = '';
  regConfirmError.textContent = '';
  registerError.textContent = '';
}

/* -------------- Modal Open/Close --------- */
function openModal(modal) {
  modal.classList.add('active');
}
function closeModal(modal) {
  modal.classList.remove('active');
}

loginBtn.addEventListener('click', () => {
  isLoggedIn() ? logoutUser() : openModal(loginModal);
});
closeLoginBtn.addEventListener('click', () => closeModal(loginModal));
closeRegisterBtn.addEventListener('click', () => closeModal(registerModal));
openRegisterLink.addEventListener('click', (e) => {
  e.preventDefault();
  closeModal(loginModal);
  openModal(registerModal);
});
openLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  closeModal(registerModal);
  openModal(loginModal);
});

[loginModal, registerModal].forEach((m) => {
  m.addEventListener('click', (e) => {
    if (e.target === m) closeModal(m);
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (loginModal.classList.contains('active')) closeModal(loginModal);
    if (registerModal.classList.contains('active')) closeModal(registerModal);
    loginBtn.focus();
  }
});

/* -------------- Auth Helpers ------------- */
function isLoggedIn() {
  return Boolean(localStorage.getItem('cosmeticsShopToken'));
}
function getUser() {
  return JSON.parse(localStorage.getItem('cosmeticsShopUser') || 'null');
}
function showLoggedInUser(user) {
  loginBtn.textContent = `Hi, ${user.name}`;
  loginBtn.disabled = true;
  const logoutBtn = document.createElement('button');
  logoutBtn.id = 'logout-btn';
  logoutBtn.textContent = 'Logout';
  Object.assign(logoutBtn.style, {
    marginLeft: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'var(--color-accent)',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 'var(--color-border-radius)',
    color: 'white',
  });
  logoutBtn.addEventListener('mouseover', () => logoutBtn.style.background = 'var(--color-accent-hover)');
  logoutBtn.addEventListener('mouseout', () => logoutBtn.style.background = 'var(--color-accent)');
  logoutBtn.addEventListener('click', logoutUser);
  navLinks.appendChild(logoutBtn);
}
function logoutUser() {
  localStorage.removeItem('cosmeticsShopToken');
  localStorage.removeItem('cosmeticsShopUser');
  const lb = document.getElementById('logout-btn');
  lb && lb.remove();
  loginBtn.textContent = 'Login';
  loginBtn.disabled = false;
}

/* -------------- API Calls ---------------- */
async function loginUser({ email, password }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid email or password');
  return await res.json();
}

async function registerUser({ name, email, password }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const msg = (await res.json()).message || 'Registration failed';
    throw new Error(msg);
  }
  return await res.json();
}

/* -------------- Form Validation ---------- */
function validateLogin() {
  clearLoginErrors();
  let valid = true;
  if (!emailRegex.test(loginEmailInput.value.trim())) {
    loginEmailError.textContent = 'Enter valid email';
    valid = false;
  }
  if (loginPasswordInput.value.trim().length < 6) {
    loginPasswordError.textContent = 'Password min 6 chars';
    valid = false;
  }
  return valid;
}

function validateRegister() {
  clearRegisterErrors();
  let valid = true;
  if (regNameInput.value.trim().length < 2) {
    regNameError.textContent = 'Enter full name';
    valid = false;
  }
  if (!emailRegex.test(regEmailInput.value.trim())) {
    regEmailError.textContent = 'Enter valid email';
    valid = false;
  }
  if (regPasswordInput.value.trim().length < 6) {
    regPasswordError.textContent = 'Password min 6 chars';
    valid = false;
  }
  if (regPasswordInput.value.trim() !== regConfirmInput.value.trim()) {
    regConfirmError.textContent = 'Passwords do not match';
    valid = false;
  }
  return valid;
}

/* -------------- Submit Handlers ---------- */
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateLogin()) return;
  try {
    const data = await loginUser({
      email: loginEmailInput.value.trim(),
      password: loginPasswordInput.value.trim(),
    });
    localStorage.setItem('cosmeticsShopToken', data.token);
    localStorage.setItem('cosmeticsShopUser', JSON.stringify({ name: data.name, email: data.email }));
    closeModal(loginModal);
    showLoggedInUser({ name: data.name });
  } catch (err) {
    loginError.textContent = err.message;
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateRegister()) return;
  try {
    const data = await registerUser({
      name: regNameInput.value.trim(),
      email: regEmailInput.value.trim(),
      password: regPasswordInput.value.trim(),
    });
    localStorage.setItem('cosmeticsShopToken', data.token);
    localStorage.setItem('cosmeticsShopUser', JSON.stringify({ name: data.name, email: data.email }));
    closeModal(registerModal);
    showLoggedInUser({ name: data.name });
  } catch (err) {
    registerError.textContent = err.message;
  }
});

/* -------------- Init --------------------- */
window.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) {
    const usr = getUser();
    usr && showLoggedInUser(usr);
  }
});

/* ---------------- CART ------------------- */
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
  const countElem = document.getElementById('cart-count-popup');
  if (countElem) {
    countElem.textContent = cart.length;
  }
}

const closeCartBtn = document.getElementById('close-cart-btn');
if (closeCartBtn) {
  closeCartBtn.addEventListener('click', closeCart);
}









function addToCart(productName) {
  cart.push(productName);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert(productName + ' added to cart!');
}

function showCart() {
  const popup = document.getElementById('cart-popup');
  const list = document.getElementById('cart-items-list');
  list.innerHTML = '';
  if (cart.length === 0) {
    list.innerHTML = '<li>Your cart is empty.</li>';
  } else {
    cart.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });
  }
  popup.classList.remove('hidden');
}

function closeCart() {
  const popup = document.getElementById('cart-popup');
  popup.classList.add('hidden');
}

/* ---------------- SEARCH ------------------ */
function searchProducts() {
  const input = document.getElementById('search-input').value.toLowerCase();
  const products = document.querySelectorAll('.product-card');
  products.forEach(product => {
    const name = product.getAttribute('data-name')?.toLowerCase() || '';
    product.style.display = name.includes(input) ? 'block' : 'none';
  });
}

const searchButton = document.getElementById('search-button');
if (searchButton) {
  searchButton.addEventListener('click', searchProducts);
}
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchProducts();
    }
  });
}

/* -------------- UX ----------------- */
shopNowBtn.addEventListener('click', () => {
  productsSection.scrollIntoView({ behavior: 'smooth' });
});
const showCartBtn = document.getElementById('show-cart-btn');
if (showCartBtn) {
  showCartBtn.addEventListener('click', showCart);
}
updateCartCount();
