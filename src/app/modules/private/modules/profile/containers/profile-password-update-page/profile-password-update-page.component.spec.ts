import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePasswordUpdatePageComponent } from './profile-password-update-page.component';

describe('ProfilePasswordUpdatePageComponent', () => {
  let component: ProfilePasswordUpdatePageComponent;
  let fixture: ComponentFixture<ProfilePasswordUpdatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilePasswordUpdatePageComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilePasswordUpdatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
