const filters = document.querySelector('.filters');
const materials = document.querySelectorAll('[data-category]');

filters.addEventListener('click', (event) => {
  const selected = event.target.closest('button[data-filter]');
  if (!selected) return;

  for (const button of filters.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button === selected));
  }

  const category = selected.dataset.filter;
  for (const material of materials) {
    material.hidden = category !== 'all' && category !== material.dataset.category;
  }
});
