import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppUsersDetailsPageComponent } from './app-users-details-page.component';

describe('AppUsersDetailsPageComponent', () => {
  let component: AppUsersDetailsPageComponent;
  let fixture: ComponentFixture<AppUsersDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppUsersDetailsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppUsersDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
