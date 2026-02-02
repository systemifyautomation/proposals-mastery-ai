// Settings page script
document.addEventListener('DOMContentLoaded', async () => {
  const storageRadios = document.querySelectorAll('input[name="storage"]');
  const youtubeCredentials = document.getElementById('youtube-credentials');
  const youtubeClientId = document.getElementById('youtube-client-id');
  const templateList = document.getElementById('template-list');
  const addTemplateBtn = document.getElementById('add-template-btn');
  const templateEditor = document.getElementById('template-editor');
  const editorTitle = document.getElementById('editor-title');
  const templateName = document.getElementById('template-name');
  const templateContent = document.getElementById('template-content');
  const saveTemplateBtn = document.getElementById('save-template-btn');
  const cancelTemplateBtn = document.getElementById('cancel-template-btn');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  const clearDataBtn = document.getElementById('clear-data-btn');
  const storagePathEl = document.getElementById('storage-path');
  const statusEl = document.getElementById('status');

  let templates = [];
  let editingTemplateId = null;

  // Default templates
  const defaultTemplates = [
    {
      id: '1',
      name: 'Professional Template',
      content: `Hello!

I'm excited about {{JOB_TITLE}}. With {{YEARS_EXPERIENCE}} years of experience as a {{TITLE}}, I've delivered exceptional results for clients worldwide.

{{BIO}}

I'd love to discuss how I can help with your project.

Best regards,
{{NAME}}`
    },
    {
      id: '2',
      name: 'Technical Template',
      content: `Hi there!

I noticed your posting for {{JOB_TITLE}} and I'm confident I can deliver excellent results.

Relevant skills: {{SKILLS}}

{{BIO}}

Portfolio: {{PORTFOLIO}}

Looking forward to working together!`
    }
  ];

  // Show status message
  function showStatus(message, type = 'success') {
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    statusEl.style.display = 'block';
    
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }

  // Load settings from storage
  async function loadSettings() {
    const result = await persistentStorage.load(['storageLocation', 'youtubeClientId', 'templates', 'onboardingComplete']);
    
    // Set storage location
    const storageLocation = result.storageLocation || 'local';
    document.querySelector(`input[name="storage"][value="${storageLocation}"]`).checked = true;
    toggleYouTubeCredentials();

    // Set YouTube Client ID
    if (result.youtubeClientId) {
      youtubeClientId.value = result.youtubeClientId;
    }

    // Load templates
    templates = result.templates || defaultTemplates;
    renderTemplates();
    
    // Display storage path
    const path = await persistentStorage.getStoragePath();
    if (storagePathEl) {
      storagePathEl.textContent = path;
    }
  }

  // Toggle YouTube credentials section
  function toggleYouTubeCredentials() {
    const selectedStorage = document.querySelector('input[name="storage"]:checked').value;
    if (selectedStorage === 'youtube' || selectedStorage === 'both') {
      youtubeCredentials.style.display = 'block';
    } else {
      youtubeCredentials.style.display = 'none';
    }
  }

  // Render templates
  function renderTemplates() {
    templateList.innerHTML = '';
    
    templates.forEach(template => {
      const item = document.createElement('div');
      item.className = 'template-item';
      item.innerHTML = `
        <div>
          <h3>${template.name}</h3>
          <p>${template.content.substring(0, 80)}...</p>
        </div>
        <div class="template-actions">
          <button class="btn btn-secondary btn-small edit-btn" data-id="${template.id}">Edit</button>
          <button class="btn btn-danger btn-small delete-btn" data-id="${template.id}">Delete</button>
        </div>
      `;
      templateList.appendChild(item);
    });

    // Add event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => editTemplate(btn.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteTemplate(btn.dataset.id));
    });
  }

  // Add new template
  function addNewTemplate() {
    editingTemplateId = null;
    editorTitle.textContent = 'Create New Template';
    templateName.value = '';
    templateContent.value = '';
    templateEditor.style.display = 'block';
    templateEditor.scrollIntoView({ behavior: 'smooth' });
  }

  // Edit template
  function editTemplate(id) {
    const template = templates.find(t => t.id === id);
    if (!template) return;

    editingTemplateId = id;
    editorTitle.textContent = 'Edit Template';
    templateName.value = template.name;
    templateContent.value = template.content;
    templateEditor.style.display = 'block';
    templateEditor.scrollIntoView({ behavior: 'smooth' });
  }

  // Delete template
  function deleteTemplate(id) {
    if (templates.length === 1) {
      showStatus('You must have at least one template', 'error');
      return;
    }

    if (confirm('Are you sure you want to delete this template?')) {
      templates = templates.filter(t => t.id !== id);
      renderTemplates();
      showStatus('Template deleted successfully');
    }
  }

  // Save template
  function saveTemplate() {
    const name = templateName.value.trim();
    const content = templateContent.value.trim();

    if (!name || !content) {
      showStatus('Please fill in all fields', 'error');
      return;
    }

    if (editingTemplateId) {
      // Update existing template
      const template = templates.find(t => t.id === editingTemplateId);
      if (template) {
        template.name = name;
        template.content = content;
      }
    } else {
      // Add new template
      const newId = Date.now().toString();
      templates.push({ id: newId, name, content });
    }

    renderTemplates();
    templateEditor.style.display = 'none';
    showStatus('Template saved successfully');
  }

  // Cancel template editing
  function cancelTemplate() {
    templateEditor.style.display = 'none';
    editingTemplateId = null;
  }

  // Save all settings
  async function saveSettings() {
    const storageLocation = document.querySelector('input[name="storage"]:checked').value;
    const clientId = youtubeClientId.value.trim();

    // Validate YouTube credentials if needed
    if ((storageLocation === 'youtube' || storageLocation === 'both') && !clientId) {
      showStatus('Please enter your YouTube Client ID', 'error');
      return;
    }

    // Save to persistent storage
    await persistentStorage.save({
      storageLocation,
      youtubeClientId: clientId,
      templates,
      onboardingComplete: true
    });

    // Update manifest with client ID if provided
    if (clientId) {
      console.log('YouTube Client ID saved:', clientId);
    }

    showStatus('Settings saved successfully!');
    
    // Redirect to popup after 1 second
    setTimeout(() => {
      window.close();
    }, 1000);
  }

  // Clear all data
  async function clearAllData() {
    if (!confirm('Are you sure you want to erase ALL settings and templates? This cannot be undone.')) {
      return;
    }

    await persistentStorage.clear();
    showStatus('All data cleared successfully!');
    
    // Reload settings (will show defaults)
    setTimeout(() => {
      location.reload();
    }, 1000);
  }

  // Event listeners
  storageRadios.forEach(radio => {
    radio.addEventListener('change', toggleYouTubeCredentials);
  });

  addTemplateBtn.addEventListener('click', addNewTemplate);
  saveTemplateBtn.addEventListener('click', saveTemplate);
  cancelTemplateBtn.addEventListener('click', cancelTemplate);
  saveSettingsBtn.addEventListener('click', saveSettings);
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', clearAllData);
  }

  // Load settings on startup
  loadSettings();
});
