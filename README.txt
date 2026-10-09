Crofton — серверная рабочая версия

Файлы:
- index.html — сайт
- admin.html — админ-панель «Кейсы»
- leads.html — админ-панель «Заявки»
- reviews.html — админ-панель «Отзывы»
- send.php — серверный обработчик заявок для Telegram/VK/Email
- leads_api.php — серверная база/архив заявок
- projects_api.php — серверная база кейсов, отзывов и загрузка изображений
- auth.php — серверная авторизация для админ-панели
- .env — пароли и токены
- .htaccess — защита .env, leads.json, leads_trash.json, projects.json
- projects.json — серверная база кейсов и отзывов
- leads.json — серверная база заявок
- leads_trash.json — серверная корзина заявок
- uploads/projects/ — серверная папка изображений кейсов и аватарок отзывов
- favicon.svg — фавикон сайта. Можно заменить своим файлом с тем же названием.

Админ-панель:
- Верхнее меню: «Кейсы», «Заявки», «Отзывы».
- admin.html: редактирование кейсов и серверная загрузка изображений.
- Изображения проекта отображаются карточками. Поля со ссылками больше нет.
- Чтобы поменять изображения местами: зажмите изображение и перетащите на нужное место.
- Чтобы удалить изображение: наведите на него, нажмите крестик и подтвердите удаление.
- reviews.html: редактирование отзывов, порядка отзывов и аватарок.
- leads.html: заявки, статусы и корзина.

Сайт:
- Кейсы и отзывы подгружаются с сервера через projects_api.php.
- Отзывы прокручиваются по кругу, при наведении прокрутка останавливается, карточка подсвечивается.
- Политика конфиденциальности и условия использования открываются в оверлее.

Отправка заявок:
- Все заявки сохраняются на сервере в leads.json.
- Все заявки отправляются в Telegram как основной канал уведомления.
- Если пользователь выбрал Email или VK, заявка дополнительно дублируется в выбранный канал.

Фавикон:
- В HTML подключён <link rel="icon" href="favicon.svg" type="image/svg+xml">.
- Чтобы заменить иконку, просто положите рядом с index.html файл favicon.svg с нужной графикой.

Важно для установки:
- Всё работает полноценно только на PHP-хостинге/сервере, не при открытии HTML двойным кликом.
- Папка uploads/projects/ должна быть доступна PHP для записи.
- Файлы projects.json, leads.json, leads_trash.json должны быть доступны PHP для записи.
- Если возможно, храните .env вне публичной папки сайта или убедитесь, что .htaccess работает.

HTTPS:
- В .htaccess добавлен 301-редирект с http на https.
- В HTML добавлен Content-Security-Policy: upgrade-insecure-requests.
- В коде нет внешних ссылок http://.
- Важно: на хостинге должен быть установлен SSL-сертификат. Без SSL-сертификата браузер всё равно будет писать, что подключение не защищено.

REG.RU / HTTPS redirect loop:
- Принудительный редирект HTTPS в .htaccess отключён, потому что на REG.RU он может вызывать ERR_TOO_MANY_REDIRECTS, если HTTPS работает через прокси.
- HTTPS лучше включать в панели REG.RU.
- Если браузер запомнил старый 301-редирект, очистите cookies/cache для домена crofton.pro или проверьте в инкогнито.

Security note:
- HTML and .htaccess include CSP: upgrade-insecure-requests; block-all-mixed-content.
- .htaccess also sends HSTS and security headers when mod_headers is enabled.
- If Chrome Security still says "active content with certificate errors" while Console shows chrome-extension://..., test in Incognito with extensions disabled and reset site permissions. That warning can be caused by a browser extension or by a previously allowed certificate-error script, not by the site code.
