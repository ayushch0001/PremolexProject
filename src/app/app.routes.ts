import { Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { Home } from './home/home';
import { FirebaseConfigFormComponent } from './admin-components/firebase-config-form.component/firebase-config-form.component';
import { FirebaseSetupComponent } from './components/firebase-setup/firebase-setup.component';
import { QualityComponent } from './components/quality/quality.component';
import { InfrastructureComponent } from './components/infrastructure/infrastructure.component';
import { CertificatesComponent } from './components/certificates/certificates.component';
import { CareersComponent } from './components/careers/careers.component';

export const routes: Routes = [
  { path: '', redirectTo: 'Home', pathMatch: 'full' },

  // Main Pages
  { path: 'Home', component: Home },
  { path: 'about', component: AboutComponent },
  {
    path: 'Products',
    loadChildren: () =>
      import('./products/products.routes').then((m) => m.PRODUCT_ROUTES),
  },
  { path: 'firebaseConections', component: FirebaseConfigFormComponent },
  { path: 'firebase-setup', component: FirebaseSetupComponent },
  { path: 'quality', component: QualityComponent },
  { path: 'infrastructure', component: InfrastructureComponent },
  { path: 'certificates', component: CertificatesComponent },
  { path: 'careers', component: CareersComponent },

  // Auth (login)
  {
    path: 'login',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // Admin area (protected by AuthGuard)
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
];
