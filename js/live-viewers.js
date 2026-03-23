/**
 * Live Viewers Logic
 * Handles the random fluctuation of the viewer count on the site.
 */

function updateLiveViewers() {
    const viewerCountElement = document.getElementById('viewerCount');
    if (!viewerCountElement) {
        console.warn('Live Viewers: viewerCount element not found.');
        return;
    }

    // Initial random number between 20 and 70
    let currentCount = Math.floor(Math.random() * (70 - 20 + 1)) + 20;
    viewerCountElement.textContent = currentCount;

    // Fluctuate count every 5 seconds
    setInterval(() => {
        const change = Math.floor(Math.random() * 9) - 4; // Random step between -4 and +4
        currentCount += change;
        
        // Clamp between 20 and 70
        if (currentCount < 20) currentCount = 20;
        if (currentCount > 70) currentCount = 70;
        
        viewerCountElement.textContent = currentCount;
    }, 5000);
    
    console.log('Live Viewers logic started.');
}

// Initialize when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateLiveViewers);
} else {
    updateLiveViewers();
}
