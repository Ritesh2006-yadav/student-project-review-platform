/**
 * Purpose: Loads the student dashboard, manages skill tags, and renders the
 * approved portfolio view.
 */

(function initializeDashboard() {
  const {
    attachLogout,
    fetchAPI,
    getToken,
    requireAuth,
    setSession
  } = window.AppAPI;

  requireAuth();
  attachLogout();

  const studentName = document.getElementById('student-name');
  const sidebarName = document.getElementById('student-sidebar-name');
  const studentAvatar = document.getElementById('student-avatar');
  const totalProjects = document.getElementById('total-projects');
  const approvedProjects = document.getElementById('approved-projects');
  const pendingProjects = document.getElementById('pending-projects');
  const rejectedProjects = document.getElementById('rejected-projects');
  const skillForm = document.getElementById('skill-form');
  const skillInput = document.getElementById('skill-input');
  const skillsContainer = document.getElementById('skills-container');
  const portfolioList = document.getElementById('portfolio-list');
  const recentProjects = document.getElementById('recent-projects');
  const messageBox = document.getElementById('dashboard-message');

  let currentUser = null;

  const showMessage = (message, type = '') => {
    messageBox.textContent = message;
    messageBox.className = `message ${type}`.trim();
  };

  const renderSkills = () => {
    skillsContainer.innerHTML = '';

    if (!currentUser.skills.length) {
      skillsContainer.innerHTML = '<p class="empty-state">No skills added yet.</p>';
      return;
    }

    currentUser.skills.forEach((skill) => {
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.innerHTML = `<span>${skill}</span><button type="button" data-skill="${skill}">×</button>`;
      skillsContainer.appendChild(tag);
    });

    skillsContainer.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', async () => {
        const nextSkills = currentUser.skills.filter((skill) => skill !== button.dataset.skill);
        await saveSkills(nextSkills);
      });
    });
  };

  const renderPortfolio = (projects) => {
    portfolioList.innerHTML = '';

    if (!projects.length) {
      portfolioList.innerHTML =
        '<p class="empty-state">Approved certificates will appear here after faculty review.</p>';
      return;
    }

    projects.forEach((project) => {
      const article = document.createElement('article');
      article.className = 'portfolio-card';
      article.innerHTML = `
        <h4>${project.title}</h4>
        <p>${project.description}</p>
        <div class="project-card-links">
          ${
            project.certificationFile
              ? `<a href="/${project.certificationFile}" target="_blank" rel="noopener noreferrer">View Certificate</a>`
              : '<span>Certificate file not uploaded</span>'
          }
          <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer">Open GitHub</a>
        </div>
      `;
      portfolioList.appendChild(article);
    });
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

  const renderRecentProjects = (projects) => {
    if (!recentProjects) {
      return;
    }

    recentProjects.innerHTML = '';

    if (!projects.length) {
      recentProjects.innerHTML =
        '<p class="empty-state">Your latest submissions will appear here after you add a project.</p>';
      return;
    }

    projects.slice(0, 5).forEach((project) => {
      const row = document.createElement('article');
      row.className = 'data-row';
      row.innerHTML = `
        <div class="data-row-top">
          <div class="data-row-title">
            <strong>${project.title}</strong>
            <small>${formatDate(project.createdAt)}</small>
          </div>
          <span class="status-badge status-${project.status}">${project.status}</span>
        </div>
        <div class="data-row-bottom">
          <span>${project.description}</span>
          <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer">Open GitHub</a>
        </div>
      `;
      recentProjects.appendChild(row);
    });
  };

  const saveSkills = async (skills) => {
    try {
      const response = await fetchAPI('/api/auth/skills', 'PUT', { skills });
      currentUser = response.data;
      setSession(getToken(), currentUser);
      renderSkills();
      showMessage('Skills updated successfully.', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  skillForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const newSkill = skillInput.value.trim();

    if (!newSkill) {
      return;
    }

    const nextSkills = [...new Set([...(currentUser.skills || []), newSkill])];
    await saveSkills(nextSkills);
    skillInput.value = '';
  });

  const loadDashboard = async () => {
    try {
      const [userResponse, projectsResponse, portfolioResponse] = await Promise.all([
        fetchAPI('/api/auth/me'),
        fetchAPI('/api/projects'),
        fetchAPI('/api/projects/portfolio')
      ]);

      currentUser = userResponse.data;
      setSession(getToken(), currentUser);

      studentName.textContent = currentUser.name;
      if (sidebarName) {
        sidebarName.textContent = currentUser.name;
      }
      if (studentAvatar) {
        studentAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
      }

      const pendingCount = projectsResponse.data.filter((project) => project.status === 'pending').length;
      const rejectedCount = projectsResponse.data.filter((project) => project.status === 'rejected').length;

      totalProjects.textContent = projectsResponse.data.length;
      approvedProjects.textContent = portfolioResponse.data.length;
      if (pendingProjects) {
        pendingProjects.textContent = pendingCount;
      }
      if (rejectedProjects) {
        rejectedProjects.textContent = rejectedCount;
      }

      renderSkills();
      renderPortfolio(portfolioResponse.data);
      renderRecentProjects(projectsResponse.data);
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  loadDashboard();
})();
