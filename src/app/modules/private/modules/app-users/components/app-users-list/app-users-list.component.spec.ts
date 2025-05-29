import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppUsersListComponent } from './app-users-list.component';

describe('AppUsersListComponent', () => {
  let component: AppUsersListComponent;
  let fixture: ComponentFixture<AppUsersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppUsersListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppUsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
