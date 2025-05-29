import { AbstractControl } from '@angular/forms';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { ImageCroppedEvent, OutputFormat } from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpRequest,
} from '@angular/common/http';
import { environment } from '@environments/environment';

type TImage = '.png' | '.jpeg' | '.jpg' | '.gif';

@Component({
  selector: 'app-image-crop',
  templateUrl: './image-crop.component.html',
  styleUrls: ['./image-crop.component.scss'],
})
export class ImageCropComponent implements AfterViewInit {
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  @Input() control!: AbstractControl;
  @Input() aspectRatio = 1 / 1;
  @Input() outputTypeExtension: OutputFormat = 'png';
  @Input() acceptedExtensions: TImage[] = ['.png', '.jpeg', '.jpg', '.gif'];
  @ViewChild('file') file!: ElementRef;
  @ViewChild('modal') modal!: ElementRef;
  imgChangeEvt!: Event;
  imageFile!: File;

  imageChangedEvent!: ImageCroppedEvent;
  croppedImage: string = '';
  baseUrl: string = environment.url;
  progress = 0;

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files: FileList | null = target.files;
    this.imgChangeEvt = event;
    if (files && files[0]) {
      this.imageFile = files[0];
      this.openModal();
    }
  }

  openModal() {
    this.modal.nativeElement.showModal();
  }

  closeModal() {
    this.modal.nativeElement.close();
    this.resetInput();
  }

  cropImg(e: ImageCroppedEvent) {
    this.imageChangedEvent = e;
  }

  imgLoad() {
    // display cropper tool
  }
  initCropper() {
    // init cropper
  }

  imgFailed() {
    // error msg
  }

  ngAfterViewInit(): void {
    this.file.nativeElement.addEventListener('change', (event: Event) => {
      this.onFileChange(event);
    });
  }

  uploadFile() {
    if (!this.imageChangedEvent?.blob) return;

    const formData = new FormData();

    const headers = new HttpHeaders({
      processData: 'false',
      ContentType: 'multipart/form-data',
      reportProgress: 'true',
      responseType: 'json',
    });

    formData.append(
      'file',
      this.imageChangedEvent.blob,
      `${this.imageFile.name}`
    );

    formData.append('returnWithUrl', 'true');

    const req = new HttpRequest(
      'POST',
      `${this.baseUrl}/api/v1/File/Upload`,
      formData,
      {
        headers,
        reportProgress: true,
        responseType: 'json',
      }
    );

    const httpEvent = this.http.request(req);
    this.closeModal();

    httpEvent.subscribe((event: HttpEvent<any>) => {
      switch (event.type) {
        case HttpEventType.Sent:
          break;
        case HttpEventType.ResponseHeader:
          break;

        case HttpEventType.UploadProgress:
          if (event.total) {
            this.progress = Math.round((event.loaded / event.total) * 100);
          }
          break;

        case HttpEventType.Response:
          this.control.setValue(event.body.data.fileName);
          setTimeout(() => {
            this.progress = 0;
          }, 1500);
      }
    });
  }

  resetInput() {
    this.file.nativeElement.value = '';
  }

  resetControlValue() {
    this.control.setValue('');
  }
}
