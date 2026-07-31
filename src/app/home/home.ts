
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroCarouselComponent } from "../components/hero-carousel/hero-carousel.component";
import { CorporateValuesComponent, ValueCard } from "../components/corporate-values/corporate-values.component";
import { HomeAboutComponent } from "../components/home-about/home-about.component";
import { ApplicationsGridComponent } from "../components/applications-grid/applications-grid.component";
import { ProjectGalleryComponent } from "../components/project-gallery/project-gallery.component";
import { HomeContactCTAComponent } from "../components/home-contact-cta/home-contact-cta.component";
import { AboutComponent } from '../components/about/about.component';
import { ProductsComponent } from "../components/products/products.component";


@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [CommonModule, HeroCarouselComponent, CorporateValuesComponent, HomeAboutComponent, ApplicationsGridComponent, ProjectGalleryComponent, HomeContactCTAComponent, AboutComponent, ProductsComponent],
})
export class Home implements OnInit {
  // Corporate values cards data
  valueCards: ValueCard[] = [
    {
      title: 'Our Mission',
      subtitle: 'What We Do',
      description: 'To deliver high-quality, reliable piping solutions that power global infrastructure, ensuring safety, efficiency, and sustainability in every project we undertake.',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
    },
    {
      title: 'Our Vision',
      subtitle: 'Where We\'re Going',
      description: 'To become the world\'s most trusted partner for industrial piping, setting benchmarks in innovation, quality, and environmental stewardship across the industry.',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
    },
    {
      title: 'Our Values',
      subtitle: 'What We Stand For',
      description: 'Integrity, innovation, and excellence drive everything we do. We prioritize safety, foster collaboration, and commit to continuous improvement for lasting impact.',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    },
  ];

  // Statistics data
  stats = [
    {
      icon: 'precision_manufacturing',
      value: '15+',
      label: 'Years of Excellence',
      color: 'text-primary'
    },
    {
      icon: 'engineering',
      value: '500+',
      label: 'Products Delivered',
      color: 'text-primary'
    },
    {
      icon: 'groups',
      value: '200+',
      label: 'Industry Partners',
      color: 'text-primary'
    },
    {
      icon: 'verified',
      value: 'ISO 9001',
      label: 'Quality Certified',
      color: 'text-primary'
    }
  ];

  // Quick links
  quickLinks = [
    { label: 'Product Catalog', icon: 'inventory_2', link: '#products' },
    { label: 'Technical Docs', icon: 'description', link: '#docs' },
    { label: 'Request Quote', icon: 'request_quote', link: '#quote' },
    { label: 'Support', icon: 'support_agent', link: '#support' }
  ];

  // Recent activities
  recentActivities = [
    {
      title: 'New Product Launch',
      description: 'HDPE Pressure Pipes PN20 series now available',
      time: '2 hours ago',
      icon: 'new_releases'
    },
    {
      title: 'ISO Certification Renewed',
      description: 'Successfully passed ISO 9001:2024 audit',
      time: '1 day ago',
      icon: 'verified'
    },
    {
      title: 'Partnership Announcement',
      description: 'Strategic partnership with AgriTech Solutions',
      time: '3 days ago',
      icon: 'handshake'
    }
  ];

  // Quick stats for dashboard cards
  productStats = [
    { label: 'Total Products', value: 45, change: '+12%', trend: 'up' },
    { label: 'Active Orders', value: 128, change: '+8%', trend: 'up' },
    { label: 'Revenue', value: '$2.4M', change: '+23%', trend: 'up' },
    { label: 'Customer Satisfaction', value: '98%', change: '+2%', trend: 'up' }
  ];
  productStatWidths: number[] = [];

  Math = Math;

  constructor() { }

  ngOnInit(): void {
    // Precompute deterministic widths for the product stat bars to avoid
    // changing values during change-detection (ExpressionChangedAfterItHasBeenCheckedError)
    this.productStatWidths = this.productStats.map(() => Math.random() * 80 + 20);
  }

  // Method to handle card clicks
  onCardClick(action: string): void {
    console.log('Action triggered:', action);
    // Add navigation or modal logic here
  }
}