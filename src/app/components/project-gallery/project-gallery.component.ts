import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollAnimateDirective } from '../../directives/scroll-animate.directive';

export interface ProjectItem {
  title: string;
  category: string;
  image: string;
}

@Component({
  selector: 'app-project-gallery',
  standalone: true,
  imports: [CommonModule, ScrollAnimateDirective],
  templateUrl: './project-gallery.component.html',
  styleUrls: ['./project-gallery.component.css'],
})
export class ProjectGalleryComponent {
  projects: ProjectItem[] = [
    {
      title: 'Domestic Water Supply',
      category: 'Municipal Infrastructure',
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80',
    },
    {
      title: 'Mines Dewatering',
      category: 'Mining & Industrial',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
    },
    {
      title: 'Agricultural Irrigation',
      category: 'Agri Infrastructure',
      image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80',
    },
    {
      title: 'Oil & Gas Pipelines',
      category: 'Energy Sector',
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80',
    },
    {
      title: 'Sewage Treatment Plants',
      category: 'Waste Management',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
    },
    {
      title: 'Industrial Cooling Systems',
      category: 'Manufacturing',
      image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80',
    },
  ];
}