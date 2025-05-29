import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministratorsUpdatePageComponent } from './administrators-update-page.component';

describe('AdministratorsUpdatePageComponent', () => {
  let component: AdministratorsUpdatePageComponent;
  let fixture: ComponentFixture<AdministratorsUpdatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministratorsUpdatePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministratorsUpdatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
