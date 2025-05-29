import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministratorsFormComponent } from './administrators-form.component';

describe('AdministratorsFormComponent', () => {
  let component: AdministratorsFormComponent;
  let fixture: ComponentFixture<AdministratorsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministratorsFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministratorsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
