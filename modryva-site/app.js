const ADMIN_EMAIL = 'modryva.mod@gmail.com';
const config = window.MODRYVA_SUPABASE;
const db = window.supabase.createClient(config.url, config.key);

const translations = {
  ru: {
    langCode: 'РУ', flag: '🇷🇺',
    heroTitle: 'Нужно создать мод на заказ для Minecraft? Сделаем быстро и качественно!',
    tagline: 'You Imagine It. We Build It.',
    easy: 'Лёгкий мод: 1 USDT', medium: 'Средний мод: 2 USDT', difficult: 'Сложный мод: 3 USDT',
    cta: 'Воплотить идею',
    cryptoOnly: 'Оплата только Крипто-валютой',
    orderPaymentNote: 'Оплата заказа — только криптовалютой. Крипто-платёжный этап подключим отдельно.',
    footerMail: 'Написать нам',
    back: '← На главную',
    orderTitle: 'Расскажи нам свою идею',
    orderLead: 'Заполни форму — заказ появится во «Входящих» прямо на сайте.',
    difficultyAuto: 'Сложность и цену определит MODRYVA после проверки идеи.',
    name: 'Твоё имя или ник', contact: 'Твоя почта', version: 'Версия Minecraft', loader: 'Загрузчик',
    idea: 'Опиши мод', ideaPlaceholder: 'Что должен делать мод? Как он должен выглядеть? Какие функции нужны?',
    send: 'Отправить идею',
    inboxTitle: 'Входящие',
    inboxLead: 'Здесь твои заказы, ответы MODRYVA и готовые файлы .jar.'
  },
  en: {
    langCode: 'EN', flag: '🇺🇸',
    heroTitle: 'Need a custom Minecraft mod? We’ll create it quickly and to a high quality!',
    tagline: 'You Imagine It. We Build It.',
    easy: 'Easy Mod: 1 USDT', medium: 'Medium Mod: 2 USDT', difficult: 'Difficult Mod: 3 USDT',
    cta: 'Embody your idea',
    cryptoOnly: 'Payment in cryptocurrency only',
    orderPaymentNote: 'Orders can be paid only with cryptocurrency. The crypto payment step will be connected separately.',
    footerMail: 'Email us',
    back: '← Home',
    orderTitle: 'Tell us your idea',
    orderLead: 'Fill out the form — your order will appear in Inbox on the site.',
    difficultyAuto: 'MODRYVA will assign the difficulty and price after reviewing your idea.',
    name: 'Your name or nickname', contact: 'Your email', version: 'Minecraft version', loader: 'Loader',
    idea: 'Describe your mod', ideaPlaceholder: 'What should the mod do? How should it look? What features do you need?',
    send: 'Send idea',
    inboxTitle: 'Inbox',
    inboxLead: 'Your orders, MODRYVA replies and finished .jar files appear here.'
  }
};

function getLang(){ return localStorage.getItem('modryva-lang') || 'ru'; }
function setLang(lang){ localStorage.setItem('modryva-lang', lang); applyLang(); renderTierPrice(); }

function applyLang(){
  const t = translations[getLang()];
  document.documentElement.lang = getLang();
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
  clearTimeout(window.__modryvaToast);
  window.__modryvaToast = setTimeout(() => toast.classList.remove('show'), 2600);
}

function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}

function formatDate(value){
  if (!value) return '';
  try { return new Intl.DateTimeFormat(getLang() === 'ru' ? 'ru-RU' : 'en-US', {dateStyle:'medium',timeStyle:'short'}).format(new Date(value)); }
  catch { return value; }
}

function isAdminEmail(email){
  return String(email || '').toLowerCase() === ADMIN_EMAIL;
}

function pageFile(){
  const p = location.pathname.split('/').filter(Boolean);
  return p[p.length - 1] || 'index.html';
}

async function currentSession(){
  const { data } = await db.auth.getSession();
  return data.session || null;
}

async function requireAuth(next = pageFile() + location.search){
  const session = await currentSession();
  if (!session){
    location.replace('profile.html?mode=register&next=' + encodeURIComponent(next));
    return null;
  }
  return session;
}

async function updateInboxBadge(){
  const badge = document.querySelector('#inbox-badge');
  if (!badge) return;
  const session = await currentSession();
  if (!session){ badge.hidden = true; return; }
  const { count } = await db.from('notifications')
    .select('*', { count:'exact', head:true })
    .is('read_at', null);
  if (count && count > 0){
    badge.textContent = count > 9 ? '9+' : String(count);
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}

async function initHome(){
  const cta = document.querySelector('.cta');
  const profileButton = document.querySelector('.profile-button');
  const session = await currentSession();
  if (cta){
    cta.href = session ? 'order.html?rev=14' : 'profile.html?mode=register&next=' + encodeURIComponent('order.html?rev=14');
  }
  if (profileButton && session){
    profileButton.title = session.user.email || 'Account';
  }
  const adminTopButton = document.querySelector('#admin-top-button');
  if (adminTopButton && session && isAdminEmail(session.user.email)) adminTopButton.hidden = false;
  await updateInboxBadge();
}

function renderProfileMode(mode){
  const title = document.querySelector('[data-account-title]');
  const lead = document.querySelector('[data-account-lead]');
  const loginForm = document.querySelector('#password-login-form');
  const switchBtn = document.querySelector('#account-mode-switch');
  const googleLabel = document.querySelector('[data-google-label]');
  if (!title || !lead || !loginForm || !switchBtn || !googleLabel) return;
  const ru = getLang() === 'ru';
  if (mode === 'login'){
    title.textContent = ru ? 'Войти' : 'Sign in';
    lead.textContent = ru ? 'Войди через Google или используй почту и пароль MODRYVA.' : 'Sign in with Google or use your MODRYVA email and password.';
    loginForm.hidden = false;
    switchBtn.textContent = ru ? 'Нет аккаунта? Зарегистрироваться через Google' : 'No account? Register with Google';
    googleLabel.textContent = ru ? 'Войти через Google' : 'Sign in with Google';
  } else {
    title.textContent = ru ? 'Создать аккаунт' : 'Create account';
    lead.textContent = ru ? 'Сначала выбери Google-аккаунт. Затем создашь отдельный пароль для MODRYVA.' : 'Choose a Google account first. Then create a separate MODRYVA password.';
    loginForm.hidden = true;
    switchBtn.textContent = ru ? 'Уже есть аккаунт? Войти по почте и паролю' : 'Already have an account? Sign in with email and password';
    googleLabel.textContent = ru ? 'Продолжить с Google' : 'Continue with Google';
  }
}

async function initProfile(){
  const signedOut = document.querySelector('#account-signed-out');
  const signedIn = document.querySelector('#account-signed-in');
  if (!signedOut || !signedIn) return;

  const params = new URLSearchParams(location.search);
  let mode = params.get('mode') === 'login' ? 'login' : 'register';
  const next = params.get('next') || 'index.html';
  const session = await currentSession();

  if (session){
    signedOut.hidden = true;
    signedIn.hidden = false;
    document.querySelector('#signed-in-email').textContent = session.user.email || '';
    const adminLink = document.querySelector('#admin-link');
    if (adminLink && isAdminEmail(session.user.email)) adminLink.hidden = false;
    document.querySelector('#logout-button')?.addEventListener('click', async () => {
      await db.auth.signOut();
      location.href = 'index.html';
    });
    return;
  }

  signedOut.hidden = false;
  signedIn.hidden = true;
  renderProfileMode(mode);

  document.querySelector('#account-mode-switch')?.addEventListener('click', () => {
    mode = mode === 'login' ? 'register' : 'login';
    renderProfileMode(mode);
  });

  document.querySelector('#google-auth')?.addEventListener('click', async () => {
    localStorage.setItem('modryva-auth-next', next);
    const redirectTo = new URL('auth-callback.html', location.href).href;
    const { error } = await db.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline'
        }
      }
    });
    if (error) showToast(error.message);
  });

  document.querySelector('#password-login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.querySelector('#login-email').value.trim();
    const password = document.querySelector('#login-password').value;
    const button = e.currentTarget.querySelector('button[type="submit"]');
    button.disabled = true;
    const { error } = await db.auth.signInWithPassword({ email, password });
    button.disabled = false;
    if (error){ showToast(error.message); return; }
    location.href = next;
  });
}

async function initAuthCallback(){
  const card = document.querySelector('#auth-callback-card');
  if (!card) return;

  try {
    if (new URLSearchParams(location.search).has('code')){
      await db.auth.exchangeCodeForSession(location.href);
    }
  } catch {}

  const session = await currentSession();
  const loading = document.querySelector('#callback-loading');
  const passwordBox = document.querySelector('#callback-password');
  const errorBox = document.querySelector('#callback-error');
  const errorText = document.querySelector('#callback-error-text');
  const next = localStorage.getItem('modryva-auth-next') || 'index.html';

  if (!session){
    loading.hidden = true;
    errorBox.hidden = false;
    errorText.textContent = 'Google не вернул активный сеанс. Попробуй регистрацию ещё раз.';
    return;
  }

  const { data: profile } = await db.from('profiles').select('password_set').eq('id', session.user.id).maybeSingle();
  if (profile?.password_set){
    localStorage.removeItem('modryva-auth-next');
    location.replace(next);
    return;
  }

  loading.hidden = true;
  passwordBox.hidden = false;
  document.querySelector('#callback-email').textContent = session.user.email || '';

  document.querySelector('#set-password-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const password = document.querySelector('#new-password').value;
    const confirm = document.querySelector('#confirm-password').value;
    if (password.length < 8){ showToast('Пароль должен быть минимум 8 символов.'); return; }
    if (password !== confirm){ showToast('Пароли не совпадают.'); return; }

    const button = e.currentTarget.querySelector('button[type="submit"]');
    button.disabled = true;
    const { error } = await db.auth.updateUser({ password });
    if (error){
      button.disabled = false;
      showToast(error.message);
      return;
    }
    await db.from('profiles').update({ password_set:true }).eq('id', session.user.id);
    localStorage.removeItem('modryva-auth-next');
    location.replace(next);
  });
}

function pricingFor(tier){
  const m = {easy:100, medium:200, difficult:300};
  return {
    currency:'USDT',
    amount_minor:m[tier],
    label:{easy:'1 USDT',medium:'2 USDT',difficult:'3 USDT'}[tier]
  };
}

function renderTierPrice(){
  const tier = document.querySelector('#tier');
  const out = document.querySelector('#tier-price');
  if (!tier || !out) return;
  const p = pricingFor(tier.value);
  out.textContent = (getLang() === 'ru' ? 'Цена: ' : 'Price: ') + p.label;
}

async function initOrderForm(){
  const form = document.querySelector('#order-form');
  if (!form) return;
  const session = await requireAuth('order.html');
  if (!session) return;

  document.querySelector('#contact').value = session.user.email || '';

  const legacyTier = document.querySelector('#tier');
  if (legacyTier) legacyTier.closest('.form-field')?.remove();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(form);
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;

    const payload = {
      user_id: session.user.id,
      customer_name: String(data.get('name') || '').trim(),
      minecraft_version: String(data.get('version') || '').trim(),
      loader: String(data.get('loader') || '').trim(),
      idea: String(data.get('idea') || '').trim(),
      tier: 'unassigned',
      currency: 'USDT',
      amount_minor: 0,
      status: 'new',
      payment_status: 'pending'
    };

    const { data: order, error } = await db.from('orders').insert(payload).select().single();
    if (error){
      button.disabled = false;
      showToast(error.message);
      return;
    }

    const { data: firstMessage, error: messageError } = await db.from('order_messages').insert({
      order_id: order.id,
      sender_id: session.user.id,
      body: payload.idea,
      is_system: false
    }).select().single();

    if (messageError){
      button.disabled = false;
      showToast(messageError.message);
      return;
    }

    const initialFiles = document.querySelector('#order-files')?.files;
    try {
      if (initialFiles?.length){
        await uploadConversationFiles({
          files: initialFiles,
          session,
          orderId: order.id,
          orderMessageId: firstMessage.id
        });
      }
    } catch (fileError){
      button.disabled = false;
      showToast(fileError.message || String(fileError));
      return;
    }

    location.href = 'inbox.html?order=' + encodeURIComponent(order.id);
  });
}

function statusLabel(status){
  const ru = getLang() === 'ru';
  const map = ru ? {
    new:'Новый', awaiting_payment:'Ожидает оплату', paid:'Оплачен', in_progress:'В работе',
    ready:'Готов', completed:'Завершён', cancelled:'Отменён', refunded:'Возврат'
  } : {
    new:'New', awaiting_payment:'Awaiting payment', paid:'Paid', in_progress:'In progress',
    ready:'Ready', completed:'Completed', cancelled:'Cancelled', refunded:'Refunded'
  };
  return map[status] || status;
}

function tierLabel(tier){
  const ru = getLang() === 'ru';
  const map = ru
    ? {unassigned:'Не определена',easy:'Лёгкий',medium:'Средний',difficult:'Сложный'}
    : {unassigned:'Not assigned',easy:'Easy',medium:'Medium',difficult:'Difficult'};
  return map[tier] || tier || (ru ? 'Не определена' : 'Not assigned');
}

function amountLabel(order){
  if (order.tier === 'unassigned' || Number(order.amount_minor) === 0){
    return getLang() === 'ru' ? 'Цена после оценки' : 'Price after review';
  }
  if (order.currency === 'USDT') return (order.amount_minor / 100).toFixed(2).replace(/\.00$/,'') + ' USDT';
  if (order.currency === 'RUB') return (order.amount_minor / 100).toFixed(0) + '₽';
  if (order.currency === 'USD') return '$' + (order.amount_minor / 100).toFixed(2).replace(/\.00$/,'');
  return order.amount_minor + ' ' + order.currency;
}

function orderProgressHtml(order){
  const ru = getLang() === 'ru';
  const steps = ru
    ? ['Идея отправлена','Оценено','Ожидает оплату','Оплачено','В работе','Готово']
    : ['Idea sent','Reviewed','Awaiting payment','Paid','In progress','Ready'];

  const progressIndex = {
    new:0,
    awaiting_payment:2,
    paid:3,
    in_progress:4,
    ready:5,
    completed:5,
    refunded:3
  }[order.status] ?? 0;

  if (order.status === 'cancelled'){
    return `<div class="order-progress cancelled-progress"><span>✕</span><strong>${ru?'Заказ отменён':'Order cancelled'}</strong></div>`;
  }

  return `<div class="order-progress">${steps.map((label,index)=>{
    const done=index<progressIndex;
    const active=index===progressIndex;
    return `<div class="progress-step ${done?'done':''} ${active?'active':''}">
      <span class="progress-dot">${done?'✓':index+1}</span>
      <span class="progress-label">${escapeHtml(label)}</span>
    </div>`;
  }).join('')}</div>`;
}

function adminOrderCardHtml(order, active=false, unread=0){
  return `<a class="order-card compact-card ${active ? 'active' : ''}" href="admin.html?order=${encodeURIComponent(order.id)}">
    <div class="order-card-top">
      <div>
        <div class="order-id">${escapeHtml(order.order_number)}</div>
        <h2>${escapeHtml((order.idea || '').slice(0,55))}${(order.idea || '').length > 55 ? '…' : ''}</h2>
      </div>
      <div class="card-status-stack">
        ${unread ? '<span class="admin-unread-badge">'+Math.min(unread,99)+'</span>' : ''}
        <span class="status-badge status-${escapeHtml(order.status)}">${escapeHtml(statusLabel(order.status))}</span>
      </div>
    </div>
    <div class="order-meta"><span>${escapeHtml(order.minecraft_version || '—')}</span><span>${escapeHtml(amountLabel(order))}</span></div>
  </a>`;
}

function orderCardHtml(order, active=false){
  return `<a class="order-card compact-card ${active ? 'active' : ''}" href="inbox.html?order=${encodeURIComponent(order.id)}">
    <div class="order-card-top">
      <div>
        <div class="order-id">${escapeHtml(order.order_number)}</div>
        <h2>${escapeHtml((order.idea || '').slice(0,55))}${(order.idea || '').length > 55 ? '…' : ''}</h2>
      </div>
      <span class="status-badge status-${escapeHtml(order.status)}">${escapeHtml(statusLabel(order.status))}</span>
    </div>
    <div class="order-meta"><span>${escapeHtml(order.minecraft_version || '—')}</span><span>${escapeHtml(amountLabel(order))}</span></div>
  </a>`;
}


const MAX_CONVERSATION_FILE_SIZE = 50 * 1024 * 1024;

function safeFileName(name){
  return String(name || 'file').replace(/[^a-zA-Z0-9._,'!&$@=;:+?() -]/g, '_');
}

function attachmentButtonsHtml(items){
  return (items || []).map(a => `
    <button type="button" class="attachment-download" data-path="${escapeHtml(a.storage_path)}" data-name="${escapeHtml(a.original_name)}">
      📎 ${escapeHtml(a.original_name)}
    </button>
  `).join('');
}

async function downloadConversationFile(path, name){
  const { data, error } = await db.storage.from('conversation-files').download(path);
  if (error){ showToast(error.message); return; }
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = name || 'file';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function uploadConversationFiles({files, session, orderId=null, ticketId=null, orderMessageId=null, supportMessageId=null}){
  const list = Array.from(files || []);
  for (const file of list){
    if (file.size > MAX_CONVERSATION_FILE_SIZE){
      throw new Error(`${file.name}: максимум 50 МБ на файл.`);
    }
    const path = `${session.user.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error: uploadError } = await db.storage
      .from('conversation-files')
      .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert:false });
    if (uploadError) throw uploadError;

    const { error: rowError } = await db.from('attachments').insert({
      uploader_id: session.user.id,
      order_id: orderId,
      ticket_id: ticketId,
      order_message_id: orderMessageId,
      support_message_id: supportMessageId,
      storage_path: path,
      original_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size
    });
    if (rowError){
      await db.storage.from('conversation-files').remove([path]);
      throw rowError;
    }
  }
}

async function downloadOrderFile(path, name){
  const { data, error } = await db.storage.from('order-files').download(path);
  if (error){ showToast(error.message); return; }
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = name || 'mod.jar';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function renderOrderDetail(order, session){
  const detail = document.querySelector('#order-detail');
  if (!detail) return;
  const [{ data: messages }, { data: files }, { data: attachments }] = await Promise.all([
    db.from('order_messages').select('*').eq('order_id', order.id).order('created_at'),
    db.from('order_files').select('*').eq('order_id', order.id).order('created_at', {ascending:false}),
    db.from('attachments').select('*').eq('order_id', order.id).order('created_at')
  ]);

  const filesHtml = (files || []).map(f => `
    <button type="button" class="file-download" data-path="${escapeHtml(f.storage_path)}" data-name="${escapeHtml(f.original_name)}">
      ↓ ${escapeHtml(f.original_name)}
    </button>`).join('');

  const messagesHtml = (messages || []).map(m => {
    const mine = m.sender_id === session.user.id;
    const attached = (attachments || []).filter(a => a.order_message_id === m.id);
    return `<div class="chat-message ${mine ? 'mine' : 'theirs'}">
      <div class="chat-author">${mine ? (getLang()==='ru'?'Ты':'You') : 'MODRYVA'}</div>
      <div class="chat-bubble">${escapeHtml(m.body)}</div>
      ${attached.length ? '<div class="message-files">'+attachmentButtonsHtml(attached)+'</div>' : ''}
      <div class="chat-time">${escapeHtml(formatDate(m.created_at))}</div>
    </div>`;
  }).join('');

  detail.innerHTML = `
    <div class="conversation-head">
      <div>
        <div class="order-id">${escapeHtml(order.order_number)}</div>
        <h2>${escapeHtml(order.customer_name || 'Minecraft mod')}</h2>
      </div>
      <span class="status-badge status-${escapeHtml(order.status)}">${escapeHtml(statusLabel(order.status))}</span>
    </div>
    ${orderProgressHtml(order)}
    <div class="detail-meta">
      <span>Minecraft: ${escapeHtml(order.minecraft_version || '—')}</span>
      <span>Loader: ${escapeHtml(order.loader || '—')}</span>
      <span>${getLang()==='ru'?'Сложность':'Difficulty'}: ${escapeHtml(tierLabel(order.tier))}</span>
      <span>${escapeHtml(amountLabel(order))}</span>
      <span>${escapeHtml(formatDate(order.created_at))}</span>
    </div>
    ${filesHtml ? '<div class="files-box"><strong>Готовые файлы</strong><div class="files-row">'+filesHtml+'</div></div>' : ''}
    ${(['new','awaiting_payment'].includes(order.status) && order.payment_status !== 'paid')
      ? '<div class="order-actions"><button class="danger-button" id="cancel-order-button" type="button">'+(getLang()==='ru'?'Отменить заказ':'Cancel order')+'</button></div>'
      : ''}
    <div class="chat-thread" id="chat-thread">${messagesHtml || '<p class="muted">Сообщений пока нет.</p>'}</div>
    <form class="chat-form" id="order-message-form">
      <textarea id="order-message-body" maxlength="10000" placeholder="Напиши MODRYVA…"></textarea>
      <div class="chat-send-tools">
        <label class="attach-button">📎 Файлы<input type="file" id="order-message-files" multiple /></label>
        <span class="file-limit-note">до 50 МБ каждый</span>
        <button class="primary-button" type="submit">Отправить</button>
      </div>
    </form>`;

  detail.querySelectorAll('.file-download').forEach(btn => btn.addEventListener('click', () => {
    downloadOrderFile(btn.dataset.path, btn.dataset.name);
  }));
  detail.querySelectorAll('.attachment-download').forEach(btn => btn.addEventListener('click', () => {
    downloadConversationFile(btn.dataset.path, btn.dataset.name);
  }));

  detail.querySelector('#cancel-order-button')?.addEventListener('click', async () => {
    const ok = confirm(getLang()==='ru'
      ? 'Отменить этот заказ? После отмены его нельзя будет оплатить.'
      : 'Cancel this order? It will no longer be available for payment.');
    if (!ok) return;
    const button = detail.querySelector('#cancel-order-button');
    button.disabled = true;
    const { data, error } = await db.rpc('cancel_my_order', { p_order_id: order.id });
    if (error || data !== true){
      button.disabled = false;
      showToast(error?.message || (getLang()==='ru'?'Не удалось отменить заказ.':'Could not cancel order.'));
      return;
    }
    showToast(getLang()==='ru'?'Заказ отменён':'Order cancelled');
    await loadInbox(order.id);
  });

  detail.querySelector('#order-message-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const body = detail.querySelector('#order-message-body').value.trim();
    const fileInput = detail.querySelector('#order-message-files');
    const filesToSend = Array.from(fileInput?.files || []);
    if (!body && !filesToSend.length) return;
    const button = e.currentTarget.querySelector('button[type="submit"]');
    button.disabled = true;

    const { data: message, error } = await db.from('order_messages').insert({
      order_id: order.id,
      sender_id: session.user.id,
      body: body || (getLang()==='ru' ? '📎 Файлы' : '📎 Files'),
      is_system:false
    }).select().single();

    if (error){ button.disabled=false; showToast(error.message); return; }

    try {
      if (filesToSend.length){
        await uploadConversationFiles({
          files: filesToSend,
          session,
          orderId: order.id,
          orderMessageId: message.id
        });
      }
    } catch (fileError){
      button.disabled=false;
      showToast(fileError.message || String(fileError));
      return;
    }

    await loadInbox(order.id);
  });

  await db.from('notifications')
    .update({read_at:new Date().toISOString()})
    .eq('order_id', order.id)
    .is('read_at', null);

  requestAnimationFrame(() => {
    const thread = detail.querySelector('#chat-thread');
    if (thread) thread.scrollTop = thread.scrollHeight;
  });
}
async function loadInbox(forceOrderId=null){
  const list = document.querySelector('#orders-list');
  if (!list) return;
  const session = await currentSession();
  if (!session) return;

  const { data: orders, error } = await db.from('orders').select('*').order('created_at', {ascending:false});
  if (error){ showToast(error.message); return; }

  const empty = document.querySelector('#empty-inbox');
  if (!orders?.length){
    list.innerHTML = '';
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  const queryId = forceOrderId || new URLSearchParams(location.search).get('order');
  const selected = orders.find(o => o.id === queryId) || orders[0];
  list.innerHTML = orders.map(o => orderCardHtml(o, o.id === selected.id)).join('');
  await renderOrderDetail(selected, session);
  await updateInboxBadge();
}

async function initInbox(){
  if (!document.querySelector('#orders-list')) return;
  const session = await requireAuth('inbox.html');
  if (!session) return;
  document.querySelector('#account-chip').textContent = session.user.email || '';
  await loadInbox();

  db.channel('modryva-inbox-' + session.user.id)
    .on('postgres_changes', {event:'*',schema:'public',table:'orders'}, () => loadInbox())
    .on('postgres_changes', {event:'INSERT',schema:'public',table:'order_messages'}, () => loadInbox())
    .on('postgres_changes', {event:'INSERT',schema:'public',table:'order_files'}, () => loadInbox())
    .on('postgres_changes', {event:'INSERT',schema:'public',table:'attachments'}, () => loadInbox())
    .subscribe();
}

function supportTicketCard(t, active=false, hrefBase='support.html', unread=0){
  return `<a class="order-card compact-card ${active ? 'active' : ''}" href="${hrefBase}?ticket=${encodeURIComponent(t.id)}">
    <div class="order-card-top">
      <div>
        <div class="order-id">${escapeHtml(t.ticket_number)}</div>
        <h2>${escapeHtml(t.subject)}</h2>
      </div>
      ${unread ? '<span class="admin-unread-badge">'+Math.min(unread,99)+'</span>' : ''}
    </div>
    <div class="order-meta"><span>${escapeHtml(t.status)}</span><span>${escapeHtml(formatDate(t.created_at))}</span></div>
  </a>`;
}

async function renderSupportDetail(ticket, session, admin=false){
  const detail = document.querySelector(admin ? '#admin-support-detail' : '#support-detail');
  if (!detail) return;
  const [{ data: messages }, { data: ticketOwner }, { data: attachments }] = await Promise.all([
    db.from('support_messages').select('*').eq('ticket_id', ticket.id).order('created_at'),
    admin ? db.from('profiles').select('email,display_name').eq('id',ticket.user_id).maybeSingle() : Promise.resolve({data:null}),
    db.from('attachments').select('*').eq('ticket_id', ticket.id).order('created_at')
  ]);
  detail.innerHTML = `
    <div class="conversation-head">
      <div><div class="order-id">${escapeHtml(ticket.ticket_number)}</div><h2>${escapeHtml(ticket.subject)}</h2>${admin ? '<div class="admin-customer-email">'+escapeHtml(ticketOwner?.email || '')+'</div>' : ''}</div>
      <span class="status-badge">${escapeHtml(ticket.status)}</span>
    </div>
    <div class="chat-thread">${(messages || []).map(m => {
      const mine = m.sender_id === session.user.id;
      const attached = (attachments || []).filter(a => a.support_message_id === m.id);
      return `<div class="chat-message ${mine ? 'mine':'theirs'}">
        <div class="chat-author">${mine ? (admin ? 'MODRYVA' : (getLang()==='ru'?'Ты':'You')) : (admin ? 'Клиент' : 'MODRYVA')}</div>
        <div class="chat-bubble">${escapeHtml(m.body)}</div>
        ${attached.length ? '<div class="message-files">'+attachmentButtonsHtml(attached)+'</div>' : ''}
        <div class="chat-time">${escapeHtml(formatDate(m.created_at))}</div>
      </div>`;
    }).join('')}</div>
    <form class="chat-form" id="${admin ? 'admin-support-reply' : 'support-reply-form'}">
      <textarea maxlength="10000" placeholder="${admin ? 'Ответ клиенту…' : 'Ответ поддержке…'}"></textarea>
      <div class="chat-send-tools">
        <label class="attach-button">📎 Файлы<input type="file" multiple /></label>
        <span class="file-limit-note">до 50 МБ каждый</span>
        <button class="primary-button" type="submit">Отправить</button>
      </div>
    </form>`;

  detail.querySelectorAll('.attachment-download').forEach(btn => btn.addEventListener('click', () => {
    downloadConversationFile(btn.dataset.path, btn.dataset.name);
  }));

  detail.querySelector('form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const body = e.currentTarget.querySelector('textarea').value.trim();
    const filesToSend = Array.from(e.currentTarget.querySelector('input[type="file"]')?.files || []);
    if (!body && !filesToSend.length) return;
    const button = e.currentTarget.querySelector('button[type="submit"]');
    button.disabled = true;

    const { data: message, error } = await db.from('support_messages').insert({
      ticket_id: ticket.id,
      sender_id: session.user.id,
      body: body || (getLang()==='ru' ? '📎 Файлы' : '📎 Files')
    }).select().single();

    if (error){ button.disabled=false; showToast(error.message); return; }

    try {
      if (filesToSend.length){
        await uploadConversationFiles({
          files: filesToSend,
          session,
          ticketId: ticket.id,
          supportMessageId: message.id
        });
      }
    } catch (fileError){
      button.disabled=false;
      showToast(fileError.message || String(fileError));
      return;
    }

    if (admin) await loadAdminSupport(ticket.id);
    else await loadSupport(ticket.id);
  });
}
async function loadSupport(forceTicketId=null){
  const list = document.querySelector('#support-list');
  if (!list) return;
  const session = await currentSession();
  if (!session) return;
  const { data: tickets, error } = await db.from('support_tickets').select('*').order('created_at',{ascending:false});
  if (error){ showToast(error.message); return; }
  if (!tickets?.length){
    list.innerHTML = '<p class="muted">Обращений пока нет.</p>';
    document.querySelector('#support-detail').innerHTML = '<div class="conversation-placeholder">Создай обращение выше.</div>';
    return;
  }
  const q = forceTicketId || new URLSearchParams(location.search).get('ticket');
  const selected = tickets.find(t => t.id === q) || tickets[0];
  list.innerHTML = tickets.map(t => supportTicketCard(t, t.id===selected.id)).join('');
  await renderSupportDetail(selected, session, false);
}

async function initSupport(){
  const form = document.querySelector('#support-new-form');
  if (!form) return;
  const session = await requireAuth('support.html');
  if (!session) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const subject = String(fd.get('subject') || '').trim();
    const body = String(fd.get('body') || '').trim();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    const { data: ticket, error } = await db.from('support_tickets')
      .insert({user_id:session.user.id,subject,status:'open'})
      .select().single();
    if (error){ button.disabled=false; showToast(error.message); return; }
    const { data: firstSupportMessage, error: supportMessageError } = await db.from('support_messages')
      .insert({ticket_id:ticket.id,sender_id:session.user.id,body})
      .select().single();
    if (supportMessageError){ button.disabled=false; showToast(supportMessageError.message); return; }

    try {
      const newFiles = document.querySelector('#support-new-files')?.files;
      if (newFiles?.length){
        await uploadConversationFiles({
          files:newFiles,
          session,
          ticketId:ticket.id,
          supportMessageId:firstSupportMessage.id
        });
      }
    } catch (fileError){
      button.disabled=false;
      showToast(fileError.message || String(fileError));
      return;
    }

    form.reset();
    button.disabled = false;
    history.replaceState(null,'','support.html?ticket='+encodeURIComponent(ticket.id));
    await loadSupport(ticket.id);
  });

  await loadSupport();
  db.channel('modryva-support-' + session.user.id)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'support_messages'},()=>loadSupport())
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'attachments'},()=>loadSupport())
    .subscribe();
}

async function adminOrderDetail(order, session){
  const detail = document.querySelector('#admin-order-detail');
  if (!detail) return;
  const [{data:messages},{data:files},{data:customerProfile},{data:attachments}] = await Promise.all([
    db.from('order_messages').select('*').eq('order_id',order.id).order('created_at'),
    db.from('order_files').select('*').eq('order_id',order.id).order('created_at',{ascending:false}),
    db.from('profiles').select('email,display_name').eq('id',order.user_id).maybeSingle(),
    db.from('attachments').select('*').eq('order_id',order.id).order('created_at')
  ]);

  detail.innerHTML = `
    <div class="conversation-head">
      <div><div class="order-id">${escapeHtml(order.order_number)}</div><h2>${escapeHtml(order.customer_name || customerProfile?.display_name || 'Client')}</h2><div class="admin-customer-email">${escapeHtml(customerProfile?.email || '')}</div></div>
      <span class="status-badge status-${escapeHtml(order.status)}">${escapeHtml(statusLabel(order.status))}</span>
    </div>
    <div class="detail-meta">
      <span>Minecraft ${escapeHtml(order.minecraft_version || '—')}</span>
      <span>${escapeHtml(order.loader || '—')}</span>
      <span>Сложность: ${escapeHtml(tierLabel(order.tier))}</span>
      <span>${escapeHtml(amountLabel(order))}</span>
      <span>Payment: ${escapeHtml(order.payment_status)}</span>
    </div>
    <div class="admin-control-row">
      <label>Сложность и цена
        <select id="admin-order-tier">
          <option value="unassigned" ${order.tier==='unassigned'?'selected':''}>Не определена</option>
          <option value="easy" ${order.tier==='easy'?'selected':''}>Лёгкий — 1 USDT</option>
          <option value="medium" ${order.tier==='medium'?'selected':''}>Средний — 2 USDT</option>
          <option value="difficult" ${order.tier==='difficult'?'selected':''}>Сложный — 3 USDT</option>
        </select>
      </label>
      <button class="secondary-button" id="admin-save-tier" type="button">Назначить цену</button>
      <label>Статус
        <select id="admin-order-status">
          ${['new','awaiting_payment','paid','in_progress','ready','completed','cancelled','refunded'].map(s=>`<option value="${s}" ${s===order.status?'selected':''}>${statusLabel(s)}</option>`).join('')}
        </select>
      </label>
      <button class="secondary-button" id="admin-save-status" type="button">Сохранить статус</button>
      <button class="danger-button" id="admin-delete-order" type="button">Удалить идею</button>
    </div>
    <div class="files-box">
      <strong>Выдать клиенту .jar</strong>
      <form id="admin-file-form" class="file-upload-form">
        <input type="file" id="admin-jar-file" accept=".jar,application/java-archive" required />
        <button class="secondary-button" type="submit">Загрузить .jar</button>
      </form>
      <div class="files-row">${(files||[]).map(f=>'<span class="file-pill">'+escapeHtml(f.original_name)+'</span>').join('')}</div>
    </div>
    <div class="chat-thread">${(messages||[]).map(m=>{
      const mine=m.sender_id===session.user.id;
      const attached=(attachments||[]).filter(a=>a.order_message_id===m.id);
      return `<div class="chat-message ${mine?'mine':'theirs'}"><div class="chat-author">${mine?'MODRYVA':'Клиент'}</div><div class="chat-bubble">${escapeHtml(m.body)}</div>${attached.length?'<div class="message-files">'+attachmentButtonsHtml(attached)+'</div>':''}<div class="chat-time">${escapeHtml(formatDate(m.created_at))}</div></div>`;
    }).join('')}</div>
    <form class="chat-form" id="admin-order-reply">
      <textarea maxlength="10000" placeholder="Ответ клиенту…"></textarea>
      <div class="chat-send-tools">
        <label class="attach-button">📎 Файлы<input type="file" multiple /></label>
        <span class="file-limit-note">до 50 МБ каждый</span>
        <button class="primary-button" type="submit">Отправить</button>
      </div>
    </form>`;

  detail.querySelectorAll('.attachment-download').forEach(btn => btn.addEventListener('click', () => {
    downloadConversationFile(btn.dataset.path, btn.dataset.name);
  }));

  detail.querySelector('#admin-save-tier')?.addEventListener('click', async () => {
    const tier = detail.querySelector('#admin-order-tier').value;
    const prices = {unassigned:0,easy:100,medium:200,difficult:300};
    const update = {
      tier,
      currency:'USDT',
      amount_minor:prices[tier] ?? 0
    };
    if (tier !== 'unassigned' && order.status === 'new') update.status = 'awaiting_payment';
    const { error } = await db.from('orders').update(update).eq('id',order.id);
    if (error) showToast(error.message);
    else {
      showToast(tier === 'unassigned' ? 'Оценка сброшена' : 'Сложность и цена назначены');
      await loadAdminOrders(order.id);
    }
  });

  detail.querySelector('#admin-delete-order')?.addEventListener('click', async () => {
    const ok = confirm('Удалить эту идею навсегда? Переписка и связанные файлы тоже будут удалены.');
    if (!ok) return;

    const button = detail.querySelector('#admin-delete-order');
    button.disabled = true;

    const [{ data: jarFiles }, { data: attachments }] = await Promise.all([
      db.from('order_files').select('storage_path').eq('order_id', order.id),
      db.from('attachments').select('storage_path').eq('order_id', order.id)
    ]);

    const jarPaths = (jarFiles || []).map(x => x.storage_path).filter(Boolean);
    const attachmentPaths = (attachments || []).map(x => x.storage_path).filter(Boolean);

    if (jarPaths.length){
      const { error: jarRemoveError } = await db.storage.from('order-files').remove(jarPaths);
      if (jarRemoveError){
        button.disabled = false;
        showToast('Не удалось удалить .jar: ' + jarRemoveError.message);
        return;
      }
    }

    if (attachmentPaths.length){
      const { error: attachmentRemoveError } = await db.storage.from('conversation-files').remove(attachmentPaths);
      if (attachmentRemoveError){
        button.disabled = false;
        showToast('Не удалось удалить вложения: ' + attachmentRemoveError.message);
        return;
      }
    }

    const { error } = await db.from('orders').delete().eq('id', order.id);
    if (error){
      button.disabled = false;
      showToast(error.message);
      return;
    }

    showToast('Идея удалена');
    history.replaceState(null,'','admin.html');
    await loadAdminOrders();
  });

  detail.querySelector('#admin-save-status')?.addEventListener('click', async () => {
    const status = detail.querySelector('#admin-order-status').value;
    const { error } = await db.from('orders').update({status}).eq('id',order.id);
    if (error) showToast(error.message);
    else { showToast('Статус обновлён'); await loadAdminOrders(order.id); }
  });

  detail.querySelector('#admin-order-reply')?.addEventListener('submit', async e => {
    e.preventDefault();
    const body=e.currentTarget.querySelector('textarea').value.trim();
    const filesToSend=Array.from(e.currentTarget.querySelector('input[type="file"]')?.files||[]);
    if (!body && !filesToSend.length) return;
    const button=e.currentTarget.querySelector('button[type="submit"]');
    button.disabled=true;
    const {data:message,error}=await db.from('order_messages').insert({
      order_id:order.id,
      sender_id:session.user.id,
      body:body || '📎 Файлы',
      is_system:false
    }).select().single();
    if (error){ button.disabled=false; showToast(error.message); return; }
    try {
      if (filesToSend.length){
        await uploadConversationFiles({files:filesToSend,session,orderId:order.id,orderMessageId:message.id});
      }
    } catch (fileError){
      button.disabled=false;
      showToast(fileError.message || String(fileError));
      return;
    }
    await loadAdminOrders(order.id);
  });

  detail.querySelector('#admin-file-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const file = detail.querySelector('#admin-jar-file').files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.jar')){ showToast('Нужен файл .jar'); return; }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
    const path = order.id + '/' + crypto.randomUUID() + '-' + safeName;
    const button = e.currentTarget.querySelector('button[type="submit"]');
    button.disabled = true;
    const { error: uploadError } = await db.storage.from('order-files').upload(path,file,{contentType:'application/java-archive',upsert:false});
    if (uploadError){ button.disabled=false; showToast(uploadError.message); return; }
    const { error: rowError } = await db.from('order_files').insert({
      order_id:order.id,storage_path:path,original_name:file.name,size_bytes:file.size,uploaded_by:session.user.id
    });
    if (rowError){ button.disabled=false; showToast(rowError.message); return; }
    await db.from('orders').update({status:'ready'}).eq('id',order.id);
    showToast('Файл загружен клиенту');
    await loadAdminOrders(order.id);
  });
}
let adminOrderFilter = 'all';

async function loadAdminOrders(forceId=null){
  const list = document.querySelector('#admin-orders-list');
  if (!list) return;
  const session = await currentSession();
  if (!session) return;

  const { data: orders, error } = await db.from('orders').select('*').order('created_at',{ascending:false});
  if (error){ showToast(error.message); return; }

  const filtered = adminOrderFilter === 'all'
    ? (orders || [])
    : (orders || []).filter(o => o.status === adminOrderFilter);

  document.querySelectorAll('[data-order-filter]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.orderFilter === adminOrderFilter);
    const count = btn.dataset.orderFilter === 'all'
      ? (orders || []).length
      : (orders || []).filter(o=>o.status===btn.dataset.orderFilter).length;
    const counter = btn.querySelector('.filter-count');
    if (counter) counter.textContent = String(count);
  });

  if (!filtered.length){
    list.innerHTML='<p class="muted">В этой категории заказов пока нет.</p>';
    document.querySelector('#admin-order-detail').innerHTML='<div class="conversation-placeholder">Выбери другую категорию.</div>';
    return;
  }

  const q = forceId || new URLSearchParams(location.search).get('order');
  const selected = filtered.find(o=>o.id===q) || filtered[0];

  await db.from('order_messages')
    .update({admin_read_at:new Date().toISOString()})
    .eq('order_id',selected.id)
    .eq('is_system',false)
    .neq('sender_id',session.user.id)
    .is('admin_read_at',null);

  const { data: unreadRows } = await db.from('order_messages')
    .select('order_id,sender_id')
    .eq('is_system',false)
    .is('admin_read_at',null);

  const unreadMap = {};
  (unreadRows || []).forEach(m => {
    if (m.sender_id && m.sender_id !== session.user.id){
      unreadMap[m.order_id] = (unreadMap[m.order_id] || 0) + 1;
    }
  });

  list.innerHTML = filtered.map(o => adminOrderCardHtml(o,o.id===selected.id,unreadMap[o.id]||0)).join('');
  await adminOrderDetail(selected,session);
}


async function loadAdminSupport(forceId=null){
  const list = document.querySelector('#admin-support-list');
  if (!list) return;
  const session = await currentSession();
  if (!session) return;

  const { data:tickets,error } = await db.from('support_tickets').select('*').order('created_at',{ascending:false});
  if (error){ showToast(error.message); return; }
  if (!tickets?.length){
    list.innerHTML='<p class="muted">Обращений пока нет.</p>';
    return;
  }

  const q=forceId || new URLSearchParams(location.search).get('ticket');
  const selected=tickets.find(t=>t.id===q)||tickets[0];

  await db.from('support_messages')
    .update({admin_read_at:new Date().toISOString()})
    .eq('ticket_id',selected.id)
    .neq('sender_id',session.user.id)
    .is('admin_read_at',null);

  const { data: unreadRows } = await db.from('support_messages')
    .select('ticket_id,sender_id')
    .is('admin_read_at',null);

  const unreadMap={};
  (unreadRows||[]).forEach(m=>{
    if(m.sender_id && m.sender_id!==session.user.id){
      unreadMap[m.ticket_id]=(unreadMap[m.ticket_id]||0)+1;
    }
  });

  list.innerHTML=tickets.map(t=>supportTicketCard(t,t.id===selected.id,'admin.html',unreadMap[t.id]||0)).join('');
  await renderSupportDetail(selected,session,true);
}


async function initAdmin(){
  const adminContent = document.querySelector('#admin-content');
  if (!adminContent) return;
  const session = await requireAuth('admin.html');
  if (!session) return;
  if (!isAdminEmail(session.user.email)){
    document.querySelector('#admin-denied').hidden=false;
    return;
  }
  adminContent.hidden=false;

  document.querySelectorAll('[data-admin-tab]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-admin-tab]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const tab=btn.dataset.adminTab;
    document.querySelector('#admin-orders-view').hidden=tab!=='orders';
    document.querySelector('#admin-support-view').hidden=tab!=='support';
  }));

  document.querySelectorAll('[data-order-filter]').forEach(btn => btn.addEventListener('click', async () => {
    adminOrderFilter = btn.dataset.orderFilter || 'all';
    history.replaceState(null,'','admin.html');
    await loadAdminOrders();
  }));

  await Promise.all([loadAdminOrders(),loadAdminSupport()]);
  db.channel('modryva-admin')
    .on('postgres_changes',{event:'*',schema:'public',table:'orders'},()=>loadAdminOrders())
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'order_messages'},()=>loadAdminOrders())
    .on('postgres_changes',{event:'*',schema:'public',table:'support_tickets'},()=>loadAdminSupport())
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'support_messages'},()=>loadAdminSupport())
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'attachments'},()=>{loadAdminOrders();loadAdminSupport();})
    .subscribe();
}

document.addEventListener('DOMContentLoaded', async () => {
  applyLang();
  initLanguageMenu();
  await initHome();
  await initProfile();
  await initAuthCallback();
  await initOrderForm();
  await initInbox();
  await initSupport();
  await initAdmin();
});
