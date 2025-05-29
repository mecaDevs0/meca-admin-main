import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingReadPageComponent } from './rating-read-page.component';

describe('RatingReadPageComponent', () => {
  let component: RatingReadPageComponent;
  let fixture: ComponentFixture<RatingReadPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RatingReadPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RatingReadPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
