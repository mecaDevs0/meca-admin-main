import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessLevelUpdatePageComponent } from './access-level-update-page.component';

describe('AccessLevelUpdatePageComponent', () => {
  let component: AccessLevelUpdatePageComponent;
  let fixture: ComponentFixture<AccessLevelUpdatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccessLevelUpdatePageComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessLevelUpdatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
