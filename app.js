
let users=JSON.parse(localStorage.users||'[]');
let ads=JSON.parse(localStorage.ads||'[]');
let reports=JSON.parse(localStorage.reports||'[]');
let current=JSON.parse(localStorage.current||'null');
let photoData='';

function save(){
 localStorage.users=JSON.stringify(users);
 localStorage.ads=JSON.stringify(ads);
 localStorage.reports=JSON.stringify(reports);
 localStorage.current=JSON.stringify(current);
}
function showPage(id,btn){
 document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
 document.getElementById(id).classList.add('active');
 document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));
 if(btn)btn.classList.add('active');
 if(id==='home')renderAds();
 if(id==='seller')renderSeller();
 if(id==='reports')renderReports();
 if(id==='account')renderProfile();
}
function register(){
 let name=regName.value.trim(),pass=regPass.value,role=regRole.value;
 if(!name||!pass)return alert('Заполни все поля');
 if(users.some(u=>u.name===name))return alert('Такой аккаунт уже существует');
 users.push({name,pass,role,phone:regPhone.value.trim(),bio:regBio.value.trim()});
 current={name,role,phone:regPhone.value.trim(),bio:regBio.value.trim()};save();renderProfile();alert('Аккаунт создан!');
}
function login(){
 let name=loginName.value.trim(),pass=loginPass.value;
 let u=users.find(x=>x.name===name&&x.pass===pass);
 if(!u)return alert('Неверное имя или пароль');
 current={name:u.name,role:u.role,phone:u.phone||"",bio:u.bio||""};save();renderProfile();alert('Вы вошли!');
}
function logout(){current=null;save();renderProfile();showPage('home')}
function renderProfile(){
 auth.classList.toggle('hidden',!!current);
 profile.classList.toggle('hidden',!current);
 if(current)profile.innerHTML=`<h3>${esc(current.name)}</h3><p>Тип аккаунта: ${esc(current.role)}</p><button onclick="logout()">Выйти</button>`;
}
function renderAds(){
 let q=search.value.toLowerCase(),c=category.value;
 let list=ads.filter(a=>a.status!=='removed'&&a.title.toLowerCase().includes(q)&&(!c||a.category===c));
 document.getElementById('ads').innerHTML=list.length?list.map(adCard).join(''):'<p class="muted">Объявлений пока нет.</p>';
}
function adCard(a){
 return `<div class="card">${a.photo?`<img src="${a.photo}">`:''}
 <h3>${esc(a.title)}</h3><div class="price">${Number(a.price).toLocaleString('ru-RU')} ₸</div>
 <p>${esc(a.description)}</p><p class="muted">${esc(a.category)} · Продавец: ${esc(a.owner)}</p>
 <button onclick="sellerProfile('${encodeURIComponent(a.owner)}')">Профиль продавца</button>
 <button onclick="contact('${encodeURIComponent(a.owner)}')">WhatsApp</button>
 <button onclick="complain(${a.id})">Пожаловаться</button></div>`;
}
function sellerProfile(owner){
 let name=decodeURIComponent(owner);
 let u=users.find(x=>x.name===name);
 if(!u)return alert('Профиль не найден');

 let number=(u.phone||'').replace(/[^0-9]/g,'');
 let sellerAds=ads.filter(a=>a.owner===name&&a.status!=='removed');

 let modal=document.createElement('div');
 modal.className='seller-modal';
 modal.style='position:fixed;inset:0;background:#000c;z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto;';
 modal.innerHTML=`
 <div style="background:#171717;color:white;border:1px solid #e32636;border-radius:16px;padding:20px;width:100%;max-width:420px;max-height:90vh;overflow:auto;">
 <h2 style="color:#e32636">Профиль продавца</h2>
 <h3>${esc(u.name)}</h3>
 <p>${esc(u.bio||'Описание не указано')}</p>
 <p>Объявлений: ${sellerAds.length}</p>
 ${number.length>=10?`<a href="https://wa.me/${number}" target="_blank" style="display:block;background:#e32636;color:white;text-align:center;padding:12px;border-radius:9px;text-decoration:none;">Написать в WhatsApp</a>`:'<p>WhatsApp не указан</p>'}
 <h3>Объявления продавца</h3>
 ${sellerAds.length?sellerAds.map(a=>`<div style="border-top:1px solid #444;padding:10px 0"><b>${esc(a.title)}</b><p>${Number(a.price).toLocaleString('ru-RU')} ₸</p></div>`).join(''):'<p>Объявлений пока нет</p>'}
 <button onclick="this.closest('.seller-modal').remove()" style="width:100%;margin-top:12px;">Закрыть</button>
 </div>`;
 document.body.appendChild(modal);
}
function contact(owner){
 let name=decodeURIComponent(owner);
 let u=users.find(x=>x.name===name);
 if(!u||!u.phone)return alert('WhatsApp не указан');
 let number=u.phone.replace(/[^0-9]/g,'');
 if(number.length<10)return alert('Проверьте номер');
 window.open('https://wa.me/'+number,'_blank');
}
function complain(id){
 if(!current)return alert('Сначала войдите в аккаунт');
 let reason=prompt('Причина жалобы:');
 if(!reason)return;
 reports.push({id,by:current.name,reason,status:'Новая'});
 save();alert('Жалоба отправлена');renderAds();
}
function addAd(){
 if(!current)return alert('Сначала войдите в аккаунт');
 if(current.role!=='seller')return alert('Для размещения объявлений нужен аккаунт продавца');
 let t=title.value.trim(),p=Number(price.value),d=description.value.trim();
 if(!t||!p||p<0||!d)return alert('Заполни название, цену и описание');
 ads.unshift({id:Date.now(),title:t,price:p,description:d,category:newCategory.value,photo:photoData,owner:current.name,status:'active'});
 save();title.value='';price.value='';description.value='';photo.value='';photoData='';
 alert('Объявление добавлено!');showPage('home');
}
photo.addEventListener('change',()=>{
 let f=photo.files[0];if(!f)return;
 if(f.size>1200000){alert('Выбери фото размером до 1,2 МБ');photo.value='';return}
 let r=new FileReader();r.onload=()=>photoData=r.result;r.readAsDataURL(f);
});
function renderSeller(){
 if(!current){sellerInfo.innerHTML='Войди в аккаунт.';myAds.innerHTML='';return}
 sellerInfo.innerHTML=`<h3>${esc(current.name)}</h3><p>Роль: ${esc(current.role)}</p>`;
 let mine=ads.filter(a=>a.owner===current.name);
 myAds.innerHTML=mine.length?mine.map(a=>`<div class="card"><b>${esc(a.title)}</b><p>${Number(a.price).toLocaleString('ru-RU')} ₸</p><button onclick="removeAd(${a.id})">Удалить объявление</button></div>`).join(''):'<p class="muted">У тебя пока нет объявлений.</p>';
}
function removeAd(id){
 if(!confirm('Удалить объявление?'))return;
 ads=ads.filter(a=>a.id!==id);save();renderSeller();
}
function renderReports(){
 if(!current||current.role!=='admin'){reportList.innerHTML='<p class="muted">Раздел модерации доступен только аккаунту администратора в этой демо-версии.</p>';return}
 reportList.innerHTML=reports.length?reports.map(r=>{
 let a=ads.find(x=>x.id===r.id);
 return `<div class="card"><b>${a?esc(a.title):'Объявление удалено'}</b><p>Жалоба от: ${esc(r.by)}</p><p>Причина: ${esc(r.reason)}</p><p>Статус: ${esc(r.status)}</p>${a?`<button onclick="removeAd(${a.id});renderReports()">Удалить объявление</button>`:''}<button onclick="resolveReport(${r.id})">Закрыть жалобу</button></div>`;
 }).join(''):'<p class="muted">Жалоб пока нет.</p>';
}
function resolveReport(id){
 let r=reports.find(x=>x.id===id);if(r)r.status='Рассмотрена';save();renderReports();
}
function esc(s){
 return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
renderAds();renderProfile();
