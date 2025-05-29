import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessLevelComponent } from './access-level.component';

describe('AccessLevelComponent', () => {
  let component: AccessLevelComponent;
  let fixture: ComponentFixture<AccessLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessLevelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
