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

const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const canAnimate = typeof Element.prototype.animate === 'function';
const actuator = 'cubic-bezier(.22,.72,.24,1)';
const motionEnabled = () => canAnimate && !motionPreference.matches;

const hero = document.querySelector('.hero-shutter');
const heroImage = hero?.querySelector('img');
if (hero && heroImage) {
  const imageReady = heroImage.decode?.().then(() => true, () => false) ?? Promise.resolve(true);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(async ([entry]) => {
      if (entry.intersectionRatio === 0) {
        hero.classList.remove('shutter-ready');
      } else if (entry.intersectionRatio >= 0.15 && await imageReady && motionEnabled()) {
        const bounds = hero.getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top < innerHeight) hero.classList.add('shutter-ready');
      }
    }, {threshold: [0, 0.15]});

    observer.observe(hero);
    window.addEventListener('pageshow', (event) => {
      if (!event.persisted) return;
      hero.classList.remove('shutter-ready');
      observer.unobserve(hero);
      observer.observe(hero);
    });
  } else {
    imageReady.then((ready) => {
      if (ready && motionEnabled()) hero.classList.add('shutter-ready');
    });
  }
}

for (const catalog of document.querySelectorAll('[data-catalog]')) {
  const search = catalog.querySelector('input');
  const entries = [...catalog.querySelectorAll('[data-group]')].filter((entry) => entry instanceof HTMLElement);
  const buttons = [...catalog.querySelectorAll('button')];
  const result = catalog.querySelector('[role="status"]');

  function filterMaterials() {
    const query = (search?.value || '').trim().toLocaleLowerCase('uk');
    const category = buttons.find((button) => button.getAttribute('aria-pressed') === 'true')?.dataset.filter;
    for (const entry of entries) {
      const text = entry.textContent.toLocaleLowerCase('uk');
      entry.hidden = !(text.includes(query) && (!category || entry.dataset.group === category));
    }
    const count = entries.filter((entry) => !entry.hidden).length;
    result.textContent = count
      ? `Знайдено позицій: ${count}`
      : 'Нічого не знайдено. Спробуйте інший запит або категорію.';
    result.classList.toggle('catalog-count', count > 0);
  }

  const cards = [...catalog.querySelectorAll('.material-card')].filter((card) => card instanceof HTMLElement);
  let cardMotion = [];
  function stopCardMotion() {
    cardMotion.forEach((animation) => animation.cancel());
    cardMotion = [];
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-pressed') === 'true') return;
      stopCardMotion();
      const animate = motionEnabled();
      const before = animate ? new Map(cards.filter((card) => !card.hidden)
        .map((card) => [card, card.getBoundingClientRect()])) : new Map();
      buttons.forEach((option) => option.setAttribute('aria-pressed', String(option === button)));
      filterMaterials();
      if (!animate) return;

      cards.filter((card) => !card.hidden).forEach((card, index) => {
        const previous = before.get(card);
        if (previous) {
          const current = card.getBoundingClientRect();
          const x = previous.left - current.left;
          const y = previous.top - current.top;
          if (x || y) cardMotion.push(card.animate(
            [{translate: `${x}px ${y}px`}, {translate: '0 0'}],
            {duration: 320, easing: actuator},
          ));
        } else {
          const image = card.querySelector('.material-image');
          cardMotion.push(image.animate(
            [{clipPath: 'inset(0 58% 0 0)'}, {clipPath: 'inset(0)'}],
            {duration: 340, delay: index * 28, easing: actuator, fill: 'backwards'},
          ));
        }
      });
    });
  }
  search?.addEventListener('input', () => {
    stopCardMotion();
    filterMaterials();
  });
  const controls = catalog.querySelector('.catalog-controls');
  if (controls instanceof HTMLElement) controls.hidden = false;
}

if ('IntersectionObserver' in window && !motionPreference.matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      entry.target.classList.add('reveal-entered');
      setTimeout(() => entry.target.classList.remove('reveal-entered'), 650);
    }
  }, {threshold: 0.12});

  for (const element of document.querySelectorAll('[data-reveal]')) {
    // The first screen and all content without JavaScript render immediately.
    if (element.getBoundingClientRect().top >= innerHeight) observer.observe(element);
  }
}

const process = document.querySelector('[data-process]');
if (process) {
  const stages = [...process.querySelectorAll('a[data-stage]')];
  const frames = [...process.querySelectorAll('.process-frame')].filter((frame) => frame instanceof HTMLElement);
  stages[0].setAttribute('aria-current', 'step');
  let current = frames[0];
  let handoff;

  process.addEventListener('click', (event) => {
    if (!(event instanceof MouseEvent) || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const stage = event.target instanceof Element && event.target.closest('a[data-stage]');
    if (!(stage instanceof HTMLAnchorElement)) return;
    const next = frames.find((frame) => frame.id === stage.dataset.stage);
    if (!next) return;
    event.preventDefault();
    if (next === current) return;

    handoff?.cancel();
    const previous = current;
    const forward = frames.indexOf(next) > frames.indexOf(previous);
    current = next;
    for (const frame of frames) {
      frame.hidden = frame !== next;
      frame.classList.remove('process-outgoing');
      frame.removeAttribute('aria-hidden');
    }
    stages.forEach((link) => link.removeAttribute('aria-current'));
    stage.setAttribute('aria-current', 'step');
    process.setAttribute('data-active-stage', String(frames.indexOf(next)));
    if (!motionEnabled()) return;

    previous.hidden = false;
    previous.classList.add('process-outgoing');
    previous.setAttribute('aria-hidden', 'true');
    handoff = next.animate(
      [{clipPath: forward ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)'}, {clipPath: 'inset(0)'}],
      {duration: 520, easing: actuator},
    );
    handoff.finished.then(() => {
      previous.hidden = true;
      previous.classList.remove('process-outgoing');
      previous.removeAttribute('aria-hidden');
    }, () => {});
  });
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
