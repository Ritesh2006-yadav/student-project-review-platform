/**
 * Purpose: Handles login/register tab switching and authentication form
 * submissions for the landing page.
 */

(function initializeAuthPage() {
  const {
    fetchAPI,
    getStoredUser,
    getToken,
    setSession,
    redirectByRole
  } = window.AppAPI;

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabButtons = document.querySelectorAll('.tab-button');
  const messageBox = document.getElementById('auth-message');
  const title = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  const ssoButtons = document.querySelectorAll('[data-sso-button]');
  const passwordToggles = document.querySelectorAll('[data-password-toggle]');

  const tabContent = {
    login: {
      title: 'Sign in to your workspace',
      subtitle:
        'Access your portfolio dashboard, project submissions, and review status in one place.'
    },
    register: {
      title: 'Create your student account',
      subtitle:
        'Get started with verified submissions, guided onboarding, and a premium review workflow.'
    }
  };

  const showMessage = (message, type = '') => {
    messageBox.textContent = message;
    messageBox.className = `message ${type}`.trim();
  };

  const setActiveTab = (tab) => {
    tabButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.tab === tab);
    });

    loginForm.classList.toggle('hidden', tab !== 'login');
    registerForm.classList.toggle('hidden', tab !== 'register');
    title.textContent = tabContent[tab].title;
    subtitle.textContent = tabContent[tab].subtitle;
    showMessage('');
  };

  const togglePasswordVisibility = (button) => {
    const wrapper = button.closest('.input-shell');
    const input = wrapper ? wrapper.querySelector('[data-password-input]') : null;

    if (!input) {
      return;
    }

    const shouldShow = input.type === 'password';
    input.type = shouldShow ? 'text' : 'password';
    button.textContent = shouldShow ? 'Hide' : 'Show';
    button.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password');
  };

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => setActiveTab(button.dataset.tab));
  });

  passwordToggles.forEach((button) => {
    button.addEventListener('click', () => togglePasswordVisibility(button));
  });

  ssoButtons.forEach((button) => {
    button.addEventListener('click', () => {
      showMessage('SSO login can be connected later without changing the current backend flow.');
    });
  });

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetchAPI('/api/auth/login', 'POST', payload);
      setSession(response.data.token, response.data.user);
      showMessage('Login successful. Redirecting...', 'success');
      redirectByRole(response.data.token);
    } catch (error) {
      showMessage(error.message, 'error');
    }
  });

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(registerForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetchAPI('/api/auth/register', 'POST', payload);
      setSession(response.data.token, response.data.user);
      showMessage('Registration successful. Redirecting...', 'success');
      redirectByRole(response.data.token);
    } catch (error) {
      showMessage(error.message, 'error');
    }
  });

  if (getStoredUser() && getToken()) {
    redirectByRole(getToken());
  }

  setActiveTab('login');
})();
