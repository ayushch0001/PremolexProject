import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { AboutComponent } from './components/about/about.component';
import { ProductCatalogComponent } from './public-pages/product-catalog/product-catalog';

export const routes: Routes = [
  { path: '', redirectTo: 'Home', pathMatch: 'full' },
  { path: 'about', component: AboutComponent },
  { path: 'Home', component: Dashboard },
  { path: 'Products', component: ProductCatalogComponent },
];
