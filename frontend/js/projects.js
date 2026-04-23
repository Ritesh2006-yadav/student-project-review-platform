/**
 * Purpose: Handles project creation, editing, listing, and deletion across the
 * project-related frontend pages.
 */

(function initializeProjects() {
  const {
    attachLogout,
    fetchAPI,
    requireAuth
  } = window.AppAPI;

  requireAuth();
  attachLogout();

  const projectForm = document.getElementById('project-form');
  const projectMessage = document.getElementById('project-message');
  const projectsTableBody = document.getElementById('projects-table-body');
  const projectsMessage = document.getElementById('projects-message');
  const projectsCardList = document.getElementById('projects-card-list');
  const totalCount = document.getElementById('projects-total-count');
  const approvedCount = document.getElementById('projects-approved-count');
  const pendingCount = document.getElementById('projects-pending-count');
  const rejectedCount = document.getElementById('projects-rejected-count');

  const statusClassMap = {
    pending: 'status-pending',
    approved: 'status-approved',
    rejected: 'status-rejected'
  };

  const showMessage = (element, message, type = '') => {
    if (!element) {
      return;
    }

    element.textContent = message;
    element.className = `message ${type}`.trim();
  };

  const getEditId = () => new URLSearchParams(window.location.search).get('edit');

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

  const loadProjectForEdit = async (projectId) => {
    try {
      const response = await fetchAPI('/api/projects');
      const project = response.data.find((item) => item._id === projectId);

      if (!project) {
        showMessage(projectMessage, 'Project not found for editing.', 'error');
        return;
      }

      document.getElementById('project-id').value = project._id;
      document.getElementById('title').value = project.title;
      document.getElementById('description').value = project.description;
      document.getElementById('githubUrl').value = project.githubUrl;
      showMessage(projectMessage, 'Editing existing project. Saving will reset status to pending.');
    } catch (error) {
      showMessage(projectMessage, error.message, 'error');
    }
  };

  const setupProjectForm = () => {
    if (!projectForm) {
      return;
    }

    const editId = getEditId();
    if (editId) {
      loadProjectForEdit(editId);
    }

    projectForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(projectForm);
      const projectId = document.getElementById('project-id').value;
      const endpoint = projectId ? `/api/projects/${projectId}` : '/api/projects';
      const method = projectId ? 'PUT' : 'POST';

      const fileInput = document.getElementById('certificationFile');
      if (!fileInput.files.length) {
        formData.delete('certificationFile');
      }

      try {
        await fetchAPI(endpoint, method, formData);
        showMessage(
          projectMessage,
          projectId ? 'Project updated successfully.' : 'Project added successfully.',
          'success'
        );
        projectForm.reset();
        document.getElementById('project-id').value = '';
        window.setTimeout(() => {
          window.location.href = '/projects.html';
        }, 700);
      } catch (error) {
        showMessage(projectMessage, error.message, 'error');
      }
    });
  };

  const renderProjectsTable = async () => {
    if (!projectsTableBody && !projectsCardList) {
      return;
    }

    try {
      const response = await fetchAPI('/api/projects');
      const projects = response.data;

      if (totalCount) {
        totalCount.textContent = projects.length;
      }
      if (approvedCount) {
        approvedCount.textContent = projects.filter((project) => project.status === 'approved').length;
      }
      if (pendingCount) {
        pendingCount.textContent = projects.filter((project) => project.status === 'pending').length;
      }
      if (rejectedCount) {
        rejectedCount.textContent = projects.filter((project) => project.status === 'rejected').length;
      }

      if (!projects.length) {
        if (projectsTableBody) {
          projectsTableBody.innerHTML =
            '<tr><td colspan="6" class="empty-state">No projects submitted yet.</td></tr>';
        }
        if (projectsCardList) {
          projectsCardList.innerHTML =
            '<p class="empty-state">No projects submitted yet. Add your first project to start the review workflow.</p>';
        }
        return;
      }

      if (projectsTableBody) {
        projectsTableBody.innerHTML = projects
          .map(
            (project) => `
              <tr>
                <td>
                  <strong>${project.title}</strong>
                  <div>${project.description}</div>
                </td>
                <td>
                  <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer">Repository</a>
                </td>
                <td>
                  ${
                    project.certificationFile
                      ? `<a href="/${project.certificationFile}" target="_blank" rel="noopener noreferrer">View File</a>`
                      : 'Not uploaded'
                  }
                </td>
                <td>
                  <span class="status-badge ${statusClassMap[project.status]}">${project.status}</span>
                </td>
                <td>${project.feedback || 'Awaiting review'}</td>
                <td>
                  <div class="action-group">
                    <a class="icon-button" href="/add-project.html?edit=${project._id}">Edit</a>
                    <button class="icon-button danger" data-delete-id="${project._id}" type="button">Delete</button>
                  </div>
                </td>
              </tr>
            `
          )
          .join('');
      }

      if (projectsCardList) {
        projectsCardList.innerHTML = projects
          .map(
            (project) => `
              <article class="project-card">
                <div class="project-card-head">
                  <div>
                    <h4>${project.title}</h4>
                    <small>Submitted on ${formatDate(project.createdAt)}</small>
                  </div>
                  <span class="status-badge ${statusClassMap[project.status]}">${project.status}</span>
                </div>
                <p>${project.description}</p>
                <div class="project-card-meta">
                  <span>${project.feedback || 'No faculty feedback yet.'}</span>
                </div>
                <div class="project-card-actions">
                  <div class="project-card-links">
                    <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer">Open Repository</a>
                    ${
                      project.certificationFile
                        ? `<a href="/${project.certificationFile}" target="_blank" rel="noopener noreferrer">View Certificate</a>`
                        : '<span>Certificate not uploaded</span>'
                    }
                  </div>
                  <div class="action-group">
                    <a class="icon-button" href="/add-project.html?edit=${project._id}">Edit</a>
                    <button class="icon-button danger" data-delete-id="${project._id}" type="button">Delete</button>
                  </div>
                </div>
              </article>
            `
          )
          .join('');
      }

      document.querySelectorAll('[data-delete-id]').forEach((button) => {
        button.addEventListener('click', async () => {
          try {
            await fetchAPI(`/api/projects/${button.dataset.deleteId}`, 'DELETE');
            showMessage(projectsMessage, 'Project deleted successfully.', 'success');
            renderProjectsTable();
          } catch (error) {
            showMessage(projectsMessage, error.message, 'error');
          }
        });
      });
    } catch (error) {
      showMessage(projectsMessage, error.message, 'error');
    }
  };

  setupProjectForm();
  renderProjectsTable();
})();
