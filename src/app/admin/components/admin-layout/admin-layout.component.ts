import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/categories': 'Categories',
  '/admin/products': 'Products',
  '/admin/blogs': 'Blogs',
  '/admin/pages': 'Corporate Pages',
  '/admin/certificates': 'Certificates',
  '/admin/careers': 'Careers',
  '/admin/settings': 'Settings',
};

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent, AdminHeaderComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);

  readonly sidebarCollapsed = signal(false);
  readonly mobileSidebarOpen = signal(false);
  private readonly currentUrl = signal<string>('/admin');

  readonly pageTitle = computed<string>(() => {
    const url = this.currentUrl().split('?')[0];
    return PAGE_TITLES[url] ?? 'Admin';
  });

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        // Close the mobile drawer whenever navigation completes.
        this.mobileSidebarOpen.set(false);
        this.currentUrl.set((event as NavigationEnd).urlAfterRedirects);
      });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }

  openMobileSidebar(): void {
    this.mobileSidebarOpen.set(true);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }
}