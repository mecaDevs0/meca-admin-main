import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonExportComponent } from './button-export.component';

describe('ButtonExportImportComponent', () => {
  let component: ButtonExportComponent;
  let fixture: ComponentFixture<ButtonExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtonExportComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
