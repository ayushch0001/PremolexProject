import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirebaseConfigFormComponent } from './firebase-config-form.component';

describe('FirebaseConfigFormComponent', () => {
  let component: FirebaseConfigFormComponent;
  let fixture: ComponentFixture<FirebaseConfigFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirebaseConfigFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FirebaseConfigFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
