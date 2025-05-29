import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppUsersReadPageComponent } from './app-users-read-page.component';

describe('AppUsersReadPageComponent', () => {
  let component: AppUsersReadPageComponent;
  let fixture: ComponentFixture<AppUsersReadPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppUsersReadPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppUsersReadPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
