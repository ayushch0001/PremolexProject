import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ValueCard {
  title: string;
  subtitle: string;
  description: string;
  icon: string; // SVG markup as string
}

@Component({
  selector: 'app-corporate-values',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './corporate-values.component.html',
  styleUrls: ['./corporate-values.component.css'],
})
export class CorporateValuesComponent {
  @Input() cards: ValueCard[] = [];
}