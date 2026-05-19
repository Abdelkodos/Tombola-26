const fs = require('fs');
const path = require('path');

function splitCombinedName(fullName) {
  const s = (fullName || '').trim();
  if (!s) return { nom: '', prenom: '' };
  // Try double-space split first
  if (s.includes('  ')) {
    const idx = s.indexOf('  ');
    return { nom: s.slice(0, idx).trim(), prenom: s.slice(idx).trim() };
  }
  // Fallback: last word = prenom, rest = nom
  const parts = s.split(/\s+/);
  if (parts.length === 1) return { nom: parts[0], prenom: '' };
  return { nom: parts.slice(0, -1).join(' '), prenom: parts[parts.length - 1] };
}

function clean(v) { return (v === undefined || v === null) ? '' : String(v).trim(); }

const HEADER_VALUES = new Set(['MATRICULE', 'NOM', 'PRENOM', 'FONCTION', 'NOM PRENOM', 'OBSERVATION', 'DATE']);
function isHeaderRow(obj) {
  const vals = Object.values(obj).map(v => String(v).trim().toUpperCase());
  return vals.filter(v => HEADER_VALUES.has(v)).length >= 2;
}

// ── SESSEN.json ──
const sessen = JSON.parse(fs.readFileSync('SESSEN.json', 'utf8'));
const sessenOut = {};
for (const [company, entries] of Object.entries(sessen)) {
  const companyName = company.trim();
  sessenOut[companyName] = [];
  for (const entry of entries) {
    if (isHeaderRow(entry)) continue;
    let matricule, nom, prenom, fonction;
    if (entry['NOM PRENOM'] !== undefined) {
      matricule = clean(entry['MATRICULE'] || entry['Matricule']);
      const split = splitCombinedName(entry['NOM PRENOM']);
      nom = split.nom;
      prenom = split.prenom;
      fonction = clean(entry['FONCTION'] || entry['Fonction'] || entry['fonction']);
    } else if (entry['nomPrenom'] !== undefined) {
      // retraite section in SESSEN
      matricule = clean(entry['RETRAITE'] || entry['Matricule'] || entry['MATRICULE']);
      const split = splitCombinedName(entry['nomPrenom']);
      nom = split.nom;
      prenom = split.prenom;
      fonction = clean(entry['Fonction'] || entry['FONCTION'] || entry['fonction']);
    } else {
      matricule = clean(entry['MATRICULE'] || entry['Matricule']);
      nom = clean(entry['NOM'] || entry['Nom']);
      prenom = clean(entry['PRENOM'] || entry['prenom']);
      fonction = clean(entry['FONCTION'] || entry['Fonction'] || entry['fonction']);
    }
    if (!nom && !prenom) continue;
    sessenOut[companyName].push({ matricule, nom, prenom, fonction });
  }
}
fs.writeFileSync('Tombola26/data/sessen.json', JSON.stringify(sessenOut, null, 2), 'utf8');

// ── moutons.json ──
const moutons = JSON.parse(fs.readFileSync('moutons.json', 'utf8'));
const moutonsOut = {};
for (const [company, entries] of Object.entries(moutons)) {
  const companyName = company.trim();
  moutonsOut[companyName] = [];
  for (const entry of entries) {
    if (isHeaderRow(entry)) continue;
    let matricule, nom, prenom, fonction;
    if (entry['NOM PRENOM'] !== undefined) {
      matricule = clean(entry['MATRICULE'] || entry['Matricule']);
      const split = splitCombinedName(entry['NOM PRENOM']);
      nom = split.nom;
      prenom = split.prenom;
      fonction = clean(entry['FONCTION'] || entry['Fonction'] || entry['fonction']);
    } else if (entry['Nom'] !== undefined && entry['prenom'] !== undefined) {
      matricule = clean(entry['Matricule'] || entry['MATRICULE']);
      nom = clean(entry['Nom'] || entry['NOM']);
      prenom = clean(entry['prenom'] || entry['PRENOM']);
      fonction = clean(entry['fonction'] || entry['FONCTION'] || entry['Fonction']);
    } else if (entry['NOM'] !== undefined) {
      matricule = clean(entry['MATRICULE'] || entry['Matricule']);
      nom = clean(entry['NOM']);
      prenom = clean(entry['PRENOM'] || entry['prenom']);
      fonction = clean(entry['FONCTION'] || entry['Fonction'] || entry['fonction']);
    } else {
      matricule = clean(entry['Matricule'] || entry['MATRICULE']);
      nom = clean(entry['Nom'] || entry['NOM']);
      prenom = clean(entry['prenom'] || entry['PRENOM']);
      fonction = clean(entry['fonction'] || entry['FONCTION']);
    }
    // For Retraite section in moutons.json, nom has "FULLNAME", prenom has "FONCTION"
    // Detect: if prenom looks like a job title and fonction is empty
    if (companyName === 'Retraite' && !fonction && prenom) {
      // In this file, "Nom" = "FULLNAME", "prenom" = actual fonction
      const split = splitCombinedName(nom);
      fonction = prenom;
      nom = split.nom;
      prenom = split.prenom;
    }
    if (!nom && !prenom) continue;
    moutonsOut[companyName].push({ matricule, nom, prenom, fonction });
  }
}
fs.writeFileSync('Tombola26/data/moutons.json', JSON.stringify(moutonsOut, null, 2), 'utf8');

// ── cassociaux.json ──
const cassociaux = JSON.parse(fs.readFileSync('cassociaux.json', 'utf8'));
const cassociauxOut = {};
for (const [company, entries] of Object.entries(cassociaux)) {
  const companyName = company.trim();
  cassociauxOut[companyName] = [];
  for (const entry of entries) {
    if (isHeaderRow(entry)) continue;
    let matricule, nom, prenom, fonction;
    if (entry['NOM PRENOM'] !== undefined) {
      matricule = clean(entry['CAS SOCIAUX 2026'] || entry['MATRICULE'] || entry['Matricule']);
      // Skip header row
      if (matricule === 'MATRICULE') continue;
      const split = splitCombinedName(entry['NOM PRENOM']);
      nom = split.nom;
      prenom = split.prenom;
      fonction = clean(entry['FONCTION'] || entry['fonction']);
    } else {
      continue;
    }
    if (!nom && !prenom) continue;
    cassociauxOut[companyName].push({ matricule, nom, prenom, fonction });
  }
}
fs.writeFileSync('Tombola26/data/cassociaux.json', JSON.stringify(cassociauxOut, null, 2), 'utf8');

// ── tombolas.json (config) ──
const tombolas = [
  { id: 'sessen', name: 'Tombola SESSEN', file: 'data/sessen.json' },
  { id: 'moutons', name: 'Tombola Moutons', file: 'data/moutons.json' },
  { id: 'cassociaux', name: 'Tombola Cas Sociaux', file: 'data/cassociaux.json' }
];
fs.writeFileSync('Tombola26/data/tombolas.json', JSON.stringify(tombolas, null, 2), 'utf8');

// Summary
for (const [label, obj] of [['SESSEN', sessenOut], ['MOUTONS', moutonsOut], ['CAS SOCIAUX', cassociauxOut]]) {
  console.log(`\n=== ${label} ===`);
  for (const [company, arr] of Object.entries(obj)) {
    console.log(`  ${company}: ${arr.length} candidates`);
  }
}
