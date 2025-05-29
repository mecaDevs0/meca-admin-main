import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRecoverPasswordComponent } from './user-recover-password.component';

describe('UserRecoverPasswordComponent', () => {
  let component: UserRecoverPasswordComponent;
  let fixture: ComponentFixture<UserRecoverPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserRecoverPasswordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRecoverPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
