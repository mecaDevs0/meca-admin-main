import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PDFImageViewerComponent } from './pdf-image-viewer.component';

describe('PDFImageViewerComponent', () => {
  let component: PDFImageViewerComponent;
  let fixture: ComponentFixture<PDFImageViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PDFImageViewerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PDFImageViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
