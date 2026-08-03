import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css'],
})
export class AdminHeaderComponent {
  readonly pageTitle = input.required<string>();
  readonly sidebarCollapsed = input(false);
  readonly toggleSidebar = output<void>();
  readonly openMobileSidebar = output<void>();

  readonly profileOpen = signal(false);

  private readonly authService = inject(AuthService);

  constructor(private readonly router: Router) {}

  toggleProfile(): void {
    this.profileOpen.update((open) => !open);
  }

  closeProfile(): void {
    this.profileOpen.set(false);
  }

  logout(): void {
    this.closeProfile();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}