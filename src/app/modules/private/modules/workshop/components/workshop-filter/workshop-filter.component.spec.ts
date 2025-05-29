import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopFilterComponent } from './workshop-filter.component';

describe('WorkshopFilterComponent', () => {
  let component: WorkshopFilterComponent;
  let fixture: ComponentFixture<WorkshopFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkshopFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkshopFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
