/**
 * Purpose: Handles the shared student/faculty authentication experience while
 * keeping existing login and registration APIs unchanged.
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
  const authMessage = document.getElementById('auth-message');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const authEyebrow = document.getElementById('auth-eyebrow');
  const authHeroTitle = document.getElementById('auth-hero-title');
  const authHeroCopy = document.getElementById('auth-hero-copy');
  const authKicker = document.getElementById('auth-kicker');
  const authBrandBadge = document.getElementById('auth-brand-badge');
  const authEmailLabel = document.getElementById('auth-email-label');
  const authEmailInput = document.getElementById('auth-email-input');
  const authSubmitLabel = document.getElementById('auth-submit-label');
  const authStudentSwitch = document.getElementById('auth-student-switch');
  const passwordToggles = document.querySelectorAll('[data-password-toggle]');
  const roleButtons = document.querySelectorAll('[data-role-switch]');
  const formSwitchButtons = document.querySelectorAll('[data-auth-switch]');

  const DEFAULT_ROLE = document.body.dataset.authDefault === 'faculty' ? 'faculty' : 'student';
  let activeRole = DEFAULT_ROLE;
  let activeView = 'login';

  const roleContent = {
    student: {
      badge: 'SP',
      kicker: 'Student Access',
      eyebrow: 'Student Access',
      heroTitle: 'Hello Student Portal',
      heroCopy: 'Use your student credentials to continue.',
      title: 'Hello Student Portal',
      subtitle: 'Use your student credentials to continue.',
      registerSubtitle: 'Create your account using your name, email, and password.',
      emailLabel: 'Student Email',
      emailPlaceholder: 'student@example.com',
      submitLabel: 'Sign In as Student'
    },
    faculty: {
      badge: 'FR',
      kicker: 'Faculty Access',
      eyebrow: 'Faculty Access',
      heroTitle: 'Faculty Review Portal',
      heroCopy: 'Use your faculty credentials to continue.',
      title: 'Faculty Portal',
      subtitle: 'Use your faculty credentials to sign in.',
      emailLabel: 'Faculty Email',
      emailPlaceholder: 'teacher@example.edu',
      submitLabel: 'Sign In as Faculty'
    }
  };

  const showMessage = (message, type = '') => {
    authMessage.textContent = message;
    authMessage.className = `message ${type}`.trim();
  };

  const applyRoleCopy = (role) => {
    const copy = roleContent[role];

    authBrandBadge.textContent = copy.badge;
    authKicker.textContent = copy.kicker;
    authEyebrow.textContent = copy.eyebrow;
    authHeroTitle.textContent = copy.heroTitle;
    authHeroCopy.textContent = copy.heroCopy;
    authEmailLabel.textContent = copy.emailLabel;
    authEmailInput.placeholder = copy.emailPlaceholder;
    authSubmitLabel.textContent = copy.submitLabel;
  };

  const setActiveView = (view) => {
    activeView = activeRole === 'faculty' ? 'login' : view;
    const studentCopy = roleContent.student;
    const facultyCopy = roleContent.faculty;

    loginForm.classList.toggle('hidden', activeView !== 'login');
    registerForm.classList.toggle('hidden', activeView !== 'register' || activeRole !== 'student');
    authStudentSwitch.classList.toggle('hidden', activeRole !== 'student');

    if (activeRole === 'faculty') {
      authTitle.textContent = facultyCopy.title;
      authSubtitle.textContent = facultyCopy.subtitle;
      return;
    }

    authTitle.textContent = studentCopy.title;
    authSubtitle.textContent = activeView === 'register' ? studentCopy.registerSubtitle : studentCopy.subtitle;
  };

  const setActiveRole = (role) => {
    activeRole = role;
    roleButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.roleSwitch === role);
      button.setAttribute('aria-selected', String(button.dataset.roleSwitch === role));
    });
    applyRoleCopy(role);
    setActiveView('login');
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

  roleButtons.forEach((button) => {
    button.addEventListener('click', () => setActiveRole(button.dataset.roleSwitch));
  });

  formSwitchButtons.forEach((button) => {
    button.addEventListener('click', () => setActiveView(button.dataset.authSwitch));
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
      const { user, token } = response.data;

      if (activeRole === 'student' && user.role === 'faculty') {
        clearSession();
        showMessage('Faculty accounts must sign in through Faculty Access.', 'error');
        return;
      }

      if (activeRole === 'faculty' && user.role !== 'faculty') {
        clearSession();
        showMessage('Student accounts must sign in through Student Access.', 'error');
        return;
      }

      setSession(token, user);
      showMessage('Login successful. Redirecting...', 'success');
      redirectByRole(token);
    } catch (error) {
      showMessage(error.message, 'error');
    }
  });

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
      const { user, token } = response.data;

      if (user.role !== 'student') {
        clearSession();
        showMessage('Only student accounts can be created here.', 'error');
        return;
      }

      setSession(token, user);
      showMessage('Registration successful. Redirecting...', 'success');
      redirectByRole(token);
    } catch (error) {
      showMessage(error.message, 'error');
    }
  });

  if (getStoredUser() && getToken()) {
    redirectByRole(getToken());
  }

  setActiveRole(DEFAULT_ROLE);
})();
