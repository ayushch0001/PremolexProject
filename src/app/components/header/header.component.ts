import { Component, HostListener, OnInit, OnDestroy, Inject, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirestoreDataService, FirestoreCategory } from '../../services/firestore-data.service';

interface NavItem {
  label: string;
  path: string;
  hasDropdown: boolean;
  children?: { label: string; path: string; queryParams?: { category: string } }[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  readonly isScrolled = signal(false);
  readonly isMobileMenuOpen = signal(false);
  readonly openDropdown = signal<string | null>(null);

  private readonly firestoreService = inject(FirestoreDataService);
  private readonly subscriptions = new Subscription();

  private readonly productsSignal = signal<{ label: string; path: string; queryParams?: { category: string } }[]>([]);

  readonly navItems = computed<NavItem[]>(() => [
    { label: 'Home', path: '/Home', hasDropdown: false },
    { label: 'About Us', path: '/about', hasDropdown: false },
    { label: 'Products', path: '/Products', hasDropdown: true, children: this.productsSignal() },
    { label: 'Quality', path: '/quality', hasDropdown: false },
    { label: 'Infrastructure', path: '/infrastructure', hasDropdown: false },
    { label: 'Certificate', path: '/certificates', hasDropdown: false },
    { label: 'Career', path: '/careers', hasDropdown: false },
  ]);

  constructor(@Inject(PLATFORM_ID) private platformId: object) { }

  ngOnInit(): void {
    this.checkScroll();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadCategories(): void {
    this.subscriptions.add(
      this.firestoreService.getCategories().subscribe({
        next: (categories: FirestoreCategory[]) => {
          // Only top-level categories (parentId === null) for the dropdown
          const topLevel = categories.filter((c) => c.parentId === null && !!c.id);
          this.productsSignal.set(
            topLevel.map((c) => ({
              label: c.name,
              path: '/Products',
              queryParams: { category: c.id as string },
            })),
          );
        },
        error: (err) => {
          console.error('[HeaderComponent] Failed to load categories:', err);
        },
      }),
    );
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScroll();
  }

  private checkScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled.set(window.scrollY > 50);
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
    if (isPlatformBrowser(this.platformId)) {
      if (this.isMobileMenuOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
        this.openDropdown.set(null);
      }
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
    this.openDropdown.set(null);
  }

  toggleDropdown(dropdown: string): void {
    this.openDropdown.set(this.openDropdown() === dropdown ? null : dropdown);
  }

  closeDropdown(): void {
    this.openDropdown.set(null);
  }

  onDropdownClick(event: MouseEvent): void {
    event.stopPropagation();
  }
}