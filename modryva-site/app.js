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
    orderLead: 'Заполни форму — заказ появится во «Входящих» прямо на сайте.',
    name: 'Твоё имя или ник', contact: 'Твоя почта', version: 'Версия Minecraft', loader: 'Загрузчик',
    idea: 'Опиши мод', ideaPlaceholder: 'Что должен делать мод? Как он должен выглядеть? Какие функции нужны?',
    send: 'Отправить идею', copy: 'Скопировать e-mail',
    mailNote: 'Заявки принимаем на',
    profileTitle: 'Добавить аккаунт', mailbox: 'Имя ящика', login: 'Войти', remember: 'запомнить',
    other: 'Другие способы входа', googleSoon: 'Вход через Google пока не подключён.',
    loginHelp: 'Пока это визуальная страница профиля. Настоящие аккаунты подключим отдельно, когда понадобится.',
    mailCopied: 'E-mail скопирован', enterIdea: 'Сначала опиши идею мода.',
    inboxTitle: 'Входящие',
    inboxLead: 'Здесь будут твои заказы, ответы MODRYVA и готовые файлы .jar.',
    inboxEmptyTitle: 'Пока сообщений нет',
    inboxEmptyText: 'После отправки заказа переписка появится здесь.',
    newOrder: 'Создать заказ',
    accountEmailLabel: 'Почта',
    orderAccountNote: 'Заказ привязывается к твоему аккаунту. Ответ MODRYVA появится во «Входящих», а уведомление придёт на твою почту.'
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
    orderLead: 'Fill out the form — your order will appear in Inbox on the site.',
    name: 'Your name or nickname', contact: 'Your email', version: 'Minecraft version', loader: 'Loader',
    idea: 'Describe your mod', ideaPlaceholder: 'What should the mod do? How should it look? What features do you need?',
    send: 'Send idea', copy: 'Copy email',
    mailNote: 'Send requests to',
    profileTitle: 'Add account', mailbox: 'Mailbox name', login: 'Sign in', remember: 'remember me',
    other: 'Other sign-in methods', googleSoon: 'Google sign-in is not connected yet.',
    loginHelp: 'For now this is the profile UI. Real accounts can be connected separately later.',
    mailCopied: 'Email copied', enterIdea: 'Describe your mod idea first.',
    inboxTitle: 'Inbox',
    inboxLead: 'Your orders, MODRYVA replies and finished .jar files will appear here.',
    inboxEmptyTitle: 'No messages yet',
    inboxEmptyText: 'Your conversation will appear here after you send an order.',
    newOrder: 'Create an order',
    accountEmailLabel: 'Email',
    orderAccountNote: 'This order is linked to your account. MODRYVA replies will appear in Inbox and you will also get an email notification.'
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

function getOrders(){
  try { return JSON.parse(localStorage.getItem('modryva-orders') || '[]'); }
  catch { return []; }
}

function saveOrders(orders){
  localStorage.setItem('modryva-orders', JSON.stringify(orders));
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

    const id = 'MDR-' + String(Date.now()).slice(-6);
    const order = {
      id,
      name: String(data.get('name') || '').trim(),
      email: String(data.get('contact') || '').trim(),
      version: String(data.get('version') || '').trim(),
      loader: String(data.get('loader') || '').trim(),
      idea,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    const orders = getOrders();
    orders.unshift(order);
    saveOrders(orders);
    window.location.href = 'inbox.html?order=' + encodeURIComponent(id);
  });
}

function getAccountEmail(){
  return localStorage.getItem('modryva-user-email') || '';
}

function requireAccount(){
  const protectedPage = document.querySelector('#order-form') || document.querySelector('.inbox-card');
  if (!protectedPage) return;
  if (!getAccountEmail()){
    const next = document.querySelector('#order-form') ? 'order.html' : 'inbox.html';
    window.location.replace(`profile.html?mode=register&next=${encodeURIComponent(next)}`);
  }
}

function initProfile(){
  const form = document.querySelector('#profile-form');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  let mode = params.get('mode') === 'login' ? 'login' : 'register';
  const next = params.get('next') || 'index.html';
  const emailInput = document.querySelector('#account-email');
  const title = document.querySelector('[data-account-title]');
  const lead = document.querySelector('[data-account-lead]');
  const submitText = document.querySelector('[data-account-submit]');
  const switchBtn = document.querySelector('#account-mode-switch');
  const saved = getAccountEmail();
  if (saved && emailInput) emailInput.value = saved;

  function renderMode(){
    const ru = getLang() === 'ru';
    if (mode === 'register'){
      title.textContent = ru ? 'Создать аккаунт' : 'Create account';
      lead.textContent = ru
        ? 'Аккаунт нужен, чтобы отправлять заказы, получать ответы и скачивать готовые .jar прямо на сайте.'
        : 'You need an account to send orders, receive replies and download finished .jar files on the site.';
      submitText.textContent = ru ? 'Создать аккаунт' : 'Create account';
      switchBtn.textContent = ru ? 'Уже есть аккаунт? Войти' : 'Already have an account? Sign in';
    } else {
      title.textContent = ru ? 'Войти' : 'Sign in';
      lead.textContent = ru
        ? 'Войди, чтобы открыть свои заказы и входящие.'
        : 'Sign in to open your orders and inbox.';
      submitText.textContent = ru ? 'Войти' : 'Sign in';
      switchBtn.textContent = ru ? 'Нет аккаунта? Зарегистрироваться' : 'No account? Create one';
    }
  }

  renderMode();
  switchBtn.addEventListener('click', () => {
    mode = mode === 'register' ? 'login' : 'register';
    renderMode();
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = String(emailInput?.value || '').trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    localStorage.setItem('modryva-user-email', email);
    const allowed = ['index.html','order.html','inbox.html'];
    window.location.href = allowed.includes(next) ? next : 'index.html';
  });
}

function initAccountUI(){
  const email = getAccountEmail();
  const chip = document.querySelector('#account-chip');
  if (chip && email) chip.textContent = email;

  const orderEmail = document.querySelector('#contact');
  if (orderEmail && email){
    orderEmail.value = email;
    orderEmail.readOnly = true;
  }
}

function escapeHtml(value){
  return String(value || '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}

function initInbox(){
  const list = document.querySelector('#orders-list');
  if (!list) return;
  const orders = getOrders();
  const empty = document.querySelector('#empty-inbox');
  if (!orders.length){
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;
  const ru = getLang() === 'ru';
  list.innerHTML = orders.map(order => `
    <article class="order-card">
      <div class="order-card-top">
        <div>
          <div class="order-id">${escapeHtml(order.id)}</div>
          <h2>${escapeHtml(order.idea.length > 58 ? order.idea.slice(0,58) + '…' : order.idea)}</h2>
        </div>
        <span class="status-badge">${ru ? 'Новый заказ' : 'New order'}</span>
      </div>
      <div class="order-meta">
        <span>Minecraft: ${escapeHtml(order.version || '—')}</span>
        <span>${ru ? 'Загрузчик' : 'Loader'}: ${escapeHtml(order.loader || '—')}</span>
      </div>
      <div class="order-message">
        <strong>${ru ? 'Ты' : 'You'}:</strong>
        <p>${escapeHtml(order.idea)}</p>
      </div>
      <div class="order-waiting">
        ${ru ? 'Ожидает ответа MODRYVA.' : 'Waiting for a reply from MODRYVA.'}
      </div>
    </article>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  applyLang();
  initLanguageMenu();
  requireAccount();
  initOrderForm();
  initProfile();
  initAccountUI();
  initInbox();
});
