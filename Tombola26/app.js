/**
 * app.js — Abrar Raffle · Main Application Logic
 * Depends on: db.js (loaded first), XLSX (CDN)
 */

/* ── State ── */
let rolling       = false;
let currentWinner = null;   // full row object

/* ── DOM Refs ── */
const fileInput     = document.getElementById('fileInput');
const dropZone      = document.getElementById('dropZone');
const drawBtn       = document.getElementById('drawBtn');
const winnerCard    = document.getElementById('winnerCard');
const winnerContent = document.getElementById('winnerContent');
const nameGridMain  = document.getElementById('nameGridMain');
const countBadge    = document.getElementById('countBadge');
const confettiEl    = document.getElementById('confettiContainer');

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  renderAll();
  bindEvents();
});

/* ════════════════════════════════════════
   RENDER
════════════════════════════════════════ */
function renderAll() {
  const eligible = DB.getEligibleRows();
  const total    = DB.getRows().length;
  const conds    = DB.getConditions();

  /* name grid */
  if (nameGridMain) {
    nameGridMain.innerHTML = '';
    if (eligible.length) {
      nameGridMain.style.display = 'flex';
      eligible.forEach(row => {
        const tag = document.createElement('span');
        tag.className   = 'name-tag';
        tag.textContent = row.__name;
        tag.title       = 'Cliquer pour supprimer';
        tag.addEventListener('click', () => {
          const rows = DB.getRows().filter(r => r.__name !== row.__name);
          DB.saveRows(rows);
          if (currentWinner && currentWinner.__name === row.__name) {
            winnerCard.classList.remove('visible');
            currentWinner = null;
          }
          renderAll();
        });
        nameGridMain.appendChild(tag);
      });
    } else {
      nameGridMain.style.display = 'none';
    }
  }

  /* badges */
  const condActive = conds.length > 0;
  if (countBadge) {
    countBadge.textContent = condActive
      ? `${eligible.length} éligible sur ${total}`
      : `${total} participant${total > 1 ? 's' : ''}`;
  }

  /* empty states */
  const emptyRaffle = document.getElementById('emptyRaffle');
  if (emptyRaffle) emptyRaffle.style.display = eligible.length ? 'none' : 'block';

  const bar = document.getElementById('participantsBarMain');
  if (bar) bar.style.display = total ? 'flex' : 'none';

  /* draw button */
  if (drawBtn) drawBtn.disabled = eligible.length === 0 || rolling;

  /* filtered-out notice */
  const filteredOut = document.getElementById('filteredOutNotice');
  if (filteredOut) {
    const excluded = total - eligible.length;
    if (condActive && excluded > 0) {
      filteredOut.textContent = `${excluded} participant${excluded !== 1 ? 's' : ''} exclu(s) par les conditions actives`;
      filteredOut.style.display = 'block';
    } else {
      filteredOut.style.display = 'none';
    }
  }

  /* conditions panel */
  renderConditions();

  /* display columns panel */
  renderDisplayCols();
}

/* ════════════════════════════════════════
   FILE UPLOAD
════════════════════════════════════════ */
function bindEvents() {
  if (fileInput) fileInput.addEventListener('change', e => handleFile(e.target.files[0]));
  if (dropZone) {
    dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', ()  => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
  }
}

/* Holds parsed workbook between sheet-picker step and import step */
let _pendingWorkbook = null;

function handleFile(file) {
  if (!file) return;
  const ext    = file.name.split('.').pop().toLowerCase();
  const reader = new FileReader();

  reader.onload = e => {
    if (ext === 'csv') {
      importCSVData(e.target.result);
    } else {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
      if (wb.SheetNames.length <= 1) {
        // Only one sheet — import directly, no picker needed
        importFromSheets(wb, wb.SheetNames);
      } else {
        // Multiple sheets — show picker
        _pendingWorkbook = wb;
        showSheetPicker(wb.SheetNames);
      }
    }
  };

  if (ext === 'csv') reader.readAsText(file);
  else               reader.readAsArrayBuffer(file);
}

function showSheetPicker(sheetNames) {
  const panel = document.getElementById('sheetPickerPanel');
  const list  = document.getElementById('sheetCheckboxList');
  if (!panel || !list) return;

  list.innerHTML = sheetNames.map((name, i) => `
    <label class="col-toggle sheet-toggle">
      <input type="checkbox" class="sheet-cb" value="${escHtml(name)}" ${i === 0 ? 'checked' : ''} />
      <span class="col-toggle-label">${escHtml(name)}</span>
    </label>`).join('');

  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function confirmSheetImport() {
  if (!_pendingWorkbook) return;
  const checked = [...document.querySelectorAll('.sheet-cb:checked')].map(cb => cb.value);
  if (!checked.length) { showToast('Sélectionnez au moins une feuille.', 'error'); return; }
  importFromSheets(_pendingWorkbook, checked);
  _pendingWorkbook = null;
  document.getElementById('sheetPickerPanel').style.display = 'none';
}

function importFromSheets(wb, sheetNames) {
  let allRows    = [];
  let allHeaders = [];

  sheetNames.forEach(name => {
    const sheet    = wb.Sheets[name];
    if (!sheet) return;
    const jsonRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (!jsonRows.length) return;

    const headers = jsonRows[0].map(h => String(h || '').trim());
    if (!allHeaders.length) allHeaders = headers; // use first sheet's headers as master

    jsonRows.slice(1).forEach(cells => {
      const obj = {};
      allHeaders.forEach((h, i) => { obj[h] = cells[i] !== undefined ? cells[i] : ''; });
      obj.__name     = String(cells[0] || '').trim();
      obj.__sheet    = name;   // track source sheet
      if (obj.__name) allRows.push(obj);
    });
  });

  if (!allRows.length) { showToast('Aucune donnée trouvée dans les feuilles sélectionnées.', 'error'); return; }

  const existing = DB.getRows().map(r => r.__name);
  const newRows  = allRows.filter(r => !existing.includes(r.__name));
  const skipped  = allRows.length - newRows.length;

  DB.saveRows([...DB.getRows(), ...newRows]);
  DB.saveColumns(allHeaders);

  renderAll();
  const sheetLabel = sheetNames.length > 1 ? ` (${sheetNames.length} feuilles)` : ` (${sheetNames[0]})`;
  showToast(`${newRows.length} participant${newRows.length > 1 ? 's' : ''} importé${newRows.length > 1 ? 's' : ''}${sheetLabel}${skipped ? ` · ${skipped} doublon${skipped > 1 ? 's' : ''} ignoré${skipped > 1 ? 's' : ''}` : ''}.`);
}

function importCSVData(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(line => {
    const cells = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    const obj   = {};
    headers.forEach((h, i) => { obj[h] = cells[i] || ''; });
    obj.__name = cells[0] || '';
    return obj;
  }).filter(r => r.__name);

  if (!rows.length) { showToast('Aucune donnée trouvée.', 'error'); return; }

  const existing = DB.getRows().map(r => r.__name);
  const newRows  = rows.filter(r => !existing.includes(r.__name));
  const skipped  = rows.length - newRows.length;

  DB.saveRows([...DB.getRows(), ...newRows]);
  DB.saveColumns(headers);

  renderAll();
  showToast(`${newRows.length} participant${newRows.length > 1 ? 's' : ''} importé${newRows.length > 1 ? 's' : ''}${skipped ? ` · ${skipped} doublon${skipped > 1 ? 's' : ''} ignoré${skipped > 1 ? 's' : ''}` : ''}.`);
}

/* ════════════════════════════════════════
   CONDITIONS
════════════════════════════════════════ */
function renderConditions() {
  const list = document.getElementById('conditionList');
  if (!list) return;

  const conds   = DB.getConditions();
  const columns = DB.getColumns().filter(c => c && !c.startsWith('__'));

  list.innerHTML = '';

  if (!conds.length) {
    list.innerHTML = '<p class="cond-empty">No conditions yet — all participants are eligible.</p>';
  } else {
    conds.forEach((cond, idx) => {
      const item = document.createElement('div');
      item.className = 'cond-item';
      item.innerHTML = `
        <span class="cond-pill">
          <span class="cond-col">${cond.column}</span>
          <span class="cond-op">${cond.operator}</span>
          <span class="cond-val">${cond.value}</span>
        </span>
        <button class="del-cond-btn" onclick="removeCondition(${idx})" title="Remove condition">
          <i class="ti ti-x"></i>
        </button>`;
      list.appendChild(item);
    });
  }

  /* builder selects */
  const colSel = document.getElementById('condColumn');
  if (colSel && columns.length) {
    const prev = colSel.value;
    colSel.innerHTML = columns.map(c => `<option value="${c}">${c}</option>`).join('');
    if (prev && columns.includes(prev)) colSel.value = prev;
  }
}

function addCondition() {
  const col  = document.getElementById('condColumn')?.value?.trim();
  const op   = document.getElementById('condOperator')?.value;
  const val  = document.getElementById('condValue')?.value?.trim();

  if (!col || !op || val === '') { showToast('Remplissez tous les champs de condition.', 'error'); return; }

  const conds = DB.getConditions();
  conds.push({ column: col, operator: op, value: val });
  DB.saveConditions(conds);
  document.getElementById('condValue').value = '';
  renderAll();
  showToast(`Condition ajoutée : ${col} ${op} ${val}`);
}

/* ════════════════════════════════════════
   DISPLAY COLUMNS
════════════════════════════════════════ */
function renderDisplayCols() {
  const panel = document.getElementById('displayColsPanel');
  if (!panel) return;

  const columns     = DB.getColumns().filter(c => c && !c.startsWith('__')).slice(1); // skip name col
  const displayCols = DB.getDisplayCols(); // null = all selected

  if (!columns.length) {
    panel.innerHTML = '<p class="cond-empty">Aucune colonne disponible — importez d\'abord un fichier.</p>';
    return;
  }

  panel.innerHTML = columns.map(col => {
    const checked = displayCols === null || displayCols.includes(col);
    return `
      <label class="col-toggle">
        <input type="checkbox" value="${escHtml(col)}" ${checked ? 'checked' : ''}
          onchange="toggleDisplayCol('${escHtml(col)}', this.checked)" />
        <span class="col-toggle-label">${escHtml(col)}</span>
      </label>`;
  }).join('');
}

function toggleDisplayCol(col, checked) {
  const columns     = DB.getColumns().filter(c => c && !c.startsWith('__')).slice(1);
  const displayCols = DB.getDisplayCols() ?? columns; // null means all were selected

  let updated;
  if (checked) {
    updated = displayCols.includes(col) ? displayCols : [...displayCols, col];
  } else {
    updated = displayCols.filter(c => c !== col);
  }

  // If all are selected, store null (= show all)
  DB.saveDisplayCols(updated.length === columns.length ? null : updated);
}

function selectAllDisplayCols() {
  DB.clearDisplayCols();
  renderDisplayCols();
}

function deselectAllDisplayCols() {
  DB.saveDisplayCols([]);
  renderDisplayCols();
}

function removeCondition(idx) {
  const conds = DB.getConditions();
  conds.splice(idx, 1);
  DB.saveConditions(conds);
  renderAll();
}

function clearAllConditions() {
  if (!confirm('Supprimer toutes les conditions ?')) return;
  DB.clearConditions();
  renderAll();
}

/* ════════════════════════════════════════
   CLEAR PARTICIPANTS
════════════════════════════════════════ */
function clearParticipants() {
  if (!confirm('Supprimer tous les participants ? Cette action est irréversible.')) return;
  DB.clearRows();
  DB.saveColumns([]);
  currentWinner = null;
  if (winnerCard) winnerCard.classList.remove('visible');
  renderAll();
}

/* ════════════════════════════════════════
   DRAW
════════════════════════════════════════ */
async function drawWinner() {
  const pool = DB.getEligibleRows();
  if (rolling || !pool.length) return;

  rolling = true;
  if (drawBtn) drawBtn.disabled = true;
  winnerCard.classList.remove('visible');

  winnerContent.innerHTML = '<p class="rolling-text" id="roller">· · ·</p>';
  winnerCard.classList.add('visible');

  const roller    = document.getElementById('roller');
  const startTime = Date.now();

  await new Promise(resolve => {
    function tick() {
      const elapsed = Date.now() - startTime;
      if (elapsed < 1800) {
        roller.textContent = pool[Math.floor(Math.random() * pool.length)].__name;
        setTimeout(tick, 70 + Math.floor(elapsed / 18));
      } else resolve();
    }
    tick();
  });

  currentWinner = pool[Math.floor(Math.random() * pool.length)];

  /* build winner detail lines from row data — respect display column selection */
  const allCols     = DB.getColumns().filter(c => c && !c.startsWith('__')).slice(1);
  const displayCols = DB.getDisplayCols();   // null = show all
  const cols        = displayCols ? allCols.filter(c => displayCols.includes(c)) : allCols;
  const details = cols.map(c => {
    const v = currentWinner[c];
    return v !== undefined && v !== '' ? `<span class="winner-detail"><em>${c}:</em> ${v}</span>` : '';
  }).filter(Boolean).join('');

  winnerContent.innerHTML = `
    <p class="winner-name-display">${escHtml(currentWinner.__name)}</p>
    ${details ? `<div class="winner-details">${details}</div>` : ''}`;

  DB.addWinner(currentWinner);
  launchConfetti();

  document.querySelectorAll('.name-tag').forEach(tag => {
    tag.classList.toggle('highlight', tag.textContent === currentWinner.__name);
  });

  rolling = false;
  if (drawBtn) drawBtn.disabled = pool.length === 0;
}

function removeAndRedraw() {
  if (!currentWinner) return;
  const rows = DB.getRows().filter(r => r.__name !== currentWinner.__name);
  DB.saveRows(rows);
  currentWinner = null;
  winnerCard.classList.remove('visible');
  renderAll();
  if (DB.getEligibleRows().length > 0) drawWinner();
}

/* ════════════════════════════════════════
   CONFETTI
════════════════════════════════════════ */
function launchConfetti() {
  if (!confettiEl) return;
  confettiEl.innerHTML = '';
  const colors = ['#B8892A', '#D4A94A', '#C9A55A', '#2C2C2C', '#F5F0E8', '#8B6520'];
  for (let i = 0; i < 48; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-delay:${(Math.random()*.6).toFixed(2)}s;
      animation-duration:${(1.2+Math.random()*.8).toFixed(2)}s;
      transform:rotate(${Math.floor(Math.random()*360)}deg);
      border-radius:${Math.random()>.5?'50%':'2px'};
      width:${6+Math.floor(Math.random()*6)}px;
      height:${6+Math.floor(Math.random()*6)}px;`;
    confettiEl.appendChild(p);
  }
  setTimeout(() => { confettiEl.innerHTML = ''; }, 2800);
}

/* ════════════════════════════════════════
   TOAST
════════════════════════════════════════ */
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
    border-left:3px solid ${type==='error'?'var(--danger)':'var(--gold)'};
    box-shadow:0 8px 32px rgba(44,44,44,.2);z-index:9999;
    animation:toastIn .3s ease;`;
  const s = document.createElement('style');
  s.textContent = `@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`;
  document.head.appendChild(s);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3400);
}

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
