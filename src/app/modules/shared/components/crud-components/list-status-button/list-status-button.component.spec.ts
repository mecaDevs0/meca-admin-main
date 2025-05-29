import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListStatusButtonComponent } from './list-status-button.component';

describe('ListStatusButtonComponent', () => {
  let component: ListStatusButtonComponent;
  let fixture: ComponentFixture<ListStatusButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListStatusButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListStatusButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
