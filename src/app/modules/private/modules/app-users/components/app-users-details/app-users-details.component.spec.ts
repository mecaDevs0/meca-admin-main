import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppUsersDetailsComponent } from './app-users-details.component';

describe('AppUsersDetailsComponent', () => {
  let component: AppUsersDetailsComponent;
  let fixture: ComponentFixture<AppUsersDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppUsersDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppUsersDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
