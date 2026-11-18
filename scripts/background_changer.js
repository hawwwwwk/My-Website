(() => {
    const backgrounds = [
        '/media/background-hills-day.gif',
        '/media/background-hills-night.gif'
    ];

    let currentBackgroundIndex = 0;
    try {
        const savedIndex = Number.parseInt(localStorage.getItem('backgroundIndex'), 10);
        if (savedIndex === 1) currentBackgroundIndex = savedIndex;
    } catch (error) {
        // Use the day background when storage is unavailable.
    }

    // Run in the head so the selected background is set before the first paint.
    document.documentElement.style.backgroundImage = `url('${backgrounds[currentBackgroundIndex]}')`;

    // Keep the outgoing navigation snapshot until the new background can paint.
    // This never hides the document when view transitions are unavailable.
    const backgroundImage = new Image();
    const finishBackground = () => {
        document.documentElement.classList.add('background-ready');
        clearTimeout(backgroundTimeout);
    };
    const backgroundTimeout = setTimeout(finishBackground, 2000);
    backgroundImage.onerror = finishBackground;
    backgroundImage.onload = async () => {
        try {
            await backgroundImage.decode();
        } catch (error) {
            // A loaded image may still paint if explicit decoding fails.
        }
        requestAnimationFrame(() => requestAnimationFrame(finishBackground));
    };
    backgroundImage.src = backgrounds[currentBackgroundIndex];

    function initializeBackgroundButton() {
        const changeBackgroundButton = document.getElementById("menu-item-background");
        if (!changeBackgroundButton) return;

        const backgroundButtonText = changeBackgroundButton.querySelector(".menu-full");
        const backgroundOriginalText = backgroundButtonText?.textContent;

        changeBackgroundButton.addEventListener("click", function(event) {
            event.preventDefault();

            currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;
            document.documentElement.style.backgroundImage = `url('${backgrounds[currentBackgroundIndex]}')`;

            try {
                localStorage.setItem('backgroundIndex', currentBackgroundIndex);
            } catch (error) {
                // Keep the selection for this page even when storage is unavailable.
            }

            if (!backgroundButtonText) return;
            backgroundButtonText.textContent = currentBackgroundIndex === 0 ? "/time set day" : "/time set night";
            setTimeout(function() {
                backgroundButtonText.textContent = backgroundOriginalText;
            }, 1000);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeBackgroundButton, { once: true });
    } else {
        initializeBackgroundButton();
    }
})();
