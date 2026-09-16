// Registration form handler.
// This posts nowhere by default. Set FORM_ENDPOINT to your automation
// provider's webhook/form URL (e.g. Resend, ManyChat, or any ESP) before
// going live. The payload below is already shaped to drop straight into
// most providers' form-submission APIs.
const FORM_ENDPOINT = '';

const form = document.getElementById('register-form');
const phoneGroup = form.querySelector('.phone-group');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const firstName = form.first_name.value.trim();
  const email = form.email.value.trim();
  const whatsappCode = form.whatsapp_country_code.value;
  const whatsappNumber = form.whatsapp_number.value.trim();
  const consent = form.whatsapp_consent.checked;

  clearErrors();
  let hasError = false;

  if (!firstName) hasError = showError(form.first_name, 'Please enter your first name.') || true;
  if (!isValidEmail(email)) hasError = showError(form.email, 'Please enter a valid email address.') || true;
  if (!whatsappCode) hasError = showError(phoneGroup, 'Please select your country code.') || true;
  else if (!whatsappNumber) hasError = showError(phoneGroup, 'Please enter your WhatsApp number.') || true;
  if (!consent) hasError = showError(form.querySelector('.consent-row'), 'Please confirm you agree to receive reminders on WhatsApp.') || true;

  if (hasError) return;

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Saving your spot...';

  const payload = {
    first_name: firstName,
    email,
    whatsapp: `${whatsappCode}${whatsappNumber}`,
    whatsapp_consent: consent,
  };

  // Fire the actual submission in the background; it doesn't need to block
  // the analyzing sequence below.
  if (FORM_ENDPOINT) {
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.error('Registration submit failed', err));
  }

  const messages = [
    'Reviewing what you shared',
    'Matching your answers to the right track',
    'Personalizing your experience',
    'Saving your spot',
  ];
  runAnalyzingSequence(messages, 5000, () => {
    window.location.href = `confirmation.html?name=${encodeURIComponent(firstName)}`;
  });
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
