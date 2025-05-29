import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphIndicatorComponent } from './graph-indicator.component';

describe('GraphIndicatorComponent', () => {
  let component: GraphIndicatorComponent;
  let fixture: ComponentFixture<GraphIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraphIndicatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
