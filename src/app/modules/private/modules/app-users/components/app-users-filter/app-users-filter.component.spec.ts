import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppUsersFilterComponent } from './app-users-filter.component';

describe('AppUsersFilterComponent', () => {
  let component: AppUsersFilterComponent;
  let fixture: ComponentFixture<AppUsersFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppUsersFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppUsersFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
