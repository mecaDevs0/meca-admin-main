import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessLevelFormComponent } from './access-level-form.component';

describe('AccessLevelFormComponent', () => {
  let component: AccessLevelFormComponent;
  let fixture: ComponentFixture<AccessLevelFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessLevelFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessLevelFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
