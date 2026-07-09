document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.hero-slider .slide'));
  const dotsContainer = document.querySelector('.slider-dots');
  const toggleGalleryButton = document.getElementById('toggleGallery');
  const extraImages = Array.from(document.querySelectorAll('.gallery-grid .extra'));
  const navToggle = document.getElementById('mobileNavToggle');
  const navLinks = document.getElementById('navLinks');
  const themeToggle = document.getElementById('themeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const storedTheme = localStorage.getItem('scholar-theme');
  if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
    document.body.setAttribute('data-theme', 'dark');
    if (themeToggle) themeToggle.textContent = '🌙';
  } else {
    document.body.removeAttribute('data-theme');
    if (themeToggle) themeToggle.textContent = '☀️';
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      if (nextTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '🌙';
        localStorage.setItem('scholar-theme', 'dark');
      } else {
        document.body.removeAttribute('data-theme');
        themeToggle.textContent = '☀️';
        localStorage.setItem('scholar-theme', 'light');
      }
    });
  }

  if (slides.length && dotsContainer) {
    const dots = slides.map((_, index) => {
      const dot = document.createElement('span');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => showSlide(index));
      dotsContainer.appendChild(dot);
      return dot;
    });

    const prevBtn = document.querySelector('.slider-control.prev');
    const nextBtn = document.querySelector('.slider-control.next');

    let currentIndex = 0;
    let intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    }, 5000);

    function showSlide(index) {
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === index);
      });
      currentIndex = index;
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const newIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(newIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const newIndex = (currentIndex + 1) % slides.length;
        showSlide(newIndex);
      });
    }

    dotsContainer.addEventListener('mouseenter', () => clearInterval(intervalId));
    dotsContainer.addEventListener('mouseleave', () => {
      intervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
      }, 5000);
    });
  }

  const teamTrack = document.querySelector('.team-track');

  if (teamTrack) {
    const scrollAmount = () => teamTrack.querySelector('.team-card')?.getBoundingClientRect().width + 18 || 258;

    setInterval(() => {
      const maxScrollLeft = teamTrack.scrollWidth - teamTrack.clientWidth;
      if (teamTrack.scrollLeft >= maxScrollLeft) {
        teamTrack.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        teamTrack.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
      }
    }, 3500);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));

  if (toggleGalleryButton) {
    toggleGalleryButton.addEventListener('click', () => {
      const isExpanded = toggleGalleryButton.dataset.expanded === 'true';
      extraImages.forEach((img) => img.classList.toggle('hidden', isExpanded));
      toggleGalleryButton.dataset.expanded = String(!isExpanded);
      toggleGalleryButton.textContent = isExpanded ? 'View More Photos' : 'Show Less';
    });
  }

  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }

  const admissionForm = document.getElementById('admissionForm');
  const admissionMessage = document.getElementById('admissionMessage');
  if (admissionForm && window.ScholarAPI) {
    admissionForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      admissionMessage.textContent = 'Submitting...';
      admissionMessage.className = 'form-feedback';

      const payload = {
        name: document.getElementById('adName').value.trim(),
        phone: document.getElementById('adPhone').value.trim(),
        email: document.getElementById('adEmail').value.trim(),
        program: document.getElementById('adProgram').value,
        message: document.getElementById('adMessage').value.trim(),
      };

      try {
        await ScholarAPI.post('/api/admissions', payload);
        admissionMessage.textContent = 'Thank you! Your admission inquiry has been submitted. We will contact you soon.';
        admissionMessage.className = 'form-feedback success';
        admissionForm.reset();
      } catch (err) {
        admissionMessage.textContent = err.message || 'Submission failed. Please try again or contact us on WhatsApp.';
        admissionMessage.className = 'form-feedback error';
      }
    });
  }
});
