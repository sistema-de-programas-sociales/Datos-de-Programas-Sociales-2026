

// ── Dark mode ──────────────────────────────────────────
function toggleDark() {
  const isDark = document.body.classList.toggle('dark');
  const icon   = document.getElementById('dark-icon');
  const lbl    = document.getElementById('dark-lbl');
  localStorage.setItem('gaceta-dark', isDark ? '1' : '0');
  if (isDark) {
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    lbl.textContent = 'Día';
  } else {
    icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    lbl.textContent = 'Noche';
  }
}
// Restaurar preferencia guardada
document.addEventListener('DOMContentLoaded', function(){
  if (localStorage.getItem('gaceta-dark') === '1') {
    document.body.classList.add('dark');
    var icon = document.getElementById('dark-icon');
    var lbl  = document.getElementById('dark-lbl');
    if (icon) icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    if (lbl)  lbl.textContent = 'Día';
  }
  // Poblar selectores de capa del mapa sin necesitar Leaflet
  if (typeof window.mapaSelectorsInit === 'function') {
    setTimeout(window.mapaSelectorsInit, 100);
  }
});
