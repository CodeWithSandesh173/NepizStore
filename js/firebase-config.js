// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAOmrpJBIFNx_29T22Ww1kLZFcMMQV0xmc",
    authDomain: "nepizstoreofficial.firebaseapp.com",
    databaseURL: "https://nepizstoreofficial-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nepizstoreofficial",
    storageBucket: "nepizstoreofficial.firebasestorage.app",
    messagingSenderId: "430781730325",
    appId: "1:430781730325:web:1b66bae96e1ff7b45b081c",
    measurementId: "G-VL2HEPY2XG"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const database = firebase.database();

// Admin email constants
const ADMIN_EMAILS = ["bhandaryshandesh2@gmail.com", "nepizdigistore@gmail.com"];
const ADMIN_EMAIL = ADMIN_EMAILS[0]; // Primary admin (kept for backward compatibility)

// Helper function to check if current user is admin
function isAdmin() {
    const user = auth.currentUser;
    return user && ADMIN_EMAILS.includes(user.email);
}

// Helper function to get current user ID
function getCurrentUserId() {
    const user = auth.currentUser;
    return user ? user.uid : null;
}

// Helper function to get current user email
function getCurrentUserEmail() {
    const user = auth.currentUser;
    return user ? user.email : null;
}

// Theme Toggle Logic
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');

    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
        btn.textContent = isDark ? '☀️' : '🌙';
        btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
}

// Initialize Theme
document.addEventListener('DOMContentLoaded', () => {
    // Check localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }

    // Black Friday Logic (Keep existing)
    if (typeof database !== 'undefined') {
        database.ref('settings/theme').on('value', snapshot => {
            const settings = snapshot.val();
            if (!settings) return;

            const now = new Date();
            const isFriday = now.getDay() === 5;

            let enableTheme = false;
            if (settings.forceBlackFriday) {
                enableTheme = true;
            } else if (settings.autoBlackFriday && isFriday) {
                enableTheme = true;
            }

            if (enableTheme) {
                document.body.classList.add('black-friday-theme');
                // Remove dark mode logic if BF is active to avoid conflict? 
                // Or let CSS cascade handle it (BF is defined after in CSS, so it wins).
            } else {
                document.body.classList.remove('black-friday-theme');
            }
        });
    }
});
