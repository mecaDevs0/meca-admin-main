import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-pdf-image-viewer',
  templateUrl: './pdf-image-viewer.component.html',
  styleUrls: ['./pdf-image-viewer.component.scss'],
})
export class PDFImageViewerComponent implements OnInit {
  @Input() url?: string;
  isImage = true;
  @ViewChild('modal') modal!: ElementRef;

  ngOnInit(): void {
    if (this.url?.includes('.pdf')) this.isImage = false;
  }

  toggleFormModal(): void {
    const modal = this.modal.nativeElement;
    if (modal.open) modal.close();
    else modal.showModal();
  }
}
