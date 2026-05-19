const DB = (() => {
  const KEYS = {
    winners: 'abrar_tombola_winners',
    drawnIds: 'abrar_tombola_drawn',
  };

  function _get(key) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
    catch { return null; }
  }
  function _set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }

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

  return {
    getWinners, addWinners, deleteEntry, clearWinners,
    getDrawnIds, addDrawnIds, clearDrawnIds,
  };
})();
