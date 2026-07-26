import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardOverviewComponent } from '../../admin-components/dashboard-overview.component/dashboard-overview.component';
import { ProductFormComponent } from '../../admin-components/product-form.component/product-form.component';
import { CategoryFormComponent } from '../../admin-components/category-form.component/category-form.component';
import { BlogFormComponent } from '../../admin-components/blog-form.component/blog-form.component';
import { HandlerFormComponent } from '../../admin-components/handler-form.component/handler-form.component';

type AdminView = 'dashboard' | 'productsForm' | 'categories' | 'blogs' | 'handlers';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardOverviewComponent,
    ProductFormComponent,
    CategoryFormComponent,
    BlogFormComponent,
    HandlerFormComponent
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  activeView = signal<AdminView>('dashboard');

  setView(view: AdminView) {
    this.activeView.set(view);
  }
}