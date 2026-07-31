import { Directive, ElementRef, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollAnimate]',
  standalone: true,
})
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  private observer: IntersectionObserver | null = null;

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.el.nativeElement.classList.add('scroll-visible');
              this.observer?.unobserve(this.el.nativeElement);
            }
          });
        },
        { threshold: 0.15 }
      );
      this.observer.observe(this.el.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}