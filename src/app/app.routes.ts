import { Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { Home } from './home/home';
import { AdminDashboard } from './dashboard/admin-dashboard/admin-dashboard';
import { ProductFormComponent } from './admin-components/product-form.component/product-form.component';
import { FirebaseConfigFormComponent } from './admin-components/firebase-config-form.component/firebase-config-form.component';

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

  // Admin Dashboard with child routes
  {
    path: 'AdminDashboard',
    component: AdminDashboard,
    children: [
      { path: 'productsForm', component: ProductFormComponent },
    ]
  },
];