let tombolasConfig = [];
let currentTombola = null;
let currentData = null;
let drawQueue = [];
let drawQueueIndex = 0;
let rolling = false;

const confettiEl = document.getElementById('confettiContainer');

document.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('data/tombolas.json');
  tombolasConfig = await res.json();
  renderTombolaSelection();
});

/* ════════════════════════════════════════
   STEP 1 — TOMBOLA SELECTION
════════════════════════════════════════ */
function renderTombolaSelection() {
  document.getElementById('stepTombola').style.display = 'block';
  document.getElementById('stepCompanies').style.display = 'none';
  document.getElementById('stepDraw').style.display = 'none';

  const grid = document.getElementById('tombolaGrid');
  grid.innerHTML = tombolasConfig.map(t => `
    <div class="tombola-card" onclick="selectTombola('${t.id}')">
      <div class="tombola-card-icon"><i class="ti ti-ticket"></i></div>
      <h2 class="tombola-card-title">${esc(t.name)}</h2>
      <p class="tombola-card-sub">Cliquez pour configurer</p>
    </div>
  `).join('');
}

async function selectTombola(id) {
  currentTombola = tombolasConfig.find(t => t.id === id);
  if (!currentTombola) return;

  const res = await fetch(currentTombola.file);
  currentData = await res.json();

  renderCompanySetup();
}

function backToTombolas() {
  currentTombola = null;
  currentData = null;
  renderTombolaSelection();
}

/* ════════════════════════════════════════
   STEP 2 — COMPANY SETUP
════════════════════════════════════════ */
function renderCompanySetup() {
  document.getElementById('stepTombola').style.display = 'none';
  document.getElementById('stepCompanies').style.display = 'block';
  document.getElementById('stepDraw').style.display = 'none';

  document.getElementById('tombolaTitle').innerHTML = `${esc(currentTombola.name)}`;

  const container = document.getElementById('companyCards');
  const companies = Object.keys(currentData);

  container.innerHTML = companies.map(company => {
    const candidates = currentData[company];
    const drawnIds = DB.getDrawnIds(currentTombola.id, company);
    const remaining = candidates.filter(c => !drawnIds.includes(c.matricule));
    const alreadyDrawn = drawnIds.length;

    return `
    <div class="card company-setup-card">
      <div class="company-header">
        <div>
          <p class="card-title" style="margin-bottom:0.3rem">${esc(company)}</p>
          <span class="count-badge">${remaining.length} candidats disponibles</span>
          ${alreadyDrawn > 0 ? `<span class="count-badge drawn-badge">${alreadyDrawn} déjà tirés</span>` : ''}
        </div>
        <div class="winner-input-group">
          <label>Gagnants :</label>
          <input type="number" class="winner-count-input" id="winCount_${esc(company)}"
            min="0" max="${remaining.length}" value="0" />
        </div>
      </div>
      <div class="candidate-preview">
        ${remaining.slice(0, 5).map(c =>
          `<span class="name-tag">${esc(c.nom)} ${esc(c.prenom)}</span>`
        ).join('')}
        ${remaining.length > 5 ? `<span class="name-tag more-tag">+${remaining.length - 5} autres</span>` : ''}
      </div>
    </div>`;
  }).join('');
}

/* ════════════════════════════════════════
   STEP 3 — DRAW
════════════════════════════════════════ */
function launchDraw() {
  const companies = Object.keys(currentData);
  drawQueue = [];

  for (const company of companies) {
    const input = document.getElementById(`winCount_${company}`);
    const count = input ? parseInt(input.value) || 0 : 0;
    if (count <= 0) continue;

    const drawnIds = DB.getDrawnIds(currentTombola.id, company);
    const pool = currentData[company].filter(c => !drawnIds.includes(c.matricule));

    if (count > pool.length) {
      showToast(`${company}: pas assez de candidats (${pool.length} disponibles, ${count} demandés).`, 'error');
      return;
    }

    drawQueue.push({ company, count, pool });
  }

  if (!drawQueue.length) {
    showToast('Veuillez saisir au moins 1 gagnant pour une société.', 'error');
    return;
  }

  drawQueueIndex = 0;
  document.getElementById('stepCompanies').style.display = 'none';
  document.getElementById('stepDraw').style.display = 'block';

  drawCurrentCompany();
}

async function drawCurrentCompany() {
  const item = drawQueue[drawQueueIndex];
  const { company, count, pool } = item;

  document.getElementById('drawTitle').innerHTML = `<em>${esc(company)}</em>`;
  document.getElementById('drawSubtitle').textContent =
    `Tirage de ${count} gagnant${count > 1 ? 's' : ''} sur ${pool.length} candidats`;
  document.getElementById('drawEyebrow').textContent = `${esc(currentTombola.name)} — ${esc(company)}`;
  document.getElementById('nextCompanyBtn').style.display = 'none';
  document.getElementById('finishBtn').style.display = 'none';

  const winnersList = document.getElementById('drawWinnersList');
  winnersList.innerHTML = '';

  const winners = [];
  const poolCopy = [...pool];

  for (let i = 0; i < count; i++) {
    const winner = await animateSingleDraw(poolCopy, i + 1, count);
    winners.push(winner);
    poolCopy.splice(poolCopy.indexOf(winner), 1);

    const winnerEl = document.createElement('div');
    winnerEl.className = 'drawn-winner-item';
    winnerEl.innerHTML = `
      <span class="drawn-rank">#${i + 1}</span>
      <span class="drawn-name">${esc(winner.nom)} ${esc(winner.prenom)}</span>
      <span class="drawn-info">${esc(winner.fonction)} — ${esc(winner.matricule)}</span>
    `;
    winnersList.appendChild(winnerEl);
  }

  DB.addWinners(currentTombola.id, currentTombola.name, company, winners);
  DB.addDrawnIds(currentTombola.id, company, winners.map(w => w.matricule));

  launchConfetti();

  const isLast = drawQueueIndex >= drawQueue.length - 1;
  if (isLast) {
    document.getElementById('finishBtn').style.display = 'flex';
  } else {
    document.getElementById('nextCompanyBtn').style.display = 'flex';
  }
}

function drawNextCompany() {
  drawQueueIndex++;
  drawCurrentCompany();
}

function finishTombola() {
  showToast(`Tirage terminé pour ${currentTombola.name} !`);
  backToTombolas();
}

async function animateSingleDraw(pool, winnerNum, totalWinners) {
  const drawContent = document.getElementById('drawContent');
  const drawCard = document.getElementById('drawCard');

  drawCard.classList.remove('visible');
  void drawCard.offsetWidth;
  drawCard.classList.add('visible');

  document.getElementById('drawEyebrow').textContent =
    `Gagnant ${winnerNum} / ${totalWinners}`;

  drawContent.innerHTML = '<p class="rolling-text" id="roller">· · ·</p>';
  const roller = document.getElementById('roller');

  const startTime = Date.now();
  await new Promise(resolve => {
    function tick() {
      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) {
        const r = pool[Math.floor(Math.random() * pool.length)];
        roller.textContent = `${r.nom} ${r.prenom}`;
        setTimeout(tick, 70 + Math.floor(elapsed / 15));
      } else resolve();
    }
    tick();
  });

  const winner = pool[Math.floor(Math.random() * pool.length)];

  drawContent.innerHTML = `
    <p class="winner-name-display">${esc(winner.nom)} ${esc(winner.prenom)}</p>
    <div class="winner-details">
      <span class="winner-detail"><em>Matricule:</em> ${esc(winner.matricule)}</span>
      <span class="winner-detail"><em>Fonction:</em> ${esc(winner.fonction)}</span>
    </div>`;

  launchConfetti();
  await new Promise(r => setTimeout(r, 1200));

  return winner;
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

function esc(str) {
  return String(str || '').replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
