import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileReadPageComponent } from './profile-read-page.component';

describe('ProfileReadPageComponent', () => {
  let component: ProfileReadPageComponent;
  let fixture: ComponentFixture<ProfileReadPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileReadPageComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileReadPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
