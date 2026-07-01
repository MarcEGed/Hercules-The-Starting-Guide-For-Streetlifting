// nav.js: sticky scroll behavior + mobile toggle
// ES6 class as required by project spec

class Navigation {
  constructor() {
    this.navbar = document.getElementById('navbar');
    this.hamburger = document.getElementById('hamburger');
    this.mobileMenu = document.getElementById('mobileMenu');
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.handleScroll());
    this.hamburger.addEventListener('click', () => this.toggleMobile());
    // close mobile menu on link click
    this.mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.closeMobile());
    });
  }

  handleScroll() {
    if (window.scrollY > 50) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }
  }

  toggleMobile() {
    this.mobileMenu.classList.toggle('open');
  }

  closeMobile() {
    this.mobileMenu.classList.remove('open');
  }
}

const nav = new Navigation();