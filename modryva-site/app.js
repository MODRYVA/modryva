const translations = {
  ru: {
    langCode: 'РУ', flag: '🇷🇺',
    heroTitle: 'Нужно создать мод на заказ для Minecraft? Сделаем быстро и качественно!',
    tagline: 'You Imagine It. We Build It.',
    easy: 'Лёгкий мод: 100₽', medium: 'Средний мод: 199₽', difficult: 'Сложный мод: 250₽',
    cta: 'Воплотить идею',
    footerMail: 'Написать нам',
    back: '← На главную',
    orderTitle: 'Расскажи нам свою идею',
    orderLead: 'Заполни форму — после нажатия кнопки откроется твоя почта с готовым письмом на MODRYVA.',
    name: 'Твоё имя или ник', contact: 'Твоя почта / Discord', version: 'Версия Minecraft', loader: 'Загрузчик',
    idea: 'Опиши мод', ideaPlaceholder: 'Что должен делать мод? Как он должен выглядеть? Какие функции нужны?',
    send: 'Отправить идею', copy: 'Скопировать e-mail',
    mailNote: 'Заявки принимаем на',
    profileTitle: 'Добавить аккаунт', mailbox: 'Имя ящика', login: 'Войти', remember: 'запомнить',
    other: 'Другие способы входа', googleSoon: 'Вход через Google пока не подключён.',
    loginHelp: 'Пока это визуальная страница профиля. Настоящие аккаунты подключим отдельно, когда понадобится.',
    mailCopied: 'E-mail скопирован', enterIdea: 'Сначала опиши идею мода.'
  },
  en: {
    langCode: 'EN', flag: '🇺🇸',
    heroTitle: 'Need a custom Minecraft mod? We’ll create it quickly and to a high quality!',
    tagline: 'You Imagine It. We Build It.',
    easy: 'Easy Mod: $1.20', medium: 'Medium Mod: $2.40', difficult: 'Difficult Mod: $3',
    cta: 'Embody your idea',
    footerMail: 'Email us',
    back: '← Home',
    orderTitle: 'Tell us your idea',
    orderLead: 'Fill out the form — your email app will open with a ready message addressed to MODRYVA.',
    name: 'Your name or nickname', contact: 'Your email / Discord', version: 'Minecraft version', loader: 'Loader',
    idea: 'Describe your mod', ideaPlaceholder: 'What should the mod do? How should it look? What features do you need?',
    send: 'Send idea', copy: 'Copy email',
    mailNote: 'Send requests to',
    profileTitle: 'Add account', mailbox: 'Mailbox name', login: 'Sign in', remember: 'remember me',
    other: 'Other sign-in methods', googleSoon: 'Google sign-in is not connected yet.',
    loginHelp: 'For now this is the profile UI. Real accounts can be connected separately later.',
    mailCopied: 'Email copied', enterIdea: 'Describe your mod idea first.'
  }
};

function getLang(){ return localStorage.getItem('modryva-lang') || 'ru'; }
function setLang(lang){
  localStorage.setItem('modryva-lang', lang);
  applyLang();
}
function applyLang(){
  const lang = getLang();
  const t = translations[lang];
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] != null) el.textContent = t[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key] != null) el.placeholder = t[key];
  });
  const code = document.querySelector('[data-lang-code]');
  const flag = document.querySelector('[data-lang-flag]');
  if (code) code.textContent = t.langCode;
  if (flag) flag.textContent = t.flag;
}

function initLanguageMenu(){
  const btn = document.querySelector('.lang-button');
  const menu = document.querySelector('.lang-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('[data-set-lang]').forEach(b => b.addEventListener('click', () => {
    setLang(b.dataset.setLang);
    menu.classList.remove('open');
  }));
  document.addEventListener('click', () => menu.classList.remove('open'));
}

function showToast(message){
  let toast = document.querySelector('.toast');
  if (!toast){
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function initOrderForm(){
  const form = document.querySelector('#order-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const idea = String(data.get('idea') || '').trim();
    const t = translations[getLang()];
    if (!idea){ showToast(t.enterIdea); return; }
    const lang = getLang();
    const subject = lang === 'ru' ? 'Заказ мода для Minecraft — MODRYVA' : 'Custom Minecraft mod request — MODRYVA';
    const body = [
      `Name / Ник: ${data.get('name') || '-'}`,
      `Contact / Контакт: ${data.get('contact') || '-'}`,
      `Minecraft: ${data.get('version') || '-'}`,
      `Loader: ${data.get('loader') || '-'}`,
      '',
      lang === 'ru' ? 'Идея мода:' : 'Mod idea:',
      idea
    ].join('\n');
    window.location.href = `mailto:modryva.mod@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  const copy = document.querySelector('#copy-email');
  if (copy) copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('modryva.mod@gmail.com');
      showToast(translations[getLang()].mailCopied);
    } catch {
      showToast('modryva.mod@gmail.com');
    }
  });
}

function initProfile(){
  const form = document.querySelector('#profile-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.querySelector('#mailbox-name')?.value.trim();
    if (name) localStorage.setItem('modryva-profile-name', name);
    window.location.href = 'index.html';
  });
  const google = document.querySelector('#google-login');
  if (google) google.addEventListener('click', () => showToast(translations[getLang()].googleSoon));
  const saved = localStorage.getItem('modryva-profile-name');
  const input = document.querySelector('#mailbox-name');
  if (saved && input) input.value = saved;
}

document.addEventListener('DOMContentLoaded', () => {
  applyLang();
  initLanguageMenu();
  initOrderForm();
  initProfile();
});
