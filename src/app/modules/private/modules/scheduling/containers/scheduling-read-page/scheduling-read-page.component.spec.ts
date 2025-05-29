import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulingReadPageComponent } from './scheduling-read-page.component';

describe('SchedulingReadPageComponent', () => {
  let component: SchedulingReadPageComponent;
  let fixture: ComponentFixture<SchedulingReadPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SchedulingReadPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SchedulingReadPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
