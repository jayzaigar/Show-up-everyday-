// Registration form handler.
// This posts nowhere by default. Set FORM_ENDPOINT to your automation
// provider's webhook/form URL (e.g. Resend, ManyChat, or any ESP) before
// going live. The payload below is already shaped to drop straight into
// most providers' form-submission APIs.
const FORM_ENDPOINT = '';

// "Get Free Spot" reveals the registration section (hidden by default, see
// index.html) and scrolls to it, so the free/VIP choice comes before the
// form instead of the form being visible right away.
const registerSection = document.getElementById('register');
const getFreeBtn = document.getElementById('get-free-btn');
if (getFreeBtn && registerSection) {
  getFreeBtn.addEventListener('click', () => {
    registerSection.classList.remove('is-hidden');
    registerSection.scrollIntoView({ behavior: 'smooth' });
  });
}

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

  const selectedOption = form.whatsapp_country_code.selectedOptions[0];
  const country = selectedOption ? (selectedOption.textContent.split(' · ')[1] || '') : '';

  const payload = {
    first_name: firstName,
    email,
    whatsapp: `${whatsappCode}${whatsappNumber}`,
    whatsapp_consent: consent,
  };

  // Fire the actual submission in the background; it doesn't need to block
  // the Airtable write and redirect below.
  if (FORM_ENDPOINT) {
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.error('Registration submit failed', err));
  }

  // Writes the registrant into Airtable (the dashboard's data source) and
  // waits for the new record's id, so the survey step can add its answers
  // to this same row instead of creating a duplicate. Resolves to null
  // (no rid) if Airtable isn't configured or doesn't respond in time.
  const recordId = await airtableRequest('POST', {
    'First Name': firstName,
    Email: email,
    WhatsApp: `${whatsappCode}${whatsappNumber}`,
    Country: country,
    Consent: consent,
  });

  const query = new URLSearchParams({ name: firstName });
  if (recordId) query.set('rid', recordId);
  window.location.href = `confirmation.html?${query.toString()}`;
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
