document.addEventListener('DOMContentLoaded', function () {
  var menuBtn = document.getElementById('menuOpenBtn');
  var panel = document.getElementById('mobileNavPanel');
  var overlay = document.getElementById('navOverlay');
  if (!menuBtn || !panel || !overlay) return;

  function openMenu() {
    panel.classList.add('open');
    overlay.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    panel.classList.remove('open');
    overlay.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  menuBtn.addEventListener('click', openMenu);
  overlay.addEventListener('click', closeMenu);
});
