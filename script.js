window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) { // Adjust scroll threshold as needed
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for fade-in sections
    const sections = document.querySelectorAll('.section-fade-in');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Optional: stop observing after animation
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Collapsible sections
    const collapsibleButtons = document.querySelectorAll('.toggle-button');
    collapsibleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.closest('.collapsible-section');
            const content = section.querySelector('.collapsible-content');

            if (content) {
                section.classList.toggle('expanded'); // Toggle on parent for h4 styling
                content.classList.toggle('expanded');

                if (content.classList.contains('expanded')) {
                    button.textContent = 'Свернуть подробности';
                    // Optional: Scroll to the top of the section when expanding
                    // if (content.scrollHeight > window.innerHeight * 0.8) {
                    //     section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // }
                } else {
                    button.textContent = 'Развернуть подробности';
                }
            }
        });
    });

    // Mobile menu toggle
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const nav = document.querySelector('.header nav ul');
    const overlay = document.querySelector('.mobile-menu-overlay');

    if (menuToggle && nav && overlay) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.classList.toggle('menu-open'); // To prevent body scroll

            // Staggered animation for menu items
            if (nav.classList.contains('active')) {
                const menuItems = nav.querySelectorAll('li');
                menuItems.forEach((item, index) => {
                    item.style.animation = ''; // Reset animation
                    setTimeout(() => {
                        item.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                    }, 0);
                });
            } else {
                const menuItems = nav.querySelectorAll('li');
                menuItems.forEach(item => {
                    item.style.animation = ''; // Clear animation when closing
                });
            }
        });

        overlay.addEventListener('click', () => { // Close menu when overlay is clicked
            nav.classList.remove('active');
            overlay.classList.remove('active');
            document.body.classList.remove('menu-open');
            const menuItems = nav.querySelectorAll('li');
            menuItems.forEach(item => {
                item.style.animation = '';
            });
        });
    }
});

// Keyframes for nav link fade can be added to CSS
/*
@keyframes navLinkFade {
    from {
        opacity: 0;
        transform: translateX(-50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
*/
