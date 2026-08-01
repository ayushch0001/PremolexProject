import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css'],
})
export class AdminSidebarComponent {
  readonly collapsed = input(false);
  readonly mobileOpen = input(false);
  readonly closeMobile = output<void>();

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Categories', route: '/admin/categories', icon: 'category' },
    { label: 'Products', route: '/admin/products', icon: 'inventory_2' },
    { label: 'Blogs', route: '/admin/blogs', icon: 'article' },
    { label: 'Settings', route: '/admin/settings', icon: 'settings' },
  ];
}