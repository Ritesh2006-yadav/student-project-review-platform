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
  const fileInput = document.getElementById('certificationFile');
  const uploadDropzone = document.getElementById('upload-dropzone');
  const uploadFileInfo = document.getElementById('upload-file-info');
  const sectionSelect = document.getElementById('section');
  const teacherSelect = document.getElementById('assigned_teacher');
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
  const editIcon = `
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  `;
  const allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'gif', 'webp'];
  const maxUploadSize = 10 * 1024 * 1024;
  let selectedUploadFile = null;

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

  const formatFileSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getProjectFileUrl = (project) => project.certificationFile || project.file || '';

  const getProjectTeacherId = (project) => {
    if (!project.assigned_teacher) {
      return '';
    }

    return typeof project.assigned_teacher === 'object'
      ? project.assigned_teacher._id
      : project.assigned_teacher;
  };

  const loadTeacherOptions = async () => {
    if (!teacherSelect) {
      return;
    }

    try {
      const response = await fetchAPI('/api/faculty/list');
      teacherSelect.innerHTML = [
        '<option value="">Select teacher</option>',
        ...response.data.map(
          (teacher) => `<option value="${teacher._id}">${teacher.name}</option>`
        )
      ].join('');
    } catch (error) {
      showMessage(projectMessage, error.message, 'error');
    }
  };

  const renderSelectedFile = () => {
    if (!uploadFileInfo) {
      return;
    }

    if (!selectedUploadFile) {
      uploadFileInfo.classList.add('hidden');
      uploadFileInfo.innerHTML = '';
      return;
    }

    uploadFileInfo.classList.remove('hidden');
    uploadFileInfo.innerHTML = `
      <div class="upload-file-meta">
        <strong>${selectedUploadFile.name}</strong>
        <span>${formatFileSize(selectedUploadFile.size)}</span>
      </div>
      <button type="button" class="upload-file-clear" data-clear-upload>Remove</button>
    `;

    const clearButton = uploadFileInfo.querySelector('[data-clear-upload]');
    if (clearButton) {
      clearButton.addEventListener('click', clearSelectedFile);
    }
  };

  const syncFileInput = () => {
    if (!fileInput) {
      return;
    }

    if (!selectedUploadFile) {
      fileInput.value = '';
      return;
    }

    const transfer = new DataTransfer();
    transfer.items.add(selectedUploadFile);
    fileInput.files = transfer.files;
  };

  const clearSelectedFile = () => {
    selectedUploadFile = null;
    syncFileInput();
    renderSelectedFile();
    showMessage(projectMessage, '');
  };

  const validateUploadFile = (file) => {
    if (!file) {
      return 'Please choose a file to upload.';
    }

    const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';

    if (!allowedExtensions.includes(extension)) {
      return 'Invalid file format. Please upload PDF, DOC, DOCX, PPT, PPTX, or image files.';
    }

    if (file.size > maxUploadSize) {
      return 'File is too large. Please upload a file smaller than 10 MB.';
    }

    return '';
  };

  const setSelectedFile = (file) => {
    const validationMessage = validateUploadFile(file);

    if (validationMessage) {
      clearSelectedFile();
      showMessage(projectMessage, validationMessage, 'error');
      return false;
    }

    selectedUploadFile = file;
    syncFileInput();
    renderSelectedFile();
    showMessage(projectMessage, '');
    return true;
  };

  const setupUploadDropzone = () => {
    if (!fileInput || !uploadDropzone) {
      return;
    }

    const setDragging = (isDragging) => {
      uploadDropzone.classList.toggle('is-dragging', isDragging);
    };

    ['dragenter', 'dragover'].forEach((eventName) => {
      uploadDropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        setDragging(true);
      });
    });

    ['dragleave', 'dragend', 'drop'].forEach((eventName) => {
      uploadDropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        setDragging(false);
      });
    });

    uploadDropzone.addEventListener('drop', (event) => {
      const [file] = event.dataTransfer.files;
      if (file) {
        setSelectedFile(file);
      }
    });

    fileInput.addEventListener('change', () => {
      const [file] = fileInput.files;
      if (file) {
        setSelectedFile(file);
      }
    });

    renderSelectedFile();
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
      if (sectionSelect) {
        sectionSelect.value = project.section || '';
      }
      if (teacherSelect) {
        teacherSelect.value = getProjectTeacherId(project);
      }
      clearSelectedFile();
      showMessage(projectMessage, 'Editing existing project. Saving will reset status to pending.');
    } catch (error) {
      showMessage(projectMessage, error.message, 'error');
    }
  };

  const setupProjectForm = async () => {
    if (!projectForm) {
      return;
    }

    await loadTeacherOptions();

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
      const fileValidationMessage = selectedUploadFile ? validateUploadFile(selectedUploadFile) : '';

      if (!formData.get('section') || !formData.get('assigned_teacher')) {
        showMessage(projectMessage, 'Please select both section and teacher before submitting.', 'error');
        return;
      }

      if (!projectId && !selectedUploadFile) {
        showMessage(projectMessage, 'Please choose a project file before submitting.', 'error');
        return;
      }

      if (fileValidationMessage) {
        showMessage(projectMessage, fileValidationMessage, 'error');
        return;
      }

      if (!selectedUploadFile) {
        formData.delete('certificationFile');
      } else {
        formData.set('certificationFile', selectedUploadFile, selectedUploadFile.name);
      }

      try {
        await fetchAPI(endpoint, method, formData);
        showMessage(
          projectMessage,
          projectId
            ? 'Project updated successfully. Your file was uploaded and saved.'
            : 'Project added successfully. Your file was uploaded and sent for review.',
          'success'
        );
        projectForm.reset();
        clearSelectedFile();
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
                    getProjectFileUrl(project)
                      ? `<a href="/${getProjectFileUrl(project)}" target="_blank" rel="noopener noreferrer">View File</a>`
                      : 'Not uploaded'
                  }
                </td>
                <td>
                  <span class="status-badge ${statusClassMap[project.status]}">${project.status}</span>
                </td>
                <td>${project.feedback || 'Awaiting review'}</td>
                <td>
                  <div class="action-group">
                    <a class="icon-button edit-button" href="/add-project.html?edit=${project._id}" aria-label="Edit project" title="Edit">${editIcon}</a>
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
                      getProjectFileUrl(project)
                        ? `<a href="/${getProjectFileUrl(project)}" target="_blank" rel="noopener noreferrer">View Certificate</a>`
                        : '<span>Certificate not uploaded</span>'
                    }
                  </div>
                  <div class="action-group">
                    <a class="icon-button edit-button" href="/add-project.html?edit=${project._id}" aria-label="Edit project" title="Edit">${editIcon}</a>
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

  setupUploadDropzone();
  setupProjectForm();
  renderProjectsTable();
})();
