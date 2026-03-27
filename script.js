document.addEventListener('DOMContentLoaded', () => {
    /* ====== Sticky Navbar ====== */
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* ====== Mobile Menu Toggle ====== */
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeBtn = document.getElementById('closeBtn');
    const mobileLinks = mobileMenu.querySelectorAll('a');

    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = 'auto'; // allow scrolling
    }

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent scrolling
    });

    closeBtn.addEventListener('click', closeMobileMenu);

    // Close when clicking the dark backdrop outside the drawer
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            closeMobileMenu();
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    /* ====== Menu Category Filtering ====== */
    const categoryBtns = document.querySelectorAll('.category-btn');
    const categorySections = document.querySelectorAll('.menu-category-section');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            // Hide all sections with smooth fade out/in effect
            categorySections.forEach(section => {
                if (section.id === filterValue) {
                    section.classList.remove('hidden');
                    section.classList.add('active');
                } else {
                    section.classList.add('hidden');
                    section.classList.remove('active');
                }
            });
        });
    });

    /* ====== Active Link Highlighting on Scroll ====== */
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Add offset for the fixed navbar height
            if (scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });

        mobileLinks.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    /* ====== Cart System ====== */
    let cart = [];
    let currentPendingItem = { name: '', price: 0 };
    
    // Add to Cart Logic for Menu Cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const titleEl = card.querySelector('.item-title');
        const addBtn = card.querySelector('.add-to-cart-btn');
        if(titleEl && addBtn) {
            addBtn.addEventListener('click', () => {
                 let name = titleEl.textContent.replace(/\s+/g, ' ').trim();
                 let priceEl = card.querySelector('.item-price');
                 let price = priceEl ? parseInt(priceEl.textContent.replace(/\D/g, '')) : 0;
                 
                 // If the item itself is an extra being ordered from the menu, skip the modal
                 if (card.closest('#toppings')) {
                     addToCart(name, 500); // the extras cost 500
                     return;
                 }
                 
                 // When selecting juices, do not show the 'Customize' option
                 if (card.closest('#juices')) {
                     addToCart(name, price);
                     return;
                 }
                 
                 // Open Extras Modal instead of adding immediately
                 currentPendingItem = { name, price };
                 openExtrasModal(name);
            });
        }
    });

    // Extras Modal Elements
    const extrasModalOverlay = document.getElementById('extrasModalOverlay');
    const extrasModal = document.getElementById('extrasModal');
    const closeExtrasBtn = document.getElementById('closeExtrasBtn');
    const modalItemName = document.getElementById('modalItemName');
    const confirmExtrasBtn = document.getElementById('confirmExtrasBtn');
    const extraCheckboxes = document.querySelectorAll('.extra-option input[type="checkbox"]');

    function openExtrasModal(itemName) {
        modalItemName.textContent = itemName;
        // Uncheck all boxes
        extraCheckboxes.forEach(cb => cb.checked = false);
        
        extrasModalOverlay.classList.add('active');
        extrasModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeExtrasModal() {
        extrasModalOverlay.classList.remove('active');
        extrasModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    closeExtrasBtn.addEventListener('click', closeExtrasModal);
    extrasModalOverlay.addEventListener('click', closeExtrasModal);

    confirmExtrasBtn.addEventListener('click', () => {
        let extras = [];
        extraCheckboxes.forEach(cb => {
            if (cb.checked) extras.push(cb.value);
        });

        // Append extras string to the name if there are any
        let finalName = currentPendingItem.name;
        let finalPrice = currentPendingItem.price;
        
        if (extras.length > 0) {
            finalName += ` (إضافات: ${extras.join('، ')})`;
            finalPrice += (extras.length * 500);
        }

        addToCart(finalName, finalPrice);
        closeExtrasModal();
    });

    // Cart Elements
    const cartOverlay = document.getElementById('cartOverlay');
    const cartSidebar = document.getElementById('cartSidebar');
    const floatingCartBtn = document.getElementById('floatingCartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const cartBadge = document.getElementById('cartBadge');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Toggle Cart
    function openCart() {
        cartOverlay.classList.add('active');
        cartSidebar.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartOverlay.classList.remove('active');
        cartSidebar.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    floatingCartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Add to Cart Logic
    function addToCart(name, price) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({ name, price, qty: 1 });
        }
        updateCartUI();
        
        // Show feedback animation on button
        floatingCartBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            floatingCartBtn.style.transform = 'scale(1)';
        }, 300);
    }

    // Update Cart Quantity
    function updateQty(name, change) {
        const item = cart.find(item => item.name === name);
        if (item) {
            item.qty += change;
            if (item.qty <= 0) {
                cart = cart.filter(i => i.name !== name);
            }
            updateCartUI();
        }
    }

    // Remove Item
    function removeItem(name) {
        cart = cart.filter(item => item.name !== name);
        updateCartUI();
    }

    window.updateQty = updateQty;
    window.removeItem = removeItem;

    // Update Cart UI
    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">السلة فارغة</div>';
        } else {
            cart.forEach(item => {
                total += item.price * item.qty;
                totalItems += item.qty;
                
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-image">
                        <i class="fa-solid fa-ice-cream"></i>
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price-row">
                            <span class="item-price">${item.price * item.qty} SD</span>
                            <div class="qty-controls">
                                <button class="qty-btn" onclick="updateQty('${item.name.replace(/'/g, "\\'")}', -1)"><i class="fa-solid fa-minus"></i></button>
                                <span class="item-qty">${item.qty}</span>
                                <button class="qty-btn" onclick="updateQty('${item.name.replace(/'/g, "\\'")}', 1)"><i class="fa-solid fa-plus"></i></button>
                            </div>
                        </div>
                    </div>
                    <button class="remove-item" onclick="removeItem('${item.name.replace(/'/g, "\\'")}')"><i class="fa-solid fa-xmark"></i></button>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }

        cartTotalPrice.innerHTML = `${total} <span class="currency">SD</span>`;
        cartBadge.textContent = totalItems;
    }

    // Checkout to WhatsApp
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('السلة فارغة! يرجى إضافة بعض الطلبات أولاً.');
            return;
        }

        let message = 'مرحباً إسكوب - Scoop، أود طلب الآتي:%0A%0A';
        let total = 0;
        
        cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name} - ${item.qty}x (%0A   السعر: ${item.price * item.qty} SD)%0A`;
            total += item.price * item.qty;
        });

        message += `%0A%0Aالإجمالي: ${total} SD`;

        const orderDesc = document.getElementById('orderDescription');
        if (orderDesc && orderDesc.value.trim() !== '') {
            message += `%0A%0Aالموقع / الوصف: ${orderDesc.value.trim()}`;
        }

        // Redirect to WhatsApp
        const waNumber = '249998736401';
        window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
    });

});

