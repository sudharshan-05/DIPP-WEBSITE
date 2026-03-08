import './style.css';
import { DEMO_ACCOUNTS } from './auth.js';
import { initPageTransitions } from './transitions.js';

// Reveal page immediately
document.body.classList.add('page-ready');
initPageTransitions();

// Toggle password visibility
document.getElementById('togglePassword').addEventListener('click', () => {
    const pw = document.getElementById('loginPassword');
    pw.type = pw.type === 'password' ? 'text' : 'password';
});

// Demo account quick fill
document.querySelectorAll('.demo-card').forEach(card => {
    card.addEventListener('click', () => {
        document.getElementById('loginEmail').value = card.dataset.email;
        document.getElementById('loginPassword').value = card.dataset.password;
        document.getElementById('loginError').classList.add('hidden');
    });
});

// Login form submit
document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');

    // Validate against DEMO_ACCOUNTS
    const account = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);

    if (!account) {
        errEl.classList.remove('hidden');
        setTimeout(() => errEl.classList.add('hidden'), 3000);
        return;
    }

    btn.textContent = 'Signing in...';
    btn.style.opacity = '0.7';
    btn.disabled = true;

    localStorage.setItem('dipp_user', JSON.stringify({
        email: account.email,
        role: account.role,
        name: account.name,
        regNo: account.regNo,
        dept: account.dept,
        year: account.year
    }));

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 700);
});
