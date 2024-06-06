document.addEventListener("DOMContentLoaded", function() {
    const backgrounds = [
        'media/background-hills-day.gif',
        'media/background-hills-night.gif'
    ];

    let currentBackgroundIndex = 0;

    const changeBackgroundButton = document.getElementById("menu-item-background"); 
    const backgroundButtonText = changeBackgroundButton.querySelector(".menu-full");
    const backgroundOriginalText = backgroundButtonText.textContent;
    changeBackgroundButton.addEventListener("click", function(event) {
        event.preventDefault();

        // cycle through backgrounds
        currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;
        document.body.style.backgroundImage = `url('${backgrounds[currentBackgroundIndex]}')`;

        // update button text
        backgroundButtonText.textContent = currentBackgroundIndex === 0 ? "/time set day" : "/time set night";
        setTimeout(function() {
            backgroundButtonText.textContent = backgroundOriginalText;
        }, 1000);
    });
});
