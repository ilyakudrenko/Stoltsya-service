/**
 * Read a required element from a generated template.
 * @template {Element} T
 * @param {string} selector
 * @param {{new(): T}} type
 * @returns {T}
 */
function required(selector, type) {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Missing template element: ${selector}`);
  return element;
}

const navigation = required('#main-nav', HTMLElement);
const menuToggle = required('.menu-toggle', HTMLButtonElement);
const menus = [...navigation.querySelectorAll('details')];

function setMobileMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
  if (!open) menus.forEach((menu) => { menu.open = false; });
}

menuToggle.addEventListener('click', () => {
  setMobileMenu(!navigation.classList.contains('open'));
});

for (const menu of menus) {
  menu.querySelector('summary').addEventListener('click', () => {
    menus.forEach((other) => { if (other !== menu) other.open = false; });
  });
}
document.addEventListener('click', (event) => {
  if (event.target instanceof Element && !event.target.closest('.head-inner')) setMobileMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const expandedMenu = menus.find((menu) => menu.open);
  if (expandedMenu) {
    expandedMenu.open = false;
    expandedMenu.querySelector('summary').focus();
  } else if (navigation.classList.contains('open')) {
    setMobileMenu(false);
    menuToggle.focus();
  }
});
required('.skip', HTMLAnchorElement).addEventListener('click', (event) => {
  event.preventDefault();
  const content = required('#main', HTMLElement);
  content.focus({preventScroll: true});
  content.scrollIntoView();
});

if (document.querySelector('#search')) {
  const search = required('#search', HTMLInputElement);
  const group = required('#group', HTMLSelectElement);
  const result = required('#results', HTMLElement);
  const entries = [...document.querySelectorAll('article[data-group]')]
    .filter((entry) => entry instanceof HTMLElement);

  function filterMaterials() {
    const query = search.value.trim().toLocaleLowerCase('uk');
    for (const entry of entries) {
      const text = entry.querySelector('.entry-text').textContent.toLocaleLowerCase('uk');
      entry.hidden = !(text.includes(query) && (!group.value || group.value === entry.dataset.group));
    }
    const count = entries.filter((entry) => !entry.hidden).length;
    result.textContent = count ? `Знайдено позицій: ${count}` : 'Нічого не знайдено. Спробуйте інший запит або категорію.';
  }

  search.addEventListener('input', filterMaterials);
  group.addEventListener('change', filterMaterials);
  required('.controls', HTMLElement).hidden = false;
  filterMaterials();
}

const form = document.querySelector('#inquiry-form');
if (form instanceof HTMLFormElement) {
  const params = new URLSearchParams(location.search);
  const topic = required('#topic', HTMLSelectElement);
  const name = required('#name', HTMLInputElement);
  const phone = required('#phone', HTMLInputElement);
  const message = required('#message', HTMLTextAreaElement);
  const preview = required('#message-preview', HTMLElement);
  const output = required('#message-output', HTMLTextAreaElement);
  const sms = required('#open-sms', HTMLAnchorElement);
  const smsAddress = sms.getAttribute('href');
  const status = required('#form-status', HTMLElement);

  if ([...topic.options].some(({value}) => value === params.get('topic'))) topic.value = params.get('topic');
  if (params.get('item')) message.value = `Цікавить: ${params.get('item').slice(0, 140)}.\n`;
  form.hidden = false;

  form.addEventListener('input', () => {
    name.setCustomValidity('');
    phone.setCustomValidity('');
    preview.hidden = true;
    status.textContent = '';
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const digits = phone.value.replace(/\D/g, '');
    name.setCustomValidity(name.value.trim() ? '' : 'Введіть ім’я.');
    phone.setCustomValidity(/^[+\d\s().-]+$/.test(phone.value) && digits.length >= 9 && digits.length <= 15 ? '' : 'Перевірте номер телефону. Він має містити від 9 до 15 цифр.');
    if (!form.reportValidity()) return;

    output.value = [
      topic.selectedOptions[0].textContent,
      `Ім’я: ${name.value.trim()}`,
      `Телефон: ${phone.value.trim()}`,
      message.value.trim(),
    ].filter(Boolean).join('\n');

    const separator = /iPhone|iPad|iPod/.test(navigator.userAgent) ? '&' : '?';
    sms.href = smsAddress + separator + 'body=' + encodeURIComponent(output.value);
    preview.hidden = false;
    status.textContent = 'Текст підготовлено. Тепер відкрийте SMS або скопіюйте повідомлення.';
  });

  required('#copy-text', HTMLButtonElement).addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = 'Текст скопійовано.';
    } catch {
      output.focus();
      output.select();
      status.textContent = 'Виділений текст можна скопіювати вручну.';
    }
  });
}
