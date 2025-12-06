// Initialize cart from localStorage
function initCart() {
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
}

// Add item to cart
function addToCart(event) {
    event.preventDefault();
    
    const button = event.target;
    const productId = button.getAttribute('data-id');
    const productName = button.getAttribute('data-name');
    const productPrice = parseFloat(button.getAttribute('data-price'));
    const pageKey = window.location.pathname; // make items unique per page
    let productImage = button.getAttribute('data-image');
    // If button has no data-image, try to find the product image in the DOM
    if (!productImage) {
        const productEl = button.closest('.product');
        if (productEl) {
            const img = productEl.querySelector('img');
            if (img) productImage = img.getAttribute('src') || '';
        }
    }
    
    // Get cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if item already exists (match by id + page to avoid cross-page collisions)
    // Try to find an exact match (same id on the same page). If not present, fall back
    // to an older item without `page` (for backward compatibility).
    const existingItem = cart.find(item => item.id === productId && item.page === pageKey)
        || cart.find(item => item.id === productId && !item.page);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            id: productId,
            page: pageKey,
            name: productName,
            price: productPrice,
            image: productImage,
            qty: 1
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Visual confirmation: ripple on button + image pop + toast notification
    createButtonRipple(button, event);
    const productEl = button.closest('.product');
    if (productEl) {
        const img = productEl.querySelector('img');
        if (img) {
            img.classList.remove('pop');
            // trigger reflow to restart animation
            void img.offsetWidth;
            img.classList.add('pop');
            setTimeout(() => img.classList.remove('pop'), 600);
            // flying animation to cart
            flyToCart(img);
        }
    }
    showToast(productName + ' added to cart!');
    // animate a ghost +1 and update the header cart count visually
    ghostIncrementCart(1);
    // schedule a debounced sync with localStorage to ensure exact count (handles concurrent updates / other tabs)
    debouncedSyncCart();
}

/* ------------------- UI helpers ------------------- */
// Ensure container for toasts exists
function getToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

function showToast(message, timeout = 2000) {
    const container = getToastContainer();
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    container.appendChild(t);
    // remove after timeout
    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateY(6px) scale(.98)';
        setTimeout(() => t.remove(), 260);
    }, timeout);
}

/* ------------------- Cart icon + flying animation ------------------- */
// Ensure a cart icon exists in the header. If header exists but no cart, inject one.
function ensureHeaderCart() {
    const header = document.querySelector('header');
    if (!header) return null;
    let wrapper = header.querySelector('.header-cart');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'header-cart';
        // create button
        const btn = document.createElement('button');
        btn.className = 'cart-btn';
        btn.setAttribute('aria-label', 'Cart');
        btn.innerHTML = `
            <svg class="cart-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6h15l-1.5 9h-11L6 6z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="10" cy="20" r="1" fill="currentColor" />
                <circle cx="18" cy="20" r="1" fill="currentColor" />
            </svg>
            <span class="cart-count">0</span>
        `;
        wrapper.appendChild(btn);
        // place after nav if possible
        const nav = header.querySelector('nav');
        if (nav && nav.parentNode === header) header.insertBefore(wrapper, nav.nextSibling);
        else header.appendChild(wrapper);
    }
    return wrapper;
}

// simple debounce utility
function debounce(fn, wait) {
    let t;
    return function(...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

// Force-sync the header counter from localStorage (accurate source of truth)
function syncCartCounter(animate = false) {
    const wrapper = document.querySelector('.header-cart') || ensureHeaderCart();
    if (!wrapper) return;
    const countEl = wrapper.querySelector('.cart-count');
    if (!countEl) return;
    const actual = getCartCount();
    // If UI already matches, do nothing
    const displayed = parseInt(countEl.textContent || '0', 10) || 0;
    if (displayed === actual) return;
    // update to actual value
    countEl.textContent = String(actual);
    if (animate) {
        countEl.style.transition = 'transform 200ms ease';
        countEl.style.transform = 'scale(1.12)';
        setTimeout(() => { countEl.style.transform = ''; }, 200);
    }
}

// debounced version used after local changes to avoid rapid churn
const debouncedSyncCart = debounce(() => syncCartCounter(true), 300);

function getCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart.reduce((s, i) => s + (i.qty || 0), 0);
}

function updateCartCounter(animate = true) {
    const wrapper = document.querySelector('.header-cart') || ensureHeaderCart();
    if (!wrapper) return;
    const countEl = wrapper.querySelector('.cart-count');
    if (!countEl) return;
    const count = getCartCount();
    countEl.textContent = String(count);
    if (animate) {
        countEl.style.transform = 'scale(1.18)';
        countEl.style.transition = 'transform 180ms ease';
        setTimeout(() => { countEl.style.transform = ''; }, 180);
    }
}

function flyToCart(imgEl) {
    const cartBtn = document.querySelector('.cart-btn');
    if (!imgEl || !cartBtn) return;
    try {
        const imgRect = imgEl.getBoundingClientRect();
        const cartRect = cartBtn.getBoundingClientRect();

        const clone = imgEl.cloneNode(true);
        clone.className = 'flying-img';
        // set initial position and size
        clone.style.left = imgRect.left + 'px';
        clone.style.top = imgRect.top + 'px';
        clone.style.width = imgRect.width + 'px';
        clone.style.height = imgRect.height + 'px';
        clone.style.opacity = '1';
        document.body.appendChild(clone);

        // force reflow
        void clone.offsetWidth;

        // compute translation to center of cart button
        const targetX = (cartRect.left + cartRect.width/2) - (imgRect.left + imgRect.width/2);
        const targetY = (cartRect.top + cartRect.height/2) - (imgRect.top + imgRect.height/2);
        const targetScale = Math.max(0.18, (cartRect.width / imgRect.width) * 0.5);

        clone.style.transform = `translate(${targetX}px, ${targetY}px) scale(${targetScale}) rotate(10deg)`;
        clone.style.opacity = '0.14';

        // cleanup after animation
        setTimeout(() => {
            clone.remove();
            // small pulse on cart
            const countEl = document.querySelector('.cart-count');
            if (countEl) {
                countEl.style.transform = 'scale(1.18)';
                setTimeout(() => countEl.style.transform = '', 180);
            }
        }, 720);
    } catch (e) {
        // ignore animation errors
    }
}

// Ghost +1 animation and UI increment (increments displayed count by `by` immediately)
function ghostIncrementCart(by = 1) {
    const wrapper = document.querySelector('.header-cart') || ensureHeaderCart();
    if (!wrapper) return;
    const countEl = wrapper.querySelector('.cart-count');
    if (!countEl) return;

    // increment displayed count immediately
    const current = parseInt(countEl.textContent || '0', 10) || 0;
    countEl.textContent = String(current + by);

    // small pulse on the counter
    countEl.style.transition = 'transform 180ms ease';
    countEl.style.transform = 'scale(1.18)';
    setTimeout(() => { countEl.style.transform = ''; }, 180);

    // create floating ghost near the counter
    const rect = countEl.getBoundingClientRect();
    const ghost = document.createElement('span');
    ghost.className = 'ghost-qty';
    ghost.textContent = (by > 0 ? `+${by}` : String(by));
    // position it centered on the counter
    ghost.style.left = (rect.left + rect.width / 2) + 'px';
    ghost.style.top = (rect.top + rect.height / 2) + 'px';
    document.body.appendChild(ghost);

    // animate: move up and fade
    requestAnimationFrame(() => {
        ghost.style.transform = 'translate(-50%, -36px) scale(1)';
        ghost.style.opacity = '0';
    });

    setTimeout(() => ghost.remove(), 700);
}

// Create a ripple element on the clicked button (needs event)
function createButtonRipple(button, event) {
    try {
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(rect.width, rect.height) * 1.2;
        ripple.style.width = ripple.style.height = size + 'px';
        // position relative to button
        const x = (event.clientX || rect.left + rect.width/2) - rect.left - size/2;
        const y = (event.clientY || rect.top + rect.height/2) - rect.top - size/2;
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        button.appendChild(ripple);
        // remove after animation
        setTimeout(() => ripple.remove(), 650);
    } catch (e) {
        // silent fail if any issue (older browsers)
    }
}

// Display cart items in cart.html
function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const tableBody = document.querySelector('table tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows (except header)
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => row.remove());
    
    if (cart.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="6" style="text-align: center; padding: 20px;">Your cart is empty</td>';
        tableBody.appendChild(emptyRow);
        updateCartSummary(cart);
        return;
    }
    
    // Add cart items to table
    cart.forEach((item, index) => {
        const row = document.createElement('tr');
        const itemTotal = (item.price * item.qty).toFixed(2);
        const imageSrc = item.image ? item.image : `https://via.placeholder.com/100x100?text=${encodeURIComponent(item.name)}`;
        row.innerHTML = `
            <td><img src="${imageSrc}" alt="${item.name}"></td>
            <td>${item.name}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td><input type="number" class="qty-input" value="${item.qty}" data-index="${index}" onchange="updateQty(${index}, this.value)"></td>
            <td>$${itemTotal}</td>
            <td class="actions"><button onclick="removeFromCart(${index})">Remove</button></td>
        `;
        tableBody.appendChild(row);
    });
    
    updateCartSummary(cart);
}

// Update quantity
function updateQty(index, newQty) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const qty = parseInt(newQty);
    
    if (qty <= 0) {
        removeFromCart(index);
    } else {
        cart[index].qty = qty;
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
    }
}

// Remove item from cart
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

// Update cart summary
function updateCartSummary(cart) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shipping = subtotal > 0 ? 5.00 : 0;
    const total = (subtotal + shipping).toFixed(2);
    
    const summaryDiv = document.querySelector('.cart-summary');
    if (summaryDiv) {
        summaryDiv.innerHTML = `
            <h3>Summary</h3>
            <p>Subtotal: <strong>$${subtotal.toFixed(2)}</strong></p>
            <p>Shipping: <strong>$${shipping.toFixed(2)}</strong></p>
            <p>Total: <strong>$${total}</strong></p>
            <a href="checkout.html" class="checkout-btn">Proceed to Checkout</a>
        `;
    }
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    initCart();
    
    // Add event listeners to all Add to Cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });
    // Add ripple/press feedback to category links (visual effect on press)
    const categoryLinks = document.querySelectorAll('.category');
    categoryLinks.forEach(el => {
        // mousedown ensures the ripple is visible before navigation
        el.addEventListener('mousedown', (e) => createButtonRipple(el, e));
        // keyboard activation (Enter / Space)
        el.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                createButtonRipple(el, e);
            }
        });
    });
    
    // Display cart if on cart page
    if (document.querySelector('table tbody')) {
        displayCart();
    }
    // ensure header cart exists and show the correct count (skip on login page)
    if (!document.getElementById('loginForm')) {
        ensureHeaderCart();
        // initialize UI from localStorage
        syncCartCounter(false);
    }
    // update auth UI (login/profile) from stored user state
    if (typeof updateAuthUI === 'function') updateAuthUI();
    // also listen for storage events from other tabs/windows and sync
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') syncCartCounter(true);
    });
    // Initialize chat widget
    initChatWidget();
});

(function(){
    // Only initialize login handlers when the login form exists on the page
    const form = document.getElementById('loginForm');
    if (!form) return;

    // Query elements scoped to the form to avoid nulls on other pages
    const identifier = form.querySelector('#identifier');
    const password = form.querySelector('#password');
    const feedback = form.querySelector('#feedback');
    const toggle = form.querySelector('#togglePwd');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalSubmitText = submitBtn ? submitBtn.textContent : 'Log in';

    if (toggle && password) {
        toggle.addEventListener('click', () => {
            const isPwd = password.type === 'password';
            password.type = isPwd ? 'text' : 'password';
            toggle.textContent = isPwd ? 'Hide' : 'Show';
            toggle.setAttribute('aria-pressed', isPwd ? 'true' : 'false');
        });

        // Simple keyboard accessibility: prevent Enter/Space from submitting when toggling
        toggle.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') ev.preventDefault();
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (feedback) feedback.textContent = '';

            // Basic client-side validation
            if (identifier && !identifier.checkValidity()) {
                if (feedback) feedback.innerHTML = '<div class="error">Please enter a valid email address.</div>';
                identifier.focus();
                return;
            }
            if (password && !password.checkValidity()) {
                if (feedback) feedback.innerHTML = '<div class="error">Password must be at least 6 characters.</div>';
                password.focus();
                return;
            }

            // Disable button and show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Signing in...';
            }

            try {
                // Send login request to server
                const response = await fetch('api_login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        identifier: identifier ? identifier.value : '',
                        password: password ? password.value : ''
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // Store user info in localStorage
                    try { 
                        localStorage.setItem('user', JSON.stringify(data.user)); 
                    } catch (err) {}
                    
                    // Update UI
                    if (typeof updateAuthUI === 'function') updateAuthUI();
                    
                    if (feedback) feedback.innerHTML = '<div style="color:green">Signed in successfully. Redirecting...</div>';
                    
                    // Clear sensitive field
                    if (password) password.value = '';
                    
                    // Redirect after a short delay
                    setTimeout(() => { window.location.href = 'index.html'; }, 700);
                } else {
                    // Show error message
                    if (feedback) feedback.innerHTML = '<div class="error">' + (data.message || 'Login failed') + '</div>';
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalSubmitText;
                    }
                }
            } catch (error) {
                // Network error or other issues
                if (feedback) feedback.innerHTML = '<div class="error">Connection error. Please try again.</div>';
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalSubmitText;
                }
                console.error('Login error:', error);
            }
        });
    }
})();

/* ------------------- Authentication UI helpers ------------------- */
function getLoggedInUser() {
    try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; }
}

function logoutUser() {
    // Send logout request to server
    fetch('api_logout.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).catch(err => console.error('Logout error:', err));
    
    // Clear from localStorage
    try { localStorage.removeItem('user'); } catch (e) {}
    updateAuthUI();
}

function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]; });
}

function updateAuthUI(){
    const user = getLoggedInUser();
    const loginBtns = document.querySelectorAll('.login-btn');

    // Replace login buttons with account container when logged in
    loginBtns.forEach(btn => {
        const parent = btn.parentNode;
        if (!parent) return;
        if (user) {
            const container = document.createElement('div');
            container.className = 'account';
            container.innerHTML = `
                <a class="account-link" href="profile.html">
                    <span class="account-avatar" aria-hidden="true">👤</span>
                    <span class="account-name">${escapeHtml(user.name)}</span>
                </a>
                <button class="account-toggle" aria-expanded="false" aria-label="Account menu">▾</button>
                <div class="account-menu" hidden>
                    <a href="profile.html">Profile</a>
                    <a href="orders.html">My Orders</a>
                    <button class="logout-btn" type="button">Logout</button>
                </div>
            `;
            parent.replaceChild(container, btn);

            // wire up menu toggle and logout
            const toggle = container.querySelector('.account-toggle');
            const menu = container.querySelector('.account-menu');
            const logoutBtn = container.querySelector('.logout-btn');
            const menuLinks = container.querySelectorAll('.account-menu a');

            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const isHidden = menu.hasAttribute('hidden');
                if (isHidden) {
                    menu.removeAttribute('hidden');
                    toggle.setAttribute('aria-expanded', 'true');
                } else {
                    menu.setAttribute('hidden', '');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });

            // Prevent menu from closing when clicking inside it
            menu.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            // Menu links should close menu after navigation
            menuLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    menu.setAttribute('hidden', '');
                    toggle.setAttribute('aria-expanded', 'false');
                });
            });

            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                logoutUser();
                // after logout, update UI and navigate home
                updateAuthUI();
                window.location.href = 'index.html';
            });

            // close menu when clicking outside
            const docClose = function(ev){
                if (!container.contains(ev.target)){
                    if (!menu.hasAttribute('hidden')){
                        menu.setAttribute('hidden','');
                        toggle.setAttribute('aria-expanded','false');
                    }
                }
            };
            document.addEventListener('click', docClose);
        }
    });

    // If not logged in, revert any account containers back to login button
    if (!user) {
        const accounts = document.querySelectorAll('.account');
        accounts.forEach(acc => {
            const parent = acc.parentNode;
            if (!parent) return;
            const a = document.createElement('a');
            a.className = 'login-btn';
            a.href = 'login.html';
            a.textContent = 'Login';
            parent.replaceChild(a, acc);
        });
    }
}

(
    function(){
        // Only initialize signup handlers when the signup form exists
        const form = document.getElementById('signupForm');
        if (!form) return;

        // Scope queries to the form
        const fullName = form.querySelector('#fullName');
        const email = form.querySelector('#email');
        const phone = form.querySelector('#phone');
        const password = form.querySelector('#password');
        const confirm = form.querySelector('#confirmPassword');
        const terms = form.querySelector('#terms');
        const submitBtn = form.querySelector('#submitBtn');
        const result = form.querySelector('#result');

        const nameError = form.querySelector('#nameError');
        const emailError = form.querySelector('#emailError');
        const passwordError = form.querySelector('#passwordError');
        const confirmError = form.querySelector('#confirmError');
        const termsError = form.querySelector('#termsError');

        const toggle = form.querySelector('#togglePw');
        const pwMeter = form.querySelector('#pwMeter');

        function setError(el, msg){ if (el) el.textContent = msg || ''; }

        function passwordScore(pw){
            let score = 0;
            if (!pw) return 0;
            if (pw.length >= 8) score++;
            if (/[A-Z]/.test(pw)) score++;
            if (/[a-z]/.test(pw)) score++;
            if (/\d/.test(pw)) score++;
            if (/[\W_]/.test(pw)) score++;
            return score; // 0..5
        }

        function updateMeter(){
            if (!pwMeter || !password) return;
            const s = passwordScore(password.value);
            const pct = Math.min(100, (s / 5) * 100);
            pwMeter.style.width = pct + '%';
        }

        if (password) {
            password.addEventListener('input', () => {
                updateMeter();
                setError(passwordError, '');
            });
        }

        if (confirm) confirm.addEventListener('input', () => setError(confirmError, ''));
        if (fullName) fullName.addEventListener('input', () => setError(nameError, ''));
        if (email) email.addEventListener('input', () => setError(emailError, ''));
        if (terms) terms.addEventListener('change', () => setError(termsError, ''));

        if (toggle && password && confirm) {
            toggle.addEventListener('click', () => {
                const showing = password.type === 'text';
                password.type = showing ? 'password' : 'text';
                confirm.type = showing ? 'password' : 'text';
                toggle.textContent = showing ? 'Show' : 'Hide';
                toggle.setAttribute('aria-pressed', String(!showing));
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                let ok = true;
                setError(nameError, '');
                setError(emailError, '');
                setError(passwordError, '');
                setError(confirmError, '');
                setError(termsError, '');
                if (result) result.textContent = '';

                // name
                if (!fullName || !fullName.value.trim() || fullName.value.trim().length < 2){
                    setError(nameError, 'Please enter your full name.');
                    ok = false;
                }

                // email (HTML5 will validate format, add message)
                if (!email || !email.checkValidity()){
                    setError(emailError, 'Please enter a valid email address.');
                    ok = false;
                }

                // password pattern: at least 8, upper, lower, digit, symbol
                const pwPattern = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}/;
                if (!password || !pwPattern.test(password.value)){
                    setError(passwordError, 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a symbol.');
                    ok = false;
                }

                if (!confirm || password.value !== confirm.value){
                    setError(confirmError, 'Passwords do not match.');
                    ok = false;
                }

                if (!terms || !terms.checked){
                    setError(termsError, 'You must accept the terms to create an account.');
                    ok = false;
                }

                if (!ok){
                    if (result) result.textContent = '';
                    return;
                }

                // Simulate submission: do not send passwords to console in real apps.
                // Here we clear sensitive fields and show success.
                const safeName = fullName.value.trim();
                const safeEmail = email.value.trim();
                // Example: store non-sensitive data locally (not recommended for real auth)
                try {
                    localStorage.setItem('demo_signup_name', safeName);
                    localStorage.setItem('demo_signup_email', safeEmail);
                } catch (err){}
                if (password) password.value = '';
                if (confirm) confirm.value = '';
                updateMeter();

                if (result) {
                    result.textContent = 'Account created successfully. Check your email to verify.';
                    result.className = 'notice success';
                }
                if (submitBtn) {
                    submitBtn.disabled = true;
                    setTimeout(()=> submitBtn.disabled = false, 1500);
                }
            });
        }

        // Initialize meter
        updateMeter();
    }
)();

/* ------------------- Chat Support Widget ------------------- */
function initChatWidget() {
    // Skip if widget already exists
    if (document.getElementById('chat-widget')) return;

    const chatHTML = `
        <div id="chat-widget" class="chat-widget">
            <div class="chat-widget-header" id="chatToggle">
                <div style="display: flex; align-items: center; gap: 8px; font-weight: 600;">
                    <span>💬 Chat Support</span>
                </div>
                <button class="chat-close-btn" id="chatMinimize">−</button>
            </div>
            <div class="chat-widget-body" id="chatBody">
                <div class="chat-messages">
                    <div class="chat-message bot">
                        <div class="chat-message-content">Hi! 👋 How can we help you today?</div>
                    </div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chatInput" class="chat-input" placeholder="Type a message..." autocomplete="off">
                    <button id="chatSend" class="chat-send-btn">Send</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatHTML);

    const chatWidget = document.getElementById('chat-widget');
    const chatToggle = document.getElementById('chatToggle');
    const chatMinimize = document.getElementById('chatMinimize');
    const chatBody = document.getElementById('chatBody');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const messagesContainer = chatBody.querySelector('.chat-messages');

    let isMinimized = false;

    // Toggle chat minimize/maximize
    chatToggle.addEventListener('click', () => {
        isMinimized = !isMinimized;
        if (isMinimized) {
            chatBody.style.display = 'none';
            chatMinimize.textContent = '+';
        } else {
            chatBody.style.display = 'flex';
            chatMinimize.textContent = '−';
            chatInput.focus();
        }
    });

    // Send message
    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-message user';
        userMsg.innerHTML = `<div class="chat-message-content">${escapeHtml(text)}</div>`;
        messagesContainer.appendChild(userMsg);

        chatInput.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Simulate bot response after a short delay
        setTimeout(() => {
            const botResponse = getAutoResponse(text);
            const botMsg = document.createElement('div');
            botMsg.className = 'chat-message bot';
            botMsg.innerHTML = `<div class="chat-message-content">${botResponse}</div>`;
            messagesContainer.appendChild(botMsg);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 600);
    }

    // Auto-respond to common queries
    function getAutoResponse(message) {
        const msg = message.toLowerCase();
        const responses = {
            'hello|hi|hey': 'Hello! 👋 Welcome to SSU New Gen TechMart. How can I assist you?',
            'help|support': 'I\'m here to help! You can ask me about:\n• Product information\n• Order status\n• Shipping details\n• Returns & refunds\n• Technical support',
            'order|track|shipping': 'To track your order, please visit your <strong>My Orders</strong> page in your account. You\'ll see the status and tracking information there.',
            'return|refund|exchange': 'We offer 30-day returns on most items. Please visit your <strong>My Orders</strong> page to start a return process.',
            'product|price|buy': 'You can browse our full selection in the <strong>Shop</strong> section. Feel free to add items to your cart and proceed to checkout!',
            'account|login|sign': 'You can log in at our <strong>Login</strong> page. If you don\'t have an account yet, you can sign up there too!',
            'thank|thanks|great': 'You\'re welcome! 😊 Is there anything else I can help you with?',
        };

        for (const [keywords, response] of Object.entries(responses)) {
            if (keywords.split('|').some(keyword => msg.includes(keyword))) {
                return response;
            }
        }

        return 'Thanks for your message! 👍 Our support team will get back to you shortly. In the meantime, feel free to explore our <strong>Shop</strong> or check your <strong>My Orders</strong> page.';
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}
