import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopServicesUpdatePageComponent } from './workshop-services-update-page.component';

describe('WorkshopServicesUpdatePageComponent', () => {
  let component: WorkshopServicesUpdatePageComponent;
  let fixture: ComponentFixture<WorkshopServicesUpdatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkshopServicesUpdatePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkshopServicesUpdatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
