import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { authGuard } from './guards/auth.guard';
import { DashboardOverviewComponent } from '../admin-components/dashboard-overview.component/dashboard-overview.component';
import { CategoryManagerComponent } from './components/category-manager/category-manager.component';
import { ProductManagerComponent } from './components/product-manager/product-manager.component';
import { BlogManagerComponent } from './components/blog-manager/blog-manager.component';
import { FirebaseConfigFormComponent } from '../admin-components/firebase-config-form.component/firebase-config-form.component';
import { CorporatePagesManagerComponent } from './components/corporate-pages-manager/corporate-pages-manager.component';
import { CertificateManagerComponent } from './components/certificate-manager/certificate-manager.component';
import { CareersManagerComponent } from './components/careers-manager/careers-manager.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardOverviewComponent },
      { path: 'categories', component: CategoryManagerComponent },
      { path: 'products', component: ProductManagerComponent },
      { path: 'blogs', component: BlogManagerComponent },
      { path: 'pages', component: CorporatePagesManagerComponent },
      { path: 'certificates', component: CertificateManagerComponent },
      { path: 'careers', component: CareersManagerComponent },
      { path: 'settings', component: FirebaseConfigFormComponent },
    ],
  },
];
