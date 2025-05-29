import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministratorsReadPageComponent } from './administrators-read-page.component';

describe('AdministratorsReadPageComponent', () => {
  let component: AdministratorsReadPageComponent;
  let fixture: ComponentFixture<AdministratorsReadPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministratorsReadPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministratorsReadPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
