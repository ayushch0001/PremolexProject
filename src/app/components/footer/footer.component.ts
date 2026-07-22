import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  footerLinks = ['Privacy Policy', 'Terms of Service', 'ISO Certifications', 'Locations'];
  currentYear = new Date().getFullYear();
}