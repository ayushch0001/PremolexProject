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
11. [Firebase Dynamic Integration](#11-firebase-dynamic-integration)
12. [Services Layer](#12-services-layer)
13. [Models / Data Types](#13-models--data-types)
14. [Directives](#14-directives)
15. [Environment Configuration](#15-environment-configuration)
16. [Styling & Theming](#16-styling--theming)
17. [How to Run](#17-how-to-run)
18. [Future Backend Integration](#18-future-backend-integration)

---

## 1. Project Overview

Premolex is a **B2B industrial website** for a piping manufacturer (HDPE, PVC, CPVC, UPVC, SWR, Agriculture, and Casing pipes). The application consists of:

- **Public-facing marketing site** — Homepage, About, Products catalog, Quality, Infrastructure, Certificates, Careers, Project gallery, Contact CTA, and Blog/News section.
- **Admin dashboard** — Password-protected area for managing products, categories, blog posts, corporate pages (Quality/Infrastructure), certificates, careers, and Firebase configuration.
- **Authentication layer** — JWT-based login system that protects the admin routes (uses the Firebase Identity Toolkit REST API).
- **Firebase integration** — Firebase is initialized from hardcoded credentials in the environment files; data access uses the tested Firebase REST APIs (Firestore v1, Storage v1, Identity Toolkit).

---

## 2. Tech Stack

| Technology | Purpose |
|---|---|
| **Angular 21** | Frontend framework (standalone components, signals, zoneless change detection) |
| **TypeScript 5.9** | Typed JavaScript |
| **Tailwind CSS 3.4** | Utility-first styling |
| **RxJS 7.8** | Reactive programming (Observables, BehaviorSubject) |
| **Angular Router** | Client-side routing with lazy loading |
| **Angular Forms** | Reactive forms for login, contact, and admin CRUD forms |
| **Angular HTTP Client** | API communication with interceptors |
| **Angular SSR** | Server-side rendering with `@angular/ssr` |
| **Firebase JS SDK** | Firestore + Storage + Auth (initialized from hardcoded env config via `FirebaseDynamicService`) |
| **Firebase REST APIs** | Identity Toolkit (`signInWithPassword`), Firestore v1, Storage v1 (tested endpoints) |
| **Node.js / Express** | Backend (planned — JWT auth endpoint) |

> **Note:** The app uses the **standard Firebase JS Web SDK** (`firebase/app`, `firebase/firestore`, `firebase/storage`, `firebase/auth`) directly instead of `@angular/fire`. Firebase credentials are **hardcoded in the environment files** (public keys). Data access uses the **Firebase REST APIs** (Firestore v1, Storage v1, Identity Toolkit) which were validated with the tested Postman collection.

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
│       ├── app.config.ts            # App providers (router, http)
│       ├── app.config.server.ts     # SSR providers
│       ├── app.routes.ts            # Root route definitions
│       ├── app.routes.server.ts     # SSR render modes
│       ├── app.module.ts            # Legacy NgModule (unused, kept for reference)
│       ├── firebase-config.service.ts   # Legacy Firebase config service
│       ├── firebase-dynamic.service.ts  # Dynamic Firebase init from localStorage
│       ├── services/                # Firestore data layer
│       │   └── firestore-data.service.ts  # Real Firestore CRUD (products, blogs, pages, certs, careers)
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
│       │   │   ├── admin-layout/    # Admin shell (sidebar + header + outlet)
│       │   │   ├── admin-sidebar/   # 8-item navigation
│       │   │   ├── admin-header/    # Page title + profile/logout
│       │   │   ├── category-manager/    # Category tree CRUD
│       │   │   ├── category-form/       # Add/edit category form
│       │   │   ├── product-manager/     # Product table CRUD
│       │   │   ├── product-form/        # Add/edit product form
│       │   │   ├── blog-manager/        # Blog table CRUD
│       │   │   ├── blog-form/           # Add/edit blog form
│       │   │   ├── corporate-pages-manager/  # Quality/Infrastructure page editor
│       │   │   ├── certificate-manager/      # Certificates CRUD (Firestore)
│       │   │   └── careers-manager/          # Job postings CRUD (Firestore)
│       │   ├── guards/auth.guard.ts # Re-exports auth guard
│       │   ├── models/              # Product, Category, Blog models
│       │   └── services/            # Product, Category, Blog services (mock)
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
│       │   ├── hero-slider/         # Alternate hero slider
│       │   ├── corporate-values/    # Mission/Vision/Values cards
│       │   ├── home-about/          # Company history section
│       │   ├── applications-grid/   # Product feature grid
│       │   ├── about/               # About section
│       │   ├── products/            # Featured products section
│       │   ├── project-gallery/     # Portfolio grid
│       │   ├── home-contact-cta/    # Contact/lead form
│       │   ├── home-blog-section/   # Latest news section
│       │   ├── blog-card/           # Blog post card
│       │   ├── quality/             # Quality page (Firestore-driven)
│       │   ├── infrastructure/      # Infrastructure page (Firestore-driven)
│       │   ├── certificates/        # Certificates page (Firestore-driven)
│       │   ├── careers/             # Careers page (Firestore-driven)
│       │   └── firebase-setup/      # Firebase credential setup page
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
| `provideBrowserGlobalErrorListeners()` | Global browser error listeners |
| `provideRouter(routes)` | Client-side routing |
| `provideClientHydration(withEventReplay())` | SSR hydration |
| `provideZonelessChangeDetection()` | Zoneless change detection |
| `provideHttpClient(withFetch(), withInterceptors([authInterceptor]))` | HTTP client with JWT interceptor |

> **Note:** Firebase is **not** initialized via `@angular/fire` providers (`provideFirebaseApp`, `provideFirestore`, `provideStorage`). Instead, it is initialized at runtime by `FirebaseDynamicService` using the **hardcoded credentials from `environment.firebaseConfig`** (an optional `localStorage` override is still supported for legacy setup-page compatibility).

### 4.4 SSR Server Routes (`app.routes.server.ts`)

| Path | Render Mode |
|---|---|
| `/login` | `RenderMode.Server` (dynamic, not pre-rendered) |
| `/firebase-setup` | `RenderMode.Server` (dynamic, not pre-rendered) |
| `**` | `RenderMode.Prerender` (static pages pre-rendered) |

---

## 5. Routing Architecture

### 5.1 Root Routes (`app.routes.ts`)

| Path | Component / Loader | Protected? |
|---|---|---|
| `''` | Redirect → `/Home` | No |
| `Home` | `HomeComponent` | No |
| `about` | `AboutComponent` | No |
| `Products` | Lazy → `PRODUCT_ROUTES` | No |
| `firebaseConections` | `FirebaseConfigFormComponent` (legacy) | No |
| `firebase-setup` | `FirebaseSetupComponent` | No |
| `quality` | `QualityComponent` | No |
| `infrastructure` | `InfrastructureComponent` | No |
| `certificates` | `CertificatesComponent` | No |
| `careers` | `CareersComponent` | No |
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
| `pages` | `CorporatePagesManagerComponent` |
| `certificates` | `CertificateManagerComponent` |
| `careers` | `CareersManagerComponent` |
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
- Nav items: **Home, About Us, Products (dropdown), Quality, Infrastructure, Certificate, Career, Contact Us**.
- Mobile hamburger menu with slide-in drawer.
- Uses `PLATFORM_ID` for SSR-safe `window` access.

#### `FooterComponent`
- Quick links, product links, social media icons (SVG).
- Dynamic `currentYear`.

#### `HeroCarouselComponent`
- 3 slides with Unsplash images.
- Auto-plays every 5 seconds via RxJS `timer`.
- Manual navigation resets the timer.

#### `HeroSliderComponent`
- Alternate hero slider component (available for use).

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

#### `QualityComponent` (NEW)
- Route: `/quality`.
- Loads page content from Firestore via `FirestoreDataService.getSitePage('quality')`.
- Renders sanitized HTML content (`DomSanitizer.bypassSecurityTrustHtml`).
- Shows loading spinner and error message states.
- Fallback placeholder content if no page exists in Firestore.

#### `InfrastructureComponent` (NEW)
- Route: `/infrastructure`.
- Loads page content from Firestore via `FirestoreDataService.getSitePage('infrastructure')`.
- Same pattern as `QualityComponent`.

#### `CertificatesComponent` (NEW)
- Route: `/certificates`.
- Loads certificates from Firestore via `FirestoreDataService.getCertificates()`.
- Displays certificates in a grid with a **lightbox** viewer (click to enlarge, locks body scroll).
- Loading and error states.

#### `CareersComponent` (NEW)
- Route: `/careers`.
- Loads job postings from Firestore via `FirestoreDataService.getCareers()`.
- Filters to only `status === 'open'` jobs.
- **Accordion UI** — click a job to expand requirements.
- Sanitizes requirements HTML for safe rendering.
- "Apply" button builds a `mailto:careers@premolex.com` link with the job title in the subject.

#### `FirebaseSetupComponent` (NEW)
- Route: `/firebase-setup`.
- Reactive form for Firebase credentials (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).
- Pre-fills form from existing `localStorage` config.
- Saves config via `FirebaseDynamicService.saveConfig()`.
- Shows connection status (reactive `isConnected` signal).
- "Disconnect" button clears config from `localStorage`.

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

Uses the **Firebase Identity Toolkit REST API** (`createdLoginCredentials` endpoint) to authenticate.

| Method | Description |
|---|---|
| `login(credentials)` | POSTs to `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=<apiKey>` with `{ email, password, returnSecureToken: true }` — stores the returned `idToken` in `localStorage` |
| `logout()` | Clears token, updates state |
| `getToken()` | Returns current Firebase ID token or `null` |
| `isAuthenticated()` | Returns `true` if token exists |
| `isLoggedIn$` | `BehaviorSubject<boolean>` Observable — emits auth state instantly |
| `token$` | `BehaviorSubject<string \| null>` Observable — emits current JWT |

**API endpoint (tested):**

```
POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCVXND9DdDhfdm81tKR5hNTC6Z1-w_0NA0
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "returnSecureToken": true
}
```

**Success response:**

```json
{
  "kind": "identitytoolkit#VerifyPasswordResponse",
  "localId": "user-uid",
  "email": "user@example.com",
  "idToken": "<JWT>",
  "registered": true,
  "refreshToken": "<refresh-token>",
  "expiresIn": "3600"
}
```

**Token storage:** `localStorage` under key `premolex_admin_token` (stores the `idToken` returned by the API).

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
- Error banner for 401 (invalid credentials), network failures, and server errors. Error messages are parsed from the Identity Toolkit REST error responses (`EMAIL_NOT_FOUND`, `INVALID_PASSWORD`, `INVALID_LOGIN_CREDENTIALS`, `USER_DISABLED`, `TOO_MANY_ATTEMPTS_TRY_LATER`, etc.).

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
  - `<app-admin-sidebar>` — navigation (Dashboard, Categories, Products, Blogs, Pages, Certificates, Careers, Settings)
  - `<app-admin-header>` — page title + profile/logout dropdown
  - `<router-outlet>` — page content
- Tracks `sidebarCollapsed` and `mobileSidebarOpen` signals.
- Computes page title from current URL.

### 9.2 `AdminSidebarComponent`

- **8 nav items** with Material Symbols icons:

| Label | Route | Icon |
|---|---|---|
| Dashboard | `/admin/dashboard` | `dashboard` |
| Categories | `/admin/categories` | `category` |
| Products | `/admin/products` | `inventory_2` |
| Blogs | `/admin/blogs` | `article` |
| Pages | `/admin/pages` | `description` |
| Certificates | `/admin/certificates` | `workspace_premium` |
| Careers | `/admin/careers` | `work` |
| Settings | `/admin/settings` | `settings` |

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

### 9.8 `CorporatePagesManagerComponent` (NEW)

- Route: `/admin/pages`.
- Edits the **Quality** and **Infrastructure** corporate pages.
- Toggle between pages via `selectedPage` signal (`'quality' | 'infrastructure'`).
- Form: `title` (required, min 3 chars) + `content` (required, min 20 chars).
- **Rich text editor** built on `contenteditable` (no external dependencies):
  - Toolbar commands: bold, italic, underline, formatBlock (H2/H3/P), createLink.
  - Uses `document.execCommand()`.
- Saves via `FirestoreDataService.saveSitePage(pageKey, { title, content })`.
- Loads existing content via `FirestoreDataService.getSitePage(pageKey)`.

### 9.9 `CertificateManagerComponent` (NEW)

- Route: `/admin/certificates`.
- CRUD for certificates stored in Firestore (`certificates` collection).
- Form: `title`, `description`, `issueYear` (1900–2100), `imageUrl`, `imageName`.
- Image upload uses `FileReader` → data URL (local preview / placeholder for Firebase Storage).
- Uses `FirestoreDataService` methods: `getCertificates()`, `addCertificate()`, `updateCertificate()`, `deleteCertificate()`.

### 9.10 `CareersManagerComponent` (NEW)

- Route: `/admin/careers`.
- CRUD for job postings stored in Firestore (`careers` collection).
- Form: `title`, `department`, `location`, `shortDescription` (max 300), `requirements` (min 20), `status` (`open`/`closed`).
- **Rich text editor** for requirements (contenteditable, same pattern as Corporate Pages).
- Uses `FirestoreDataService` methods: `getCareers()`, `addCareer()`, `updateCareer()`, `deleteCareer()`.

### 9.11 `FirebaseConfigFormComponent`

- Form to configure Firebase credentials (apiKey, authDomain, projectId, etc.).
- Saves config to `localStorage` via `FirebaseConfigService`.
- Connects Firestore + Storage dynamically.

### 9.12 Form Components

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

## 11. Firebase Dynamic Integration

### 11.1 `FirebaseDynamicService` (`firebase-dynamic.service.ts`)

Initializes Firebase using the **hardcoded credentials from `environment.firebaseConfig`**. An optional `localStorage` override (key `premolex_firebase_config`) is still respected for legacy setup-page compatibility.

| Method | Description |
|---|---|
| `initializeFirebase()` | Initializes Firebase from `environment.firebaseConfig` (default) or localStorage override (called in constructor on browser) |
| `saveConfig(config)` | Saves a config override to localStorage (pass `null` to clear) and re-initializes |
| `getConfig()` | Returns the current effective config — **always returns a `FirebaseConfig`** (env default or override) |
| `getLocalStorageConfig()` | Reads the optional localStorage override, or `null` |
| `clearConfig()` | Removes the localStorage override and re-initializes with environment config |
| `getFirestoreInstance()` | Returns Firestore instance or `null` |
| `getStorageInstance()` | Returns Storage instance or `null` |
| `getAuthInstance()` | Returns Auth instance or `null` |
| `isFirebaseConnected()` | Returns `true` if Firebase app is initialized |

**State:**
- `isConnected` — `signal<boolean>` reactive connection state.

**Key behavior:**
- Uses `getApps().length ? getApp() : initializeApp(config)` to avoid duplicate initialization.
- SSR-safe: only initializes in the browser (`isPlatformBrowser`).
- Uses the **standard Firebase JS SDK** (`firebase/app`, `firebase/firestore`, `firebase/storage`, `firebase/auth`).

**Hardcoded config (`environment.ts` / `environment.prod.ts`):**

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  firebaseConfig: {
    apiKey: 'AIzaSyCVXND9DdDhfdm81tKR5hNTC6Z1-w_0NA0',
    authDomain: 'premolex-a3c1c.firebaseapp.com',
    projectId: 'premolex-a3c1c',
    storageBucket: 'premolex-a3c1c.firebasestorage.app',
    messagingSenderId: '610846055734',
    appId: '1:610846055734:web:46db90142233e4b02da797',
    measurementId: 'G-G3CZXJM65L',
  },
};
```

### 11.2 `FirestoreDataService` (`services/firestore-data.service.ts`)

Performs real CRUD operations against Firebase Firestore using the **Firestore REST v1 API** (`https://firestore.googleapis.com/v1/projects/<projectId>/databases/(default)/documents/...`) — the same tested cURL endpoints from the Postman collection. All methods return RxJS Observables so they plug directly into Angular async pipes and tables.

**Collections:**

| Collection | Document Type | Notes |
|---|---|---|
| `products` | `FirestoreProduct` | Ordered by `title` ascending |
| `blogs` | `FirestoreBlog` | Ordered by `createdAt` descending |
| `site_pages` | `FirestoreSitePage` | Fixed doc ids: `quality`, `infrastructure` |
| `certificates` | `FirestoreCertificate` | Ordered by `issueYear` descending |
| `careers` | `FirestoreCareer` | Ordered by `createdAt` descending |

**Products methods:**
- `getProducts()` → `Observable<FirestoreProduct[]>`
- `getProductById(id)` → `Observable<FirestoreProduct | null>`
- `addProduct(data)` → `Observable<FirestoreProduct>`
- `updateProduct(id, data)` → `Observable<FirestoreProduct>`
- `deleteProduct(id)` → `Observable<void>`

**Blogs methods:**
- `getBlogs()` → `Observable<FirestoreBlog[]>`
- `getBlogById(id)` → `Observable<FirestoreBlog | null>`
- `addBlog(data)` → `Observable<FirestoreBlog>`
- `updateBlog(id, data)` → `Observable<FirestoreBlog>`
- `deleteBlog(id)` → `Observable<void>`

**Site Pages methods:**
- `getSitePage(id)` → `Observable<FirestoreSitePage | null>`
- `getPageContent(pageId)` → `Observable<FirestoreSitePage | null>` (alias)
- `updatePageContent(pageId, content)` → `Observable<FirestoreSitePage>` (upsert)
- `saveSitePage(pageKey, data)` → `Observable<FirestoreSitePage>` (upsert with fixed doc id)

**Certificates methods:**
- `getCertificates()` → `Observable<FirestoreCertificate[]>`
- `addCertificate(data)` → `Observable<FirestoreCertificate>`
- `updateCertificate(id, data)` → `Observable<FirestoreCertificate>`
- `deleteCertificate(id)` → `Observable<void>`

**Careers methods:**
- `getCareers()` / `getJobs()` → `Observable<FirestoreCareer[]>`
- `addCareer(data)` / `addJob(data)` → `Observable<FirestoreCareer>`
- `updateCareer(id, data)` / `updateJob(id, data)` → `Observable<FirestoreCareer>`
- `deleteCareer(id)` / `deleteJob(id)` → `Observable<void>`

**Data format conversion:**
- Automatically converts between plain JS objects and the Firestore REST **envelope format** (`fields`/`stringValue`/`integerValue`/`doubleValue`/`booleanValue`/`mapValue`/`arrayValue`).
- Updates use `PATCH` with `updateMask.fieldPaths=...` query params.

**Error handling:**
- 404 on reads → returns `null`/`[]` (graceful).
- All create/update operations stamp `createdAt` / `updatedAt` ISO timestamps.

### 11.3 `FirebaseStorageService` (`services/firebase-storage.service.ts`)

Handles file uploads/downloads against the **Firebase Storage REST v1 API** (`https://firebasestorage.googleapis.com/v0/b/<bucket>/o`) — matching the tested `saveImage` / `readImages` cURLs.

| Method | Description |
|---|---|
| `uploadFile(file, path)` | Uploads raw file bytes via `POST .../o?name=<path>` with the file's MIME type as `Content-Type`. Emits `HttpEvent` stream (Sent → UploadProgress → Response) for progress UI. Returns a `StorageUploadResult` with the public download URL. |
| `getDownloadUrl(path)` | Builds the public download URL (`.../o/<encoded-path>?alt=media`). |

**Upload paths used:**
- Product images → `product_images/<timestamp>_<sanitized-name>`
- Blog featured images → `blog_images/<timestamp>_<sanitized-name>`

---

## 12. Services Layer

| Service | Location | Purpose |
|---|---|---|
| `AuthService` | `auth/services/` | JWT login, token storage, auth state |
| `ProductService` (admin) | `admin/services/` | Admin product CRUD (mock) |
| `CategoryService` | `admin/services/` | Admin category CRUD + tree (mock) |
| `BlogService` | `admin/services/` | Admin blog CRUD + upload (mock) |
| `ProductService` (public) | `products/services/` | Public product catalog (mock) |
| `FirebaseConfigService` | `app/` | Legacy Firebase config + connection |
| `FirebaseDynamicService` | `app/` | **Firebase init from env config (with localStorage override)** |
| `FirestoreDataService` | `services/` | **Real Firestore REST v1 CRUD (products, blogs, pages, certs, careers)** |
| `FirebaseStorageService` | `services/` | **Real Firebase Storage REST v1 uploads/downloads** |

All services use `providedIn: 'root'` (singleton).

---

## 13. Models / Data Types

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

### Firestore Models (`services/firestore-data.service.ts`)

| Model | Fields |
|---|---|
| `FirestoreDocument` | id?, createdAt?, updatedAt? |
| `FirestoreProduct` | title, slug, shortDescription, categoryId, subcategoryId, imageUrl, imageName, specifications[], status (`active`/`draft`) |
| `FirestoreBlog` | title, slug, author, content, excerpt, featuredImageUrl, featuredImageName, status (`published`/`draft`), publishedAt |
| `FirestoreSitePage` | pageKey (`quality`/`infrastructure`), title, content |
| `FirestoreCertificate` | title, description, issueYear, imageUrl, imageName |
| `FirestoreCareer` | title, department, location, shortDescription, requirements, status (`open`/`closed`) |

### Firebase Config Model (`firebase-dynamic.service.ts`)

| Model | Fields |
|---|---|
| `FirebaseConfig` | apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId |

---

## 14. Directives

### `ScrollAnimateDirective` (`directives/scroll-animate.directive.ts`)

- Adds `scroll-animate` class to elements.
- Uses `IntersectionObserver` to add `scroll-visible` when the element enters the viewport.
- Used by: `HomeAboutComponent`, `ApplicationsGridComponent`, `ProjectGalleryComponent`, `HomeContactCTAComponent`.

---

## 15. Environment Configuration

### `environments/environment.ts` (Development)

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  firebaseConfig: {
    apiKey: 'AIzaSyCVXND9DdDhfdm81tKR5hNTC6Z1-w_0NA0',
    authDomain: 'premolex-a3c1c.firebaseapp.com',
    projectId: 'premolex-a3c1c',
    storageBucket: 'premolex-a3c1c.firebasestorage.app',
    messagingSenderId: '610846055734',
    appId: '1:610846055734:web:46db90142233e4b02da797',
    measurementId: 'G-G3CZXJM65L',
  },
};
```

### `environments/environment.prod.ts` (Production)

```ts
export const environment = {
  production: true,
  apiUrl: 'https://api.premolex.com/api',
  firebaseConfig: {
    apiKey: 'AIzaSyCVXND9DdDhfdm81tKR5hNTC6Z1-w_0NA0',
    authDomain: 'premolex-a3c1c.firebaseapp.com',
    projectId: 'premolex-a3c1c',
    storageBucket: 'premolex-a3c1c.firebasestorage.app',
    messagingSenderId: '610846055734',
    appId: '1:610846055734:web:46db90142233e4b02da797',
    measurementId: 'G-G3CZXJM65L',
  },
};
```

> **Note:** The `AuthService` uses `environment.firebaseConfig.apiKey` to build the Identity Toolkit login endpoint: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=<apiKey>`.

---

## 16. Styling & Theming

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

## 17. How to Run

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
| `http://localhost:4200/quality` | Quality page (Firestore-driven) |
| `http://localhost:4200/infrastructure` | Infrastructure page (Firestore-driven) |
| `http://localhost:4200/certificates` | Certificates page (Firestore-driven) |
| `http://localhost:4200/careers` | Careers page (Firestore-driven) |
| `http://localhost:4200/firebase-setup` | Firebase credential setup |
| `http://localhost:4200/login` | Admin login page |
| `http://localhost:4200/admin` | Admin dashboard (protected) |
| `http://localhost:4200/admin/dashboard` | Admin dashboard overview |
| `http://localhost:4200/admin/categories` | Category manager |
| `http://localhost:4200/admin/products` | Product manager |
| `http://localhost:4200/admin/blogs` | Blog manager |
| `http://localhost:4200/admin/pages` | Corporate pages manager (Quality/Infrastructure) |
| `http://localhost:4200/admin/certificates` | Certificate manager |
| `http://localhost:4200/admin/careers` | Careers manager |
| `http://localhost:4200/admin/settings` | Firebase settings |

### Production Build

```bash
npm run build
```

---

## 18. Future Backend Integration

The app is structured to easily swap mock services for a real Node.js/Express backend:

| Service | Current (Mock) | Future (REST) |
|---|---|---|
| `AuthService` | Uses Firebase Identity Toolkit REST (`signInWithPassword`) | ✅ Ready (tested) |
| `ProductService` (admin) | In-memory signal (CRUD); uploads use real Storage REST | `GET/POST/PUT/DELETE /api/products` |
| `CategoryService` | In-memory signal | `GET/POST/PUT/DELETE /api/categories` |
| `BlogService` | In-memory signal (CRUD); uploads use real Storage REST | `GET/POST/PUT/DELETE /api/blog` |
| `ProductService` (public) | `Observable.of()` | `GET /api/products` |
| `FirestoreDataService` | **Real Firestore REST v1 CRUD** | ✅ Ready (tested) |
| `FirebaseStorageService` | **Real Storage REST v1 uploads** | ✅ Ready (tested) |

The `AuthInterceptor` automatically attaches the Firebase ID token to all outgoing requests, so protected API endpoints will receive the `Authorization: Bearer <token>` header.

> **Note:** `FirestoreDataService` and `FirebaseStorageService` provide **real Firebase persistence** via the tested REST v1 endpoints — no backend swap needed for products, blogs, site pages, certificates, careers, or image uploads. The mock admin CRUD services (`ProductService`, `CategoryService`, `BlogService`) remain as in-memory alternatives for now, while their `uploadImage()` methods now use the real Firebase Storage REST API.

---

*Documentation generated for the Premolex Industries B2B industrial website.*