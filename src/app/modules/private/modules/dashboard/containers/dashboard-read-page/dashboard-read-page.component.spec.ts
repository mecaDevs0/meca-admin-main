import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardReadPageComponent } from './dashboard-read-page.component';

describe('DashboardReadPageComponent', () => {
  let component: DashboardReadPageComponent;
  let fixture: ComponentFixture<DashboardReadPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardReadPageComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardReadPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
