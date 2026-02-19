# Сайт веб-студии на Angular

**Год:** 2025

## 📋 Описание проекта

**IT Storm** — корпоративный сайт веб-студии, разработанный на Angular. Сайт представляет услуги компании в области веб-разработки, SMM-продвижения, рекламы и копирайтинга.

### 🎯 Основной функционал

- **Главная страница** с интерактивной каруселью промо-акций и предложений
- **Каталог услуг** с описанием и ценами:
  - Создание сайтов
  - Продвижение в социальных сетях
  - Реклама
  - Копирайтинг
- **Блог** с системой фильтрации статей по категориям и пагинацией
- **Детальные страницы статей** с возможностью комментирования
- **Система комментариев** с лайками, дизлайками и жалобами на спам
- **Формы заявок** на услуги с валидацией
- **Авторизация и регистрация** пользователей
- **Адаптивный дизайн** для всех устройств (десктоп, планшет, мобильные)

### ✨ Особенности реализации

- **SPA архитектура** с lazy loading модулей
- **Реактивное программирование** с использованием RxJS
- **Интерсепторы** для автоматической авторизации запросов
- **Сервисы** для управления состоянием и данными
- **Адаптивная верстка** с использованием SCSS миксинов и медиа-запросов
- **Бургер-меню** для мобильных устройств
- **Карусели** для отображения промо-акций и отзывов
- **Модальные окна** для форм заявок
- **Валидация форм** с отображением ошибок
- **Наблюдатель прокрутки** для отслеживания активных секций страницы

### 📱 Адаптивность

Проект полностью адаптирован для различных размеров экранов:
- **Десктоп** (≥1240px)
- **Планшеты** (768px - 1239px)
- **Мобильные устройства** (≤767px)

Используются брейкпоинты:
- `xl`: 1240px
- `lg`: 992px
- `md`: 768px
- `sm`: 576px
- `xs`: 375px

## 💻 Используемые технологии

### Frontend
- **Angular 14** - основной фреймворк
- **TypeScript** - язык программирования
- **SCSS** - препроцессор стилей с использованием:
  - Переменных для цветов и размеров
  - Миксинов для медиа-запросов и типографики
  - Модульной структуры стилей
- **RxJS 7.4** - управление состоянием и асинхронными операциями
- **Angular Material** - UI компоненты
- **ngx-owl-carousel-o** - карусели для промо-акций и отзывов
- **Angular Forms** - реактивные формы с валидацией
- **Angular Router** - маршрутизация с lazy loading

### Backend & Tools
- **REST API** - взаимодействие с backend
- **MongoDB** - база данных
- **Postman** - тестирование API
- **Swagger** - документация API

### 🔐 Аутентификация
- Страница авторизации и регистрации пользователя
- Валидация ввода данных
- HTTP интерсептор для автоматической авторизации запросов
- Хранение токенов в localStorage
- Защищенные маршруты

### 🎨 Дизайн
- Верстка по макету из Figma
- Адаптивный дизайн для всех устройств
- Современный UI/UX
- Кастомные компоненты и стили


## 🚀 Запуск проекта

### Требования
- Node.js (версия 14 или выше)
- npm или yarn
- Angular CLI 14.2.13

### Установка зависимостей
```bash
cd frontend
npm install
```

### Запуск development сервера
```bash
npm start
# или
ng serve
```

Приложение будет доступно по адресу `http://localhost:4200/`

### Сборка для production
```bash
npm run build
```

### Запуск тестов
```bash
npm test
```

## 🏗️ Архитектура проекта

Проект следует принципам модульной архитектуры Angular:

- **Core модуль** - содержит сервисы аутентификации и HTTP интерсепторы
- **Shared модуль** - переиспользуемые компоненты, директивы и сервисы
- **Feature модули** (Blog, User) - функциональные модули с lazy loading
- **Views** - компоненты страниц и представлений
- **Services** - бизнес-логика и работа с API
- **Types** - TypeScript интерфейсы и типы данных

### Основные компоненты:

- **LayoutComponent** - основной layout с header и footer
- **MainComponent** - главная страница с каруселью, услугами, отзывами
- **ArticlesComponent** - список статей блога с фильтрацией
- **DetailComponent** - детальная страница статьи с комментариями
- **LoginComponent / SignupComponent** - страницы авторизации
- **ArticleCardComponent** - карточка статьи
- **CommentCardComponent** - карточка комментария

### Сервисы:

- **AuthService** - управление аутентификацией
- **ArticlesService** - работа со статьями блога
- **CommentsService** - управление комментариями
- **OrderService** - обработка заявок на услуги
- **UserService** - работа с данными пользователя
- **ScrollObserverService** - отслеживание прокрутки страницы

## 📁 Структура папок в проекте:

```
it-storm
├───.idea
├───backend
└───frontend
      │   .browserslistrc
      │   .editorconfig
      │   .gitignore
      │   angular.json
      │   karma.conf.js
      │   package-lock.json
      │   package.json
      │   README.md
      │   tsconfig.app.json
      │   tsconfig.json
      │   tsconfig.spec.json
      └───src
      │   favicon.ico
      │   index.html
      │   main.ts
      │   polyfills.ts
      │   test.ts
      │
      ├───app
      │   │   app-routing.module.ts
      │   │   app.component.html
      │   │   app.component.scss
      │   │   app.component.spec.ts
      │   │   app.component.ts
      │   │   app.module.ts
      │   │
      │   ├───core
      │   │   └───auth
      │   │           auth.interceptor.ts
      │   │           auth.service.ts
      │   │
      │   ├───shared
      │   │   │   shared.module.ts
      │   │   │
      │   │   ├───components
      │   │   │   ├───article-card
      │   │   │   │       article-card.component.html
      │   │   │   │       article-card.component.scss
      │   │   │   │       article-card.component.ts
      │   │   │   │
      │   │   │   ├───comment-card
      │   │   │   │       comment-card.component.html
      │   │   │   │       comment-card.component.scss
      │   │   │   │       comment-card.component.ts
      │   │   │   │
      │   │   │   └───loader
      │   │   │           loader.component.html
      │   │   │           loader.component.scss
      │   │   │           loader.component.ts
      │   │   │
      │   │   ├───directives
      │   │   │       password-repeat.directive.ts
      │   │   │
      │   │   ├───layout
      │   │   │   │   layout.component.html
      │   │   │   │   layout.component.ts
      │   │   │   │
      │   │   │   ├───footer
      │   │   │   │       footer.component.html
      │   │   │   │       footer.component.scss
      │   │   │   │       footer.component.ts
      │   │   │   │
      │   │   │   └───header
      │   │   │           header.component.html
      │   │   │           header.component.scss
      │   │   │           header.component.ts
      │   │   │
      │   │   └───services
      │   │           articles.service.ts
      │   │           category.service.ts
      │   │           comments.service.ts
      │   │           loader.service.ts
      │   │           order.service.ts
      │   │           scroll-observer.service.ts
      │   │           user.service.ts
      │   │
      │   └───views
      │       ├───blog
      │       │   │   blog-routing.module.ts
      │       │   │   blog.module.ts
      │       │   │
      │       │   ├───articles
      │       │   │       articles.component.html
      │       │   │       articles.component.scss
      │       │   │       articles.component.ts
      │       │   │
      │       │   └───detail
      │       │           detail.component.html
      │       │           detail.component.scss
      │       │           detail.component.ts
      │       │
      │       ├───main
      │       │       main.component.html
      │       │       main.component.scss
      │       │       main.component.ts
      │       │       
      │       └───user
      │           │   user-routing.module.ts
      │           │   user.module.ts
      │           │
      │           ├───agree
      │           │       agree.component.html
      │           │       agree.component.scss
      │           │       agree.component.ts
      │           │
      │           ├───login
      │           │       login.component.html
      │           │       login.component.scss
      │           │       login.component.ts
      │           │
      │           └───signup
      │                   signup.component.html
      │                   signup.component.scss
      │                   signup.component.ts
      │
      ├───assets
      │   │   .gitkeep
      │   │
      │   ├───fonts
      │   │
      │   ├───images
      │   │   │   logo.png
      │   │   │
      │   │   ├───blog
      │   │   │
      │   │   ├───page
      │   │   │
      │   │   ├───reviews
      │   │   │
      │   │   └───services
      │   │
      │   └───styles
      │           styles.scss
      │           _auth-form.scss
      │           _fonts.scss
      │           _global.scss
      │           _mixins.scss
      │           _variables.scss
      │
      ├───environments
      │       environment.prod.ts
      │       environment.ts
      │
      └───types
            active-params.type.ts
            addComment.ts
            article.type.ts
            category.type.ts
            comments-params.type.ts
            comments.type.ts
            default-response.type.ts
            login-response.type.ts
            order.type.ts
            popular-articles.type.ts
            user-info.type.ts
    