import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopServicesFormComponent } from './workshop-services-form.component';

describe('WorkshopServicesFormComponent', () => {
  let component: WorkshopServicesFormComponent;
  let fixture: ComponentFixture<WorkshopServicesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkshopServicesFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkshopServicesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
