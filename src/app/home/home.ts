
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSliderComponent } from "../components/hero-slider/hero-slider.component";
import { HeaderComponent } from "../components/header/header.component";
import { AboutComponent } from '../components/about/about.component';
import { ProductsComponent } from "../components/products/products.component";
import { FooterComponent } from "../components/footer/footer.component";


@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [CommonModule, HeroSliderComponent, AboutComponent, ProductsComponent],
})
export class Home implements OnInit {
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