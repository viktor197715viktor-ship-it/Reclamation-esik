from pathlib import Path

p = Path("index.html")
s = p.read_text()

def replace(old, new):
    global s
    if old not in s:
        print("Не найден фрагмент:", old[:50])
        return
    s = s.replace(old, new, 1)

replace(
    '<input id="regPass" type="password" placeholder="Пароль">',
    '''<input id="regPass" type="password" placeholder="Пароль">
   <input id="regPhone" placeholder="WhatsApp (необязательно)">
   <textarea id="regBio" placeholder="Описание магазина"></textarea>'''
)

replace(
    'users.push({name,pass,role});',
    'users.push({name,pass,role,phone:regPhone.value.trim(),bio:regBio.value.trim()});'
)

replace(
    'current={name,role};save();',
    'current={name,role,phone:regPhone.value.trim(),bio:regBio.value.trim()};save();'
)

replace(
    'current={name:u.name,role:u.role};save();',
    'current={name:u.name,role:u.role,phone:u.phone||"",bio:u.bio||""};save();'
)

replace(
    'function contact(owner){',
    '''function sellerProfile(owner){
 let name=decodeURIComponent(owner);
 let u=users.find(x=>x.name===name);
 if(!u)return alert('Профиль не найден');
 alert('Продавец: '+u.name+'\\nОписание: '+(u.bio||'Не указано')+'\\nWhatsApp: '+(u.phone||'Не указан'));
}
function contact(owner){'''
)

replace(
    "let name=decodeURIComponent(owner);\n alert('Продавец: '+name+'. Свяжитесь с ним через указанный им контакт вне приложения.');",
    """let name=decodeURIComponent(owner);
 let u=users.find(x=>x.name===name);
 if(!u||!u.phone)return alert('WhatsApp не указан');
 let number=u.phone.replace(/[^0-9]/g,'');
 if(number.length<10)return alert('Проверьте номер');
 window.open('https://wa.me/'+number,'_blank');"""
)

replace(
    '<button onclick="contact(\'${encodeURIComponent(a.owner)}\')">Связаться</button>',
    '''<button onclick="sellerProfile('${encodeURIComponent(a.owner)}')">Профиль продавца</button>
 <button onclick="contact('${encodeURIComponent(a.owner)}')">WhatsApp</button>'''
)

p.write_text(s)
Path("www/index.html").write_text(s)
print("Готово! Изменения сохранены.")
