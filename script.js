const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxIHHMhkCQx7aeyZDCRMqKoQZbm0yr0rwztwOhXFZwxJysjYmWbKDyx1bJGdIV7v-Tkow/exec';

const menuButton = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    });
  });
}

const researchForm = document.querySelector('#research-form');

if (researchForm) {
  const submitButton = researchForm.querySelector('button[type="submit"]');
  const statusMessage = researchForm.querySelector('[data-form-status]');
  let isSubmitting = false;

  const setFieldError = (field, message) => {
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    const error = researchForm.querySelector(`#${field.id}-error`);
    if (error) error.textContent = message;
  };

  const showSuccess = () => {
    statusMessage.textContent = 'Thank you. Our team will contact you about a short research conversation.';
    statusMessage.className = 'form-status success';
    researchForm.reset();
    isSubmitting = false;
    submitButton.disabled = false;
    submitButton.textContent = 'Share My Experience';
  };

  const showError = () => {
    statusMessage.textContent = 'We could not send your details. Please check your connection and try again.';
    statusMessage.className = 'form-status error';
    isSubmitting = false;
    submitButton.disabled = false;
    submitButton.textContent = 'Share My Experience';
  };

  researchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nameField = researchForm.elements.name;
    const emailField = researchForm.elements.email;
    const phoneField = researchForm.elements.phone;
    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const phone = phoneField.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    setFieldError(nameField, name ? '' : 'Please enter your name.');
    setFieldError(emailField, emailPattern.test(email) ? '' : 'Please enter a valid email address.');
    setFieldError(phoneField, phone ? '' : 'Please enter your phone number.');

    if (!name || !emailPattern.test(email) || !phone) {
      statusMessage.textContent = 'Please check the highlighted fields.';
      statusMessage.className = 'form-status error';
      researchForm.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    statusMessage.textContent = 'Sending your details…';
    statusMessage.className = 'form-status';

    const url =
      SCRIPT_URL +
      '?' +
      new URLSearchParams({
        name,
        email,
        phone
      });

    // A no-cors response is opaque, so the browser cannot inspect its status or JSON body.
    fetch(url, {
      method: 'GET',
      mode: 'no-cors'
    })
      .then(() => showSuccess())
      .catch(() => showError());
  });

  researchForm.querySelectorAll('input').forEach((field) => {
    field.addEventListener('input', () => setFieldError(field, ''));
  });
}
