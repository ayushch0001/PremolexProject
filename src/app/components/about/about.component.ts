import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  FirestoreDataService,
  FirestoreTeamMember,
} from '../../services/firestore-data.service';

@Component({
  standalone: true,
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, OnDestroy {
  private readonly firestoreService = inject(FirestoreDataService);
  private readonly subscriptions = new Subscription();

  readonly teamMembers = signal<FirestoreTeamMember[]>([]);
  readonly isLoading = signal(true);

  readonly topMembers = computed<FirestoreTeamMember[]>(() =>
    this.teamMembers().slice(0, 3),
  );

  missionItems = [
    { icon: '', title: 'Industries We Serve', description: 'Government Projects, Railway, Airport, Metro Tunnel, Bridge, Dam, Road, Smart City, Solar Power Plant, Agriculture Irrigation, Drip & Sprinkler, STP, ETP, Chemical Industry, Slurry Transportation, Iron Ore & Coal Pipe, Oil & Gas, Mining, Biogas Plant, Food Grade Pipe, Pharmaceutical, Telecom Duct, Fire Fighting and Fire Retardant Pipes.' },
    { icon: '', title: 'Special Products', description: 'Geotextile Wrapped Perforated Pipe, Geodrain Pipe, Chemical Resistant Pipe, Temperature Proof Pipe, Customized Size Pipe, Underground Cable Duct, Large Diameter HDPE Pipe.' },
    { icon: 'precision_manufacturing', title: 'Mission', description: 'To engineer uncompromising fluid delivery systems.' },
    { icon: 'visibility', title: 'Vision', description: 'Setting the global standard for industrial durability.' },

  ];

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadTeamMembers(): void {
    this.subscriptions.add(
      this.firestoreService.getTeamMembers().subscribe({
        next: (docs) => {
          this.teamMembers.set(docs);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('[About] Failed to load team members:', err);
          this.isLoading.set(false);
        },
      }),
    );
  }
}