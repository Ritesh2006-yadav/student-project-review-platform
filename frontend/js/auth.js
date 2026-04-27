/**
 * Purpose: Handles login/register tab switching and authentication form
 * submissions for the landing page.
 */

(function initializeAuthPage() {
  const {
    clearSession,
    fetchAPI,
    getStoredUser,
    getToken,
    setSession,
    redirectByRole
  } = window.AppAPI;

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const switchButtons = document.querySelectorAll('[data-auth-switch]');
  const messageBox = document.getElementById('auth-message');
  const title = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  const passwordToggles = document.querySelectorAll('[data-password-toggle]');

  const tabContent = {
    login: {
      title: 'Student Portal',
      subtitle: 'Use your student credentials to continue.'
    },
    register: {
      title: 'Student Portal',
      subtitle: 'Create your account using your name, email, and password.'
    }
  };

  const showMessage = (message, type = '') => {
    messageBox.textContent = message;
    messageBox.className = `message ${type}`.trim();
  };

  const setActiveTab = (tab) => {
    loginForm.classList.toggle('hidden', tab !== 'login');
    if (registerForm) {
      registerForm.classList.toggle('hidden', tab !== 'register');
    }
    if (title && tabContent[tab]) {
      title.textContent = tabContent[tab].title;
    }
    if (subtitle && tabContent[tab]) {
      subtitle.textContent = tabContent[tab].subtitle;
    }
    showMessage('');
  };

  const validateRegistration = (payload) => {
    if (!payload.name || payload.name.trim().length < 2) {
      return 'Name must be at least 2 characters long.';
    }

    if (!payload.email) {
      return 'Email is required.';
    }

    if (!payload.password || payload.password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }

    return '';
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

  switchButtons.forEach((button) => {
    button.addEventListener('click', () => setActiveTab(button.dataset.authSwitch));
  });

  passwordToggles.forEach((button) => {
    button.addEventListener('click', () => togglePasswordVisibility(button));
  });

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetchAPI('/api/auth/login', 'POST', payload);
      if (response.data.user.role === 'faculty') {
        clearSession();
        showMessage('Faculty accounts must sign in through the Faculty Portal.', 'error');
        return;
      }
      setSession(response.data.token, response.data.user);
      showMessage('Login successful. Redirecting...', 'success');
      redirectByRole(response.data.token);
    } catch (error) {
      showMessage(error.message, 'error');
    }
  });

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(registerForm);
      const payload = Object.fromEntries(formData.entries());
      const validationMessage = validateRegistration(payload);

      if (validationMessage) {
        showMessage(validationMessage, 'error');
        return;
      }

      try {
        const response = await fetchAPI('/api/auth/register', 'POST', payload);
        if (response.data.user.role !== 'student') {
          clearSession();
          showMessage('Only student accounts can be created from the Student Portal.', 'error');
          return;
        }
        setSession(response.data.token, response.data.user);
        showMessage('Registration successful. Redirecting...', 'success');
        redirectByRole(response.data.token);
      } catch (error) {
        showMessage(error.message, 'error');
      }
    });
  }

  if (getStoredUser() && getToken()) {
    redirectByRole(getToken());
  }

  setActiveTab('login');
})();
