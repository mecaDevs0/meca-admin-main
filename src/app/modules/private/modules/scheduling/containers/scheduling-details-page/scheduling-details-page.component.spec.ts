import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulingDetailsPageComponent } from './scheduling-details-page.component';

describe('SchedulingDetailsPageComponent', () => {
  let component: SchedulingDetailsPageComponent;
  let fixture: ComponentFixture<SchedulingDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SchedulingDetailsPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SchedulingDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
