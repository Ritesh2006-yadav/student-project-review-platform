/**
 * Purpose: Handles the separate faculty login page and faculty dashboard
 * project review actions using plain JavaScript and JWT authentication.
 */

(function initializeFacultySystem() {
  const TOKEN_KEY = 'token';

  const loginForm = document.getElementById('faculty-login-form');
  const loginMessage = document.getElementById('faculty-login-message');
  const projectsTable =
    document.getElementById('faculty-projects-table') ||
    document.getElementById('faculty-projects-body');
  const dashboardMessage =
    document.getElementById('faculty-dashboard-message') ||
    document.getElementById('faculty-message');
  const logoutButton =
    document.getElementById('faculty-logout-button') || document.getElementById('logout-button');
  const facultyCards = document.getElementById('faculty-project-cards');
  const facultyNotifications = document.getElementById('faculty-notifications');
  const facultyTotal = document.getElementById('faculty-total-projects');
  const facultyApproved = document.getElementById('faculty-approved-projects');
  const facultyPending = document.getElementById('faculty-pending-projects');
  const facultyRejected = document.getElementById('faculty-rejected-projects');
  const facultySectionSelect = document.getElementById('faculty-section-select');
  const passwordToggles = document.querySelectorAll('[data-password-toggle]');
  const ssoButtons = document.querySelectorAll('[data-sso-button]');

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  const decodeToken = (token) => {
    try {
      const payload = token.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  };

  const showMessage = (element, message, type = '') => {
    if (!element) {
      return;
    }

    element.textContent = message;
    element.className = `message ${type}`.trim();
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

  const redirectToFacultyLogin = () => {
    window.location.href = '/faculty';
  };

  const getStatusClass = (status) => {
    if (status === 'approved') {
      return 'faculty-status-approved';
    }

    if (status === 'rejected') {
      return 'faculty-status-rejected';
    }

    return 'faculty-status-pending';
  };

  const formatDate = (value) => {
    if (!value) {
      return 'Recently';
    }

    return new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getProjectFileUrl = (project) => project.certificationFile || project.file || '';

  const renderNotifications = (projects) => {
    if (!facultyNotifications) {
      return;
    }

    if (!projects.length) {
      facultyNotifications.innerHTML =
        '<p class="empty-state">New review updates will appear here when students submit projects.</p>';
      return;
    }

    facultyNotifications.innerHTML = projects
      .slice(0, 4)
      .map((project) => {
        const notificationClass = `notification-${project.status}`;
        const label =
          project.status === 'approved'
            ? 'Approved'
            : project.status === 'rejected'
              ? 'Rejected'
              : 'Pending';

        return `
          <article class="notification-card">
            <div class="notification-icon ${notificationClass}">${label.charAt(0)}</div>
            <div>
              <strong>${project.title}</strong>
              <p>${project.studentId ? project.studentId.name : 'Unknown Student'} submitted this project.</p>
              <small>${formatDate(project.createdAt)}</small>
            </div>
          </article>
        `;
      })
      .join('');
  };

  const facultyFetch = async (endpoint, method = 'GET', body = null) => {
    const token = getToken();
    const options = {
      method,
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    if (body) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, options);
    const result = await response.json();

    if (response.status === 401 || response.status === 403) {
      localStorage.clear();
      redirectToFacultyLogin();
      throw new Error(result.message || 'Access denied');
    }

    if (!response.ok) {
      throw new Error(result.message || 'Request failed');
    }

    return result;
  };

  const renderProjects = (projects) => {
    if (!projectsTable) {
      if (!facultyCards) {
        return;
      }
    }

    if (facultyTotal) {
      facultyTotal.textContent = projects.length;
    }
    if (facultyApproved) {
      facultyApproved.textContent = projects.filter((project) => project.status === 'approved').length;
    }
    if (facultyPending) {
      facultyPending.textContent = projects.filter((project) => project.status === 'pending').length;
    }
    if (facultyRejected) {
      facultyRejected.textContent = projects.filter((project) => project.status === 'rejected').length;
    }

    renderNotifications(projects);

    if (!projects.length) {
      if (projectsTable) {
        projectsTable.innerHTML =
          '<tr><td colspan="9" class="empty-state">No student projects found.</td></tr>';
      }
      if (facultyCards) {
        facultyCards.innerHTML =
          '<p class="empty-state">No student projects found yet. New submissions will appear here.</p>';
      }
      return;
    }

    if (projectsTable) {
      projectsTable.innerHTML = projects
        .map(
          (project) => `
            <tr>
              <td>${project.studentId ? project.studentId.name : 'Unknown Student'}</td>
              <td>${project.studentId ? project.studentId.email : 'N/A'}</td>
              <td>${project.title}</td>
              <td>${project.section || 'N/A'}</td>
              <td>${project.description || 'No description provided'}</td>
              <td>
                ${
                  project.githubUrl
                    ? `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer">Open Link</a>`
                    : 'No GitHub link'
                }
              </td>
              <td>
                ${
                  getProjectFileUrl(project)
                    ? `<a href="/${getProjectFileUrl(project)}" target="_blank" rel="noopener noreferrer">View File</a>`
                    : 'No file uploaded'
                }
              </td>
              <td>
                <span class="faculty-status-badge ${getStatusClass(project.status)}">${project.status}</span>
              </td>
              <td>
                <div class="action-group">
                  <button type="button" class="primary-button" data-approve-id="${project._id}">Approve</button>
                  <button type="button" class="icon-button danger" data-reject-id="${project._id}">Reject</button>
                </div>
              </td>
            </tr>
          `
        )
        .join('');
    }

    if (facultyCards) {
      facultyCards.innerHTML = projects
      .map(
        (project) => `
          <article class="project-card">
            <div class="project-card-head">
              <div>
                <h4>${project.title}</h4>
                <small>
                  ${project.studentId ? project.studentId.name : 'Unknown Student'}
                  · ${project.studentId ? project.studentId.email : 'N/A'}
                </small>
                <small>${project.section || 'Unassigned section'}</small>
              </div>
              <span class="faculty-status-badge ${getStatusClass(project.status)}">${project.status}</span>
            </div>
            <p>${project.description || 'No description provided'}</p>
            <div class="project-card-meta">
              <span>Submitted ${formatDate(project.createdAt)}</span>
              <div class="project-card-links">
                ${
                  project.githubUrl
                    ? `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer">Open Repository</a>`
                    : '<span>No GitHub link</span>'
                }
                ${
                  getProjectFileUrl(project)
                    ? `<a href="/${getProjectFileUrl(project)}" target="_blank" rel="noopener noreferrer">View File</a>`
                    : '<span>No file uploaded</span>'
                }
              </div>
            </div>
            <div class="project-card-actions">
              <span>${project.feedback || 'No faculty feedback added yet.'}</span>
              <div class="action-group">
                <button type="button" class="primary-button" data-approve-id="${project._id}">Approve</button>
                <button type="button" class="icon-button danger" data-reject-id="${project._id}">Reject</button>
              </div>
            </div>
          </article>
        `
      )
      .join('');
    }

    document.querySelectorAll('[data-approve-id]').forEach((button) => {
      button.addEventListener('click', () => approveProject(button.dataset.approveId));
    });

    document.querySelectorAll('[data-reject-id]').forEach((button) => {
      button.addEventListener('click', () => rejectProject(button.dataset.rejectId));
    });
  };

  const loadProjects = async () => {
    try {
      const section = facultySectionSelect ? facultySectionSelect.value : '';

      if (!section) {
        renderProjects([]);
        showMessage(dashboardMessage, 'Select a section to view assigned projects.');
        return;
      }

      const result = await facultyFetch(`/api/faculty/projects?section=${encodeURIComponent(section)}`);
      renderProjects(result.data);
      showMessage(dashboardMessage, '');
    } catch (error) {
      showMessage(dashboardMessage, error.message, 'error');
    }
  };

  const loadSections = async () => {
    if (!facultySectionSelect) {
      await loadProjects();
      return;
    }

    try {
      const result = await facultyFetch('/api/faculty/sections');
      facultySectionSelect.innerHTML = [
        '<option value="">Select section</option>',
        ...result.data.map((section) => `<option value="${section}">${section}</option>`)
      ].join('');

      if (result.data.length) {
        facultySectionSelect.value = result.data[0];
        await loadProjects();
      } else {
        renderProjects([]);
        showMessage(dashboardMessage, 'No sections assigned yet.');
      }
    } catch (error) {
      showMessage(dashboardMessage, error.message, 'error');
    }
  };

  const approveProject = async (id) => {
    try {
      await facultyFetch(`/api/faculty/projects/${id}`, 'PUT', { status: 'approved' });
      showMessage(dashboardMessage, 'Project approved successfully.', 'success');
      await loadProjects();
    } catch (error) {
      showMessage(dashboardMessage, error.message, 'error');
    }
  };

  const rejectProject = async (id) => {
    const feedback = window.prompt('Enter rejection reason:');

    if (!feedback || !feedback.trim()) {
      return;
    }

    try {
      await facultyFetch(`/api/faculty/projects/${id}`, 'PUT', {
        status: 'rejected',
        feedback: feedback.trim()
      });
      showMessage(dashboardMessage, 'Project rejected successfully.', 'success');
      await loadProjects();
    } catch (error) {
      showMessage(dashboardMessage, error.message, 'error');
    }
  };

  if (loginForm) {
    passwordToggles.forEach((button) => {
      button.addEventListener('click', () => togglePasswordVisibility(button));
    });

    ssoButtons.forEach((button) => {
      button.addEventListener('click', () => {
        showMessage(
          loginMessage,
          'SSO can be connected later while keeping the current faculty login endpoint unchanged.'
        );
      });
    });

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(loginForm);
      const payload = {
        email: formData.get('email'),
        password: formData.get('password')
      };

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
          showMessage(loginMessage, result.message || 'Login failed', 'error');
          return;
        }

        const token = result.data.token;
        const decoded = decodeToken(token);

        if (!decoded || decoded.role !== 'faculty') {
          showMessage(loginMessage, 'Not a faculty account', 'error');
          return;
        }

        localStorage.setItem(TOKEN_KEY, token);
        window.location.href = '/faculty-dashboard.html';
      } catch (error) {
        showMessage(loginMessage, error.message, 'error');
      }
    });

    return;
  }

  if (projectsTable) {
    const token = getToken();

    if (!token) {
      redirectToFacultyLogin();
      return;
    }

    const decoded = decodeToken(token);

    if (!decoded || decoded.role !== 'faculty') {
      redirectToFacultyLogin();
      return;
    }

    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        localStorage.clear();
        redirectToFacultyLogin();
      });
    }

    if (facultySectionSelect) {
      facultySectionSelect.addEventListener('change', loadProjects);
    }

    loadSections();
  }
})();
