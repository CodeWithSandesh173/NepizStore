// Admin Dashboard JavaScript
// Handles all admin CRUD operations for products, orders, coupons, announcements, Black Friday, and chats

// Show different admin sections
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    event.target.classList.add('active');

    // Load data for the section
    loadSectionData(sectionName);
}

// Load data for each section
function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'products':
            loadProductsList();
            break;
        case 'orders':
            loadOrdersList();
            break;
        case 'coupons':
            loadCouponsList();
            break;
        case 'announcements':
            loadCurrentAnnouncement();
            break;
        case 'blackfriday':
            loadBlackFridayDeals();
            break;
        case 'settings':
            loadSiteSettings();
            break;
        case 'chats':
            loadChatsList();
            break;
    }
}

// ===== SETTINGS =====
function loadSiteSettings() {
    database.ref('settings/theme').once('value', snapshot => {
        const settings = snapshot.val() || {};
        document.getElementById('settingAutoBF').checked = settings.autoBlackFriday || false;
        document.getElementById('settingForceBF').checked = settings.forceBlackFriday || false;
    });
}

function saveSiteSettings() {
    const settings = {
        autoBlackFriday: document.getElementById('settingAutoBF').checked,
        forceBlackFriday: document.getElementById('settingForceBF').checked
    };

    database.ref('settings/theme').set(settings)
        .then(() => alert('Settings saved successfully! Website theme will update.'))
        .catch(error => alert('Error: ' + error.message));
}

// ===== DASHBOARD ===== 
function loadDashboardStats() {
    // Count products
    database.ref('products').once('value', snapshot => {
        document.getElementById('statProducts').textContent = snapshot.numChildren();
    });

    // Count orders and calculate revenue
    database.ref('orders').once('value', snapshot => {
        let totalOrders = 0;
        let pendingOrders = 0;
        let totalRevenue = 0;

        snapshot.forEach(child => {
            const order = child.val();
            totalOrders++;
            if (order.status === 'pending') pendingOrders++;

            // Robust Revenue Calculation
            let orderTotal = 0;

            if (order.total !== undefined && order.total !== null) {
                const totalStr = String(order.total);

                // Strip non-numeric
                const cleanTotal = totalStr.replace(/[^0-9.]/g, '');
                let amount = parseFloat(cleanTotal);

                if (Number.isFinite(amount)) {
                    orderTotal = amount;
                }
            }

            if (order.status === 'completed') totalRevenue += orderTotal;
        });

        document.getElementById('statOrders').textContent = totalOrders;
        document.getElementById('statPending').textContent = pendingOrders;
        document.getElementById('statRevenue').textContent = `NPR ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    });
}

// ===== PRODUCTS =====
function loadProductsList() {
    database.ref('products').once('value', snapshot => {
        const container = document.getElementById('productsList');
        container.innerHTML = '';

        snapshot.forEach(child => {
            const product = child.val();
            const div = document.createElement('div');
            div.className = 'card';
            div.style.marginBottom = '1rem';
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3>${product.name}</h3>
                        <p class="text-muted">${product.category} - ${product.packages.length} packages</p>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary" onclick="editProduct('${product.id}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    });
}

// Helper to add package input row
function addPackageInput(label = '', price = '') {
    const container = document.getElementById('packagesContainer');
    const div = document.createElement('div');
    div.className = 'package-row';
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.marginBottom = '10px';
    div.innerHTML = `
        <input type="text" placeholder="Label (e.g. 60 UC)" class="package-label" value="${label}" required>
        <input type="number" placeholder="Price" class="package-price" value="${price}" required>
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(div);
}

function showAddProductModal() {
    document.getElementById('productForm').reset();
    document.getElementById('packagesContainer').innerHTML = '';
    // Add one empty package row by default
    addPackageInput();

    document.getElementById('productId').readOnly = false;
    document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

function editProduct(productId) {
    database.ref(`products/${productId}`).once('value', snapshot => {
        const product = snapshot.val();
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productCurrency').value = product.currency || 'NPR'; // Default to NPR
        document.getElementById('productImage').value = product.image;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productRequirements').value = product.requirements || '';
        document.getElementById('productAdvancedUI').checked = product.useAdvancedUI || false;

        // Load packages
        const container = document.getElementById('packagesContainer');
        container.innerHTML = '';
        if (product.packages && product.packages.length > 0) {
            product.packages.forEach(pkg => {
                addPackageInput(pkg.label, pkg.price);
            });
        } else {
            addPackageInput();
        }

        document.getElementById('productId').readOnly = true;
        document.getElementById('productModal').classList.add('active');
    });
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        database.ref(`products/${productId}`).remove()
            .then(() => {
                alert('Product deleted successfully!');
                loadProductsList();
            })
            .catch(error => alert('Error: ' + error.message));
    }
}

// Product form submission
document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Collect packages
            const packages = [];
            document.querySelectorAll('.package-row').forEach(row => {
                const label = row.querySelector('.package-label').value;
                const price = Number(row.querySelector('.package-price').value);
                if (label && price) {
                    packages.push({ label, price });
                }
            });

            if (packages.length === 0) {
                alert('Please add at least one package.');
                return;
            }

            const productData = {
                id: document.getElementById('productId').value,
                name: document.getElementById('productName').value,
                category: document.getElementById('productCategory').value,
                currency: document.getElementById('productCurrency').value, // Save currency
                image: document.getElementById('productImage').value,
                description: document.getElementById('productDescription').value,
                requirements: document.getElementById('productRequirements').value,
                useAdvancedUI: document.getElementById('productAdvancedUI').checked,
                packages: packages
            };

            console.log("Saving Product Data to Firebase:", productData); // Log data for user verification

            database.ref(`products/${productData.id}`).set(productData)
                .then(() => {
                    alert('Product saved successfully! Check console for data details.');
                    closeProductModal();
                    loadProductsList();
                })
                .catch(error => alert('Error: ' + error.message));
        });
    }

    // Sync Products Button
    const syncBtn = document.getElementById('syncProductsBtn');
    if (syncBtn) {
        console.log("Sync Button found, attaching listener");
        syncBtn.addEventListener('click', () => {
            console.log("Sync Button clicked");
            if (confirm('This will overwrite all product data in Firebase with the local data in js/products.js. Continue?')) {
                if (typeof syncProductsToFirebase === 'function') {
                    syncProductsToFirebase();
                    alert('Products syncing started. Check console for details.');
                } else {
                    alert('Error: syncProductsToFirebase function not found. Please reload.');
                }
            }
        });
    }
});

// ===== ORDERS =====
function loadOrdersList() {
    database.ref('orders').once('value', snapshot => {
        const tbody = document.getElementById('ordersTable');
        tbody.innerHTML = '';

        if (!snapshot.exists()) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No orders yet</td></tr>';
            return;
        }

        const orders = [];
        snapshot.forEach(child => {
            orders.push({ id: child.key, ...child.val() });
        });

        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        orders.forEach(order => {
            const tr = document.createElement('tr');
            // Safe access to properties
            const displayEmail = order.userEmail || 'Guest / Unknown';
            const displayTotal = order.total ? `NPR ${order.total}` : 'NPR 0';
            const itemCount = order.items ? order.items.length : 0;

            tr.innerHTML = `
                <td>${order.id.substring(0, 8)}</td>
                <td>${displayEmail}</td>
                <td>${itemCount} items</td>
                <td>${displayTotal}</td>
                <td>
                    <select onchange="updateOrderStatus('${order.id}', this.value)">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-secondary" onclick="window.open('admin-view-order.html?id=${order.id}', '_blank')">View Details</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }).catch(error => {
        console.error('Error loading orders:', error);
        const tbody = document.getElementById('ordersTable');
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading orders: ' + error.message + '</td></tr>';
    });
}

function updateOrderStatus(orderId, newStatus) {
    database.ref(`orders/${orderId}/status`).set(newStatus)
        .then(() => alert('Order status updated!'))
        .catch(error => alert('Error: ' + error.message));
}

function viewOrderDetails(orderId) {
    database.ref(`orders/${orderId}`).once('value', snapshot => {
        const order = snapshot.val();
        let details = `Order #${orderId.substring(0, 8)}\n\n`;
        details += `Customer: ${order.userEmail || 'N/A'}\n`;
        details += `Date: ${new Date(order.createdAt).toLocaleString()}\n`;
        details += `Status: ${order.status}\n\n`;

        details += `Items:\n`;
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                details += `- ${item.productName} (${item.package}): NPR ${item.price}\n`;
            });
        } else {
            details += `- No items found (Legacy order)\n`;
        }

        details += `\nTotal: NPR ${order.total || 0}\n\n`;
        details += `Payment Method: ${order.paymentMethod || 'N/A'}\n`;

        if (order.paymentProof) {
            details += `Payment Proof Link: ${order.paymentProof.imgbbLink || 'N/A'}\n`;
            details += `Account Number: ${order.paymentProof.accountNumber || 'N/A'}\n`;
            details += `Transaction ID: ${order.paymentProof.transactionId || 'N/A'}\n\n`;
        } else {
            details += `Payment Proof: Not submitted\n\n`;
        }

        details += `Requirements / Account Details:\n`;
        if (order.requirements) {
            // Check if requirements is a string or object
            if (typeof order.requirements === 'object') {
                for (let key in order.requirements) {
                    // Format key from "requirement_pubg_id" to "Pubg Id" for better readability
                    const readableKey = key.replace('requirement_', '').replace(/_/g, ' ').toUpperCase();
                    details += `${readableKey}: ${order.requirements[key]}\n`;
                }
            } else {
                details += `${order.requirements}\n`;
            }
        } else {
            details += `No specific requirements provided.\n`;
        }

        alert(details);
    });
}

// ===== COUPONS =====
function loadCouponsList() {
    database.ref('coupons').once('value', snapshot => {
        const tbody = document.getElementById('couponsTable');
        tbody.innerHTML = '';

        snapshot.forEach(child => {
            const coupon = child.val();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${coupon.code}</td>
                <td>${coupon.discount}%</td>
                <td>${coupon.active ? '✅ Active' : '❌ Inactive'}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteCoupon('${child.key}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function showAddCouponModal() {
    document.getElementById('couponForm').reset();
    document.getElementById('couponModal').classList.add('active');
}

function closeCouponModal() {
    document.getElementById('couponModal').classList.remove('active');
}

function deleteCoupon(couponId) {
    if (confirm('Are you sure you want to delete this coupon?')) {
        database.ref(`coupons/${couponId}`).remove()
            .then(() => {
                alert('Coupon deleted!');
                loadCouponsList();
            })
            .catch(error => alert('Error: ' + error.message));
    }
}

// Coupon form submission
document.addEventListener('DOMContentLoaded', () => {
    const couponForm = document.getElementById('couponForm');
    if (couponForm) {
        couponForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const couponData = {
                code: document.getElementById('couponCode').value.toUpperCase(),
                discount: parseInt(document.getElementById('couponDiscount').value),
                active: document.getElementById('couponActive').checked
            };

            database.ref('coupons').push(couponData)
                .then(() => {
                    alert('Coupon created successfully!');
                    closeCouponModal();
                    loadCouponsList();
                })
                .catch(error => alert('Error: ' + error.message));
        });
    }
});

// ===== ANNOUNCEMENTS =====
function loadCurrentAnnouncement() {
    database.ref('announcement').once('value', snapshot => {
        const announcement = snapshot.val();
        if (announcement) {
            document.getElementById('announcementMessage').value = announcement.message || '';
            document.getElementById('announcementActive').checked = announcement.active || false;
        }
    });
}

function saveAnnouncement() {
    const announcementData = {
        message: document.getElementById('announcementMessage').value,
        active: document.getElementById('announcementActive').checked
    };

    database.ref('announcement').set(announcementData)
        .then(() => alert('Announcement saved successfully!'))
        .catch(error => alert('Error: ' + error.message));
}

function syncProductsManual() {
    syncProductsToFirebase();
    alert('Products syncing started. Check console for details.');
}

// ===== BLACK FRIDAY =====
function loadBlackFridayDeals() {
    database.ref('blackFriday').once('value', snapshot => {
        const container = document.getElementById('blackFridayList');
        container.innerHTML = '';

        snapshot.forEach(child => {
            const deal = child.val();
            const div = document.createElement('div');
            div.className = 'card';
            div.style.marginBottom = '1rem';
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3>${deal.name} - ${deal.package}</h3>
                        <p class="text-muted">
                            <span style="text-decoration: line-through;">NPR ${deal.originalPrice}</span>
                            <span class="text-danger"> → NPR ${deal.discountedPrice}</span>
                            (Save ${Math.round((1 - deal.discountedPrice / deal.originalPrice) * 100)}%)
                        </p>
                    </div>
                    <button class="btn btn-danger" onclick="deleteBlackFridayDeal('${child.key}')">Delete</button>
                </div>
            `;
            container.appendChild(div);
        });
    });
}

let bfSelectedProduct = null;

function showAddBlackFridayModal() {
    document.getElementById('blackFridayForm').reset();

    // Load products into dropdown
    const select = document.getElementById('bfProductSelect');
    select.innerHTML = '<option value="">-- Loading... --</option>';

    database.ref('products').once('value', snapshot => {
        select.innerHTML = '<option value="">-- Select a Product --</option>';
        snapshot.forEach(child => {
            const product = child.val();
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            // Store full object in data attribute? No, just lookup or fetch.
            // Actually simplest to store map in memory if list is small, or just fetch on change.
            // Let's attach data to element for simplicity
            option.dataset.product = JSON.stringify(product);
            select.appendChild(option);
        });
    });

    document.getElementById('blackFridayModal').classList.add('active');
}

function onBFProductChange() {
    const select = document.getElementById('bfProductSelect');
    const packageSelect = document.getElementById('bfPackageSelect');
    const selectedOption = select.options[select.selectedIndex];

    if (!selectedOption.value) {
        packageSelect.innerHTML = '<option value="">-- First Select Product --</option>';
        return;
    }

    const product = JSON.parse(selectedOption.dataset.product);
    bfSelectedProduct = product;

    // Auto-fill hidden fields
    document.getElementById('bfProductName').value = product.name;
    document.getElementById('bfImage').value = product.image;

    // Populate packages
    packageSelect.innerHTML = '<option value="">-- Select a Package --</option>';
    if (product.packages) {
        product.packages.forEach((pkg, index) => {
            const option = document.createElement('option');
            option.value = index; // Use index to identify
            option.textContent = `${pkg.label} (NPR ${pkg.price})`;
            option.dataset.price = pkg.price;
            option.dataset.label = pkg.label;
            packageSelect.appendChild(option);
        });
    }
}

function onBFPackageChange() {
    const select = document.getElementById('bfPackageSelect');
    const selectedOption = select.options[select.selectedIndex];

    if (selectedOption.value !== "") {
        document.getElementById('bfOriginalPrice').value = selectedOption.dataset.price;
        document.getElementById('bfPackage').value = selectedOption.dataset.label;
    } else {
        document.getElementById('bfOriginalPrice').value = '';
        document.getElementById('bfPackage').value = '';
    }
}

function closeBlackFridayModal() {
    document.getElementById('blackFridayModal').classList.remove('active');
}

function deleteBlackFridayDeal(dealId) {
    if (confirm('Delete this Black Friday deal?')) {
        database.ref(`blackFriday/${dealId}`).remove()
            .then(() => {
                alert('Deal deleted!');
                loadBlackFridayDeals();
            })
            .catch(error => alert('Error: ' + error.message));
    }
}

// Black Friday form submission
document.addEventListener('DOMContentLoaded', () => {
    const bfForm = document.getElementById('blackFridayForm');
    if (bfForm) {
        bfForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const dealData = {
                productId: document.getElementById('bfProductId').value,
                name: document.getElementById('bfProductName').value,
                package: document.getElementById('bfPackage').value,
                image: document.getElementById('bfImage').value,
                originalPrice: parseInt(document.getElementById('bfOriginalPrice').value),
                discountedPrice: parseInt(document.getElementById('bfDiscountedPrice').value)
            };

            database.ref('blackFriday').push(dealData)
                .then(() => {
                    alert('Black Friday deal added!');
                    closeBlackFridayModal();
                    loadBlackFridayDeals();
                })
                .catch(error => alert('Error: ' + error.message));
        });
    }
});

// ===== CHATS =====
function loadChatsList() {
    database.ref('chats').once('value', snapshot => {
        const container = document.getElementById('chatsList');
        container.innerHTML = '';

        if (!snapshot.exists()) {
            container.innerHTML = '<p class="text-center text-muted">No chats yet</p>';
            return;
        }

        snapshot.forEach(child => {
            const chat = child.val();
            const chatId = child.key;
            const metadata = chat.metadata || {};

            const div = document.createElement('div');
            div.className = 'card';
            div.style.marginBottom = '1rem';
            div.innerHTML = `
                <div>
                    <h3>${metadata.userEmail || 'Guest User'}</h3>
                    <p class="text-muted">Last message: ${metadata.lastMessage || 'N/A'}</p>
                    <button class="btn btn-secondary" onclick="viewChat('${chatId}')">View Chat</button>
                </div>
            `;
            container.appendChild(div);
        });
    });
}

function viewChat(chatId) {
    database.ref(`chats/${chatId}/messages`).once('value', snapshot => {
        let chatHistory = '';
        snapshot.forEach(child => {
            const msg = child.val();
            chatHistory += `[${msg.sender}]: ${msg.text}\n`;
        });

        const reply = prompt('Chat History:\n\n' + chatHistory + '\n\nEnter your reply:');
        if (reply) {
            const message = {
                text: reply,
                sender: 'support',
                timestamp: new Date().toISOString(),
                read: false
            };
            database.ref(`chats/${chatId}/messages`).push(message)
                .then(() => alert('Reply sent!'))
                .catch(error => alert('Error: ' + error.message));
        }
    });
}

// Logout
function logoutAdmin() {
    if (confirm('Are you sure you want to logout?')) {
        logoutUser().then(() => {
            window.location.href = 'index.html';
        });
    }
}

// Load dashboard on page load
window.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    initNotifications();
});

// ===== NOTIFICATIONS =====
// ===== NOTIFICATIONS =====
let notificationListenerActive = false;
const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Professional notification sound

function initNotifications() {
    console.log("[Notification] Initializing...");
    // Wait for auth to be ready
    auth.onAuthStateChanged(user => {
        if (user && ADMIN_EMAILS.includes(user.email)) {
            console.log("[Notification] Admin detected.");
            checkNotificationPermission();

            // Also switch orders list to real-time since we are here
            startRealTimeOrders();
        } else {
            console.log("[Notification] Not admin or not logged in.");
        }
    });
}

function checkNotificationPermission() {
    if (Notification.permission === "granted") {
        console.log("[Notification] Permission already granted.");
        startOrderListener();
        updateNotificationButton(true);
    } else if (Notification.permission === "denied") {
        console.warn("[Notification] Permission denied. User must enable manually in settings.");
        updateNotificationButton(false, "Denied");
    } else {
        console.log("[Notification] Permission needed.");
        updateNotificationButton(false);
    }
}

function enableNotifications() {
    // Play sound immediately to "unlock" audio in some browsers
    notificationSound.play().catch(e => console.log("Audio play blocked until interaction"));

    if (Notification.permission === "granted") {
        alert("Notifications already enabled! (Sound tested)");
        startOrderListener();
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            console.log("[Notification] Permission granted by user.");
            startOrderListener();
            updateNotificationButton(true);
            // Show a test notification
            showNotification("test", { userEmail: "Test User", total: "0" }, 'order');
        } else {
            console.warn("[Notification] Permission denied by user.");
            updateNotificationButton(false, "Denied");
        }
    });
}

function updateNotificationButton(enabled, labelOverride) {
    const btn = document.getElementById('enableNotifyBtn');
    if (!btn) return;

    if (enabled) {
        btn.innerHTML = "✅ Notifications & Sound Active";
        btn.classList.remove('btn-warning');
        btn.classList.add('btn-success');
        // btn.disabled = true; // Let them click it to test sound if they want
    } else {
        btn.textContent = labelOverride ? `❌ Notifications ${labelOverride}` : "🔔 Enable Notifications";
        btn.classList.remove('btn-success');
        btn.classList.add('btn-warning');
        btn.disabled = false;
    }
}

function startOrderListener() {
    if (notificationListenerActive) return;
    notificationListenerActive = true;

    // Use current timestamp to ignore old orders
    // We'll use a small buffer (5 minutes) just in case clock skew or delay
    const now = new Date();
    now.setMinutes(now.getMinutes() - 1);
    const baselineTime = now.toISOString();

    console.log(`[Notification] Listening for orders after: ${baselineTime}`);

    // Listen for orders added after 'baselineTime'
    database.ref('orders').orderByChild('createdAt').startAt(baselineTime).on('child_added', snapshot => {
        const order = snapshot.val();
        const orderId = snapshot.key;

        // Final sanity check to avoid double-triggering or old orders
        // Use a local storage or memory set to track notified IDs
        if (!window.notifiedOrders) window.notifiedOrders = new Set();
        if (window.notifiedOrders.has(orderId)) return;
        window.notifiedOrders.add(orderId);

        console.log("[Notification] New order detected:", orderId);
        showNotification(orderId, order, 'order');
    });

    // START CHAT LISTENER
    database.ref('chats').on('child_changed', snapshot => {
        const chat = snapshot.val();
        const chatId = snapshot.key;
        const metadata = chat.metadata;

        if (metadata && metadata.lastMessageTime > baselineTime && metadata.unreadCount > 0) {
            // Check if user sent the last message
            if (metadata.lastSender !== 'support') {
                showNotification(chatId, metadata, 'chat');
            }
        }
    });
}

function startRealTimeOrders() {
    console.log("[Admin] Starting real-time order list updates...");
    database.ref('orders').on('value', snapshot => {
        // If we are currently looking at the orders section, refresh the list
        const ordersSection = document.getElementById('orders');
        if (ordersSection && ordersSection.classList.contains('active')) {
            loadOrdersList();
        }
        // Also update dashboard stats
        loadDashboardStats();
    });
}

function showNotification(id, data, type) {
    let title, body, tag, icon;

    // Play Sound Alert
    notificationSound.play().catch(e => console.error("Sound play failed:", e));

    if (type === 'order') {
        title = "💰 NEW ORDER RECEIVED!";
        body = `Order #${id.substring(0, 8).toUpperCase()}\nCustomer: ${data.userEmail}\nTotal: ${data.total}`;
        tag = 'order_' + id;
        icon = 'images/icon.png';
    } else if (type === 'chat') {
        title = "💬 NEW MESSAGE";
        body = `From: ${data.userEmail || "Guest User"}\n"${data.lastMessage}"`;
        tag = 'chat_' + id + '_' + data.lastMessageTime;
        icon = 'images/icon.png';
    } else if (id === 'test') {
        title = "🔔 Notification Test";
        body = "If you see this and heard a sound, notifications are working!";
        tag = 'test';
    }

    if (Notification.permission === "granted") {
        const notification = new Notification(title, {
            body: body,
            icon: icon,
            tag: tag,
            silent: false, // Browser-default sound (our custom sound plays via Audio API)
            requireInteraction: true
        });

        notification.onclick = function () {
            window.focus();
            if (type === 'order') {
                showSection('orders');
            } else if (type === 'chat') {
                window.location.href = 'admin-chat.html';
            }
            this.close();
        };
    } else {
        // Fallback: alert if permission missing but somehow triggered
        console.log("Notification triggered but permission is: " + Notification.permission);
    }
}
