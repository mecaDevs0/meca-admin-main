import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessLevelFilterComponent } from './access-level-filter.component';

describe('AccessLevelFilterComponent', () => {
  let component: AccessLevelFilterComponent;
  let fixture: ComponentFixture<AccessLevelFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessLevelFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessLevelFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
