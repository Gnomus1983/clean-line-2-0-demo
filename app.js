const phone = '37362047482';
const products = [
  {id:'gallus-color', name:'Гель для стирки Gallus Color 4L, 100 стирок', brand:'Gallus', cat:'Стирка', price:135, old:null, badges:['Хит']},
  {id:'power-white', name:'Гель для стирки Power Wash White 4L', brand:'Power Wash', cat:'Стирка', price:99, old:125, badges:['Скидка']},
  {id:'onyx-color', name:'Гель для стирки ONYX Color 4.64L', brand:'ONYX', cat:'Стирка', price:105, old:null, badges:['Хит','Скидка']},
  {id:'passion-balsam', name:'Passion Gold ополаскиватель Fresh Spring 2L', brand:'Passion Gold', cat:'Стирка', price:79, old:null, badges:[]},
  {id:'gallus-spray', name:'Gallus спрей для кухни и плиты 750 мл', brand:'Gallus', cat:'Уборка', price:65, old:null, badges:['Хит']},
  {id:'passion-stone', name:'Passion Gold от камня и ржавчины 750 мл', brand:'Passion Gold', cat:'Уборка', price:51, old:null, badges:['Хит']},
  {id:'alio-tabs', name:'Alio Classic XXL таблетки для посудомоечной машины 100 шт.', brand:'Alio', cat:'Кухня', price:210, old:null, badges:['Хит']},
  {id:'power-lemon', name:'Power Wash Lemon 5L для посуды', brand:'Power Wash', cat:'Кухня', price:140, old:null, badges:['Хит']},
  {id:'balea-cream', name:'Balea крем для лица и тела 250 мл', brand:'Balea', cat:'Гигиена', price:55, old:null, badges:['Новинка']},
  {id:'truesmile', name:'Truesmile Baking Soda Whitening 100 мл', brand:'Truesmile', cat:'Гигиена', price:35, old:null, badges:['Хит']},
  {id:'forea-men', name:'Forea Men Aqua дезодорант 50 мл', brand:'Forea', cat:'Гигиена', price:28, old:null, badges:['Новинка']},
  {id:'paper-patrice', name:'Patrice Monoroll кухонное полотенце 2 слоя', brand:'Patrice', cat:'Кухня', price:65, old:null, badges:['Хит']}
];

let activeFilter = 'all';
let cart = JSON.parse(localStorage.getItem('cleanline-store-cart') || '[]');
let deferredPrompt = null;

function $(sel){ return document.querySelector(sel); }
function $all(sel){ return [...document.querySelectorAll(sel)]; }
function showToast(text){ const t=$('#toast'); if(!t) return; t.textContent=text; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2200); }
function money(n){ return `${n} Lei`; }
function initials(text){ return text.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase(); }

function productCard(p){
  const badges = p.badges.map(b=>`<span class="badge ${b==='Скидка'?'sale':'hit'}">${b}</span>`).join('');
  return `<article class="product-card">
    <div class="badge-row">${badges}</div>
    <div class="product-media" aria-hidden="true"><span>${initials(p.brand)}</span></div>
    <span class="brand-label">${p.brand} · ${p.cat}</span>
    <h3>${p.name}</h3>
    <div class="price-row"><span class="price">${money(p.price)}</span>${p.old?`<span class="old-price">${money(p.old)}</span>`:''}</div>
    <button class="primary-btn" data-add="${p.id}">Добавить в корзину</button>
  </article>`;
}

function renderProducts(){
  const q = ($('#searchInput')?.value || '').toLowerCase().trim();
  const list = products.filter(p => {
    const byFilter = activeFilter === 'all' || p.cat === activeFilter || p.badges.includes(activeFilter);
    const byQ = !q || `${p.name} ${p.brand} ${p.cat}`.toLowerCase().includes(q);
    return byFilter && byQ;
  });
  $('#productGrid').innerHTML = list.map(productCard).join('') || `<div class="product-card"><h3>Ничего не найдено</h3><p>Попробуйте изменить запрос или выбрать другую категорию.</p></div>`;
}

function updateCart(){
  localStorage.setItem('cleanline-store-cart', JSON.stringify(cart));
  const count = cart.reduce((s,i)=>s+i.qty,0);
  if($('#cartCount')) $('#cartCount').textContent = count;
  const items = cart.map(line=>`<div class="cart-line"><div><b>${line.name}</b><small>${line.qty} × ${money(line.price)}</small></div><button data-remove="${line.id}">убрать</button></div>`).join('');
  if($('#cartItems')) $('#cartItems').innerHTML = items || '<p>Корзина пока пуста. Добавьте товары из каталога.</p>';
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  if($('#cartTotal')) $('#cartTotal').textContent = money(total);
  const lines = cart.map(i=>`- ${i.name} — ${i.qty} шт. × ${i.price} Lei`).join('%0A');
  const orderText = encodeURIComponent(`Здравствуйте! Хочу оформить заказ:%0A${lines}%0AИтого: ${total} Lei`);
  if($('#whatsappOrder')) $('#whatsappOrder').href = `https://wa.me/${phone}?text=${orderText}`;
}

function addProduct(id){
  const p = products.find(x=>x.id===id) || {id, name:id, price:0};
  const existing = cart.find(x=>x.id===id);
  if(existing) existing.qty += 1; else cart.push({...p, qty:1});
  updateCart();
  showToast('Товар добавлен в корзину');
}

function openCart(){
  if(!$('#cartDrawer')) return;
  $('#cartDrawer').classList.add('open');
  $('#overlay')?.classList.add('show');
  $('#cartDrawer').setAttribute('aria-hidden','false');
}
function closeCart(){
  if(!$('#cartDrawer')) return;
  $('#cartDrawer').classList.remove('open');
  $('#overlay')?.classList.remove('show');
  $('#cartDrawer').setAttribute('aria-hidden','true');
}

function saveLead(form, label='Заявка отправлена'){
  const data = Object.fromEntries(new FormData(form).entries());
  const leads = JSON.parse(localStorage.getItem('cleanline-store-leads') || '[]');
  leads.push({...data, date:new Date().toISOString()});
  localStorage.setItem('cleanline-store-leads', JSON.stringify(leads));
  showToast(label);
}

function scrollFilter(filter){
  activeFilter = filter;
  $all('#filterTabs button').forEach(btn=>btn.classList.toggle('active',btn.dataset.filter===filter));
  renderProducts();
}

window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  showToast('Приложение доступно для установки');
});

async function installPwa(){
  if(deferredPrompt){
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  } else {
    showToast('Откройте сайт в Chrome и добавьте его на главный экран');
  }
}

renderProducts();
updateCart();

$('#searchInput')?.addEventListener('input', renderProducts);
$('#filterTabs')?.addEventListener('click', e=>{
  if(e.target.matches('button')){
    activeFilter = e.target.dataset.filter;
    $all('#filterTabs button').forEach(b=>b.classList.toggle('active',b===e.target));
    renderProducts();
  }
});

document.body.addEventListener('click', e=>{
  const add = e.target.closest('[data-add]');
  if(add){ addProduct(add.dataset.add); openCart(); }

  const bundle = e.target.closest('[data-bundle]');
  if(bundle){ addProduct(bundle.dataset.bundle); openCart(); }

  const rem = e.target.closest('[data-remove]');
  if(rem){ cart = cart.filter(i=>i.id!==rem.dataset.remove); updateCart(); }

  const fl = e.target.closest('[data-filter-link]');
  if(fl){ setTimeout(()=>scrollFilter(fl.dataset.filterLink), 60); }

  if(e.target.matches('[data-open-lead]')) $('#leadDialog')?.showModal();
  if(e.target.closest('.dialog-close')) $('#leadDialog')?.close();
});

$('#cartButton')?.addEventListener('click', openCart);
$('#closeCart')?.addEventListener('click', closeCart);
$('#overlay')?.addEventListener('click', closeCart);
$('#b2bForm')?.addEventListener('submit', e=>{ e.preventDefault(); saveLead(e.currentTarget,'Заявка отправлена'); e.currentTarget.reset(); });
$('#leadModalForm')?.addEventListener('submit', e=>{ e.preventDefault(); saveLead(e.currentTarget,'Спасибо! Мы скоро свяжемся с вами'); $('#leadDialog')?.close(); e.currentTarget.reset(); });
$('#installPwaTop')?.addEventListener('click', installPwa);
$('#installPwaPhone')?.addEventListener('click', installPwa);
$('#openAi')?.addEventListener('click', ()=>document.querySelector('#wholesale')?.scrollIntoView({behavior:'smooth'}));

if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
