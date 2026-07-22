import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'about', component: About },
  { path: 'home', component: Home },
  { path: 'dashboard', component: Dashboard },
];
