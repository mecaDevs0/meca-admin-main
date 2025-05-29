import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopDetailsPageComponent } from './workshop-details-page.component';

describe('WorkshopDetailsPageComponent', () => {
  let component: WorkshopDetailsPageComponent;
  let fixture: ComponentFixture<WorkshopDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkshopDetailsPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkshopDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
