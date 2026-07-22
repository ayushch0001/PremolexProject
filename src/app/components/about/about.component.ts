import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  missionItems = [
    { icon: 'precision_manufacturing', title: 'Mission', description: 'To engineer uncompromising fluid delivery systems.' },
    { icon: 'visibility', title: 'Vision', description: 'Setting the global standard for industrial durability.' }
  ];
}