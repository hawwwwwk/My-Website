document.addEventListener("DOMContentLoaded", function() {
    const notification = document.getElementById('notification');
    if (!notification) {
        return;
    }

    function showNotification(title, subtext, anchor) {
        notification.querySelector('.notification-title').textContent = title;
        notification.querySelector('.notification-subtext').textContent = subtext;
        notification.style.display = 'block';

        if (anchor) {
            const buttonRect = anchor.getBoundingClientRect();
            const notificationWidth = notification.offsetWidth;
            const notificationHeight = notification.offsetHeight;
            const maxLeft = Math.max(8, window.innerWidth - notificationWidth - 8);
            const desiredLeft = buttonRect.left + buttonRect.width / 2 - notificationWidth + 15;
            const left = Math.min(Math.max(8, desiredLeft), maxLeft);
            const top = Math.max(8, buttonRect.top - notificationHeight - 12);

            notification.style.left = `${left}px`;
            notification.style.top = `${top}px`;
            notification.style.right = 'auto';
            notification.style.bottom = 'auto';
        }
    }

    function hideNotification() {
        notification.style.display = 'none';
        notification.style.left = '';
        notification.style.top = '';
        notification.style.right = '';
        notification.style.bottom = '';
    }

    document.querySelectorAll('.link-button[data-thought]:not([data-thought=""])').forEach(button => {
        const showThought = () => {
            const image = button.querySelector('img');
            showNotification(button.dataset.thoughtTitle || image?.alt || '', button.dataset.thought, button);
        };

        button.addEventListener('mouseenter', showThought);
        button.addEventListener('mouseleave', () => {
            if (document.activeElement !== button) {
                hideNotification();
            }
        });
        button.addEventListener('focus', showThought);
        button.addEventListener('blur', () => {
            if (!button.matches(':hover')) {
                hideNotification();
            }
        });
    });

    if (notification.hasAttribute('data-welcome')) {
        if (window.innerWidth >= 768) {
            showNotification('Hiya!', 'Welcome to my website! Enjoy your stay!');
        } else {
            showNotification('Mobile device', 'This website is mobile UNFRIENDLY. Consider switching to desktop~');
        }

        setTimeout(hideNotification, 5000);
    }
});
