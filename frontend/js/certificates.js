/**
 * Purpose: Loads approved student projects for the certificates page.
 */

(function initializeCertificates() {
  const {
    attachLogout,
    fetchAPI,
    requireAuth
  } = window.AppAPI;

  requireAuth();
  attachLogout();

  const certificatesList = document.getElementById('certificates-list');
  const certificatesMessage = document.getElementById('certificates-message');
  const approvedCount = document.getElementById('certificates-approved-count');

  const showMessage = (message, type = '') => {
    if (!certificatesMessage) {
      return;
    }

    certificatesMessage.textContent = message;
    certificatesMessage.className = `message ${type}`.trim();
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

  const renderCertificates = (projects) => {
    if (!certificatesList) {
      return;
    }

    certificatesList.innerHTML = '';

    if (approvedCount) {
      approvedCount.textContent = projects.length;
    }

    if (!projects.length) {
      certificatesList.innerHTML =
        '<p class="empty-state">No approved projects yet. Approved submissions will appear here.</p>';
      return;
    }

    projects.forEach((project) => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-card-head">
          <div>
            <h4>${project.title}</h4>
            <small>Approved project · ${formatDate(project.createdAt)}</small>
          </div>
          <span class="status-badge status-approved">approved</span>
        </div>
        <p>${project.description}</p>
        <div class="project-card-actions">
          <div class="project-card-links">
            <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer">Open Repository</a>
            ${
              project.certificationFile
                ? `<a href="/${project.certificationFile}" target="_blank" rel="noopener noreferrer">View Certificate</a>`
                : '<span>Certificate file not uploaded</span>'
            }
          </div>
        </div>
      `;
      certificatesList.appendChild(card);
    });
  };

  const loadCertificates = async () => {
    try {
      const response = await fetchAPI('/api/projects/portfolio');
      renderCertificates(response.data);
      showMessage('');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  loadCertificates();
})();
