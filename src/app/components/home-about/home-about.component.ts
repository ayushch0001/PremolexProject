import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollAnimateDirective } from '../../directives/scroll-animate.directive';

export interface AboutBullet {
  text: string;
}

@Component({
  selector: 'app-home-about',
  standalone: true,
  imports: [CommonModule, ScrollAnimateDirective],
  templateUrl: './home-about.component.html',
  styleUrls: ['./home-about.component.css'],
})
export class HomeAboutComponent {
  bullets: AboutBullet[] = [
    { text: 'State-of-the-art manufacturing facility in Raipur, Chhattisgarh' },
    { text: 'ISO 9001:2024 certified production processes' },
    { text: 'Over 500+ successful product deliveries worldwide' },
    { text: 'Expert team with 15+ years of industry experience' },
  ];

  facilityImage = 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80';
}