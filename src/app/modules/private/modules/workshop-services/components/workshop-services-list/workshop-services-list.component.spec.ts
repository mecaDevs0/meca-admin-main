import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopServicesListComponent } from './workshop-services-list.component';

describe('WorkshopServicesListComponent', () => {
  let component: WorkshopServicesListComponent;
  let fixture: ComponentFixture<WorkshopServicesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkshopServicesListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkshopServicesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
