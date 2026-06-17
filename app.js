const phone = '37362047482';
const products = [
  {id:'gallus-color', name:'Гель для стирки Gallus Color 4L, 100 стирок', brand:'Gallus', cat:'Стирка', price:135, old:null, icon:'🧺', badges:['Хит']},
  {id:'power-white', name:'Гель для стирки Power Wash WHITE 4L', brand:'Power Wash', cat:'Стирка', price:99, old:125, icon:'🧺', badges:['Скидка']},
  {id:'onyx-color', name:'Гель для стирки ONYX Color 4,64L', brand:'ONYX', cat:'Стирка', price:105, old:null, icon:'🧴', badges:['Хит','Скидка']},
  {id:'passion-balsam', name:'Passion Gold ополаскиватель 2L Fresh Spring', brand:'Passion Gold', cat:'Стирка', price:79, old:null, icon:'🌸', badges:[]},
  {id:'gallus-spray', name:'Спрей Gallus для кухни и плиты 750 мл', brand:'Gallus', cat:'Уборка', price:65, old:null, icon:'🧽', badges:['Хит']},
  {id:'gallus-stone', name:'Passion Gold жидкость от камня и ржавчины 750 мл', brand:'Passion Gold', cat:'Уборка', price:51, old:null, icon:'🚿', badges:['Хит']},
  {id:'alio-tabs', name:'Alio Classic XXL таблетки для посудомоечной машины 100 шт.', brand:'Alio', cat:'Кухня', price:210, old:null, icon:'🍽️', badges:['Хит']},
  {id:'power-lemon', name:'Power Wash Lemon 5L для посуды', brand:'Power Wash', cat:'Кухня', price:140, old:null, icon:'🍋', badges:['Хит']},
  {id:'balea-cream', name:'Balea крем для лица и тела 250 мл', brand:'Balea', cat:'Гигиена', price:55, old:null, icon:'🧴', badges:['Новинка']},
  {id:'truesmile', name:'Truesmile Baking Soda Whitening 100 мл', brand:'Truesmile', cat:'Гигиена', price:35, old:null, icon:'🪥', badges:['Хит']},
  {id:'forea-men', name:'Дезодорант Forea Men Aqua 50 мл', brand:'Forea', cat:'Гигиена', price:28, old:null, icon:'💧', badges:['Новинка']},
  {id:'paper-patrice', name:'Кухонное полотенце Patrice Monoroll 2 слоя', brand:'Patrice', cat:'Кухня', price:65, old:null, icon:'🧻', badges:['Хит']}
];
let activeFilter = 'all';
let cart = JSON.parse(localStorage.getItem('cleanline-demo-cart') || '[]');
let deferredPrompt = null;

function $(sel){ return document.querySelector(sel); }
function $all(sel){ return [...document.querySelectorAll(sel)]; }

function showToast(text){ const t=$('#toast'); t.textContent=text; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2200); }
function money(n){ return `${n} Lei`; }

function productCard(p){
  const badges = p.badges.map(b=>`<span class="badge ${b==='Скидка'?'sale':'hit'}">${b}</span>`).join('');
  return `<article class="product-card">
    <div class="badge-row">${badges}</div>
    <div class="product-icon" aria-hidden="true">${p.icon}</div>
    <span class="brand-label">${p.brand} · ${p.cat}</span>
    <h3>${p.name}</h3>
    <div class="price-row"><span class="price">${money(p.price)}</span>${p.old?`<span class="old-price">${money(p.old)}</span>`:''}</div>
    <button class="primary-btn" data-add="${p.id}">Добавить в корзину</button>
  </article>`;
}

function renderProducts(){
  const q = ($('#searchInput')?.value || '').toLowerCase().trim();
  let list = products.filter(p => {
    const byFilter = activeFilter === 'all' || p.cat === activeFilter || p.badges.includes(activeFilter);
    const byQ = !q || `${p.name} ${p.brand} ${p.cat}`.toLowerCase().includes(q);
    return byFilter && byQ;
  });
  $('#productGrid').innerHTML = list.map(productCard).join('') || `<div class="product-card"><h3>Ничего не найдено</h3><p>Попробуйте другой бренд или категорию.</p></div>`;
}
function updateCart(){
  localStorage.setItem('cleanline-demo-cart', JSON.stringify(cart));
  $('#cartCount').textContent = cart.reduce((s,i)=>s+i.qty,0);
  const items = cart.map(line=>`<div class="cart-line"><div><b>${line.name}</b><small>${line.qty} × ${money(line.price)}</small></div><button data-remove="${line.id}">убрать</button></div>`).join('');
  $('#cartItems').innerHTML = items || '<p>Корзина пустая. Добавьте товар из каталога.</p>';
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  $('#cartTotal').textContent = money(total);
  const orderText = encodeURIComponent(`Здравствуйте! Хочу оформить заказ CleanLine:%0A${cart.map(i=>`- ${i.name} — ${i.qty} шт. × ${i.price} Lei`).join('%0A')}%0AИтого: ${total} Lei`);
  $('#whatsappOrder').href = `https://wa.me/${phone}?text=${orderText}`;
}
function addProduct(id){
  let p = products.find(x=>x.id===id) || {id, name:id, price:0};
  let existing = cart.find(x=>x.id===id);
  if(existing) existing.qty += 1; else cart.push({...p, qty:1});
  updateCart(); showToast('Товар добавлен в корзину');
}
function openCart(){ $('#cartDrawer').classList.add('open'); $('#overlay').classList.add('show'); $('#cartDrawer').setAttribute('aria-hidden','false'); }
function closeCart(){ $('#cartDrawer').classList.remove('open'); $('#overlay').classList.remove('show'); $('#cartDrawer').setAttribute('aria-hidden','true'); }
function saveLead(form, label='Заявка сохранена'){ const data=Object.fromEntries(new FormData(form).entries()); const leads=JSON.parse(localStorage.getItem('cleanline-demo-leads')||'[]'); leads.push({...data, date:new Date().toISOString()}); localStorage.setItem('cleanline-demo-leads',JSON.stringify(leads)); showToast(label); }
function scrollFilter(filter){ activeFilter=filter; $all('#filterTabs button').forEach(btn=>btn.classList.toggle('active',btn.dataset.filter===filter)); renderProducts(); }

window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt=e; showToast('Приложение можно установить'); });
async function installPwa(){
  if(deferredPrompt){ deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; }
  else showToast('Для установки откройте через HTTPS/Chrome и нажмите “Добавить на главный экран”');
}

renderProducts(); updateCart();
$('#searchInput')?.addEventListener('input', renderProducts);
$('#filterTabs')?.addEventListener('click', e=>{ if(e.target.matches('button')){ activeFilter=e.target.dataset.filter; $all('#filterTabs button').forEach(b=>b.classList.toggle('active',b===e.target)); renderProducts(); }});
document.body.addEventListener('click', e=>{
  const add=e.target.closest('[data-add]'); if(add){ addProduct(add.dataset.add); openCart(); }
  const bundle=e.target.closest('[data-bundle]'); if(bundle){ addProduct(bundle.dataset.bundle); openCart(); }
  const rem=e.target.closest('[data-remove]'); if(rem){ cart=cart.filter(i=>i.id!==rem.dataset.remove); updateCart(); }
  const fl=e.target.closest('[data-filter-link]'); if(fl){ setTimeout(()=>scrollFilter(fl.dataset.filterLink), 80); }
  if(e.target.matches('[data-open-lead]')) $('#leadDialog').showModal();
});
$('#cartButton').addEventListener('click', openCart); $('#closeCart').addEventListener('click', closeCart); $('#overlay').addEventListener('click', closeCart);
$('#b2bForm').addEventListener('submit', e=>{ e.preventDefault(); saveLead(e.currentTarget,'B2B заявка сохранена'); e.currentTarget.reset(); });
$('#leadModalForm').addEventListener('submit', e=>{ e.preventDefault(); saveLead(e.currentTarget,'Заявка сохранена в демо-CRM'); $('#leadDialog').close(); e.currentTarget.reset(); });
$('#installPwaTop').addEventListener('click', installPwa); $('#installPwaPhone').addEventListener('click', installPwa);
$('#openAi').addEventListener('click', ()=>document.querySelector('.ai-block').scrollIntoView({behavior:'smooth'}));
$all('.quick-questions button').forEach(btn=>btn.addEventListener('click',()=>{
  const q=btn.dataset.q; const box=$('#chatDemo');
  const answers={
    'Для белого белья':'Для белого белья можно предложить Power Wash WHITE 4L или Gallus Weiss. Добавить в корзину?',
    'Чем убрать жир на кухне':'Для кухни подойдёт спрей Gallus для плиты 750 мл и набор “Кухня без жира”.',
    'Оптовый прайс':'Для оптового прайса оставьте телефон и тип бизнеса. Заявка уйдёт менеджеру в CRM.'
  };
  const user=document.createElement('div'); user.className='msg user'; user.textContent=q;
  const bot=document.createElement('div'); bot.className='msg bot'; bot.textContent=answers[q]||'Подберу товар и оформлю заявку.';
  box.insertBefore(user, box.querySelector('.quick-questions')); box.insertBefore(bot, box.querySelector('.quick-questions'));
}));
if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{})); }
