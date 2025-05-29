import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessLevelListComponent } from './access-level-list.component';

describe('AccessLevelListComponent', () => {
  let component: AccessLevelListComponent;
  let fixture: ComponentFixture<AccessLevelListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessLevelListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessLevelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
