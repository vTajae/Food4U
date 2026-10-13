// Same storage/attribute contract as the legacy shell; runs before body paint.
(() => {
  let theme = 'system';
  try { const value = localStorage.getItem('food4u-theme'); if (value === 'dark' || value === 'light') theme = value; } catch { /* Storage may be unavailable. */ }
  function applyTheme(value, persist) {
    theme = value;
    if (value === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = value;
    if (persist) try { if (value === 'system') localStorage.removeItem('food4u-theme'); else localStorage.setItem('food4u-theme', value); } catch { /* Choice still applies for this page. */ }
    document.querySelectorAll('[data-theme-choice]').forEach(button => button.setAttribute('aria-checked', String(button.dataset.themeChoice === theme)));
  }
  applyTheme(theme, false);
  function initialize() {
    applyTheme(theme, false);
    const trigger = document.getElementById('account-trigger');
    const menu = document.getElementById('account-menu');
    if (trigger && menu) {
      const items = [...menu.querySelectorAll('[role="menuitemradio"], [role="menuitem"]')];
      function close(restore = true) { menu.hidden = true; trigger.setAttribute('aria-expanded', 'false'); if (restore) trigger.focus(); }
      function open(last = false) { menu.hidden = false; trigger.setAttribute('aria-expanded', 'true'); items[last ? items.length - 1 : 0].focus(); }
      trigger.addEventListener('click', () => menu.hidden ? open() : close());
      trigger.addEventListener('keydown', event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(event.key === 'ArrowUp'); } });
      menu.addEventListener('keydown', event => {
        const current = items.indexOf(document.activeElement);
        let index;
        if (event.key === 'Escape') { event.preventDefault(); close(); return; }
        if (event.key === 'Tab') { close(); return; }
        if (event.key === 'ArrowDown') index = (current + 1) % items.length;
        if (event.key === 'ArrowUp') index = (current - 1 + items.length) % items.length;
        if (event.key === 'Home') index = 0;
        if (event.key === 'End') index = items.length - 1;
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && event.key !== ' ') {
          const ordered = [...items.slice(current + 1), ...items.slice(0, current + 1)];
          const found = ordered.find(item => item.textContent.trim().toLowerCase().startsWith(event.key.toLowerCase()));
          if (found) index = items.indexOf(found);
        }
        if (index !== undefined) { event.preventDefault(); items[index].focus(); }
      });
      menu.querySelectorAll('[data-theme-choice]').forEach(button => button.addEventListener('click', () => { applyTheme(button.dataset.themeChoice, true); close(); }));
      document.addEventListener('pointerdown', event => { if (!menu.hidden && !menu.contains(event.target) && !trigger.contains(event.target)) close(false); });
      document.addEventListener('focusin', event => { if (!menu.hidden && !menu.contains(event.target) && event.target !== trigger) close(false); });
    }
    const form = document.getElementById('ask-form');
    if (!form) return;
    const input = document.getElementById('ask');
    const submit = document.getElementById('ask-submit');
    const error = document.getElementById('ask-error');
    const region = document.getElementById('ask-results');
    const toast = document.getElementById('suggestion-error');
    const idle = region.firstElementChild.cloneNode(true);
    const suggestions = [...document.querySelectorAll('[data-suggestion]')];
    let results = [];
    let busy = false;
    let toastTimer;
    const element = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = String(text); return node; };
    function clearValidation() { error.hidden = true; input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
    function validation(message) {
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      for (const [key, value] of Object.entries({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' })) icon.setAttribute(key, value);
      const circle = document.createElementNS(icon.namespaceURI, 'circle'); circle.setAttribute('cx', '12'); circle.setAttribute('cy', '12'); circle.setAttribute('r', '10');
      const path = document.createElementNS(icon.namespaceURI, 'path'); path.setAttribute('d', 'M12 8v4m0 4h.01'); icon.append(circle, path);
      error.replaceChildren(icon, element('span', '', message)); error.hidden = false;
      input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', 'ask-error'); input.focus();
    }
    function notify(message) { clearTimeout(toastTimer); toast.textContent = `${message} Check your connection and try again.`; toast.hidden = false; toastTimer = setTimeout(() => { toast.hidden = true; }, 5000); }
    toast.addEventListener('pointerenter', () => clearTimeout(toastTimer));
    toast.addEventListener('pointerleave', () => { toastTimer = setTimeout(() => { toast.hidden = true; }, 5000); });
    function loading() {
      const wrap = element('div', 'loading-results'); wrap.setAttribute('aria-busy', 'true');
      const status = element('p', '', 'Finding meals that fit your plan…'); status.setAttribute('role', 'status'); wrap.append(status);
      const grid = element('ul', 'result-grid');
      for (let i = 0; i < 3; i++) { const card = element('li', 'skeleton-card'); card.setAttribute('aria-hidden', 'true'); card.append(element('div', 'skeleton skeleton-title'), element('div', 'skeleton'), element('div', 'skeleton skeleton-short')); const actions = element('div', 'skeleton-actions'); actions.append(element('div', 'skeleton'), element('div', 'skeleton')); card.append(actions); grid.append(card); }
      wrap.append(grid); region.replaceChildren(wrap);
    }
    function ingredients(text) { const parts = []; let value = ''; let depth = 0; for (const char of text) { if (char === '(') depth++; if (char === ')' && depth > 0) depth--; if ((char === ',' || char === ';') && depth === 0) { if (value.trim()) parts.push(value.trim()); value = ''; } else value += char; } if (value.trim()) parts.push(value.trim()); return parts; }
    function verdictBadge(verdict) {
      const labels = { fits: 'Fits your plan', care: 'Eat with care', avoid: 'Avoid for now' };
      if (!Object.hasOwn(labels, verdict)) return null;
      const badge = element('span', `verdict-badge verdict-${verdict}`);
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      for (const [key, value] of Object.entries({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'aria-hidden': 'true' })) svg.setAttribute(key, value);
      const circle = document.createElementNS(svg.namespaceURI, 'circle'); circle.setAttribute('cx', '12'); circle.setAttribute('cy', '12'); circle.setAttribute('r', '10');
      const path = document.createElementNS(svg.namespaceURI, 'path'); path.setAttribute('d', verdict === 'fits' ? 'm9 12 2 2 4-4' : verdict === 'avoid' ? 'm9 9 6 6m0-6-6 6' : 'M12 8v4m0 4h.01'); svg.append(circle, path);
      badge.append(svg, document.createTextNode(labels[verdict])); return badge;
    }
    function checkStrip(items) {
      if (!Array.isArray(items) || !items.length) return null;
      const strip = element('div', 'check-strip'); strip.append(element('span', 'result-count', 'Checked against'), element('span', '', items.join(' · '))); return strip;
    }
    function card(item, index, { verdict, reason, checkedAgainst = [] } = {}) {
      const node = element('article', 'recommendation-card');
      const header = element('div', 'card-header'); const badge = verdictBadge(verdict); if (badge) header.append(badge); header.append(element('h3', 'card-title', item.description || `Item ${index + 1}`)); if (reason) header.append(element('p', 'card-muted', reason)); node.append(header);
      // Match AskScreen's current SearchResultFood contract: no inferred safety
      // verdict/reason/checkedAgainst, including unknown fields from upstream.
      if (item.brandOwner || item.scientificName || item.additionalDescriptions) {
        const content = element('div', 'card-content');
        for (const [key, label] of [['brandOwner', 'Brand:'], ['scientificName', 'Scientific name:']]) if (item[key]) { const p = element('p'); p.append(element('strong', '', label), document.createTextNode(` ${item[key]}`)); content.append(p); }
        if (item.additionalDescriptions) content.append(element('p', 'card-muted', item.additionalDescriptions)); node.append(content);
      }
      const parts = typeof item.ingredients === 'string' ? ingredients(item.ingredients) : [];
      const nutrients = Array.isArray(item.foodNutrients) ? item.foodNutrients : [];
      const actions = element('div', 'card-actions');
      function disclosure(label, body) {
        const id = `result-${index}-${label.toLowerCase()}`;
        const button = element('button', 'secondary-button', label); button.type = 'button'; button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', id);
        const panel = element('div', 'card-content'); panel.id = id; panel.hidden = true; panel.append(element('h4', '', label), body);
        button.addEventListener('click', () => { panel.hidden = !panel.hidden; button.setAttribute('aria-expanded', String(!panel.hidden)); button.textContent = panel.hidden ? label : `Hide ${label.toLowerCase()}`; });
        actions.append(button); node.append(panel);
      }
      if (parts.length || nutrients.length) node.append(actions);
      if (parts.length) { const list = element('ul', 'ingredients'); parts.forEach(part => { const li = element('li'); li.append(element('span', 'ingredient-chip', part)); list.append(li); }); disclosure('Ingredients', list); }
      if (nutrients.length) {
        const wrap = element('div', 'nutrients'); const table = element('table'); const head = element('thead'); const row = element('tr'); for (const label of ['Nutrient', 'Amount']) { const cell = element('th', '', label); cell.scope = 'col'; row.append(cell); } head.append(row); table.append(head);
        const body = element('tbody'); for (const nutrient of nutrients) { if (!nutrient || typeof nutrient !== 'object') continue; const row = element('tr'); row.append(element('td', '', nutrient.nutrientName ?? ''), element('td', '', `${nutrient.value ?? ''} ${String(nutrient.unitName ?? '').toLowerCase()}`)); body.append(row); } table.append(body); wrap.append(table); disclosure('Nutrients', wrap);
      }
      const strip = checkStrip(checkedAgainst); if (strip) node.append(strip); return node;
    }
    function render(done) {
      if (!done && !results.length) { region.replaceChildren(idle.cloneNode(true)); return; }
      if (!results.length) { const empty = element('div', 'no-matches'); empty.append(element('p', 'state-heading', 'No matches for that'), element('p', '', 'Try different words, or one of the suggestions above.')); region.replaceChildren(empty); return; }
      const count = element('h2', 'result-count', `${results.length} ${results.length === 1 ? 'suggestion' : 'suggestions'}`); const grid = element('ul', 'result-grid'); results.forEach((item, index) => { const li = element('li'); li.append(card(item, index)); grid.append(li); }); region.replaceChildren(count, grid);
    }
    async function run(action, queryKey, query) {
      if (busy) return;
      busy = true; submit.disabled = true; submit.setAttribute('aria-busy', 'true'); suggestions.forEach(button => { button.disabled = true; }); toast.hidden = true; loading();
      try {
        const data = new FormData(); data.set('action', action); data.set('queryKey', queryKey); data.set('query', query);
        const response = await fetch('/api/suggestion', { method: 'POST', body: data }); const body = await response.json();
        if (!response.ok) { notify(typeof body?.error === 'string' ? body.error : "Couldn't get suggestions."); render(false); return; }
        results = Array.isArray(body?.meal) ? body.meal.filter(item => item && typeof item === 'object') : []; render(true);
      } catch { notify("Couldn't reach the food database."); render(false); }
      finally { busy = false; submit.disabled = false; submit.setAttribute('aria-busy', 'false'); suggestions.forEach(button => { button.disabled = false; }); }
    }
    function ask() { if (busy) return; const query = input.value.trim(); if (!query) { validation('Type a question to get suggestions.'); return; } if (query.length > 100) { validation('Keep it under 100 characters.'); return; } clearValidation(); void run('meal', 'general', query); }
    form.addEventListener('submit', event => { event.preventDefault(); ask(); });
    input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); ask(); } });
    input.addEventListener('input', () => { clearValidation(); input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 160)}px`; });
    const prompts = { suggest: ['randomMeal', "I'm hungry"], recipie: ['newRecipie', "Let's cook something"], diet: ['dietSuggest', 'What diets support my eating habits?'] };
    suggestions.forEach(button => button.addEventListener('click', () => { const action = button.dataset.suggestion; const [key, text] = prompts[action]; void run(action, key, text); }));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true }); else initialize();
})();
