// Popup script - Template selection for extension
document.addEventListener('DOMContentLoaded', async () => {
  const templateSelect = document.getElementById('template-select');
  const statusEl = document.getElementById('status');

  // Default templates - users can modify these or add their own
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

  // Load templates from storage or use defaults
  function loadTemplates() {
    chrome.storage.local.get(['templates', 'selectedTemplate'], (result) => {
      let templates = result.templates || defaultTemplates;
      
      // Save defaults if nothing in storage
      if (!result.templates) {
        chrome.storage.local.set({ templates: defaultTemplates });
      }

      // Populate template dropdown
      templateSelect.innerHTML = '<option value="">Select a template...</option>';
      templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name;
        templateSelect.appendChild(option);
      });

      // Pre-select previously selected template
      if (result.selectedTemplate) {
        templateSelect.value = result.selectedTemplate.id;
        showStatus('Template loaded: ' + result.selectedTemplate.name, 'success');
      }
    });
  }

  // Show status message
  function showStatus(message, type = 'info') {
    statusEl.textContent = message;
    statusEl.className = 'status ' + type;
    statusEl.style.display = 'block';
    
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }

  // When template is selected, save it to storage
  templateSelect.addEventListener('change', () => {
    const selectedId = templateSelect.value;
    if (!selectedId) return;

    chrome.storage.local.get(['templates'], (result) => {
      const templates = result.templates || defaultTemplates;
      const selectedTemplate = templates.find(t => t.id === selectedId);
      
      if (selectedTemplate) {
        chrome.storage.local.set({ selectedTemplate }, () => {
          showStatus('Template selected: ' + selectedTemplate.name, 'success');
        });
      }
    });
  });

  // Load templates on startup
  loadTemplates();
});

