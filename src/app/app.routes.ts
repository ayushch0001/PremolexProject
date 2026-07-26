import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { AboutComponent } from './components/about/about.component';
import { ProductCatalogComponent } from './public-pages/product-catalog/product-catalog';
import { Home } from './home/home';
import { AdminDashboard } from './dashboard/admin-dashboard/admin-dashboard';
import { ProductFormComponent } from './admin-components/product-form.component/product-form.component';
import { FirebaseConfigFormComponent } from './admin-components/firebase-config-form.component/firebase-config-form.component';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    // canActivate: [authGuard], // 🔥 Protects all child routes
    children: [
      { path: '', redirectTo: 'Home', pathMatch: 'full' },

      // Main Features
      { path: 'Home', component: Home },
      { path: 'about', component: AboutComponent },
      { path: 'Products', component: ProductCatalogComponent },
      { path: 'firebaseConections', component: FirebaseConfigFormComponent },
      {
        path: 'AdminDashboard', component: AdminDashboard,
        children: [
          // { path: '', redirectTo: 'Home', pathMatch: 'full' },
          { path: 'productsForm', component: ProductFormComponent },
        ]
      },
      // // Alternative flat structure (if you prefer)
      // 
      // { path: 'create-post', component: Posts },
      // { path: 'post-manager', component: Allposts },
      // { path: 'facebook-settings', component: Settings },
      // { path: 'accounts', component: MetaAccountsComponent },
      // { path: 'comments', component: CommentsManagementComponent },

    ]
  }
]