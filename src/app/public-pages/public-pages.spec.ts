import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicPages } from './public-pages';

describe('PublicPages', () => {
  let component: PublicPages;
  let fixture: ComponentFixture<PublicPages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicPages],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicPages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
