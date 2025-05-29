import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopServicesDetailsPageComponent } from './workshop-services-details-page.component';

describe('WorkshopServicesDetailsPageComponent', () => {
  let component: WorkshopServicesDetailsPageComponent;
  let fixture: ComponentFixture<WorkshopServicesDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkshopServicesDetailsPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkshopServicesDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
