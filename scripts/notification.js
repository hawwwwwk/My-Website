document.addEventListener("DOMContentLoaded", function() {
    function showNotification(title, subtext) {
        const notification = document.getElementById('notification');
        notification.querySelector('.notification-title').textContent = title;
        notification.querySelector('.notification-subtext').textContent = subtext;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000); // Hide after 5 seconds
    }

    // Welcome message
    if (window.innerWidth >= 768) {
        showNotification('Hiya!', 'Welcome to my website! Enjoy your stay!');
    } else {
        showNotification('Mobile device', 'This website look\'s better on a desktop! Consider switching!');
    }
});
