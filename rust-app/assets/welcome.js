/* Five-question onboarding. All upstream content is inserted as text, never HTML. */
(() => {
  'use strict';
  const questions = [
    { questionId: 5, questionText: 'What cuisines do you enjoy?', queryKey: 'cuisines' },
    { questionId: 5555, questionText: 'Do you follow a particular diet?', queryKey: 'diets' },
    { questionId: 1, questionText: 'Do you have a medical condition?', queryKey: 'icd10cm' },
    { questionId: 11, questionText: 'Any allergies or foods you avoid?', queryKey: 'conditions' },
    { questionId: 555, questionText: 'What do you usually spend per meal?', queryKey: 'price' },
  ];
  function element(tag, className = '', text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function icon(path) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    for (const [name, value] of Object.entries({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' })) svg.setAttribute(name, value);
    const shape = document.createElementNS(svg.namespaceURI, 'path'); shape.setAttribute('d', path); svg.append(shape); return svg;
  }
  function initialize() {
    const root = document.getElementById('welcome-stepper');
    if (!root || root.dataset.ready) return;
    root.dataset.ready = 'true';
    let state = { currentStep: 0, answers: [] };
    let persistenceEnabled = true, storageWarning = '', storageAlert;
    const unavailableStorage = "Your answers can't be saved in this browser. You can continue, but keep this page open until you save your profile.";
    // Preserve an unreadable draft instead of silently replacing it with empty state.
    let raw;
    try {
      raw = localStorage.getItem('formState');
    } catch { persistenceEnabled = false; storageWarning = unavailableStorage; }
    if (raw !== undefined && raw !== null) try {
      const saved = JSON.parse(raw);
      if (saved && Number.isInteger(saved.currentStep) && saved.currentStep >= 0 && Array.isArray(saved.answers) && saved.answers.every(q => q && !Array.isArray(q) && Number.isFinite(q.questionId) && Array.isArray(q.answers) && q.answers.every(a => a && typeof a === 'object' && !Array.isArray(a) && ['name', 'value', 'code'].every(k => a[k] === undefined || typeof a[k] === 'string')))) {
        state = { currentStep: Math.min(saved.currentStep, questions.length), answers: saved.answers };
      } else throw new Error('Invalid saved draft');
    } catch {
      persistenceEnabled = false;
      storageWarning = "Your saved answers couldn't be loaded. Your stored draft is retained until you successfully save a profile. Changes on this page won't be saved in this browser.";
    }
    const content = document.getElementById('welcome-content');
    const heading = document.getElementById('welcome-heading');
    const progress = document.getElementById('welcome-progress');
    const back = document.getElementById('welcome-back');
    const next = document.getElementById('welcome-next');
    let pending = false, error = '', disposeSearch = () => {};
    const answersFor = id => state.answers.find(q => q.questionId === id)?.answers ?? [];
    function renderStorageWarning() {
      if (!storageWarning) return;
      if (!storageAlert) { storageAlert = element('p', 'welcome-error'); storageAlert.setAttribute('role', 'alert'); content.before(storageAlert); }
      if (storageAlert.textContent !== storageWarning) storageAlert.textContent = storageWarning;
    }
    function persist() {
      if (!persistenceEnabled) return;
      try { localStorage.setItem('formState', JSON.stringify(state)); }
      catch { persistenceEnabled = false; storageWarning = unavailableStorage; }
    }
    function setAnswer(id, answers) {
      const existing = state.answers.find(q => q.questionId === id);
      if (existing) existing.answers = answers;
      else state.answers.push({ questionId: id, answers });
      persist(); renderStorageWarning();
    }
    function chips(id, removable, changed) {
      const list = element('ul', 'welcome-answers');
      if (removable) list.setAttribute('aria-label', 'Your answers');
      answersFor(id).forEach((answer, index) => {
        // questionBase uses name (even for price); review uses name ?? value.
        const label = `${removable ? answer.name : answer.name ?? answer.value ?? ''}${answer.code ? ` (${answer.code})` : ''}`;
        const li = element('li'); const chip = element('span', `constraint-chip${removable ? ' removable-chip' : ''}`, label);
        if (removable) {
          const remove = element('button'); remove.type = 'button'; remove.setAttribute('aria-label', `Remove ${label}`); remove.append(icon('M18 6 6 18M6 6l12 12'));
          remove.addEventListener('click', () => { setAnswer(id, answersFor(id).filter((_, i) => i !== index)); changed(index); });
          chip.append(remove);
        }
        li.append(chip); list.append(li);
      });
      return list;
    }
    function reference(question, headingId, changed) {
      const wrap = element('div', 'welcome-ref');
      const trigger = element('button', 'secondary-button welcome-ref-trigger'); trigger.type = 'button'; trigger.setAttribute('role', 'combobox'); trigger.setAttribute('aria-expanded', 'false'); trigger.setAttribute('aria-controls', 'welcome-options'); trigger.setAttribute('aria-labelledby', headingId); trigger.setAttribute('aria-haspopup', 'listbox');
      const label = element('span'); trigger.append(label, icon('m8 9 4-4 4 4m-8 6 4 4 4-4'));
      const popover = element('div', 'welcome-popover'); popover.hidden = true;
      const searchWrap = element('div', 'welcome-search-wrap'); const input = element('input', 'welcome-search'); input.type = 'text'; input.placeholder = 'Type to search'; input.setAttribute('aria-label', 'Type to search'); input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-controls', 'welcome-options'); input.setAttribute('aria-expanded', 'false');
      searchWrap.append(icon('m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0'), input);
      const list = element('div', 'welcome-options'); list.id = 'welcome-options'; list.setAttribute('role', 'listbox'); list.setAttribute('aria-label', 'Suggestions');
      const status = element('div', 'welcome-ref-status'); status.setAttribute('role', 'status'); status.hidden = true;
      const announcement = element('span', 'sr-only'); announcement.setAttribute('role', 'status');
      popover.append(searchWrap, status, list, announcement); wrap.append(trigger, popover);
      let suggestions = [], active = -1, timer, controller, sequence = 0, loading = false, searchError = '';
      const selected = suggestion => answersFor(question.questionId).some(a => a.name === suggestion.name && a.code === suggestion.code);
      function updateLabel() { const count = answersFor(question.questionId).length; label.textContent = count ? `${count} selected` : 'Type to search'; label.className = count ? '' : 'welcome-placeholder'; }
      function renderOptions() {
        list.replaceChildren(); list.setAttribute('aria-busy', String(loading)); input.removeAttribute('aria-activedescendant');
        status.textContent = loading ? 'Loading...' : searchError || (input.value.trim() && !suggestions.length ? 'No matches. Try a different word.' : ''); status.hidden = !status.textContent; status.setAttribute('role', searchError ? 'alert' : 'status');
        suggestions.forEach((suggestion, index) => {
          const checked = selected(suggestion); const row = element('div', 'welcome-option'); row.id = `welcome-option-${index}`; row.setAttribute('role', 'option'); row.setAttribute('aria-selected', String(index === active)); row.dataset.checked = String(checked);
          const check = element('span', 'welcome-check', checked ? '✓' : ''); check.setAttribute('aria-hidden', 'true');
          const name = element('span', '', `${suggestion.name ?? ''}${suggestion.code ? ` : ${suggestion.code}` : ''}`); if (checked) name.append(element('span', 'sr-only', ' (selected)'));
          row.append(check, name); row.addEventListener('mousedown', event => event.preventDefault()); row.addEventListener('click', () => { active = index; toggle(suggestion); input.focus(); });
          list.append(row); if (index === active) input.setAttribute('aria-activedescendant', row.id);
        });
      }
      function toggle(suggestion) {
        const wasSelected = selected(suggestion);
        setAnswer(question.questionId, wasSelected ? answersFor(question.questionId).filter(a => !(a.name === suggestion.name && a.code === suggestion.code)) : [...answersFor(question.questionId), suggestion]);
        updateLabel(); changed(); renderOptions(); announcement.textContent = `${suggestion.name ?? ''}${wasSelected ? ' removed' : ' selected'}`;
      }
      function close(restore = true) { popover.hidden = true; trigger.setAttribute('aria-expanded', 'false'); input.setAttribute('aria-expanded', 'false'); if (restore) trigger.focus(); }
      function open() { popover.hidden = false; trigger.setAttribute('aria-expanded', 'true'); input.setAttribute('aria-expanded', 'true'); input.focus(); }
      trigger.addEventListener('click', () => popover.hidden ? open() : close());
      trigger.addEventListener('keydown', event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(); } });
      input.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
        else if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && suggestions.length) { event.preventDefault(); active = (active + (event.key === 'ArrowDown' ? 1 : -1) + suggestions.length) % suggestions.length; renderOptions(); list.children[active]?.scrollIntoView({ block: 'nearest' }); }
        else if (event.key === 'Enter') { event.preventDefault(); if (suggestions[active]) toggle(suggestions[active]); }
      });
      input.addEventListener('input', () => {
        clearTimeout(timer); controller?.abort(); const seq = ++sequence; const query = input.value.trim(); suggestions = []; active = -1; loading = false; searchError = ''; renderOptions();
        timer = setTimeout(async () => {
          if (!query) return;
          controller = new AbortController(); loading = true; renderOptions();
          try {
            const response = await fetch(`/api/refs?query=${encodeURIComponent(query)}&type=${encodeURIComponent(question.queryKey)}`, { signal: controller.signal }); const data = await response.json();
            if (seq !== sequence) return;
            if (!response.ok || !Array.isArray(data.suggestions)) searchError = typeof data.message === 'string' ? data.message : "Couldn't load suggestions.";
            else { suggestions = data.suggestions.filter(s => s && typeof s === 'object' && ['name', 'code', 'value'].every(k => s[k] === undefined || typeof s[k] === 'string')); active = suggestions.length ? 0 : -1; }
          } catch (failure) { if (seq === sequence && failure.name !== 'AbortError') searchError = "Couldn't load suggestions."; }
          finally { if (seq === sequence) { loading = false; renderOptions(); } }
        }, 300);
      });
      const outside = event => { if (!popover.hidden && !wrap.contains(event.target)) close(false); };
      const focusOut = event => { if (!wrap.contains(event.relatedTarget)) close(false); };
      document.addEventListener('pointerdown', outside); wrap.addEventListener('focusout', focusOut);
      disposeSearch = () => { clearTimeout(timer); ++sequence; controller?.abort(); document.removeEventListener('pointerdown', outside); };
      updateLabel();
      return { wrap, trigger, refresh: () => { updateLabel(); renderOptions(); } };
    }
    function render(focusHeading = false) {
      persist(); renderStorageWarning();
      disposeSearch(); disposeSearch = () => {}; content.replaceChildren();
      const review = state.currentStep === questions.length;
      document.getElementById('welcome-step').textContent = review ? 'Review' : `Step ${state.currentStep + 1} of ${questions.length}`;
      const percent = Math.round(state.currentStep / questions.length * 100); progress.setAttribute('aria-valuenow', String(percent)); progress.firstElementChild.style.width = `${percent}%`;
      heading.textContent = review ? "Here's what we'll check against" : 'Tell us about you';
      back.disabled = !state.currentStep || pending; next.disabled = pending; next.setAttribute('aria-busy', String(pending)); next.textContent = review ? pending ? 'Saving…' : 'Save profile' : state.currentStep === questions.length - 1 ? 'Review' : 'Continue';
      if (review) {
        const section = element('section', 'welcome-review');
        questions.forEach(question => { const group = element('div'); group.append(element('h2', '', question.questionText)); group.append(answersFor(question.questionId).length ? chips(question.questionId, false) : element('p', 'welcome-skipped', 'Skipped')); section.append(group); });
        if (error) { const alert = element('p', 'welcome-error', error); alert.setAttribute('role', 'alert'); section.append(alert); }
        content.append(section);
      } else {
        const question = questions[state.currentStep]; const section = element('div', 'welcome-question'); const title = element('h3', '', question.questionText); title.id = 'welcome-question-heading'; section.append(title);
        const chipRegion = element('div'); let field, ref;
        function updateChips(removedIndex) {
          chipRegion.replaceChildren(); const answers = answersFor(question.questionId);
          chipRegion.hidden = !answers.length;
          if (answers.length) chipRegion.append(chips(question.questionId, true, updateChips));
          if (ref) ref.refresh(); else if (field) field.value = answers[0]?.value || '';
          if (removedIndex !== undefined) { const buttons = chipRegion.querySelectorAll('button'); (buttons[Math.min(removedIndex, buttons.length - 1)] || field).focus(); }
        }
        if (question.queryKey === 'price') {
          field = element('input', 'welcome-price'); field.type = 'text'; field.inputMode = 'decimal'; field.placeholder = 'Enter price'; field.setAttribute('aria-labelledby', title.id); field.value = answersFor(question.questionId)[0]?.value || '';
          field.addEventListener('input', () => { setAnswer(question.questionId, [{ value: field.value }]); updateChips(); }); section.append(field);
        } else { ref = reference(question, title.id, updateChips); field = ref.trigger; section.append(ref.wrap); }
        updateChips(); section.append(chipRegion); content.append(section);
      }
      if (focusHeading) heading.focus();
    }
    async function submit() {
      pending = true; error = ''; render();
      const submission = state.answers.flatMap(q => { const info = questions.find(question => question.questionId === q.questionId); return info ? [{ questionId: q.questionId, queryKey: info.queryKey, answers: q.answers }] : []; });
      try {
        const response = await fetch('/welcome', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body: JSON.stringify({ submission }), redirect: 'error' });
        const result = await response.json();
        if (response.ok && result.ok === true && result.redirect === '/dashboard') { try { localStorage.removeItem('formState'); } catch { /* Optional persistence. */ } location.assign('/dashboard'); return; }
        if (result.ok === false && result.redirect === '/login') { location.assign('/login'); return; }
        error = typeof result.message === 'string' ? result.message : "Couldn't save your profile. Please try again.";
      } catch { error = "Couldn't save your profile. Please try again."; }
      pending = false; render(); next.focus();
    }
    back.addEventListener('click', () => { if (pending || !state.currentStep) return; --state.currentStep; render(true); });
    next.addEventListener('click', () => { if (pending) return; if (state.currentStep === questions.length) void submit(); else { ++state.currentStep; render(true); } });
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true }); else initialize();
})();
