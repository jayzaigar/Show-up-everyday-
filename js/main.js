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

  // Fire the actual submission in the background; it doesn't need to block
  // the analyzing sequence below.
  if (FORM_ENDPOINT) {
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.error('Registration submit failed', err));
  }

  runAnalyzingSequence(() => {
    window.location.href = `confirmation.html?name=${encodeURIComponent(firstName)}`;
  });
});

// Perceived-value "analyzing" loading screen: nothing is actually being
// analyzed, this is purely a few seconds of reassurance before the
// confirmation page. See the .analyzing-overlay markup at the end of the
// registration section.
function runAnalyzingSequence(onDone) {
  const overlay = document.getElementById('analyzing-overlay');
  if (!overlay) { onDone(); return; }

  const messageEl = document.getElementById('analyzing-message');
  const barFill = document.getElementById('analyzing-bar-fill');
  const messages = [
    'Reviewing what you shared',
    'Matching your answers to the right track',
    'Personalizing your experience',
    'Saving your spot',
  ];
  const totalDuration = 5000;
  const stepDuration = totalDuration / messages.length;

  overlay.classList.add('is-active');
  // Force layout before adding the visible class, so the opacity transition runs.
  overlay.getBoundingClientRect();
  overlay.classList.add('is-visible');
  barFill.getBoundingClientRect();
  barFill.style.width = '100%';

  let step = 0;
  messageEl.textContent = messages[0];
  const interval = setInterval(() => {
    step += 1;
    if (step < messages.length) {
      messageEl.textContent = messages[step];
    }
  }, stepDuration);

  setTimeout(() => {
    clearInterval(interval);
    onDone();
  }, totalDuration);
}

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
