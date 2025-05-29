import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopServicesDetailsComponent } from './workshop-services-details.component';

describe('WorkshopServicesDetailsComponent', () => {
  let component: WorkshopServicesDetailsComponent;
  let fixture: ComponentFixture<WorkshopServicesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkshopServicesDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkshopServicesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
