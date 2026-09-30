export function initExperimentSidebarDrawer() {
  const toggle = document.querySelector<HTMLButtonElement>('.experiment-sidebar-bar__button');
  const panel = document.getElementById('experiment-sidebar-panel');
  const mobileMq = window.matchMedia('(max-width: 44.999em)');

  function setDrawerOpen(open: boolean) {
    panel?.setAttribute('data-visible', open ? 'true' : 'false');
    toggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!mobileMq.matches) {
      panel?.removeAttribute('inert');
      return;
    }
    if (open) panel?.removeAttribute('inert');
    else panel?.setAttribute('inert', '');
  }

  function syncDrawerState() {
    if (!mobileMq.matches) {
      panel?.removeAttribute('inert');
      return;
    }
    const open = panel?.getAttribute('data-visible') === 'true';
    toggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) panel?.removeAttribute('inert');
    else panel?.setAttribute('inert', '');
  }

  toggle?.addEventListener('click', () => {
    const open = panel?.getAttribute('data-visible') === 'true';
    setDrawerOpen(!open);
  });

  panel?.querySelectorAll('.experiment-sidebar__link').forEach((link) => {
    link.addEventListener('click', () => {
      if (!mobileMq.matches) return;
      setDrawerOpen(false);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!mobileMq.matches) return;
    if (panel?.getAttribute('data-visible') !== 'true') return;
    setDrawerOpen(false);
    toggle?.focus();
  });

  mobileMq.addEventListener('change', syncDrawerState);
  syncDrawerState();
}

initExperimentSidebarDrawer();
