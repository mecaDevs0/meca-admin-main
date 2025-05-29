import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopServicesComponent } from './workshop-services.component';

describe('WorkshopServicesComponent', () => {
  let component: WorkshopServicesComponent;
  let fixture: ComponentFixture<WorkshopServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkshopServicesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkshopServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
