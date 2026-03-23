/**
 * Recent Purchases Notification Logic
 * Displays a rotating list of recent customer purchases to build social proof.
 */

const purchaseData = [
    { name: "Sandesh", product: "Spotify" },
    { name: "Aayush", product: "Spotify" },
    { name: "Rohit", product: "Spotify" },
    { name: "Sujan", product: "Spotify" },
    { name: "Bikash", product: "Spotify" },
    { name: "Niraj", product: "Spotify" },
    { name: "Prakash", product: "Spotify" },
    { name: "Suman", product: "Spotify" },
    { name: "Dipesh", product: "Spotify" },
    { name: "Kiran", product: "Spotify" },
    { name: "Samir", product: "Netflix" },
    { name: "Anish", product: "Netflix" },
    { name: "Ramesh", product: "Netflix" },
    { name: "Bibek", product: "Netflix" },
    { name: "Sagar", product: "Netflix" },
    { name: "Amit", product: "Crunchyroll" },
    { name: "Raj", product: "Crunchyroll" },
    { name: "Nitesh", product: "Crunchyroll" },
    { name: "Shyam", product: "Crunchyroll" },
    { name: "Ajay", product: "Crunchyroll" },
    { name: "Pawan", product: "Google Storage" },
    { name: "Kamal", product: "Google Storage" },
    { name: "Dinesh", product: "Google Storage" },
    { name: "Raju", product: "Google Storage" },
    { name: "Sunil", product: "Google Storage" },
    { name: "Binod", product: "Prime Video" },
    { name: "Tej", product: "Prime Video" },
    { name: "Milan", product: "Prime Video" },
    { name: "Umesh", product: "Prime Video" },
    { name: "Gopal", product: "Prime Video" },
    { name: "Nabin", product: "ChatGPT" },
    { name: "Suraj", product: "ChatGPT" },
    { name: "Krishna", product: "ChatGPT" },
    { name: "Arjun", product: "ChatGPT" },
    { name: "Rabin", product: "ChatGPT" },
    { name: "Ashish", product: "Sony LIV" },
    { name: "Manish", product: "Sony LIV" },
    { name: "Roshan", product: "Sony LIV" },
    { name: "Deepak", product: "Sony LIV" },
    { name: "Hari", product: "Sony LIV" }
];

const timeOptions = [
    "just now",
    "2 minutes ago",
    "5 minutes ago",
    "10 minutes ago",
    "15 minutes ago",
    "25 minutes ago",
    "45 minutes ago",
    "1 hour ago",
    "2 hours ago"
];

function showNotification() {
    const container = document.getElementById('purchaseNotification');
    if (!container) return;

    // Pick random purchase
    const purchase = purchaseData[Math.floor(Math.random() * purchaseData.length)];
    const time = timeOptions[Math.floor(Math.random() * timeOptions.length)];

    // Update content
    container.innerHTML = `
        <div class="purchase-icon">🛍️</div>
        <div class="purchase-info">
            <span class="purchase-user"><strong>${purchase.name}</strong> just bought</span>
            <span class="purchase-product">${purchase.product}</span>
            <span class="purchase-time">${time}</span>
        </div>
    `;

    // Show with animation
    container.classList.add('active');

    // Hide after 5 seconds
    setTimeout(() => {
        container.classList.remove('active');
    }, 5000);
}

// Start rotation
function initRecentPurchases() {
    // Initial delay
    setTimeout(() => {
        showNotification();
        // Repeat every 10-15 seconds
        setInterval(showNotification, 12000);
    }, 3000);
}

// Initialize when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecentPurchases);
} else {
    initRecentPurchases();
}
