import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopServicesCreatePageComponent } from './workshop-services-create-page.component';

describe('WorkshopServicesCreatePageComponent', () => {
  let component: WorkshopServicesCreatePageComponent;
  let fixture: ComponentFixture<WorkshopServicesCreatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkshopServicesCreatePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkshopServicesCreatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
