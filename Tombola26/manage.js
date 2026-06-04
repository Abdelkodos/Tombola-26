let currentTombolaId = null;
let currentCompanyName = null;

document.addEventListener('DOMContentLoaded', async () => {
  await DB.seedFromJSON();
  showTombolas();
});

function esc(str) {
  return String(str || '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function showToast(message, type = 'success') {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position:fixed;bottom:2rem;right:2rem;padding:12px 20px;
    background:var(--charcoal);color:var(--cream);
    font-family:var(--font-body);font-size:.82rem;letter-spacing:.04em;
    border-radius:var(--radius-sm);
    border-left:3px solid ${type === 'error' ? 'var(--danger)' : 'var(--gold)'};
    box-shadow:0 8px 32px rgba(44,44,44,.2);z-index:9999;
    animation:toastIn .3s ease;`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ════════════════════════════════════════
   MODAL
════════════════════════════════════════ */
function openModal(title, bodyHtml, actions) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHtml;
  document.getElementById('modalActions').innerHTML = actions;
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

/* ════════════════════════════════════════
   BREADCRUMB
════════════════════════════════════════ */
function updateBreadcrumb() {
  const bc = document.getElementById('breadcrumb');
  let html = `<span class="bc-item ${!currentTombolaId ? 'bc-active' : 'bc-link'}" onclick="showTombolas()">
    <i class="ti ti-ticket"></i> Tombolas</span>`;

  if (currentTombolaId) {
    const t = DB.getTombolas().find(x => x.id === currentTombolaId);
    const name = t ? t.name : currentTombolaId;
    html += `<span class="bc-sep"><i class="ti ti-chevron-right"></i></span>`;
    html += `<span class="bc-item ${!currentCompanyName ? 'bc-active' : 'bc-link'}" onclick="showCompanies('${esc(currentTombolaId)}')">${esc(name)}</span>`;
  }

  if (currentCompanyName) {
    html += `<span class="bc-sep"><i class="ti ti-chevron-right"></i></span>`;
    html += `<span class="bc-item bc-active">${esc(currentCompanyName)}</span>`;
  }

  bc.innerHTML = html;
}

/* ════════════════════════════════════════
   LEVEL 1 — TOMBOLAS
════════════════════════════════════════ */
function showTombolas() {
  currentTombolaId = null;
  currentCompanyName = null;
  updateBreadcrumb();

  document.getElementById('viewTombolas').style.display = 'block';
  document.getElementById('viewCompanies').style.display = 'none';
  document.getElementById('viewEmployees').style.display = 'none';

  const tombolas = DB.getTombolas();
  const container = document.getElementById('viewTombolas');

  let html = `
    <div class="manage-toolbar">
      <button class="btn btn-gold" onclick="openAddTombola()">
        <i class="ti ti-plus"></i> Nouvelle Tombola
      </button>
    </div>`;

  if (!tombolas.length) {
    html += `<div class="card"><div class="empty-state">
      <div class="empty-icon"><i class="ti ti-ticket"></i></div>
      <p>Aucune tombola. Créez-en une pour commencer.</p>
    </div></div>`;
  } else {
    html += '<div class="manage-list">';
    tombolas.forEach(t => {
      const data = DB.getTombolaData(t.id);
      const companyCount = Object.keys(data).length;
      const empCount = Object.values(data).reduce((s, arr) => s + arr.length, 0);
      html += `
        <div class="manage-row" onclick="showCompanies('${esc(t.id)}')">
          <div class="manage-row-icon"><i class="ti ti-ticket"></i></div>
          <div class="manage-row-info">
            <span class="manage-row-title">${esc(t.name)}</span>
            <span class="manage-row-sub">${companyCount} société${companyCount !== 1 ? 's' : ''} · ${empCount} employé${empCount !== 1 ? 's' : ''}</span>
          </div>
          <div class="manage-row-actions" onclick="event.stopPropagation()">
            <button class="btn btn-outline btn-sm" onclick="openEditTombola('${esc(t.id)}')"><i class="ti ti-pencil"></i></button>
            <button class="btn btn-danger btn-sm" onclick="confirmDeleteTombola('${esc(t.id)}')"><i class="ti ti-trash"></i></button>
          </div>
        </div>`;
    });
    html += '</div>';
  }

  container.innerHTML = html;
}

function openAddTombola() {
  openModal('Nouvelle Tombola',
    `<label class="modal-label">Nom de la tombola</label>
     <input type="text" class="input-field modal-input" id="inputTombolaName" placeholder="Ex: Tombola Omra" />`,
    `<button class="btn btn-outline" onclick="closeModal()">Annuler</button>
     <button class="btn btn-gold" onclick="doAddTombola()">Créer</button>`
  );
  setTimeout(() => document.getElementById('inputTombolaName')?.focus(), 100);
}

function doAddTombola() {
  const name = document.getElementById('inputTombolaName').value.trim();
  if (!name) { showToast('Veuillez saisir un nom.', 'error'); return; }
  DB.addTombola(name);
  closeModal();
  showTombolas();
  showToast('Tombola créée.');
}

function openEditTombola(id) {
  const t = DB.getTombolas().find(x => x.id === id);
  if (!t) return;
  openModal('Modifier la Tombola',
    `<label class="modal-label">Nom</label>
     <input type="text" class="input-field modal-input" id="inputTombolaName" value="${esc(t.name)}" />`,
    `<button class="btn btn-outline" onclick="closeModal()">Annuler</button>
     <button class="btn btn-gold" onclick="doEditTombola('${esc(id)}')">Enregistrer</button>`
  );
  setTimeout(() => document.getElementById('inputTombolaName')?.focus(), 100);
}

function doEditTombola(id) {
  const name = document.getElementById('inputTombolaName').value.trim();
  if (!name) { showToast('Veuillez saisir un nom.', 'error'); return; }
  DB.updateTombola(id, name);
  closeModal();
  showTombolas();
  showToast('Tombola modifiée.');
}

function confirmDeleteTombola(id) {
  const t = DB.getTombolas().find(x => x.id === id);
  if (!t) return;
  openModal('Supprimer la Tombola',
    `<p class="modal-text">Supprimer <strong>${esc(t.name)}</strong> et toutes ses données ? Cette action est irréversible.</p>`,
    `<button class="btn btn-outline" onclick="closeModal()">Annuler</button>
     <button class="btn btn-danger" onclick="doDeleteTombola('${esc(id)}')">Supprimer</button>`
  );
}

function doDeleteTombola(id) {
  DB.deleteTombola(id);
  closeModal();
  showTombolas();
  showToast('Tombola supprimée.');
}

/* ════════════════════════════════════════
   LEVEL 2 — COMPANIES
════════════════════════════════════════ */
function showCompanies(tombolaId) {
  currentTombolaId = tombolaId;
  currentCompanyName = null;
  updateBreadcrumb();

  document.getElementById('viewTombolas').style.display = 'none';
  document.getElementById('viewCompanies').style.display = 'block';
  document.getElementById('viewEmployees').style.display = 'none';

  const data = DB.getTombolaData(tombolaId);
  const companies = Object.keys(data);
  const container = document.getElementById('viewCompanies');

  let html = `
    <div class="manage-toolbar">
      <button class="btn btn-ghost" onclick="showTombolas()"><i class="ti ti-arrow-left"></i> Retour</button>
      <button class="btn btn-gold" onclick="openAddCompany()">
        <i class="ti ti-plus"></i> Nouvelle Société
      </button>
    </div>`;

  if (!companies.length) {
    html += `<div class="card"><div class="empty-state">
      <div class="empty-icon"><i class="ti ti-building"></i></div>
      <p>Aucune société. Ajoutez-en une pour commencer.</p>
    </div></div>`;
  } else {
    html += '<div class="manage-list">';
    companies.forEach(company => {
      const count = data[company].length;
      html += `
        <div class="manage-row" onclick="showEmployees('${esc(currentTombolaId)}', '${esc(company)}')">
          <div class="manage-row-icon"><i class="ti ti-building"></i></div>
          <div class="manage-row-info">
            <span class="manage-row-title">${esc(company)}</span>
            <span class="manage-row-sub">${count} employé${count !== 1 ? 's' : ''}</span>
          </div>
          <div class="manage-row-actions" onclick="event.stopPropagation()">
            <button class="btn btn-outline btn-sm" onclick="openRenameCompany('${esc(company)}')"><i class="ti ti-pencil"></i></button>
            <button class="btn btn-danger btn-sm" onclick="confirmDeleteCompany('${esc(company)}')"><i class="ti ti-trash"></i></button>
          </div>
        </div>`;
    });
    html += '</div>';
  }

  container.innerHTML = html;
}

function openAddCompany() {
  openModal('Nouvelle Société',
    `<label class="modal-label">Nom de la société</label>
     <input type="text" class="input-field modal-input" id="inputCompanyName" placeholder="Ex: GROUPE MOJAZINE" />`,
    `<button class="btn btn-outline" onclick="closeModal()">Annuler</button>
     <button class="btn btn-gold" onclick="doAddCompany()">Créer</button>`
  );
  setTimeout(() => document.getElementById('inputCompanyName')?.focus(), 100);
}

function doAddCompany() {
  const name = document.getElementById('inputCompanyName').value.trim();
  if (!name) { showToast('Veuillez saisir un nom.', 'error'); return; }
  const data = DB.getTombolaData(currentTombolaId);
  if (data[name]) { showToast('Cette société existe déjà.', 'error'); return; }
  DB.addCompany(currentTombolaId, name);
  closeModal();
  showCompanies(currentTombolaId);
  showToast('Société ajoutée.');
}

function openRenameCompany(oldName) {
  openModal('Renommer la Société',
    `<label class="modal-label">Nouveau nom</label>
     <input type="text" class="input-field modal-input" id="inputCompanyName" value="${esc(oldName)}" />`,
    `<button class="btn btn-outline" onclick="closeModal()">Annuler</button>
     <button class="btn btn-gold" onclick="doRenameCompany('${esc(oldName)}')">Enregistrer</button>`
  );
  setTimeout(() => document.getElementById('inputCompanyName')?.focus(), 100);
}

function doRenameCompany(oldName) {
  const newName = document.getElementById('inputCompanyName').value.trim();
  if (!newName) { showToast('Veuillez saisir un nom.', 'error'); return; }
  if (newName === oldName) { closeModal(); return; }
  const data = DB.getTombolaData(currentTombolaId);
  if (data[newName]) { showToast('Ce nom existe déjà.', 'error'); return; }
  DB.renameCompany(currentTombolaId, oldName, newName);
  closeModal();
  showCompanies(currentTombolaId);
  showToast('Société renommée.');
}

function confirmDeleteCompany(company) {
  const count = DB.getEmployees(currentTombolaId, company).length;
  openModal('Supprimer la Société',
    `<p class="modal-text">Supprimer <strong>${esc(company)}</strong> et ses ${count} employé${count !== 1 ? 's' : ''} ? Cette action est irréversible.</p>`,
    `<button class="btn btn-outline" onclick="closeModal()">Annuler</button>
     <button class="btn btn-danger" onclick="doDeleteCompany('${esc(company)}')">Supprimer</button>`
  );
}

function doDeleteCompany(company) {
  DB.deleteCompany(currentTombolaId, company);
  closeModal();
  showCompanies(currentTombolaId);
  showToast('Société supprimée.');
}

/* ════════════════════════════════════════
   LEVEL 3 — EMPLOYEES
════════════════════════════════════════ */
function showEmployees(tombolaId, company) {
  currentTombolaId = tombolaId;
  currentCompanyName = company;
  updateBreadcrumb();

  document.getElementById('viewTombolas').style.display = 'none';
  document.getElementById('viewCompanies').style.display = 'none';
  document.getElementById('viewEmployees').style.display = 'block';

  renderEmployeeList();
}

function renderEmployeeList() {
  const employees = DB.getEmployees(currentTombolaId, currentCompanyName);
  const container = document.getElementById('viewEmployees');

  let html = `
    <div class="manage-toolbar">
      <button class="btn btn-ghost" onclick="showCompanies('${esc(currentTombolaId)}')"><i class="ti ti-arrow-left"></i> Retour</button>
      <div style="display:flex;gap:0.5rem">
        <button class="btn btn-outline" onclick="openImportEmployees()"><i class="ti ti-upload"></i> Importer</button>
        <button class="btn btn-gold" onclick="openAddEmployee()"><i class="ti ti-plus"></i> Ajouter</button>
      </div>
    </div>`;

  if (!employees.length) {
    html += `<div class="card"><div class="empty-state">
      <div class="empty-icon"><i class="ti ti-users"></i></div>
      <p>Aucun employé. Ajoutez-en ou importez depuis un fichier.</p>
    </div></div>`;
  } else {
    html += `
    <div class="card">
      <div class="manage-toolbar" style="margin-bottom:1rem">
        <span class="count-badge">${employees.length} employé${employees.length !== 1 ? 's' : ''}</span>
        <input type="text" class="input-field" id="empSearchInput" placeholder="Rechercher…"
          oninput="filterEmployeeTable()" style="max-width:240px" />
      </div>
      <div class="candidate-table-scroll" style="max-height:500px">
        <table class="history-table candidate-full-table" id="empTable">
          <thead><tr>
            <th>Matricule</th><th>Nom</th><th>Prénom</th><th>Fonction</th><th style="width:90px"></th>
          </tr></thead>
          <tbody>`;

    employees.forEach((emp, i) => {
      html += `
            <tr data-idx="${i}">
              <td>${esc(emp.matricule)}</td>
              <td class="name-cell">${esc(emp.nom)}</td>
              <td>${esc(emp.prenom)}</td>
              <td class="date-cell">${esc(emp.fonction)}</td>
              <td>
                <div style="display:flex;gap:4px;justify-content:flex-end">
                  <button class="del-btn" onclick="openEditEmployee(${i})" title="Modifier"><i class="ti ti-pencil"></i></button>
                  <button class="del-btn" onclick="confirmDeleteEmployee(${i})" title="Supprimer"><i class="ti ti-trash"></i></button>
                </div>
              </td>
            </tr>`;
    });

    html += `</tbody></table></div></div>`;
  }

  container.innerHTML = html;
}

function filterEmployeeTable() {
  const query = document.getElementById('empSearchInput').value.toLowerCase();
  document.querySelectorAll('#empTable tbody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
}

function employeeFormHtml(emp) {
  const m = emp || { matricule: '', nom: '', prenom: '', fonction: '' };
  return `
    <div class="modal-form">
      <label class="modal-label">Matricule</label>
      <input type="text" class="input-field modal-input" id="inputMatricule" value="${esc(m.matricule)}" placeholder="Ex: 20003243" />
      <label class="modal-label">Nom</label>
      <input type="text" class="input-field modal-input" id="inputNom" value="${esc(m.nom)}" placeholder="Ex: DUPONT" />
      <label class="modal-label">Prénom</label>
      <input type="text" class="input-field modal-input" id="inputPrenom" value="${esc(m.prenom)}" placeholder="Ex: JEAN" />
      <label class="modal-label">Fonction</label>
      <input type="text" class="input-field modal-input" id="inputFonction" value="${esc(m.fonction)}" placeholder="Ex: CHEF DE CHANTIER" />
    </div>`;
}

function getEmployeeFromForm() {
  return {
    matricule: document.getElementById('inputMatricule').value.trim(),
    nom: document.getElementById('inputNom').value.trim(),
    prenom: document.getElementById('inputPrenom').value.trim(),
    fonction: document.getElementById('inputFonction').value.trim(),
  };
}

function openAddEmployee() {
  openModal('Ajouter un Employé', employeeFormHtml(),
    `<button class="btn btn-outline" onclick="closeModal()">Annuler</button>
     <button class="btn btn-gold" onclick="doAddEmployee()">Ajouter</button>`
  );
  setTimeout(() => document.getElementById('inputMatricule')?.focus(), 100);
}

function doAddEmployee() {
  const emp = getEmployeeFromForm();
  if (!emp.nom || !emp.prenom) { showToast('Nom et prénom sont obligatoires.', 'error'); return; }
  DB.addEmployee(currentTombolaId, currentCompanyName, emp);
  closeModal();
  renderEmployeeList();
  showToast('Employé ajouté.');
}

function openEditEmployee(index) {
  const employees = DB.getEmployees(currentTombolaId, currentCompanyName);
  const emp = employees[index];
  if (!emp) return;
  openModal('Modifier l\'Employé', employeeFormHtml(emp),
    `<button class="btn btn-outline" onclick="closeModal()">Annuler</button>
     <button class="btn btn-gold" onclick="doEditEmployee(${index})">Enregistrer</button>`
  );
  setTimeout(() => document.getElementById('inputMatricule')?.focus(), 100);
}

function doEditEmployee(index) {
  const emp = getEmployeeFromForm();
  if (!emp.nom || !emp.prenom) { showToast('Nom et prénom sont obligatoires.', 'error'); return; }
  DB.updateEmployee(currentTombolaId, currentCompanyName, index, emp);
  closeModal();
  renderEmployeeList();
  showToast('Employé modifié.');
}

function confirmDeleteEmployee(index) {
  const employees = DB.getEmployees(currentTombolaId, currentCompanyName);
  const emp = employees[index];
  if (!emp) return;
  openModal('Supprimer l\'Employé',
    `<p class="modal-text">Supprimer <strong>${esc(emp.nom)} ${esc(emp.prenom)}</strong> (${esc(emp.matricule)}) ?</p>`,
    `<button class="btn btn-outline" onclick="closeModal()">Annuler</button>
     <button class="btn btn-danger" onclick="doDeleteEmployee(${index})">Supprimer</button>`
  );
}

function doDeleteEmployee(index) {
  DB.deleteEmployee(currentTombolaId, currentCompanyName, index);
  closeModal();
  renderEmployeeList();
  showToast('Employé supprimé.');
}

/* ════════════════════════════════════════
   IMPORT (CSV / JSON paste)
════════════════════════════════════════ */
function openImportEmployees() {
  openModal('Importer des Employés',
    `<p class="modal-text" style="margin-bottom:1rem">Collez des données au format CSV ou JSON. Le CSV doit avoir les colonnes : <strong>matricule, nom, prenom, fonction</strong> (avec en-tête).</p>
     <textarea class="input-field modal-input modal-textarea" id="importData" rows="10"
       placeholder="matricule,nom,prenom,fonction&#10;20003243,DUPONT,JEAN,CHEF DE CHANTIER&#10;..."></textarea>
     <p class="modal-hint" id="importHint"></p>`,
    `<button class="btn btn-outline" onclick="closeModal()">Annuler</button>
     <button class="btn btn-gold" onclick="doImport()">Importer</button>`
  );
  setTimeout(() => document.getElementById('importData')?.focus(), 100);
}

function doImport() {
  const raw = document.getElementById('importData').value.trim();
  if (!raw) { showToast('Aucune donnée.', 'error'); return; }

  let rows = [];

  // Try JSON first
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      rows = parsed.filter(r => r.nom || r.prenom);
    }
  } catch {
    // Try CSV
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) { showToast('Données insuffisantes.', 'error'); return; }

    const sep = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
    const header = lines[0].split(sep).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

    const iMat = header.findIndex(h => h.includes('matricule'));
    const iNom = header.findIndex(h => h === 'nom');
    const iPrenom = header.findIndex(h => h.includes('prenom') || h.includes('prénom'));
    const iFonc = header.findIndex(h => h.includes('fonction'));

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(sep).map(c => c.trim().replace(/^['"]|['"]$/g, ''));
      const emp = {
        matricule: iMat >= 0 ? (cols[iMat] || '') : '',
        nom: iNom >= 0 ? (cols[iNom] || '') : '',
        prenom: iPrenom >= 0 ? (cols[iPrenom] || '') : '',
        fonction: iFonc >= 0 ? (cols[iFonc] || '') : '',
      };
      if (emp.nom || emp.prenom) rows.push(emp);
    }
  }

  if (!rows.length) { showToast('Aucune ligne valide trouvée.', 'error'); return; }

  const data = DB.getTombolaData(currentTombolaId);
  if (!data[currentCompanyName]) data[currentCompanyName] = [];
  data[currentCompanyName].push(...rows);
  DB.setTombolaData(currentTombolaId, data);

  closeModal();
  renderEmployeeList();
  showToast(`${rows.length} employé${rows.length > 1 ? 's' : ''} importé${rows.length > 1 ? 's' : ''}.`);
}

// Expose functions for onclick attributes
window.showTombolas = showTombolas;
window.showCompanies = showCompanies;
window.showEmployees = showEmployees;
window.openAddTombola = openAddTombola;
window.doAddTombola = doAddTombola;
window.openEditTombola = openEditTombola;
window.doEditTombola = doEditTombola;
window.confirmDeleteTombola = confirmDeleteTombola;
window.doDeleteTombola = doDeleteTombola;
window.openAddCompany = openAddCompany;
window.doAddCompany = doAddCompany;
window.openRenameCompany = openRenameCompany;
window.doRenameCompany = doRenameCompany;
window.confirmDeleteCompany = confirmDeleteCompany;
window.doDeleteCompany = doDeleteCompany;
window.openAddEmployee = openAddEmployee;
window.doAddEmployee = doAddEmployee;
window.openEditEmployee = openEditEmployee;
window.doEditEmployee = doEditEmployee;
window.confirmDeleteEmployee = confirmDeleteEmployee;
window.doDeleteEmployee = doDeleteEmployee;
window.openImportEmployees = openImportEmployees;
window.doImport = doImport;
window.filterEmployeeTable = filterEmployeeTable;
window.openModal = openModal;
window.closeModal = closeModal;
