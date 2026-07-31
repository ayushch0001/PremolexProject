import { Component, HostListener, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  hasDropdown: boolean;
  children?: { label: string; path: string }[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isScrolled = false;
  isMobileMenuOpen = false;
  openDropdown: string | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: object) { }

  products: { label: string; path: string }[] = [
    { label: 'HDPE Pressure Pipes', path: '/Products/hdpe-pressure-pipes' },
    { label: 'Impact Sprinklers', path: '/Products/impact-sprinklers' },
    { label: 'Inline Drip Laterals', path: '/Products/inline-drip-laterals' },
    { label: 'PVC Pipes', path: '/Products/pvc-pipes' },
    { label: 'Fittings & Accessories', path: '/Products/fittings' },
  ];

  navItems: NavItem[] = [
    { label: 'Home', path: '/Home', hasDropdown: false },
    { label: 'About Us', path: '/about', hasDropdown: false },
    { label: 'Products', path: '/Products', hasDropdown: true, children: this.products },
    { label: 'Quality', path: '/quality', hasDropdown: false },
    { label: 'Infrastructure', path: '/infrastructure', hasDropdown: false },
    { label: 'Certificate', path: '/certificate', hasDropdown: false },
    { label: 'Career', path: '/career', hasDropdown: false },
    { label: 'Contact Us', path: '/contact', hasDropdown: false },
  ];

  ngOnInit(): void {
    this.checkScroll();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScroll();
  }

  private checkScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled = window.scrollY > 50;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (isPlatformBrowser(this.platformId)) {
      if (this.isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
        this.openDropdown = null;
      }
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
    this.openDropdown = null;
  }

  toggleDropdown(dropdown: string): void {
    this.openDropdown = this.openDropdown === dropdown ? null : dropdown;
  }

  closeDropdown(): void {
    this.openDropdown = null;
  }

  onDropdownClick(event: MouseEvent): void {
    event.stopPropagation();
  }
}