const fs = require('fs');

// Load the SUD/NORD matricule sets from sessen.json (already split by user)
const sessen = JSON.parse(fs.readFileSync('Tombola26/data/sessen.json', 'utf8'));
const sudMatricules = new Set(sessen.SESSUD.map(c => c.matricule));
const nordMatricules = new Set(sessen.SESNORD.map(c => c.matricule));

// ── Split SES in moutons.json into SESSUD / SESNORD ──
const moutons = JSON.parse(fs.readFileSync('Tombola26/data/moutons.json', 'utf8'));
if (moutons['SES']) {
  const ses = moutons['SES'];
  const sessud = [];
  const sesnord = [];
  const unmatched = [];

  ses.forEach(c => {
    if (sudMatricules.has(c.matricule)) sessud.push(c);
    else if (nordMatricules.has(c.matricule)) sesnord.push(c);
    else unmatched.push(c);
  });

  console.log(`moutons SES split: SUD=${sessud.length}, NORD=${sesnord.length}, unmatched=${unmatched.length}`);
  if (unmatched.length) {
    // Put unmatched in SUD by default
    console.log('Unmatched matricules added to SESSUD:', unmatched.map(c => c.matricule));
    sessud.push(...unmatched);
  }

  delete moutons['SES'];
  // Rebuild object with desired key order
  const newMoutons = {};
  newMoutons['SESSUD'] = sessud;
  newMoutons['SESNORD'] = sesnord;
  for (const [k, v] of Object.entries(moutons)) {
    newMoutons[k] = v;
  }

  fs.writeFileSync('Tombola26/data/moutons.json', JSON.stringify(newMoutons, null, 2), 'utf8');
  console.log('moutons.json updated: SES split into SESSUD + SESNORD');
}

// ── Rename company keys across all data files ──
const RENAMES = {
  'CADRE': 'Cadres',
  'retraite': 'Retraité(e)s',
  'Retraite': 'Retraité(e)s',
  'AUTRES STE': 'Autres Sociétés (Bitumed, Abrar Industrie, Abrar Agro, Abrar Dev Immo, Abrar SO)',
  'AUTRES SOCIETE': 'Autres Sociétés (Bitumed, Abrar Industrie, Abrar Agro, Abrar Dev Immo, Abrar SO)',
  'SES': 'SUD EMPLOI',
  'SESSUD': 'SUD EMPLOI SUD',
  'SESNORD': 'SUD EMPLOI NORD',
};

function renameKeys(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const newData = {};
  for (const [key, value] of Object.entries(data)) {
    const newKey = RENAMES[key] || key;
    newData[newKey] = value;
  }
  fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf8');
  console.log(`${filePath}: keys renamed`);
  console.log('  Keys:', Object.keys(newData).join(', '));
}

renameKeys('Tombola26/data/sessen.json');
renameKeys('Tombola26/data/moutons.json');
renameKeys('Tombola26/data/cassociaux.json');

// ── Rename tombola title ──
const tombolas = JSON.parse(fs.readFileSync('Tombola26/data/tombolas.json', 'utf8'));
tombolas.forEach(t => {
  if (t.id === 'cassociaux') t.name = 'Tombola Appartement pour Les Cas Sociaux';
});
fs.writeFileSync('Tombola26/data/tombolas.json', JSON.stringify(tombolas, null, 2), 'utf8');
console.log('tombolas.json: cassociaux renamed');
