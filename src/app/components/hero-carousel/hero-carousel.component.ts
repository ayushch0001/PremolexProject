import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { timer, Subscription } from 'rxjs';

export interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-carousel.component.html',
  styleUrls: ['./hero-carousel.component.css'],
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  slides: HeroSlide[] = [
    {
      image: '/sliderImages/Slider-1.jpg',
      title: 'Transforming Industry With Innovative Piping Solutions',
      subtitle: 'Precision-engineered pipes for oil, gas, water, and industrial infrastructure worldwide.',
      ctaLabel: 'Explore Our Ranges',
      ctaLink: '/Products',
    },
    {
      image: '/sliderImages/Slider2.png',
      title: 'Quality You Can Trust, Delivery You Can Rely On',
      subtitle: 'ISO 9001 certified manufacturing with end-to-end supply chain excellence.',
      ctaLabel: 'Explore Our Ranges',
      ctaLink: '/Products',
    },
    {
      image: '/sliderImages/Slider-2.jpg',
      title: 'Sustainable Piping for a Better Tomorrow',
      subtitle: 'Eco-friendly materials and processes that reduce environmental impact without compromising quality.',
      ctaLabel: 'Explore Our Ranges',
      ctaLink: '/Products',
    },
  ];

  currentSlide = 0;
  private timerSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  private startAutoPlay(): void {
    this.timerSubscription = timer(500, 500).subscribe(() => {
      this.nextSlide();
    });
  }

  private stopAutoPlay(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    // Reset the timer when user manually navigates
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}