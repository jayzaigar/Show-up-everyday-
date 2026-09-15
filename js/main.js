// Registration form handler.
// This posts nowhere by default. Set FORM_ENDPOINT to your automation
// provider's webhook/form URL (e.g. Resend, ManyChat, or any ESP) before
// going live. The payload below ({ first_name, email }) is already shaped
// to drop straight into most providers' form-submission APIs.
const FORM_ENDPOINT = '';

const form = document.getElementById('register-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const firstName = form.first_name.value.trim();
  const email = form.email.value.trim();

  clearErrors();
  let hasError = false;

  if (!firstName) hasError = showError(form.first_name, 'Please enter your first name.') || true;
  if (!isValidEmail(email)) hasError = showError(form.email, 'Please enter a valid email address.') || true;

  if (hasError) return;

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Saving your spot...';

  const payload = { first_name: firstName, email };

  try {
    if (FORM_ENDPOINT) {
      await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
  } catch (err) {
    // Fail open: still send the visitor to the confirmation page.
    console.error('Registration submit failed', err);
  }

  window.location.href = `confirmation.html?name=${encodeURIComponent(firstName)}`;
});

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showError(field, message) {
  const error = document.createElement('p');
  error.className = 'form-error';
  error.textContent = message;
  field.insertAdjacentElement('afterend', error);
  return true;
}

function clearErrors() {
  form.querySelectorAll('.form-error').forEach((el) => el.remove());
}
