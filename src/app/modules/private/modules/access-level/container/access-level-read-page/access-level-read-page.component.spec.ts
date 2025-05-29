import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessLevelReadPageComponent } from './access-level-read-page.component';

describe('AccessLevelReadPageComponent', () => {
  let component: AccessLevelReadPageComponent;
  let fixture: ComponentFixture<AccessLevelReadPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccessLevelReadPageComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessLevelReadPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
