# Premolex Industries — Project Documentation

> **Complete flow documentation, component-wise, for the Premolex B2B industrial website.**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Application Bootstrap & Configuration](#4-application-bootstrap--configuration)
5. [Routing Architecture](#5-routing-architecture)
6. [Public Site Flow (Component-wise)](#6-public-site-flow-component-wise)
7. [Products Catalog Flow](#7-products-catalog-flow)
8. [Authentication Flow](#8-authentication-flow)
9. [Admin Dashboard Flow](#9-admin-dashboard-flow)
10. [Blog/News Flow](#10-blognews-flow)
11. [Services Layer](#11-services-layer)
12. [Models / Data Types](#12-models--data-types)
13. [Directives](#13-directives)
14. [Environment Configuration](#14-environment-configuration)
15. [Styling & Theming](#15-styling--theming)
16. [How to Run](#16-how-to-run)
17. [Future Backend Integration](#17-future-backend-integration)

---

## 1. Project Overview

Premolex is a **B2B industrial website** for a piping manufacturer (HDPE, PVC, CPVC, UPVC, SWR, Agriculture, and Casing pipes). The application consists of:

- **Public-facing marketing site** — Homepage, About, Products catalog, Project gallery, Contact CTA, and Blog/News section.
- **Admin dashboard** — Password-protected area for managing products, categories, blog posts, and Firebase configuration.
- **Authentication layer** — JWT-based login system that protects the admin routes.

---

## 2. Tech Stack

| Technology | Purpose |
|---|---|
| **Angular 21** | Frontend framework (standalone components, signals, zoneless change detection) |
| **TypeScript 5.9** | Typed JavaScript |
| **Tailwind CSS 3.4** | Utility-first styling |
| **RxJS 7.8** | Reactive programming (Observables, BehaviorSubject) |
| **Angular Router** | Client-side routing with lazy loading |
| **Angular Forms** | Reactive forms for login & contact forms |
| **Angular HTTP Client** | API communication with interceptors |
| **Angular SSR** | Server-side rendering with `@angular/ssr` |
| **Firebase** | Firestore + Storage (configurable via admin settings) |
| **Node.js / Express** | Backend (planned — JWT auth endpoint) |

---

## 3. Project Structure

```
premolex/
├── public/                          # Static assets (favicon)
├── src/
│   ├── environments/
│   │   ├── environment.ts           # Dev API URL
│   │   └── environment.prod.ts      # Prod API URL
│   ├── main.ts                      # Browser bootstrap
│   ├── main.server.ts               # SSR bootstrap
│   ├── server.ts                    # Express SSR server
│   ├── styles.css                   # Global styles (Tailwind + fonts)
│   └── app/
│       ├── app.ts                   # Root standalone component
│       ├── app.html                 # Root template (header/footer shell)
│       ├── app.css                  # Root styles
│       ├── app.config.ts            # App providers (router, http, firebase)
│       ├── app.config.server.ts     # SSR providers
│       ├── app.routes.ts            # Root route definitions
│       ├── app.routes.server.ts     # SSR render modes
│       ├── app.module.ts            # Legacy NgModule (unused, kept for reference)
│       ├── firebase-config.service.ts  # Firebase dynamic config service
│       ├── auth/                    # Authentication layer
│       │   ├── auth.module.ts       # AuthModule (grouping)
│       │   ├── auth.routes.ts       # /login route
│       │   ├── components/login/    # LoginComponent (TS/HTML/CSS)
│       │   ├── guards/auth.guard.ts # AuthGuard (route protection)
│       │   ├── interceptors/auth.interceptor.ts  # JWT attachment
│       │   └── services/auth.service.ts          # AuthService
│       ├── admin/                   # Admin dashboard
│       │   ├── admin.routes.ts      # /admin routes (protected)
│       │   ├── components/          # Layout, sidebar, header, managers, forms
│       │   ├── guards/auth.guard.ts # Re-exports auth guard
│       │   ├── models/              # Product, Category, Blog models
│       │   └── services/            # Product, Category, Blog services
│       ├── admin-components/        # Legacy admin components
│       │   ├── dashboard-overview.component/
│       │   ├── product-form.component/
│       │   ├── category-form.component/
│       │   ├── blog-form.component/
│       │   ├── firebase-config-form.component/
│       │   └── handler-form.component/
│       ├── components/              # Public site components
│       │   ├── top-bar/             # Contact info bar
│       │   ├── header/              # Main navigation header
│       │   ├── footer/              # Site footer
│       │   ├── hero-carousel/       # Homepage hero slider
│       │   ├── corporate-values/    # Mission/Vision/Values cards
│       │   ├── home-about/          # Company history section
│       │   ├── applications-grid/   # Product feature grid
│       │   ├── about/               # About section
│       │   ├── products/            # Featured products section
│       │   ├── project-gallery/     # Portfolio grid
│       │   ├── home-contact-cta/    # Contact/lead form
│       │   ├── home-blog-section/   # Latest news section
│       │   └── blog-card/           # Blog post card
│       ├── products/                # Products catalog
│       │   ├── products.routes.ts   # /Products routes
│       │   ├── components/          # Layout, sidebar, grid, card
│       │   ├── models/              # Product model
│       │   └── services/            # ProductService
│       ├── home/                    # Homepage
│       │   ├── home.ts              # HomeComponent
│       │   ├── home.html            # Homepage template
│       │   └── home.css
│       ├── dashboard/               # Legacy dashboard shell
│       ├── private-pages/           # Placeholder private pages
│       ├── public-pages/            # Placeholder public pages
│       └── directives/
│           └── scroll-animate.directive.ts  # Scroll-triggered animations
```

---

## 4. Application Bootstrap & Configuration

### 4.1 Entry Point (`main.ts`)

```ts
bootstrapApplication(App, appConfig)
```

The app uses **standalone components** with `bootstrapApplication` (no `NgModule` bootstrap).

### 4.2 Root Component (`app.ts`)

The root `App` component:

- Renders the **site shell** (TopBar, Header, Footer) around the `<router-outlet>`.
- **Hides the site chrome on auth pages** (`/login`) via an `isAuthPage` signal that listens to `NavigationEnd` events.
- Uses `provideZonelessChangeDetection()` for performance.

### 4.3 App Config (`app.config.ts`)

Registers all root providers:

| Provider | Purpose |
|---|---|
| `provideRouter(routes)` | Client-side routing |
| `provideClientHydration(withEventReplay())` | SSR hydration |
| `provideZonelessChangeDetection()` | Zoneless change detection |
| `provideHttpClient(withFetch(), withInterceptors([authInterceptor]))` | HTTP client with JWT interceptor |
| `provideFirebaseApp(...)` | Firebase app initialization |
| `provideFirestore(...)` | Firestore database |
| `provideStorage(...)` | Firebase Storage |

### 4.4 SSR Server Routes (`app.routes.server.ts`)

- `/login` → `RenderMode.Server` (dynamic, not pre-rendered)
- `**` → `RenderMode.Prerender` (static pages pre-rendered)

---

## 5. Routing Architecture

### 5.1 Root Routes (`app.routes.ts`)

| Path | Component / Loader | Protected? |
|---|---|---|
| `''` | Redirect → `/Home` | No |
| `Home` | `HomeComponent` | No |
| `about` | `AboutComponent` | No |
| `Products` | Lazy → `PRODUCT_ROUTES` | No |
| `firebaseConections` | `FirebaseConfigFormComponent` | No |
| `login` | Lazy → `AUTH_ROUTES` | No |
| `admin` | Lazy → `ADMIN_ROUTES` | **Yes** (AuthGuard) |

### 5.2 Auth Routes (`auth/auth.routes.ts`)

| Path | Component |
|---|---|
| `''` (i.e. `/login`) | `LoginComponent` |

### 5.3 Admin Routes (`admin/admin.routes.ts`)

All children are wrapped in `AdminLayoutComponent` and protected by `canActivate: [authGuard]`.

| Path | Component |
|---|---|
| `''` | Redirect → `dashboard` |
| `dashboard` | `DashboardOverviewComponent` |
| `categories` | `CategoryManagerComponent` |
| `products` | `ProductManagerComponent` |
| `blogs` | `BlogManagerComponent` |
| `settings` | `FirebaseConfigFormComponent` |

### 5.4 Products Routes (`products/products.routes.ts`)

| Path | Component |
|---|---|
| `''` (i.e. `/Products`) | `ProductLayoutComponent` |

---

## 6. Public Site Flow (Component-wise)

### 6.1 Root Shell (`app.html`)

```
┌─────────────────────────────────────────────┐
│  <app-top-bar>  (contact info bar)          │
│  <app-header>   (main navigation)           │
│  <router-outlet>  (page content)            │
│  <app-footer>   (site footer)               │
└─────────────────────────────────────────────┘
```

> **Note:** On `/login`, the top-bar, header, and footer are hidden for a full-screen auth experience.

### 6.2 Homepage (`home/home.ts` + `home.html`)

The `HomeComponent` composes the following sections **in order**:

| Order | Component | Purpose |
|---|---|---|
| 1 | `<app-hero-carousel>` | Auto-rotating hero slider (3 slides, 5s interval) |
| 2 | `<app-corporate-values>` | Mission / Vision / Values cards (SVG icons) |
| 3 | `<app-home-about>` | Company history + facility image + bullet points |
| 4 | `<app-applications-grid>` | 6 product feature cards (Flexible, Durable, etc.) |
| 5 | **Dashboard Quick Stats** (inline) | 4 stat cards (Years, Products, Partners, ISO) |
| 6 | `<app-about>` | Mission/Vision mini-section |
| 7 | **Performance Overview** (inline) | 4 product stat cards with progress bars |
| 8 | `<app-products>` | 3 featured product cards |
| 9 | `<app-project-gallery>` | 6 project portfolio cards |
| 10 | **Quick Links & Recent Activity** (inline) | 3-column section |
| 11 | `<app-home-contact-cta>` | Lead generation contact form |
| 12 | `<app-home-blog-section>` | **Latest News & Updates** (3 recent posts) |

### 6.3 Component Details

#### `TopBarComponent`
- Displays location, phone, and email contact info.
- Static data in the component.

#### `HeaderComponent`
- Sticky header with scroll shadow effect.
- Desktop nav with dropdown for Products (5 sub-links).
- Mobile hamburger menu with slide-in drawer.
- Uses `PLATFORM_ID` for SSR-safe `window` access.

#### `FooterComponent`
- Quick links, product links, social media icons (SVG).
- Dynamic `currentYear`.

#### `HeroCarouselComponent`
- 3 slides with Unsplash images.
- Auto-plays every 5 seconds via RxJS `timer`.
- Manual navigation resets the timer.

#### `CorporateValuesComponent`
- Receives `@Input() cards: ValueCard[]` from `HomeComponent`.
- Renders Mission, Vision, Values with inline SVG icons.

#### `HomeAboutComponent`
- Company history section with facility image and 4 bullet points.
- Uses `ScrollAnimateDirective` for scroll-triggered animations.

#### `ApplicationsGridComponent`
- 6 feature cards (Flexible, Durable, Chemical-Resistant, Leak-Proof, Lightweight, Environment-Friendly).
- Each with inline SVG icon.

#### `AboutComponent`
- Mission/Vision mini-section with Material Symbols icons.

#### `ProductsComponent`
- 3 featured product cards (HDPE Pressure Pipes, Impact Sprinklers, Inline Drip Laterals).
- Each with image, status badge, and spec list.

#### `ProjectGalleryComponent`
- 6 project cards (Municipal, Mining, Agri, Energy, Waste, Manufacturing).
- Uses `ScrollAnimateDirective`.

#### `HomeContactCTAComponent`
- Reactive contact form (name, email, subject, message).
- Validates required + email format.
- Simulates API submission with 1.5s delay and success message.

#### `HomeBlogSectionComponent`
- Displays the **3 most recently published** blog posts.
- Filters by `status === 'published'`, sorts by `publishedAt` descending.
- "View All News" link at top-right.
- Responsive grid: 1 col (mobile) / 2 col (tablet) / 3 col (desktop).

#### `BlogCardComponent`
- Receives `@Input() post: BlogPost`.
- Shows featured image (or placeholder), publish date (via `date` pipe), title, 2-line clamped excerpt, and "Read More" link.
- Hover: card lifts `translateY(-6px)`, image zooms `scale(1.06)`.

---

## 7. Products Catalog Flow

### 7.1 Route
`/Products` → lazy-loaded `ProductLayoutComponent`.

### 7.2 `ProductLayoutComponent`
- Reads `?category=` query param to filter products.
- Loads categories and products from `ProductService`.
- Computes `filteredProducts` based on selected category.
- Renders:
  - `<app-category-sidebar>` — category list (clicking updates query param)
  - `<app-product-grid>` — grid of product cards
- Opens a specs modal when a product is clicked.

### 7.3 `CategorySidebarComponent`
- Displays category list with "All Products" option.
- Emits category selection.

### 7.4 `ProductGridComponent`
- Receives `@Input() products: Product[]`.
- Emits `viewDetails` when a product card is clicked.

### 7.5 `ProductCardComponent`
- Displays product image, name, subtitle, and category.
- Click triggers `viewDetails` output.

### 7.6 `ProductService` (products/services)
- Mock service returning `Observable<Product[]>` and `Observable<ProductCategory[]>`.
- 7 categories, 16 products with specifications.
- Methods: `getCategories()`, `getProducts()`, `getProductsByCategory()`.

---

## 8. Authentication Flow

### 8.1 Overview

```
User visits /admin
        │
        ▼
┌─────────────────┐
│  AuthGuard      │
│  (canActivate)  │
└────────┬────────┘
         │
    has token?
    /        \
   yes        no
    │          │
    ▼          ▼
 /admin     redirect
 (allowed)  to /login
```

### 8.2 `AuthService` (`auth/services/auth.service.ts`)

| Method | Description |
|---|---|
| `login(credentials)` | POSTs to `${apiUrl}/auth/login`, stores JWT in `localStorage` |
| `logout()` | Clears token, updates state |
| `getToken()` | Returns current JWT or `null` |
| `isAuthenticated()` | Returns `true` if token exists |
| `isLoggedIn$` | `BehaviorSubject<boolean>` Observable — emits auth state instantly |
| `token$` | `BehaviorSubject<string \| null>` Observable — emits current JWT |

**Token storage:** `localStorage` under key `premolex_admin_token`.

### 8.3 `AuthGuard` (`auth/guards/auth.guard.ts`)

- Functional `CanActivateFn`.
- Injects `AuthService` and `Router`.
- If `getToken()` returns a token → allows access.
- Otherwise → returns `router.createUrlTree(['/login'])` (redirect).

### 8.4 `AuthInterceptor` (`auth/interceptors/auth.interceptor.ts`)

- Functional `HttpInterceptorFn`.
- Injects `AuthService`.
- If a token exists, clones the request and adds:
  ```
  Authorization: Bearer <token>
  ```
- Registered in `app.config.ts` via `withInterceptors([authInterceptor])`.

### 8.5 `LoginComponent` (`auth/components/login/`)

**Form:**
- Email (required + email format validator)
- Password (required)

**UI:**
- Dark blue (`#0A2540`) industrial-themed background with orange radial gradients.
- White card, 90% width on mobile, 400px max on desktop.
- Company logo (Premolex "P" mark + wordmark).
- "Forgot Password?" link.
- Loading spinner inside the Login button while pending.
- Error banner for 401 (invalid credentials), network failures, and server errors.

**Flow:**
1. User submits valid form.
2. `AuthService.login()` is called.
3. On success → token stored → navigate to `/admin`.
4. On error → display appropriate error message.

### 8.6 Admin Header Logout

`AdminHeaderComponent.logout()`:
1. Closes profile dropdown.
2. Calls `AuthService.logout()` (clears token).
3. Navigates to `/login`.

---

## 9. Admin Dashboard Flow

### 9.1 `AdminLayoutComponent`

- Wraps all admin pages with:
  - `<app-admin-sidebar>` — navigation (Dashboard, Categories, Products, Blogs, Settings)
  - `<app-admin-header>` — page title + profile/logout dropdown
  - `<router-outlet>` — page content
- Tracks `sidebarCollapsed` and `mobileSidebarOpen` signals.
- Computes page title from current URL.

### 9.2 `AdminSidebarComponent`

- 5 nav items with Material Symbols icons.
- Collapsible on desktop, drawer on mobile.

### 9.3 `AdminHeaderComponent`

- Hamburger toggle (mobile) / collapse toggle (desktop).
- Page title display.
- Profile dropdown with logout button.

### 9.4 `DashboardOverviewComponent`

- Placeholder dashboard overview page.

### 9.5 `CategoryManagerComponent`

- Displays categories as an expandable tree.
- Add / Edit / Delete categories.
- Uses `CategoryService`.

### 9.6 `ProductManagerComponent`

- Table of products with search + status filter.
- Add / Edit / Delete products.
- Uses `ProductService` + `CategoryService`.
- Renders `ProductFormComponent` for add/edit.

### 9.7 `BlogManagerComponent`

- Table of blog posts with search + status filter.
- Add / Edit / Delete posts.
- Uses `BlogService`.
- Renders `BlogFormComponent` for add/edit.

### 9.8 `FirebaseConfigFormComponent`

- Form to configure Firebase credentials (apiKey, authDomain, projectId, etc.).
- Saves config to `localStorage` via `FirebaseConfigService`.
- Connects Firestore + Storage dynamically.

### 9.9 Form Components

| Component | Purpose |
|---|---|
| `CategoryFormComponent` | Add/edit category (name, slug, description, parent) |
| `ProductFormComponent` | Add/edit product (title, slug, description, category, specs, image) |
| `BlogFormComponent` | Add/edit blog post (title, slug, author, content, excerpt, image, status) |

---

## 10. Blog/News Flow

### 10.1 Data Model (`admin/models/blog.model.ts`)

```ts
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  content: string;
  excerpt: string;
  featuredImageUrl: string | null;
  featuredImageName: string | null;
  status: 'published' | 'draft';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### 10.2 `BlogService` (`admin/services/blog.service.ts`)

Mock service mirroring a REST API:

| Method | Maps to |
|---|---|
| `getPosts()` | `GET /api/blog` |
| `getPostById(id)` | `GET /api/blog/:id` |
| `createPost(data)` | `POST /api/blog` |
| `updatePost(id, data)` | `PUT /api/blog/:id` |
| `deletePost(id)` | `DELETE /api/blog/:id` |
| `uploadImage(file)` | `POST /api/blog/upload` |

Seeds 3 posts (2 published, 1 draft).

### 10.3 Homepage Display

`HomeBlogSectionComponent`:
1. Loads all posts via `BlogService.getPosts()`.
2. Filters `status === 'published'`.
3. Sorts by `publishedAt` (newest first).
4. Slices to top 3.
5. Renders `<app-blog-card>` for each.

### 10.4 `BlogCardComponent`

- Featured image (or placeholder icon).
- Publish date via Angular `date` pipe (`mediumDate`).
- Title.
- 2-line clamped excerpt (`-webkit-line-clamp: 2`).
- "Read More" link → `/blog/{slug}`.

---

## 11. Services Layer

| Service | Location | Purpose |
|---|---|---|
| `AuthService` | `auth/services/` | JWT login, token storage, auth state |
| `ProductService` (admin) | `admin/services/` | Admin product CRUD (mock) |
| `CategoryService` | `admin/services/` | Admin category CRUD + tree (mock) |
| `BlogService` | `admin/services/` | Admin blog CRUD + upload (mock) |
| `ProductService` (public) | `products/services/` | Public product catalog (mock) |
| `FirebaseConfigService` | `app/` | Dynamic Firebase config + connection |

All services use `providedIn: 'root'` (singleton).

---

## 12. Models / Data Types

### Admin Models (`admin/models/`)

| Model | Fields |
|---|---|
| `Product` | id, title, slug, shortDescription, categoryId, subcategoryId, imageUrl, imageName, specifications[], status, createdAt, updatedAt |
| `Category` | id, name, slug, description, parentId, createdAt |
| `CategoryTreeNode` | Category + children[] |
| `BlogPost` | id, title, slug, author, content, excerpt, featuredImageUrl, featuredImageName, status, publishedAt, createdAt, updatedAt |

### Public Product Model (`products/models/`)

| Model | Fields |
|---|---|
| `Product` | id (number), name, subtitle, categoryId, category, imageUrl, specifications[] |
| `ProductCategory` | id, name, description |

### Auth Models (`auth/services/auth.service.ts`)

| Model | Fields |
|---|---|
| `LoginCredentials` | email, password |
| `LoginResponse` | token, user? (id, name, email, role) |

---

## 13. Directives

### `ScrollAnimateDirective` (`directives/scroll-animate.directive.ts`)

- Adds `scroll-animate` class to elements.
- Uses `IntersectionObserver` to add `scroll-visible` when the element enters the viewport.
- Used by: `HomeAboutComponent`, `ApplicationsGridComponent`, `ProjectGalleryComponent`, `HomeContactCTAComponent`.

---

## 14. Environment Configuration

### `environments/environment.ts` (Development)

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

### `environments/environment.prod.ts` (Production)

```ts
export const environment = {
  production: true,
  apiUrl: 'https://api.premolex.com/api',
};
```

> **Note:** The `AuthService` uses `environment.apiUrl` to build the login endpoint: `${apiUrl}/auth/login`.

---

## 15. Styling & Theming

### Global Styles (`styles.css`)

- Imports **Inter** font and **Material Symbols Outlined** icons.
- Tailwind base/components/utilities.
- Scroll-animate animation classes.

### Tailwind Config (`tailwind.config.cjs`)

- **Brand colors:**
  - `primary`: `#00236f` (deep blue)
  - `accent`: `#FF6B00` (orange)
  - `background`: `#f8f9fa`
  - `surface`: `#f8f9fa`
- **Custom spacing:** `xs` (8px), `sm` (16px), `md` (24px), `lg` (48px), `xl` (80px), `gutter` (24px), `container-max` (1280px)
- **Custom font sizes:** `headline-xl` (48px), `headline-lg` (32px), `headline-md` (24px), `body-md` (16px), `label-sm` (12px)
- **Plugins:** `@tailwindcss/forms`, `@tailwindcss/container-queries`

### Login Page Theme

- Background: `#0A2540` (deep corporate blue) with orange radial gradients.
- Card: white, rounded, shadow.
- Inputs: blue focus outlines (`#0A2540`).
- Button: `#0A2540` background, white text, spinner on loading.

---

## 16. How to Run

### Prerequisites

- Node.js (v20+)
- npm (v10+)

### Install Dependencies

```bash
cd premolex
npm install
```

### Development Server

```bash
npm start
# or
npx ng serve --configuration development
```

Open: **`http://localhost:4200/`**

### Key URLs

| URL | Page |
|---|---|
| `http://localhost:4200/` | Redirects to `/Home` |
| `http://localhost:4200/Home` | Homepage |
| `http://localhost:4200/Products` | Products catalog |
| `http://localhost:4200/login` | Admin login page |
| `http://localhost:4200/admin` | Admin dashboard (protected) |
| `http://localhost:4200/admin/dashboard` | Admin dashboard overview |
| `http://localhost:4200/admin/categories` | Category manager |
| `http://localhost:4200/admin/products` | Product manager |
| `http://localhost:4200/admin/blogs` | Blog manager |
| `http://localhost:4200/admin/settings` | Firebase settings |

### Production Build

```bash
npm run build
```

---

## 17. Future Backend Integration

The app is structured to easily swap mock services for a real Node.js/Express backend:

| Service | Current (Mock) | Future (REST) |
|---|---|---|
| `AuthService` | Already uses `HttpClient` → `POST /api/auth/login` | ✅ Ready |
| `ProductService` (admin) | In-memory signal | `GET/POST/PUT/DELETE /api/products` |
| `CategoryService` | In-memory signal | `GET/POST/PUT/DELETE /api/categories` |
| `BlogService` | In-memory signal | `GET/POST/PUT/DELETE /api/blog` |
| `ProductService` (public) | `Observable.of()` | `GET /api/products` |

The `AuthInterceptor` automatically attaches the JWT to all outgoing requests, so protected API endpoints will receive the `Authorization: Bearer <token>` header.

---

*Documentation generated for the Premolex Industries B2B industrial website.*