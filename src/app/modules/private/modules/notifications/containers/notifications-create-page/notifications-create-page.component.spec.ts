import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsCreatePageComponent } from './notifications-create-page.component';

describe('NotificationsCreatePageComponent', () => {
  let component: NotificationsCreatePageComponent;
  let fixture: ComponentFixture<NotificationsCreatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationsCreatePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsCreatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
