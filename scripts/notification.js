document.addEventListener("DOMContentLoaded", function() {
    function showNotification(title, subtext) {
        const notification = document.getElementById('notification');
        notification.querySelector('.notification-title').textContent = title;
        notification.querySelector('.notification-subtext').textContent = subtext;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000); // hide after 5 seconds
    }

    // welcome message
    if (window.innerWidth >= 768) {
        showNotification('Hiya!', 'Welcome to my website! Enjoy your stay!');
    } else {
        showNotification('Mobile device', 'This website is mobile UNFRIENDLY. Consider switching to desktop~');
    }
});
