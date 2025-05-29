import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministratorsFilterComponent } from './administrators-filter.component';

describe('AdministratorsFilterComponent', () => {
  let component: AdministratorsFilterComponent;
  let fixture: ComponentFixture<AdministratorsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministratorsFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministratorsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
