import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessLevelCreatePageComponent } from './access-level-create-page.component';

describe('AccessLevelCreatePageComponent', () => {
  let component: AccessLevelCreatePageComponent;
  let fixture: ComponentFixture<AccessLevelCreatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccessLevelCreatePageComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessLevelCreatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
