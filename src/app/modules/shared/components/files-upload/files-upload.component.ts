import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { CompressorService } from '@app/core/services/compressor/compressor.service';
import { HttpService } from '@app/core/services/http/http.service';
import { IFileUpload } from '@app/core/interfaces/CORE/IFileUpload';
import { AlertMessages } from '@app/core/classes/AlertMessages';

@Component({
  selector: 'app-files-upload',
  templateUrl: './files-upload.component.html',
  styleUrls: ['./files-upload.component.scss'],
})
export class ImageUploadComponent {
  @Input() widthImage: number = 1920;
  @Input() heightImage: number = 1080;
  @Input() widthContainer: number = 210;
  @Input() heightContainer: number = 175;
  @Input() labelDimensions: boolean = false;
  @Input() labelExtension: boolean = false;
  @Input() control!: AbstractControl;
  @Input() label: string = 'os arquivos';
  @Input() accept: string =
    'image/png, image/jpeg, image/jpg, application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint, text/plain, application/pdf';
  @Input() compress: boolean = true;
  @Input() cssInline: boolean = false;
  @Input() readOnly: boolean = false;
  @Input() isMultiple: boolean = false;
  baseRef = `${environment.url}/content/upload/`;

  @ViewChild('file') fileButton!: ElementRef;
  buttonLoading = false;

  constructor(
    private httpService: HttpService<IFileUpload>,
    private compressorService: CompressorService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  dragOverHandler(ev: any) {
    ev.preventDefault();
  }

  dropHandler(ev: any) {
    ev.preventDefault();
    if (this.buttonLoading === false && ev.dataTransfer.items) {
      // Use a interface DataTransferItemList para acessar o (s) arquivo (s)
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        // Se os itens soltos não forem arquivos, rejeite-os
        if (ev.dataTransfer.items[i].kind === 'file') {
          var file = ev.dataTransfer.items[i].getAsFile();
          this.handleSetFile([file]);
        }
      }
    }
  }

  handleSetFile = (event: any) => {
    const file: FileList = event?.target?.files || event;

    let isValid = true;
    for (let i = 0; i < file.length; i++) {
      if (!this.accept.includes(file.item(i)?.type as any)) {
        isValid = false;
        AlertMessages.error(
          `Extensão de arquivo inválida. Precisa ser no(s) formato(s): (${this.handleTypesAccept()})`
        );
        return;
      }
    }

    if (file && file.length) {
      if (this.isMultiple) {
        this.handleMultipleFiles(file);
      } else {
        this.handleUniqFile(file);
      }
    }
  };

  handleMultipleFiles(file: FileList) {
    this.buttonLoading = true;

    if (this.compress === true) {
      let filesArray: File[] = [];

      for (let i = 0; i < file.length; i++) {
        if (file.item(i)?.type.includes('image')) {
          this.compressorService
            .compressFile(file.item(i) as File, {
              width: this.widthImage,
              height: this.heightImage,
            })
            .subscribe((result: Blob) => {
              const compressedFile = new File(
                [result],
                file.item(i)?.name || 'compressed_file',
                {
                  type: file.item(i)?.type,
                }
              );

              filesArray.push(compressedFile);
            });
        } else {
          filesArray.push(file.item(i) as File);
        }
      }

      setTimeout(() => {
        const dataTransfer = new DataTransfer();
        filesArray.forEach((file: File) => dataTransfer.items.add(file));
        let files: FileList = dataTransfer.files;

        this.httpService.uploadFiles(files, false, '', true).subscribe(
          ({ data }) => {
            this.buttonLoading = false;
            this.control?.setValue([...this.control.value, ...data?.fileNames]);
            this.changeDetectorRef.detectChanges();
          },
          (err: any) => {
            this.buttonLoading = false;
          }
        );
      }, 1000);
    } else {
      this.httpService.uploadFiles(file, false, '', true).subscribe(
        ({ data }) => {
          this.buttonLoading = false;
          this.control.setValue([...this.control.value, ...data?.fileNames]);
          this.changeDetectorRef.detectChanges();
        },
        (err: any) => {
          this.buttonLoading = false;
        }
      );
    }
  }

  handleUniqFile(file: FileList) {
    this.buttonLoading = true;

    if (this.compress === true) {
      let fileItem: File;
      if (file.item(0)?.type.includes('image')) {
        this.compressorService
          .compressFile(file.item(0) as File, {
            width: this.widthImage,
            height: this.heightImage,
          })
          .subscribe((result: Blob) => {
            fileItem = new File(
              [result],
              file.item(0)?.name || 'compressed_file',
              {
                type: file.item(0)?.type,
              }
            );
          });
      } else {
        fileItem = file.item(0) as File;
      }

      setTimeout(() => {
        this.httpService
          .uploadFile(fileItem as File, false, '', true)
          .subscribe(
            ({ data }) => {
              this.buttonLoading = false;
              this.control?.setValue(data?.fileName);
              this.changeDetectorRef.detectChanges();
            },
            (err: any) => {
              this.buttonLoading = false;
            }
          );
      }, 1000);
    } else {
      this.httpService
        .uploadFile(file.item(0) as File, false, '', true)
        .subscribe(
          ({ data }) => {
            this.buttonLoading = false;
            this.control.setValue(data?.fileName);
            this.changeDetectorRef.detectChanges();
          },
          (err: any) => {
            this.buttonLoading = false;
          }
        );
    }
  }

  handleRemoveFile(index: number | null = null) {
    if (index === null) {
      this.control.setValue(null);
      this.fileButton.nativeElement.value = '';
      this.changeDetectorRef.detectChanges();
    } else {
      let files = this.control.value?.filter(
        (el: any, i: number) => i !== index
      );
      this.control.setValue(files);
      this.fileButton.nativeElement.value = '';
      this.changeDetectorRef.detectChanges();
    }
  }

  handleTypesAccept() {
    const types = this.accept?.split(', ');
    const extensions = types.map((type) => '.' + type.split('/')[1]);
    return `${extensions.join(', ').toUpperCase()}`;
  }
}
