import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternationalTelephoneComponent } from './international-telephone.component';

describe('InternationalTelephoneComponent', () => {
  let component: InternationalTelephoneComponent;
  let fixture: ComponentFixture<InternationalTelephoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InternationalTelephoneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternationalTelephoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
