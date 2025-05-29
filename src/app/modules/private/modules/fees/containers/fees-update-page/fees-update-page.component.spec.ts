import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesUpdatePageComponent } from './fees-update-page.component';

describe('FeesUpdatePageComponent', () => {
  let component: FeesUpdatePageComponent;
  let fixture: ComponentFixture<FeesUpdatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeesUpdatePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeesUpdatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
