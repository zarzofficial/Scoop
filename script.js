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
    let cart = JSON.parse(localStorage.getItem('scoopCart')) || [];
    let currentPendingItem = { name: '', price: 0 };
    
    // Initialize UI on load if cart has items
    setTimeout(updateCartUI, 100);
    
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
        localStorage.setItem('scoopCart', JSON.stringify(cart));
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
            localStorage.setItem('scoopCart', JSON.stringify(cart));
            updateCartUI();
        }
    }

    // Remove Item
    function removeItem(name) {
        cart = cart.filter(item => item.name !== name);
        localStorage.setItem('scoopCart', JSON.stringify(cart));
        updateCartUI();
    }

    window.updateQty = updateQty;
    window.removeItem = removeItem;

    // Update Cart UI
    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalItems = 0;
        const cartFooter = document.getElementById('cartFooter');

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">السلة فارغة</div>';
            if (cartFooter) cartFooter.style.display = 'none';
        } else {
            if (cartFooter) cartFooter.style.display = 'block';
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

    function buildOrderDetails() {
        let detailsText = '';
        let total = 0;
        cart.forEach((item, index) => {
            detailsText += `${index + 1}. ${item.name} - ${item.qty}x (السعر: ${item.price * item.qty} SD)\n`;
            total += item.price * item.qty;
        });
        detailsText += `\nالإجمالي: ${total} SD`;

        const orderDesc = document.getElementById('orderDescription');
        if (orderDesc && orderDesc.value.trim() !== '') {
            detailsText += `\nالموقع / الوصف: ${orderDesc.value.trim()}`;
        }
        return { detailsText, total };
    }

    // Checkout to WhatsApp
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('السلة فارغة! يرجى إضافة بعض الطلبات أولاً.');
            return;
        }
        
        let name = document.getElementById('orderName').value.trim();
        let phone = document.getElementById('orderPhone').value.trim();
        let desc = document.getElementById('orderDescription').value.trim();

        if (!name || !phone || !desc) {
            alert('يرجى تعبئة كافة الحقول (الاسم، رقم الهاتف، والوصف/العنوان) لإتمام الطلب.');
            return;
        }

        const { detailsText, total } = buildOrderDetails();
        let message = `مرحباً إسكوب - Scoop، أود طلب الآتي:\n\nالاسم: ${name}\nرقم الهاتف: ${phone}\n\n${detailsText}`;

        const waNumber = '249998736401';
        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
        
        // Save to orders history
        let orderId = Math.random().toString(36).substring(2, 9).toUpperCase(); // معرف فريد
        let orders = JSON.parse(localStorage.getItem('scoopOrders')) || [];
        orders.push({ id: orderId, date: new Date().toISOString(), items: [...cart], total: total, method: 'واتساب' });
        localStorage.setItem('scoopOrders', JSON.stringify(orders));

        cart = [];
        localStorage.setItem('scoopCart', JSON.stringify(cart));
        updateCartUI();
        document.getElementById('orderName').value = '';
        document.getElementById('orderPhone').value = '';
        document.getElementById('orderDescription').value = '';
        closeCart();
    });

    // Checkout to Website (Payment Gateway)
    const websiteCheckoutBtn = document.getElementById('websiteCheckoutBtn');
    const paymentModalOverlay = document.getElementById('paymentModalOverlay');
    const paymentModal = document.getElementById('paymentModal');
    const closePaymentBtn = document.getElementById('closePaymentBtn');
    const paymentOptions = document.querySelectorAll('input[name="paymentOption"]');
    const bankakDetails = document.getElementById('bankakDetails');
    const bankakReceipt = document.getElementById('bankakReceipt');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');

    function openPaymentModal() {
        paymentModalOverlay.classList.add('active');
        paymentModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closePaymentModal() {
        paymentModalOverlay.classList.remove('active');
        paymentModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    if (closePaymentBtn) closePaymentBtn.addEventListener('click', closePaymentModal);
    if (paymentModalOverlay) paymentModalOverlay.addEventListener('click', closePaymentModal);

    // Toggle Bankak Details
    paymentOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            if (e.target.value === 'bankak') {
                bankakDetails.style.display = 'block';
            } else {
                bankakDetails.style.display = 'none';
            }
        });
    });

    if (websiteCheckoutBtn) {
        websiteCheckoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('السلة فارغة!');
                return;
            }

            let name = document.getElementById('orderName').value.trim();
            let phone = document.getElementById('orderPhone').value.trim();
            let desc = document.getElementById('orderDescription').value.trim();

            if (!name || !phone || !desc) {
                alert('يرجى تعبئة كافة الحقول (الاسم، رقم الهاتف، والوصف/العنوان) لإتمام الطلب.');
                return;
            }
            
            // Validate success, proceed to payment
            openPaymentModal();
        });
    }

    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', async () => {
            let name = document.getElementById('orderName').value.trim();
            let phone = document.getElementById('orderPhone').value.trim();
            let selectedOption = document.querySelector('input[name="paymentOption"]:checked').value;
            let paymentStr = '';
            let uiPaymentMethod = '';

            if (selectedOption === 'bankak') {
                let receipt = bankakReceipt.value.trim();
                if (receipt.length !== 4) {
                    alert('الرجاء إدخال آخر 4 أرقام من معاملة بنكك بشكل صحيح للتأكيد.');
                    return;
                }
                paymentStr = `\nطريقة الدفع: تحويل بنكك (آخر 4 أرقام: ${receipt}) - مدفوع`;
                uiPaymentMethod = 'الموقع (تحويل بنكك)';
            } else {
                paymentStr = `\nطريقة الدفع: كاش (عند الاستلام)`;
                uiPaymentMethod = 'الموقع (الدفع كاش)';
            }

            confirmPaymentBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...';
            confirmPaymentBtn.disabled = true;

            const { detailsText, total } = buildOrderDetails();
            let orderId = Math.random().toString(36).substring(2, 9).toUpperCase(); // معرف فريد
            let finalDetails = detailsText + '\n' + paymentStr + '\n#ID:' + orderId;

            try {
                // إرسال الطلب بتنسيق نصي صريح لضمان استلامه في جوجل سكريبت بدون مشاكل CORS
                await fetch("https://script.google.com/macros/s/AKfycbzx3J2Wct7OCXSWM0ZGo0GlgmPs0ZaUncCTuzq9CFNsp6eoVMToqMiRlR6iBkGyb7Qo/exec", {
                    method: "POST",
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: JSON.stringify({
                        name: name,
                        phone: phone,
                        product: finalDetails
                    })
                });

                alert("تم إرسال الطلب بنجاح 🔥 سيتم التواصل معك قريباً!");
                
                // Save to orders history
                let orders = JSON.parse(localStorage.getItem('scoopOrders')) || [];
                orders.push({ id: orderId, date: new Date().toISOString(), items: [...cart], total: total, method: uiPaymentMethod });
                localStorage.setItem('scoopOrders', JSON.stringify(orders));

                // Clear state
                cart = [];
                localStorage.setItem('scoopCart', JSON.stringify(cart));
                updateCartUI();
                document.getElementById('orderName').value = '';
                document.getElementById('orderPhone').value = '';
                document.getElementById('orderDescription').value = '';
                bankakReceipt.value = '';
                
                closePaymentModal();
                closeCart();

            } catch (err) {
                alert("حدث خطأ أثناء الاتصال، يرجى المحاولة مرة أخرى.");
            } finally {
                confirmPaymentBtn.innerHTML = 'تأكيد الدفع وإنهاء الطلب <i class="fa-solid fa-check"></i>';
                confirmPaymentBtn.disabled = false;
            }
        });
    }

    // Orders Modal Logic
    const myOrdersNavBtn = document.getElementById('myOrdersNavBtn');
    const myOrdersMobileBtn = document.getElementById('myOrdersMobileBtn');
    const ordersModalOverlay = document.getElementById('ordersModalOverlay');
    const ordersModal = document.getElementById('ordersModal');
    const closeOrdersBtn = document.getElementById('closeOrdersBtn');
    const ordersContainer = document.getElementById('ordersContainer');

    function openOrdersModal() {
        renderOrders();
        ordersModalOverlay.classList.add('active');
        ordersModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeOrdersModal() {
        ordersModalOverlay.classList.remove('active');
        ordersModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    if(myOrdersNavBtn) {
        myOrdersNavBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openOrdersModal();
        });
    }
    
    if(myOrdersMobileBtn) {
        myOrdersMobileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Assuming closeMobileMenu exists globally (which it does via scoping in DOMContentLoaded)
            document.getElementById('mobileMenu').classList.remove('active');
            openOrdersModal();
        });
    }

    if(closeOrdersBtn) closeOrdersBtn.addEventListener('click', closeOrdersModal);
    if(ordersModalOverlay) ordersModalOverlay.addEventListener('click', closeOrdersModal);

    function renderOrders() {
        if(!ordersContainer) return;

        let storedOrders = JSON.parse(localStorage.getItem('scoopOrders')) || [];
        if (storedOrders.length === 0) {
            ordersContainer.innerHTML = '<div class="empty-cart-msg" style="text-align:center; padding: 30px; color:#777;"><i class="fa-solid fa-box-open" style="font-size:3rem; margin-bottom:15px; color:#ccc; display:block;"></i> لا توجد طلبات سابقة.</div>';
            return;
        }

        ordersContainer.innerHTML = '';
        
        // Render orders newest first
        storedOrders.slice().reverse().forEach((order, index) => {
            let d = new Date(order.date);
            let dateStr = d.toLocaleDateString('ar-EG') + ' ' + d.toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'});
            
            let itemsHtml = '';
            if(order.items && Array.isArray(order.items)) {
                itemsHtml = order.items.map(i => `
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.95rem;">
                        <span>${i.qty}x ${i.name}</span>
                        <span>${i.price * i.qty} SD</span>
                    </div>
                `).join('');
            } else {
                itemsHtml = '<div style="color:#999; font-size:0.85rem;">تفاصيل الطلب غير متوفرة</div>';
            }

            let statusBadge = '';
            if (order.method === 'واتساب') {
                statusBadge = '<span style="color:#25D366; background:#e8fdf0; padding:4px 10px; border-radius:12px; font-size:0.85rem;"><i class="fa-brands fa-whatsapp"></i> تواصل بالواتساب</span>';
            } else {
                statusBadge = `<span id="statusBadge-${order.id}" style="color:#666; background:#f0f0f0; padding:4px 10px; border-radius:12px; font-size:0.85rem;"><i class="fa-solid fa-spinner fa-spin"></i> تحديث...</span>`;
            }

            ordersContainer.innerHTML += `
                <div style="background:#fff; border:1px solid #e0e0e0; border-radius:12px; padding:20px; margin-bottom:15px; box-shadow:0 3px 10px rgba(0,0,0,0.02); position:relative; overflow:hidden;">
                    <div style="position:absolute; top:0; right:0; width:5px; height:100%; background:var(--primary-color);"></div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px dashed #eee; padding-bottom:12px; align-items:flex-start;">
                        <div>
                            <span style="font-weight:900; color:var(--text-dark); display:block; font-size:1.1rem;">طلب #${storedOrders.length - index}</span>
                            <span style="font-size:0.8rem; color:#888; display:block; margin-top:5px;">كود الطلب: ${order.id || 'غير متوفر'}</span>
                        </div>
                        <div style="text-align:left;">
                            <span style="color:#777; font-size:0.85rem; font-family:monospace; display:block; margin-bottom:8px">${dateStr}</span>
                            ${statusBadge}
                        </div>
                    </div>
                    
                    <div style="margin-bottom:15px; padding-right:12px;">
                        ${itemsHtml}
                    </div>
                    
                    <div style="display:flex; justify-content:space-between; font-weight:800; color:var(--text-dark); margin-top:15px; background:#fafafa; padding:12px 15px; border-radius:8px;">
                        <span>الإجمالي المدفوع</span>
                        <span style="color:var(--primary-color); font-size:1.1rem;">${order.total} SD</span>
                    </div>
                </div>
            `;
        });

        // Fetch live statuses for website orders
        if (storedOrders.some(o => o.method !== 'واتساب' && o.id)) {
            fetchLiveOrderStatuses();
        }
    }

    async function fetchLiveOrderStatuses() {
        try {
            const adminUrl = "https://script.google.com/macros/s/AKfycbzsurRcynQazy4J_UWFrNOqeJKIEfJoVZ2U0l-Wo5s-x1R-ltg1FVuaPagSSpDMWGjuyA/exec";
            let res = await fetch(adminUrl + "?v=" + Date.now());
            let cloudOrders = await res.json();

            let storedOrders = JSON.parse(localStorage.getItem('scoopOrders')) || [];
            storedOrders.forEach(order => {
                if (order.method !== 'واتساب' && order.id) {
                    let matchingCloudRow = cloudOrders.find(co => co.Product && co.Product.includes('#ID:' + order.id));
                    let badgeEl = document.getElementById(`statusBadge-${order.id}`);
                    if (matchingCloudRow && badgeEl) {
                        let status = matchingCloudRow['الحالة'] || matchingCloudRow.status || matchingCloudRow.Status || 'جديد';
                        let badgeColor = '#666'; let badgeBg = '#f0f0f0'; let icon = 'fa-clock';
                        if(status.includes('جديد')) { badgeColor = '#d32f2f'; badgeBg = '#ffebee'; }
                        else if(status.includes('التحضير')) { badgeColor = '#f57f17'; badgeBg = '#fff9c4'; icon = 'fa-fire-burner'; }
                        else if(status.includes('مكتمل')) { badgeColor = '#388e3c'; badgeBg = '#e8f5e9'; icon = 'fa-check-circle'; }
                        else if(status.includes('ملغي')) { badgeColor = '#7f8c8d'; badgeBg = '#ecf0f1'; icon = 'fa-xmark'; }
                        else { badgeColor = '#d32f2f'; badgeBg = '#ffebee'; }
                        
                        badgeEl.innerHTML = `<i class="fa-solid ${icon}"></i> ${status}`;
                        badgeEl.style.color = badgeColor;
                        badgeEl.style.background = badgeBg;
                    } else if (badgeEl) {
                        badgeEl.innerHTML = `<i class="fa-solid fa-clock"></i> قيد المراجعة`;
                    }
                }
            });
        } catch(e) {
            console.error("فشل في مزامنة حالة الطلبات", e);
            document.querySelectorAll('[id^="statusBadge-"]').forEach(el => {
                el.innerHTML = "تعذر الاتصال بالخادم";
            });
        }
    }

});
