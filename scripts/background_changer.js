document.addEventListener("DOMContentLoaded", function() {
    const backgrounds = [
        '/media/background-hills-day.gif',
        '/media/background-hills-night.gif'
    ];

    let currentBackgroundIndex = parseInt(localStorage.getItem('backgroundIndex')) || 0;

    // apply background
    document.body.style.backgroundImage = `url('${backgrounds[currentBackgroundIndex]}')`;

    const changeBackgroundButton = document.getElementById("menu-item-background"); 
    const backgroundButtonText = changeBackgroundButton.querySelector(".menu-full");
    const backgroundOriginalText = backgroundButtonText.textContent;

    changeBackgroundButton.addEventListener("click", function(event) {
        event.preventDefault();

        // cycle
        currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;
        document.body.style.backgroundImage = `url('${backgrounds[currentBackgroundIndex]}')`;

        // save 
        localStorage.setItem('backgroundIndex', currentBackgroundIndex);

        // update haha minecraft
        backgroundButtonText.textContent = currentBackgroundIndex === 0 ? "/time set day" : "/time set night";
        setTimeout(function() {
            backgroundButtonText.textContent = backgroundOriginalText;
        }, 1000);
    });
});
