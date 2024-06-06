document.addEventListener("DOMContentLoaded", function() {
    const menuItems = document.querySelectorAll(".menu-item");

    menuItems.forEach(item => {
        const img = item.querySelector(".menu-icon");
        const originalSrc = img.src;
        const extension = originalSrc.split('.').pop();
        const hoverSrc = originalSrc.replace(`.${extension}`, `_hover.${extension}`);

        item.addEventListener("mouseenter", function() {
            img.src = hoverSrc;
        });

        item.addEventListener("mouseleave", function() {
            img.src = originalSrc;
        });
    });

    const contactButton = document.getElementById("menu-item-contact");
    contactButton.addEventListener("click", function(event) {
        event.preventDefault();
        const email = "ethanmahlke@gmail.com";
        
        navigator.clipboard.writeText(email).then(function() {
            const contactText = contactButton.querySelector(".menu-full");
            const contactIcon = contactButton.querySelector(".menu-icon");
            const contactOriginalText = contactText.textContent;
            const contactOriginalIconSrc = "media/contact_icon.png";
            contactText.textContent = "Email copied!";
            contactIcon.src = "media/contact_icon_copied.png";
            
            setTimeout(function() {
                contactText.textContent = contactOriginalText;
                contactIcon.src = contactOriginalIconSrc;
            }, 3000);
        }).catch(function(error) {
            console.error("Could not copy text: ", error);
        });
    });
});
