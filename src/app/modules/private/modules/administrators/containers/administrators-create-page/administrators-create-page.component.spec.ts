import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministratorsCreatePageComponent } from './administrators-create-page.component';

describe('AdministratorsCreatePageComponent', () => {
  let component: AdministratorsCreatePageComponent;
  let fixture: ComponentFixture<AdministratorsCreatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministratorsCreatePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministratorsCreatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
