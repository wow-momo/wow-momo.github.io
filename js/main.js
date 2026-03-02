/**
 * WoW Mo:Mo — Main JavaScript
 * Navigation, animations, menu filtering, scroll effects
 */

(function () {
  'use strict';

  // ─── DOM Ready ───
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initMobileMenu();
    initNavbarScroll();
    initMenuFilter();
    initRevealOnScroll();
    initContactForm();
  }

  // ═══════════════════════════════════════════
  // MOBILE MENU
  // ═══════════════════════════════════════════
  function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function () {
      const isOpen = !menu.classList.contains('hidden');
      menu.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', String(!isOpen));

      // Animate hamburger
      const lines = btn.querySelectorAll('.hamburger-line');
      if (!isOpen) {
        // Opening
        lines[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
        lines[1].style.opacity = '0';
        lines[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
        lines[2].style.width = '1.5rem';
      } else {
        // Closing
        lines[0].style.transform = '';
        lines[1].style.opacity = '';
        lines[2].style.transform = '';
        lines[2].style.width = '';
      }
    });

    // Close on link click
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        const lines = btn.querySelectorAll('.hamburger-line');
        lines[0].style.transform = '';
        lines[1].style.opacity = '';
        lines[2].style.transform = '';
        lines[2].style.width = '';
      });
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }

  // ═══════════════════════════════════════════
  // NAVBAR SCROLL EFFECT
  // ═══════════════════════════════════════════
  function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    function onScroll() {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Initial state
  }

  // ═══════════════════════════════════════════
  // MENU CATEGORY FILTER
  // ═══════════════════════════════════════════
  function initMenuFilter() {
    const tabs = document.querySelectorAll('.menu-tab');
    const sections = document.querySelectorAll('.menu-section');
    if (!tabs.length || !sections.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var category = this.getAttribute('data-category');

        // Update active tab
        tabs.forEach(function (t) {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');

        // Show/hide sections
        sections.forEach(function (section) {
          if (category === 'all' || section.getAttribute('data-category') === category) {
            section.style.display = '';
            // Animate items in
            section.querySelectorAll('.menu-item').forEach(function (item, i) {
              item.style.opacity = '0';
              item.style.transform = 'translateY(20px)';
              setTimeout(function () {
                item.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
              }, i * 80);
            });
          } else {
            section.style.display = 'none';
          }
        });
      });
    });
  }

  // ═══════════════════════════════════════════
  // REVEAL ON SCROLL (Intersection Observer)
  // ═══════════════════════════════════════════
  function initRevealOnScroll() {
    var elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  // ═══════════════════════════════════════════
  // CONTACT FORM (basic client-side validation)
  // ═══════════════════════════════════════════
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    // Show success banner if redirected back after FormSubmit
    if (window.location.search.indexOf('success=true') !== -1) {
      var banner = document.createElement('div');
      banner.className = 'fixed top-0 left-0 right-0 z-[9999] bg-green-600 text-white text-center py-4 px-6 font-heading font-700 text-lg shadow-lg';
      banner.innerHTML = '✓ Message sent successfully! We\u2019ll get back to you soon. <button onclick="this.parentElement.remove();history.replaceState(null,\'\',location.pathname)" class="ml-4 underline text-white/80 hover:text-white">Dismiss</button>';
      document.body.prepend(banner);
      // Auto-dismiss after 8 seconds
      setTimeout(function () {
        if (banner.parentElement) {
          banner.remove();
          history.replaceState(null, '', location.pathname);
        }
      }, 8000);
    }

    form.addEventListener('submit', function (e) {
      var name = form.querySelector('#name');
      var email = form.querySelector('#email');
      var message = form.querySelector('#message');
      var valid = true;

      // Reset
      [name, email, message].forEach(function (el) {
        if (el) el.style.borderColor = '';
      });

      if (name && !name.value.trim()) {
        name.style.borderColor = '#C41E3A';
        valid = false;
      }
      if (email && !isValidEmail(email.value)) {
        email.style.borderColor = '#C41E3A';
        valid = false;
      }
      if (message && !message.value.trim()) {
        message.style.borderColor = '#C41E3A';
        valid = false;
      }

      if (!valid) {
        e.preventDefault(); // Block submission only if invalid
      } else {
        // Show sending state (form will navigate away to FormSubmit)
        var btn = form.querySelector('button[type="submit"]');
        if (btn) {
          btn.innerHTML = 'Sending\u2026';
          btn.disabled = true;
        }
      }
    });

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
  }

})();
