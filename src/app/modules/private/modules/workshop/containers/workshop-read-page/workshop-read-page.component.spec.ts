import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopReadPageComponent } from './workshop-read-page.component';

describe('WorkshopReadPageComponent', () => {
  let component: WorkshopReadPageComponent;
  let fixture: ComponentFixture<WorkshopReadPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkshopReadPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkshopReadPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
