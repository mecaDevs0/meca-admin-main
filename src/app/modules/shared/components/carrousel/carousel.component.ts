import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertMessages } from '@classes/AlertMessages';
import { HttpService } from '@core/services/http/http.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent {
  @Output() imagesEmitter = new EventEmitter();
  @Input() images: string[] = [];
  baseUrl: string = environment.url;
  celWidth = 350;
  celHeight = 350;
  currentIndex = 0;
  @Input() maxImages = 3;

  constructor(private http: HttpService<FileList>) {
    this.handleInnerWidth();
  }

  handleInnerWidth = () => {
    if (window.innerWidth < 768) {
      this.celWidth = 320;
    }
  };

  previous = () => {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  };

  next = () => {
    if (this.currentIndex < this.images?.length - 1) {
      this.currentIndex++;
    }
  };

  handleFileImage = (event: Event) => {
    const target = event?.target as HTMLInputElement;
    const files: FileList = target.files as FileList;

    if (files.length + this.images.length <= this.maxImages) {
      if (files && files[0]) {
        this.http.uploadFiles(files).subscribe(({ data }) => {
          data?.fileNames.forEach((el: string) => {
            this.images?.push(el);
            this.imagesEmitter.emit(this.images);
          });
        });
      }
    } else {
      AlertMessages.error(
        `Você só pode carregar no máximo (${
          this.maxImages - this.images.length
        }) arquivo(s)`
      );
    }
  };

  handleRemove = () => {
    this.images.splice(this.currentIndex, 1);
    this.currentIndex--;
    this.imagesEmitter.emit(this.images);
  };
}
