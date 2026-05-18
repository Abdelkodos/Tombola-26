/**
 * db.js — Abrar Raffle · Database Layer
 * Handles persistent storage for participants (full row data),
 * winner history, and eligibility conditions.
 */

const DB = (() => {
  const KEYS = {
    rows:        'abrar_raffle_rows',
    columns:     'abrar_raffle_columns',
    conditions:  'abrar_raffle_conditions',
    winners:     'abrar_raffle_winners',
    displayCols: 'abrar_raffle_display_cols',
  };

  function _get(key) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
    catch (e) { console.error('[DB] Read error:', e); return null; }
  }
  function _set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { console.error('[DB] Write error:', e); return false; }
  }

  /* ── Rows (full participant data) ── */
  function getRows()      { return _get(KEYS.rows)    || []; }
  function saveRows(rows) { return _set(KEYS.rows, rows); }
  function clearRows()    { return _set(KEYS.rows, []); }

  /* ── Columns ── */
  function getColumns()      { return _get(KEYS.columns) || []; }
  function saveColumns(cols) { return _set(KEYS.columns, cols); }

  /* ── Conditions ── */
  function getConditions()      { return _get(KEYS.conditions) || []; }
  function saveConditions(list) { return _set(KEYS.conditions, list); }
  function clearConditions()    { return _set(KEYS.conditions, []); }

  /**
   * Apply ALL conditions (AND logic) to a row.
   * Returns true if the row passes all conditions.
   */
  function rowPasses(row, conditions) {
    if (!conditions || !conditions.length) return true;
    return conditions.every(cond => {
      const raw     = row[cond.column];
      if (raw === undefined || raw === null || raw === '') return false;
      const cellNum = parseFloat(String(raw).replace(/[^0-9.\-]/g, ''));
      const condNum = parseFloat(cond.value);
      switch (cond.operator) {
        case '>=':       return cellNum >= condNum;
        case '<=':       return cellNum <= condNum;
        case '>':        return cellNum >  condNum;
        case '<':        return cellNum <  condNum;
        case '=':        return String(raw).toLowerCase() === String(cond.value).toLowerCase();
        case '!=':       return String(raw).toLowerCase() !== String(cond.value).toLowerCase();
        case 'contains': return String(raw).toLowerCase().includes(String(cond.value).toLowerCase());
        default:         return true;
      }
    });
  }

  function getEligibleRows() {
    return getRows().filter(r => rowPasses(r, getConditions()));
  }

  /* ── Winners ── */
  function getWinners() { return _get(KEYS.winners) || []; }

  function addWinner(row) {
    const list = getWinners();
    const now  = new Date();
    list.push({
      id:   Date.now(),
      name: row.__name,
      row,
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    });
    return _set(KEYS.winners, list);
  }

  function deleteWinner(id) { return _set(KEYS.winners, getWinners().filter(w => w.id !== id)); }
  function clearWinners()   { return _set(KEYS.winners, []); }

  /* ── Display Columns ── */
  // Returns null when never set (meaning "show all"), or an array of column names
  function getDisplayCols()      { return _get(KEYS.displayCols); }
  function saveDisplayCols(cols) { return _set(KEYS.displayCols, cols); }
  function clearDisplayCols()    { return _set(KEYS.displayCols, null); }

  return {
    getRows, saveRows, clearRows,
    getColumns, saveColumns,
    getConditions, saveConditions, clearConditions,
    rowPasses, getEligibleRows,
    getWinners, addWinner, deleteWinner, clearWinners,
    getDisplayCols, saveDisplayCols, clearDisplayCols,
  };
})();
