// Announcements functionality
function loadAnnouncement() {
    // Auto-update announcement to match the new theme if not already done
    if (!localStorage.getItem("theme_announcement_updated_v2")) {
        database.ref('announcement').set({
            active: true,
            message: "🎉 Welcome! Get instant delivery on PUBG UC, Free Fire Diamonds, and Premium Subscriptions! 💎"
        }).then(() => {
            localStorage.setItem("theme_announcement_updated_v2", "true");
        }).catch(err => console.error(err));
    }

    database.ref('announcement').once('value')
        .then(snapshot => {
            const announcement = snapshot.val();
            if (announcement && announcement.active) {
                displayAnnouncement(announcement.message);
            }
        })
        .catch(error => console.error("Error loading announcement:", error));
}

function displayAnnouncement(message) {
    const banner = document.getElementById('announcementBanner');
    const text = document.getElementById('announcementText');

    if (banner && text) {
        text.textContent = message;
        banner.style.display = 'block';
    }
}

function closeAnnouncement() {
    const banner = document.getElementById('announcementBanner');
    if (banner) {
        banner.style.display = 'none';
    }
}
