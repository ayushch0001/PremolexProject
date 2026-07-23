import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivatePages } from './private-pages';

describe('PrivatePages', () => {
  let component: PrivatePages;
  let fixture: ComponentFixture<PrivatePages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivatePages],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivatePages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
