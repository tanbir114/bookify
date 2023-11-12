const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#side-menu-toggle');

function backdropClickHandler() {
  backdrop.style.display = 'none';
  sideDrawer.classList.remove('open');
}

function menuToggleClickHandler() {
  backdrop.style.display = 'block';
  sideDrawer.classList.add('open');
}

backdrop.addEventListener('click', backdropClickHandler);
menuToggle.addEventListener('click', menuToggleClickHandler);

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const monthAbbreviation = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${monthAbbreviation}<br><span>${day}</span>`;
}
