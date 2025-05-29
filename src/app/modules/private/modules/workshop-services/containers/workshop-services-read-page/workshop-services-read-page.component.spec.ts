import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopServicesReadPageComponent } from './workshop-services-read-page.component';

describe('WorkshopServicesReadPageComponent', () => {
  let component: WorkshopServicesReadPageComponent;
  let fixture: ComponentFixture<WorkshopServicesReadPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkshopServicesReadPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkshopServicesReadPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
