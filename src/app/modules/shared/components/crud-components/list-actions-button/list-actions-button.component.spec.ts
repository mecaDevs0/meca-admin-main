import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListActionsButtonComponent } from './list-actions-button.component';

describe('ListActionsButtonComponent', () => {
  let component: ListActionsButtonComponent;
  let fixture: ComponentFixture<ListActionsButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListActionsButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListActionsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
