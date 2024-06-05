document.addEventListener("DOMContentLoaded", function() {
    const menuItems = document.querySelectorAll(".menu-item");

    menuItems.forEach(item => {
        const img = item.querySelector(".menu-icon");
        const originalSrc = img.src;
        const hoverSrc = originalSrc.replace(".png", "_hover.png");

        item.addEventListener("mouseenter", function() {
            img.src = hoverSrc;
        });

        item.addEventListener("mouseleave", function() {
            img.src = originalSrc;
        });
    });

    const contactButton = document.getElementById("menu-item-contact");
    contactButton.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent the default action
        const email = "ethanmahlke@gmail.com";
        
        // Copy email to clipboard
        navigator.clipboard.writeText(email).then(function() {
            // Change button text to "Email copied!"
            const contactText = contactButton.querySelector(".menu-full");
            const contactIcon = contactButton.querySelector(".menu-icon");
            const originalText = contactText.textContent;
            const originalIconSrc = "media/contact_icon.png";
            contactText.textContent = "Email copied!";
            contactIcon.src = "media/contact_icon_copied.png";
            
            // Change text and icon back to original after 3 seconds
            setTimeout(function() {
                contactText.textContent = originalText;
                contactIcon.src = originalIconSrc;
            }, 3000);
        }).catch(function(error) {
            console.error("Could not copy text: ", error);
        });
    });
});