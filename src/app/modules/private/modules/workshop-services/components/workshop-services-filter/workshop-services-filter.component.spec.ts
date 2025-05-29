import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopServicesFilterComponent } from './workshop-services-filter.component';

describe('WorkshopServicesFilterComponent', () => {
  let component: WorkshopServicesFilterComponent;
  let fixture: ComponentFixture<WorkshopServicesFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkshopServicesFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkshopServicesFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
