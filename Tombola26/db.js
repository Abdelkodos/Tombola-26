const DB = (() => {
  const KEYS = {
    winners: 'abrar_tombola_winners',
    drawnIds: 'abrar_tombola_drawn',
    tombolas: 'abrar_tombola_config',
    dataPrefix: 'abrar_tombola_data_',
    seeded: 'abrar_tombola_seeded',
  };

  function _get(key) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
    catch { return null; }
  }
  function _set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }

  // ── Winners ──
  function getWinners() { return _get(KEYS.winners) || []; }

  function addWinners(tombolaId, tombolaName, companyName, winners) {
    const list = getWinners();
    const now = new Date();
    list.push({
      id: Date.now(),
      tombolaId,
      tombolaName,
      company: companyName,
      winners,
      date: now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    });
    return _set(KEYS.winners, list);
  }

  function deleteEntry(id) { return _set(KEYS.winners, getWinners().filter(w => w.id !== id)); }
  function clearWinners() { return _set(KEYS.winners, []); }

  // ── Drawn IDs ──
  function getDrawnIds(tombolaId, company) {
    const all = _get(KEYS.drawnIds) || {};
    const key = `${tombolaId}::${company}`;
    return all[key] || [];
  }

  function addDrawnIds(tombolaId, company, matricules) {
    const all = _get(KEYS.drawnIds) || {};
    const key = `${tombolaId}::${company}`;
    all[key] = [...(all[key] || []), ...matricules];
    return _set(KEYS.drawnIds, all);
  }

  function clearDrawnIds() { return _set(KEYS.drawnIds, {}); }

  // ── Tombola Config CRUD ──
  function getTombolas() { return _get(KEYS.tombolas) || []; }
  function setTombolas(list) { return _set(KEYS.tombolas, list); }

  function addTombola(name) {
    const list = getTombolas();
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') + '_' + Date.now();
    list.push({ id, name });
    setTombolas(list);
    _set(KEYS.dataPrefix + id, {});
    return id;
  }

  function updateTombola(id, newName) {
    const list = getTombolas();
    const t = list.find(x => x.id === id);
    if (t) { t.name = newName; setTombolas(list); }
  }

  function deleteTombola(id) {
    setTombolas(getTombolas().filter(x => x.id !== id));
    try { localStorage.removeItem(KEYS.dataPrefix + id); } catch {}
  }

  // ── Company/Employee Data CRUD ──
  function getTombolaData(tombolaId) { return _get(KEYS.dataPrefix + tombolaId) || {}; }
  function setTombolaData(tombolaId, data) { return _set(KEYS.dataPrefix + tombolaId, data); }

  function addCompany(tombolaId, companyName) {
    const data = getTombolaData(tombolaId);
    if (!data[companyName]) { data[companyName] = []; setTombolaData(tombolaId, data); }
  }

  function renameCompany(tombolaId, oldName, newName) {
    const data = getTombolaData(tombolaId);
    if (data[oldName] && !data[newName]) {
      data[newName] = data[oldName];
      delete data[oldName];
      setTombolaData(tombolaId, data);
    }
  }

  function deleteCompany(tombolaId, companyName) {
    const data = getTombolaData(tombolaId);
    delete data[companyName];
    setTombolaData(tombolaId, data);
  }

  function getEmployees(tombolaId, companyName) {
    return (getTombolaData(tombolaId)[companyName]) || [];
  }

  function addEmployee(tombolaId, companyName, employee) {
    const data = getTombolaData(tombolaId);
    if (!data[companyName]) data[companyName] = [];
    data[companyName].push(employee);
    setTombolaData(tombolaId, data);
  }

  function updateEmployee(tombolaId, companyName, index, employee) {
    const data = getTombolaData(tombolaId);
    if (data[companyName] && data[companyName][index]) {
      data[companyName][index] = employee;
      setTombolaData(tombolaId, data);
    }
  }

  function deleteEmployee(tombolaId, companyName, index) {
    const data = getTombolaData(tombolaId);
    if (data[companyName]) {
      data[companyName].splice(index, 1);
      setTombolaData(tombolaId, data);
    }
  }

  // ── Seed from JSON (first load) ──
  function isSeeded() { return !!_get(KEYS.seeded); }
  function markSeeded() { return _set(KEYS.seeded, true); }

  async function seedFromJSON() {
    if (isSeeded()) return;
    try {
      const res = await fetch('data/tombolas.json');
      const config = await res.json();
      const tombolas = config.map(t => ({ id: t.id, name: t.name }));
      setTombolas(tombolas);
      for (const t of config) {
        const dataRes = await fetch(t.file);
        const data = await dataRes.json();
        setTombolaData(t.id, data);
      }
      markSeeded();
    } catch (e) {
      console.error('Seed failed:', e);
    }
  }

  return {
    getWinners, addWinners, deleteEntry, clearWinners,
    getDrawnIds, addDrawnIds, clearDrawnIds,
    getTombolas, setTombolas, addTombola, updateTombola, deleteTombola,
    getTombolaData, setTombolaData,
    addCompany, renameCompany, deleteCompany,
    getEmployees, addEmployee, updateEmployee, deleteEmployee,
    seedFromJSON, isSeeded,
  };
})();
