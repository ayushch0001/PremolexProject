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
    { icon: 'precision_manufacturing', title: 'Mission', description: 'To engineer uncompromising fluid delivery systems.' },
    { icon: 'visibility', title: 'Vision', description: 'Setting the global standard for industrial durability.' }
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