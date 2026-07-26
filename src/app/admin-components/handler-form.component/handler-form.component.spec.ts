import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandlerFormComponent } from './handler-form.component';

describe('HandlerFormComponent', () => {
  let component: HandlerFormComponent;
  let fixture: ComponentFixture<HandlerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HandlerFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HandlerFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
