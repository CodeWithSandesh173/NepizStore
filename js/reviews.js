// Review System Logic
function submitReview(reviewData) {
    if (typeof database === 'undefined') {
        console.error("Firebase database is not initialized");
        return Promise.reject("Database not found");
    }
    const reviewId = database.ref('reviews').push().key;
    reviewData.timestamp = firebase.database.ServerValue.TIMESTAMP;

    console.log("Submitting review:", reviewData);
    return database.ref(`reviews/${reviewId}`).set(reviewData);
}

function loadReviews(productId = null) {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;

    let ref = database.ref('reviews');
    if (productId) {
        ref = ref.orderByChild('productId').equalTo(productId);
    }

    ref.limitToLast(6).once('value').then(snapshot => {
        if (!snapshot.exists()) {
            container.innerHTML = '<p class="text-center text-muted">No reviews yet. Be the first to leave one!</p>';
            return;
        }

        container.innerHTML = '';
        const reviews = [];
        snapshot.forEach(child => {
            reviews.push(child.val());
        });

        // Show newest first
        reviews.reverse().forEach(review => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';

            // Create starred rating
            let stars = '';
            for (let i = 0; i < 5; i++) {
                stars += i < review.rating ? '⭐' : '☆';
            }

            card.innerHTML = `
                <div style="font-size: 0.8rem; margin-bottom: 0.5rem;">${stars}</div>
                <p>"${review.comment}"</p>
                <div class="user-info">
                    <div class="user-avatar">${review.username.substring(0, 2).toUpperCase()}</div>
                    <div>
                        <strong>${review.username}</strong>
                        <div class="verified-badge">✓ Verified Buyer</div>
                        <small class="text-muted" style="display:block; font-size: 0.7rem;">Bought ${review.productName}</small>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }).catch(error => {
        console.error("Error loading reviews:", error);
    });
}

// Auto-load reviews on index.html
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', () => {
        loadReviews();
    });
}
