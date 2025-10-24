// script.js — handles register/login using localStorage + sessionStorage
// Key names
const USERS_KEY = 'demo_users_v1';
const SESSION_KEY = 'demo_auth_session';

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const profileBox = document.getElementById('profile');
  const profileName = document.getElementById('profileName');

  const liMsg = document.getElementById('li-msg');
  const reMsg = document.getElementById('re-msg');

  // nav buttons
  document.getElementById('btnLoginView').addEventListener('click', () => showView('login'));
  document.getElementById('btnRegisterView').addEventListener('click', () => showView('register'));

  // logout / clear
  document.getElementById('btnLogout').addEventListener('click', logout);
  document.getElementById('btnClearUsers').addEventListener('click', () => {
    if (confirm('Clear all stored users? This is for development only.')) {
      localStorage.removeItem(USERS_KEY);
      alert('All users cleared.');
      logout();
    }
  });

  // show/hide views
  function showView(view) {
    if (view === 'login') {
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
      profileBox.classList.add('hidden');
    } else if (view === 'register') {
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      profileBox.classList.add('hidden');
    } else if (view === 'profile') {
      profileBox.classList.remove('hidden');
      loginForm.classList.add('hidden');
      registerForm.classList.add('hidden');
    }
    // clear messages
    liMsg.textContent = '';
    reMsg.textContent = '';
  }

  // Storage helpers
  function loadUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch (e) {
      console.error('Failed to parse users from localStorage', e);
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  // Session helpers
  function setSession(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }
  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY));
    } catch (e) {
      return null;
    }
  }

  // On page load: check session
  const existing = getSession();
  if (existing && existing.name) {
    profileName.textContent = existing.name;
    showView('profile');
  } else {
    showView('login');
  }

  // Register form submit
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    reMsg.textContent = '';

    const name = document.getElementById('re-name').value.trim();
    const email = document.getElementById('re-email').value.trim().toLowerCase();
    const password = document.getElementById('re-password').value;

    if (!name || !email || !password) {
      reMsg.textContent = 'Please fill in all fields.';
      return;
    }
    if (password.length < 6) {
      reMsg.textContent = 'Password must be at least 6 characters.';
      return;
    }
    // simple email format check
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      reMsg.textContent = 'Please enter a valid email address.';
      return;
    }

    const users = loadUsers();
    if (users.some(u => u.email === email)) {
      reMsg.textContent = 'That email is already registered.';
      return;
    }

    // NOTE: storing plain text password here only for demo purposes.
    users.push({ name, email, password });
    saveUsers(users);

    // set session and show profile
    setSession({ name, email });
    profileName.textContent = name;
    registerForm.reset();
    showView('profile');
  });

  // Login form submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    liMsg.textContent = '';

    const email = document.getElementById('li-email').value.trim().toLowerCase();
    const password = document.getElementById('li-password').value;

    if (!email || !password) {
      liMsg.textContent = 'Please enter email and password.';
      return;
    }

    const users = loadUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      liMsg.textContent = 'Invalid email or password.';
      return;
    }

    // success
    setSession({ name: user.name, email: user.email });
    profileName.textContent = user.name;
    loginForm.reset();
    showView('profile');
  });

  function logout() {
    clearSession();
    profileName.textContent = '';
    showView('login');
  }
});
