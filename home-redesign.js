/* Home redesign: four primary destinations (play, workshop, store, upgrades) plus "More". */
(() => {
  const nav = document.getElementById('homePageTabs');
  if (!nav) return;
  const secondary = ['homeTasksTab', 'homeLeaderboardTab', 'homeCodexTab', 'homeUltimateTab'].map(id => document.getElementById(id)).filter(Boolean);
  const label = () => ({ zh: '更多', ja: 'その他', ko: '더보기', ru: 'Ещё', es: 'Más' }[typeof currentLanguage === 'string' ? currentLanguage : document.documentElement.lang.slice(0, 2)] || 'More');
  const more = document.createElement('button');
  more.type = 'button';
  more.id = 'homeMoreTab';
  more.className = 'home-page-tab home-more-tab';
  more.setAttribute('aria-haspopup', 'true');
  more.setAttribute('aria-expanded', 'false');
  nav.append(more);
  const sheet = document.createElement('div');
  sheet.className = 'home-more-sheet';
  sheet.hidden = true;
  document.body.append(sheet);
  for (const tab of secondary) tab.classList.add('home-secondary-tab');

  function render() {
    more.textContent = label();
    const badgeOf = tab => { const b = tab.querySelector('.home-tab-badge'); return b && !b.hidden && b.textContent.trim() !== '0' ? b.textContent.trim() : ''; };
    const name = tab => [...tab.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    sheet.innerHTML = secondary.map(tab => `<button type="button" data-target="${tab.id}"><i></i><span>${name(tab)}</span>${badgeOf(tab) ? `<em class="hr-sheet-badge">${badgeOf(tab)}</em>` : ''}</button>`).join('');
    more.classList.toggle('has-badge', secondary.some(tab => badgeOf(tab)));
    // The icon is a url("data:...") value; set it as a property so its quotes never meet HTML attributes.
    for (const button of sheet.querySelectorAll('[data-target]')) button.querySelector('i').style.setProperty('--hr-icon', getComputedStyle(document.getElementById(button.dataset.target)).getPropertyValue('--hr-icon'));
    const active = secondary.some(tab => tab.getAttribute('aria-selected') === 'true');
    more.classList.toggle('is-current', active);
  }
  function setOpen(open) {
    sheet.hidden = !open;
    more.setAttribute('aria-expanded', String(open));
    if (open) render();
  }
  more.addEventListener('click', event => { event.stopPropagation(); setOpen(sheet.hidden); });
  sheet.addEventListener('click', event => {
    const button = event.target.closest('[data-target]');
    if (!button) return;
    setOpen(false);
    document.getElementById(button.dataset.target)?.click();
    render();
  });
  document.addEventListener('click', event => { if (!sheet.hidden && !sheet.contains(event.target)) setOpen(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !sheet.hidden) { setOpen(false); more.focus(); } });
  nav.addEventListener('click', () => setTimeout(render, 0));
  window.addEventListener('space-tower-language-changed', render);
  // The bottom bar uses the short "強化 / Upgrade" label for permanent upgrades.
  const meta = document.getElementById('metaOpenButton');
  const shortMeta = () => {
    if (!meta) return;
    const row = globalThis.SpaceTowerLocale?.entries?.get('強化');
    const current = meta.textContent.trim();
    if (current === '強化' || (row && Object.values(row).includes(current))) return;
    meta.textContent = '強化';
    globalThis.SpaceTowerLocale?.translate?.(meta);
  };
  if (meta) { new MutationObserver(shortMeta).observe(meta, { childList: true, characterData: true, subtree: true }); shortMeta(); document.addEventListener('DOMContentLoaded', shortMeta); }
  for (const tab of secondary) { const b = tab.querySelector('.home-tab-badge'); if (b) new MutationObserver(() => more.classList.toggle('has-badge', secondary.some(t => { const x = t.querySelector('.home-tab-badge'); return x && !x.hidden && x.textContent.trim() !== '0'; }))).observe(b, { attributes: true, childList: true, characterData: true, subtree: true }); }
  render();
})();
