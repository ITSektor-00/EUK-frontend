# 🎨 EUK Platforma - Frontend Dokumentacija

## 📋 Sadržaj
- [Pregled Projekta](#pregled-projekta)
- [Tehnička Arhitektura](#tehnička-arhitektura)
- [Struktura Projekta](#struktura-projekta)
- [Komponente](#komponente)
- [Servisi](#servisi)
- [Rute i Navigacija](#rute-i-navigacija)
- [State Management](#state-management)
- [UI Framework i Styling](#ui-framework-i-styling)
- [API Integracija](#api-integracija)
- [Autentifikacija](#autentifikacija)
- [Deployment](#deployment)
- [Development Workflow](#development-workflow)
- [Performance i Optimizacija](#performance-i-optimizacija)

---

## 🚀 Pregled Projekta

**EUK Platforma** je moderna web aplikacija za upravljanje EUK predmetima, kategorijama i ugroženim licima. Frontend je izgrađen sa najnovijim tehnologijama i prati moderne standarde web development-a.

### 🎯 Glavne Funkcionalnosti
- **Autentifikacija i Autorizacija** - JWT-based login sistem
- **EUK Predmeti Management** - CRUD operacije sa paginacijom i filterima
- **Kategorije Management** - Upravljanje kategorijama predmeta
- **Ugrožena Lica** - Upravljanje ugroženim licima sa pretragom
- **Statistike i Izveštaji** - Detaljne analize i export funkcionalnosti
- **Responsive Design** - Optimizovano za sve uređaje

---

## 🏗️ Tehnička Arhitektura

### Core Framework
- **Next.js 15.4.2** - React framework sa App Router
- **React 19.1.0** - Najnovija verzija React-a
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework

### Build Tools
- **Bun** - Fast JavaScript runtime i package manager
- **ESLint** - Code quality i linting
- **PostCSS** - CSS processing
- **Next.js Compiler** - Optimizovani build proces

### Development Environment
- **Node.js** - Runtime environment
- **TypeScript Compiler** - Type checking i compilation
- **Hot Reload** - Development server sa live reload

---

## 📁 Struktura Projekta

```
euk-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── login/             # Login stranica
│   │   ├── register/          # Registracija
│   │   ├── dashboard/         # Dashboard
│   │   ├── euk/               # EUK modul
│   │   │   ├── predmeti/      # Predmeti management
│   │   │   ├── kategorije/    # Kategorije management
│   │   │   ├── ugrozena-lica/ # Ugrožena lica
│   │   │   └── stampanje/     # Štampanje funkcionalnosti
│   │   ├── api/               # API routes
│   │   └── components/        # Shared komponente
│   ├── components/             # Reusable komponente
│   ├── services/               # API servisi
│   ├── contexts/               # React contexts
│   └── hooks/                  # Custom hooks
├── public/                     # Static assets
├── package.json                # Dependencies
├── tsconfig.json              # TypeScript config
├── next.config.ts             # Next.js config
└── tailwind.config.js         # Tailwind config
```

---

## 🧩 Komponente

### Core Layout Komponente

#### `layout.tsx`
- **Opis:** Root layout za celu aplikaciju
- **Funkcionalnosti:** Theme provider, global styles, meta tags
- **Props:** children (React.ReactNode)

#### `ClientLayoutShell.tsx`
- **Opis:** Client-side layout wrapper
- **Funkcionalnosti:** Sidebar, navbar, responsive layout
- **Props:** children, showSidebar (boolean)

#### `Navbar.tsx`
- **Opis:** Glavna navigaciona traka
- **Funkcionalnosti:** Logo, navigation links, user menu, theme toggle
- **Props:** user (User | null), onLogout (function)

#### `SidebarNav.tsx`
- **Opis:** Sidebar navigacija
- **Funkcionalnosti:** Menu items, active states, responsive design
- **Props:** isOpen (boolean), onClose (function)

### Auth Komponente

#### `LoginForm.tsx`
- **Opis:** Forma za prijavu korisnika
- **Funkcionalnosti:** Username/email, password, validation, error handling
- **Props:** onLogin (function), isLoading (boolean)

#### `RegisterForm.tsx`
- **Opis:** Forma za registraciju novog korisnika
- **Funkcionalnosti:** User data input, validation, username availability check
- **Props:** onRegister (function), isLoading (boolean)

#### `ProtectedRoute.tsx`
- **Opis:** HOC za zaštitu ruta
- **Funkcionalnosti:** Authentication check, redirect logic
- **Props:** children (React.ReactNode)

### EUK Management Komponente

#### `PredmetiTable.tsx`
- **Opis:** Tabela za prikaz predmeta
- **Funkcionalnosti:** Paginacija, filtering, sorting, CRUD operations
- **Props:** predmeti (array), onEdit, onDelete, onView

#### `NoviPredmetModal.tsx`
- **Opis:** Modal za kreiranje novog predmeta
- **Funkcionalnosti:** Form inputs, validation, category selection
- **Props:** isOpen (boolean), onClose (function), onSubmit (function)

#### `PredmetDetaljiModal.tsx`
- **Opis:** Modal za prikaz detalja predmeta
- **Funkcionalnosti:** Predmet info, ugrožena lica, edit mode
- **Props:** predmet (object), isOpen (boolean), onClose (function)

#### `KategorijeTable.tsx`
- **Opis:** Tabela za upravljanje kategorijama
- **Funkcionalnosti:** CRUD operations, inline editing
- **Props:** kategorije (array), onEdit, onDelete

#### `UgrozenaLicaTable.tsx`
- **Opis:** Tabela za upravljanje ugroženim licima
- **Funkcionalnosti:** Search, filtering, paginacija, export
- **Props:** ugrozenaLica (array), onEdit, onDelete

### UI Komponente

#### `ValidationIndicator.tsx`
- **Opis:** Indikator za validaciju polja
- **Funkcionalnosti:** Success/error states, validation messages
- **Props:** isValid (boolean), message (string)

#### `ImageWithFallback.tsx`
- **Opis:** Image komponenta sa fallback
- **Funkcionalnosti:** Error handling, placeholder image
- **Props:** src (string), alt (string), fallback (string)

#### `ExportModal.tsx`
- **Opis:** Modal za export podataka
- **Funkcionalnosti:** Format selection, date range, export options
- **Props:** isOpen (boolean), onClose (function), data (array)

---

## 🔌 Servisi

### API Service (`src/services/api.ts`)

#### Osnovne Funkcionalnosti
- **Base URL Management** - Environment-based configuration
- **Error Handling** - Centralizovano error management
- **Token Management** - JWT token handling
- **Request/Response Processing** - Standardizovani API calls

#### EUK API Metode
```typescript
// Kategorije
async getKategorije(token: string)
async createKategorija(data: { naziv: string }, token: string)
async updateKategorija(id: number, data: { naziv: string }, token: string)
async deleteKategorija(id: number, token: string)

// Predmeti
async getPredmeti(params: string, token: string)
async createPredmet(data: Record<string, unknown>, token: string)
async updatePredmet(id: number, data: Record<string, unknown>, token: string)
async deletePredmet(id: number, token: string)

// Ugrožena Lica
async getUgrozenaLica(params: string, token: string)
async createUgrozenoLice(data: Record<string, unknown>, token: string)
async updateUgrozenoLice(id: number, data: Record<string, unknown>, token: string)
async deleteUgrozenoLice(id: number, token: string)
```

#### Auth Metode
```typescript
async signUp(userData: SignUpData)
async signIn(credentials: SignInData)
async getCurrentUser(token: string)
async checkUsernameAvailability(username: string)
```

#### Test Metode
```typescript
async testHello(): Promise<string>
async testStatus(): Promise<string>
async testEcho(message: unknown): Promise<string>
async testCORS()
```

### Auth Service (`src/services/authService.ts`)

#### Interface Definicije
```typescript
export interface SignUpData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInData {
  usernameOrEmail: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}
```

#### Auth Metode
```typescript
async signUp(userData: SignUpData): Promise<AuthResponse>
async signIn(credentials: SignInData): Promise<AuthResponse>
async getCurrentUser(token: string): Promise<User>
async updateProfile(userData: Partial<User>, token: string): Promise<User>
```

---

## 🗺️ Rute i Navigacija

### App Router Struktura

#### `/` - Home Page
- **Opis:** Landing page sa osnovnim informacijama
- **Komponente:** Hero section, features, navigation

#### `/login` - Login Page
- **Opis:** Stranica za prijavu korisnika
- **Komponente:** LoginForm, AuthLayout
- **Funkcionalnosti:** Form validation, error handling, redirect

#### `/register` - Register Page
- **Opis:** Stranica za registraciju novog korisnika
- **Komponente:** RegisterForm, AuthLayout
- **Funkcionalnosti:** User registration, validation, username check

#### `/dashboard` - Dashboard
- **Opis:** Glavna dashboard stranica
- **Komponente:** Dashboard layout, statistics, quick actions
- **Funkcionalnosti:** Overview, navigation to EUK modules

#### `/euk/*` - EUK Module
- **Opis:** Glavni modul za EUK funkcionalnosti
- **Sub-routes:**
  - `/euk/predmeti` - Predmeti management
  - `/euk/kategorije` - Kategorije management
  - `/euk/ugrozena-lica` - Ugrožena lica management
  - `/euk/stampanje` - Štampanje funkcionalnosti

### Navigation Flow
```
Home → Login/Register → Dashboard → EUK Modules
                ↓
            Protected Routes
                ↓
        Authentication Required
```

---

## 🔄 State Management

### React Contexts

#### `ThemeContext.tsx`
- **Opis:** Global theme management
- **State:** currentTheme (string), isDark (boolean)
- **Methods:** toggleTheme(), setTheme(theme)

#### `AuthContext.tsx`
- **Opis:** Authentication state management
- **State:** user (User | null), token (string | null), isAuthenticated (boolean)
- **Methods:** login(), logout(), updateUser()

### Local State Management
- **useState** - Component-level state
- **useEffect** - Side effects i lifecycle
- **useCallback** - Memoized functions
- **useMemo** - Memoized values

### Form State Management
- **Controlled Components** - React state-based forms
- **Form Validation** - Custom validation logic
- **Error Handling** - Centralizovano error management

---

## 🎨 UI Framework i Styling

### Material-UI (MUI)
- **@mui/material** - Core UI komponente
- **@mui/icons-material** - Icon library
- **@mui/x-data-grid** - Advanced data tables
- **@mui/x-date-pickers** - Date picker komponente

### Tailwind CSS 4
- **Utility Classes** - Rapid UI development
- **Custom Properties** - CSS variables za theming
- **Responsive Design** - Mobile-first approach
- **Dark Mode** - Built-in dark theme support

### Custom Styling
```css
:root {
  --background: #f5f5f5;
  --foreground: #171717;
  --primary: #2563eb;
  --secondary: #f3f4f6;
  --success: #16a34a;
  --destructive: #dc2626;
}

.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
  --primary: #3b82f6;
  --secondary: #374151;
}
```

### Responsive Design
- **Mobile First** - Mobile-optimized layout
- **Breakpoints** - Tailwind responsive utilities
- **Flexbox/Grid** - Modern CSS layout systems
- **Touch Friendly** - Mobile interaction optimization

---

## 🌐 API Integracija

### Backend Communication
- **Base URL:** Environment-based configuration
- **Development:** `http://localhost:8080`
- **Production:** `https://euk.onrender.com`

### HTTP Methods
- **GET** - Dohvatanje podataka
- **POST** - Kreiranje novih resursa
- **PUT** - Ažuriranje postojećih resursa
- **DELETE** - Brisanje resursa

### Request/Response Handling
```typescript
// Standardizovani API call
async apiCall(endpoint: string, options: RequestInit = {}, token?: string) {
  const url = `${this.baseURL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  
  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}
```

### Error Handling
- **Network Errors** - Connection issues
- **HTTP Errors** - 4xx/5xx status codes
- **Validation Errors** - Form validation failures
- **Authentication Errors** - Token expiration, invalid credentials

---

## 🔐 Autentifikacija

### JWT Token Management
- **Token Storage** - LocalStorage/SessionStorage
- **Token Expiration** - Automatic logout handling
- **Token Refresh** - Automatic token renewal
- **Secure Storage** - HttpOnly cookies (production)

### Authentication Flow
```
1. User Login → Credentials Validation
2. JWT Token Generation → Backend Response
3. Token Storage → Local Storage
4. Protected Route Access → Token Validation
5. API Calls → Authorization Header
6. Token Expiration → Automatic Logout
```

### Protected Routes
- **Route Guards** - HOC-based protection
- **Authentication Check** - Token validation
- **Redirect Logic** - Unauthorized access handling
- **Role-based Access** - User permission system

### Security Features
- **CSRF Protection** - Token-based CSRF prevention
- **XSS Prevention** - Input sanitization
- **Secure Headers** - Security header configuration
- **HTTPS Enforcement** - Production security

---

## 🚀 Deployment

### Build Process
```bash
# Development
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting
```

### Environment Configuration
```typescript
// next.config.ts
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  },
};
```

### Vercel Deployment
- **Platform:** Vercel
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Environment Variables:** Production API URLs
- **Auto-deploy:** Git integration

### Production Optimizations
- **Code Splitting** - Automatic route-based splitting
- **Image Optimization** - Next.js image optimization
- **Bundle Analysis** - Webpack bundle analyzer
- **Performance Monitoring** - Core Web Vitals tracking

---

## 🛠️ Development Workflow

### Development Tools
- **TypeScript** - Type checking i IntelliSense
- **ESLint** - Code quality i consistency
- **Prettier** - Code formatting
- **Husky** - Git hooks (pre-commit)

### Code Standards
- **TypeScript Strict Mode** - Strict type checking
- **ESLint Rules** - Consistent code style
- **Component Structure** - Standardized component patterns
- **File Naming** - Consistent naming conventions

### Testing Strategy
- **Unit Tests** - Component testing
- **Integration Tests** - API integration testing
- **E2E Tests** - User workflow testing
- **Performance Tests** - Load testing

### Git Workflow
- **Feature Branches** - Feature development
- **Pull Requests** - Code review process
- **Semantic Commits** - Conventional commit messages
- **Release Tags** - Version management

---

## ⚡ Performance i Optimizacija

### Next.js Optimizations
- **App Router** - Modern routing system
- **Server Components** - Reduced client-side JavaScript
- **Image Optimization** - Automatic image optimization
- **Code Splitting** - Route-based code splitting

### React Optimizations
- **Memoization** - useMemo i useCallback
- **Lazy Loading** - Component lazy loading
- **Virtual Scrolling** - Large list optimization
- **Bundle Splitting** - Dynamic imports

### CSS Optimizations
- **Tailwind JIT** - Just-in-time CSS generation
- **Purge CSS** - Unused CSS removal
- **Critical CSS** - Above-the-fold optimization
- **CSS Variables** - Dynamic theming

### Bundle Optimization
- **Tree Shaking** - Unused code elimination
- **Minification** - Code compression
- **Gzip Compression** - Response compression
- **CDN Integration** - Static asset delivery

---

## 📊 Statistike i Metrike

### Performance Metrics
- **First Contentful Paint (FCP)** - < 1.5s
- **Largest Contentful Paint (LCP)** - < 2.5s
- **First Input Delay (FID)** - < 100ms
- **Cumulative Layout Shift (CLS)** - < 0.1

### Bundle Analysis
- **Total Bundle Size** - < 500KB (gzipped)
- **JavaScript Bundle** - < 300KB (gzipped)
- **CSS Bundle** - < 100KB (gzipped)
- **Image Assets** - < 100KB (total)

### Code Quality
- **TypeScript Coverage** - 100%
- **ESLint Score** - 0 warnings/errors
- **Test Coverage** - > 80%
- **Accessibility Score** - > 95%

---

## 🔮 Budući Razvoj

### Planned Features
- **Real-time Updates** - WebSocket integration
- **Offline Support** - Service Worker implementation
- **PWA Features** - Progressive Web App capabilities
- **Advanced Analytics** - User behavior tracking

### Technical Improvements
- **Micro-frontend Architecture** - Module-based development
- **GraphQL Integration** - Efficient data fetching
- **State Management** - Redux Toolkit integration
- **Testing Framework** - Jest + React Testing Library

### Performance Goals
- **Core Web Vitals** - All metrics in green
- **Bundle Size** - Further optimization
- **Loading Speed** - Sub-second initial load
- **User Experience** - Smooth interactions

---

## 📝 Napomene

Ova dokumentacija pokriva kompletan frontend sistem EUK Platforme. Frontend je izgrađen sa najnovijim tehnologijama i prati moderne standarde web development-a. Za dodatne informacije ili podršku, kontaktirajte development tim.

---

## 🔗 Korisni Linkovi

- **Next.js Documentation:** https://nextjs.org/docs
- **React Documentation:** https://react.dev
- **TypeScript Handbook:** https://www.typescriptlang.org/docs
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **Material-UI Docs:** https://mui.com/material-ui/

---

*Dokumentacija generisana: ${new Date().toLocaleDateString('sr-RS')}*
*Verzija: 1.0*
*Frontend Version: 0.1.0*
