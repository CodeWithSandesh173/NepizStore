// Authentication Functions
// Handles user registration, login, logout, password reset

// Register new user
function registerUser(email, password, username) {
    return auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;

            // Send email verification
            user.sendEmailVerification();

            // Store user profile in database
            return database.ref(`users/${user.uid}`).set({
                username: username,
                email: email,
                createdAt: new Date().toISOString()
            });
        });
}

// Login user
function loginUser(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
}

// Logout user
function logoutUser() {
    return auth.signOut();
}

// Reset password
function resetPassword(email) {
    return auth.sendPasswordResetEmail(email);
}

// Check auth state
function onAuthStateChanged(callback) {
    auth.onAuthStateChanged(callback);
}

// Protect page (redirect if not logged in)
function protectPage() {
    onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'login.html';
        }
    });
}

// Protect admin page
function protectAdminPage() {
    onAuthStateChanged(user => {
        if (!user || !ADMIN_EMAILS.includes(user.email)) {
            alert('Access denied. Admin only.');
            window.location.href = 'index.html';
        }
    });
}

// Get user profile
function getUserProfile(userId, callback) {
    database.ref(`users/${userId}`).once('value')
        .then(snapshot => callback(snapshot.val()))
        .catch(error => console.error("Error fetching user profile:", error));
}

// Update user profile
function updateUserProfile(userId, data) {
    return database.ref(`users/${userId}`).update(data);
}

// ===== CUSTOMER NOTIFICATIONS =====
let customerNotificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
let customerOrdersListenerActive = false;

function initCustomerNotifications(user) {
    if (customerOrdersListenerActive || !user) return;

    // Skip notification listener for ADMIN in auth.js (already handled in admin.js)
    if (typeof ADMIN_EMAILS !== 'undefined' && ADMIN_EMAILS.includes(user.email)) return;

    customerOrdersListenerActive = true;
    console.log("[Auth] Starting customer notification listener...");

    // Request permission silently or on first order? 
    // Let's check permission on load if they are logged in.
    if (Notification.permission === "default") {
        // Notification.requestPermission(); // Don't annoy on every page load, maybe wait for status change?
    }

    // Listen for changes in user's orders
    database.ref('orders').orderByChild('userId').equalTo(user.uid).on('child_changed', snapshot => {
        const order = snapshot.val();
        const orderId = snapshot.key;

        // Check if status changed to 'completed'
        if (order.status === 'completed') {
            showCustomerNotification(orderId, order);
        }
    });
}

function showCustomerNotification(orderId, order) {
    // Play Sound
    customerNotificationSound.play().catch(e => console.log("Sound play blocked until user interaction"));

    const title = "✅ Order Completed!";
    const body = `Great news! Your order #${orderId.substring(0, 8).toUpperCase()} for ${order.items[0].productName} is now DONE.`;
    const icon = 'images/icon.png';

    if (Notification.permission === "granted") {
        new Notification(title, { body, icon, tag: 'order_done_' + orderId });
    } else {
        // Fallback for when notifications aren't enabled
        alert(title + "\n" + body);
    }
}

// Initialize on auth state change
auth.onAuthStateChanged(user => {
    if (user) {
        initCustomerNotifications(user);
    }
});
