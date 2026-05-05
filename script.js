const toggle = document.getElementById('themeToggle');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navLinks = document.getElementById('navLinks');
const body = document.body;
const root = document.documentElement;

// Load saved preference
if (localStorage.getItem('theme') === 'light') {
  root.classList.add('light');
}

toggle.addEventListener('click', () => {
  root.classList.toggle('light');
  localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
});

// Menu functions
function toggleMenu() {
    navLinks.classList.toggle('active');
    const isOpen = navLinks.classList.contains('active');
    hamburgerBtn.setAttribute('aria-expanded', isOpen);
    body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMenu() {
    navLinks.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
}

// Event listener for hamburger button
if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });
}

// Rest of your code remains the same...
const navLinksItems = document.querySelectorAll('.nav-links a');
navLinksItems.forEach(link => {
    link.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            closeMenu();
        }
        
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = document.querySelector('nav').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - navHeight - 20;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                history.pushState(null, null, targetId);
            }
        }
    });
});

document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768 && navLinks.classList.contains('active')) {
        if (!navLinks.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            closeMenu();
        }
    }
});

window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        closeMenu();
    }
});