import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulingDetailsComponent } from './scheduling-details.component';

describe('SchedulingDetailsComponent', () => {
  let component: SchedulingDetailsComponent;
  let fixture: ComponentFixture<SchedulingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SchedulingDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SchedulingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
