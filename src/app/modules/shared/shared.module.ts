import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { ImageUploadComponent } from '@shared/components/files-upload/files-upload.component';
import { FormErrorComponent } from '@shared/components/form-error/form-error.component';
import { RouterModule } from '@angular/router';
import { ListPaginationComponent } from '@app/modules/shared/components/crud-components/list-pagination/list-pagination.component';
import { AlertComponent } from '@shared/components/alert/alert.component';
import { GraphicLineComponent } from '@shared/components/graphic-line/graphic-line.component';
import { GraphIndicatorComponent } from '@shared/components/graph-indicator/graph-indicator.component';
import { ButtonExportComponent } from '@shared/components/button-export/button-export.component';
import { AudioComponent } from '@shared/components/audio/audio.component';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { ViewImageComponent } from '@shared/components/view-image/view-image.component';
import { ReadComponent } from '@shared/components/crud-components/read/read.component';
import { FormPageComponent } from '@shared/components/crud-components/form-page/form-page.component';
import { FilterComponent } from '@shared/components/crud-components/filter/filter.component';
import { FormComponent } from '@shared/components/crud-components/form/form.component';
import { ListComponent } from '@shared/components/crud-components/list/list.component';
import { ListStatusButtonComponent } from '@shared/components/crud-components/list-status-button/list-status-button.component';
import { ListActionsButtonComponent } from '@shared/components/crud-components/list-actions-button/list-actions-button.component';
import { DetailsComponent } from '@shared/components/crud-components/details/details.component';
import { CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { CarouselComponent } from '@shared/components/carrousel/carousel.component';
import { NotificationsComponent } from '@shared/components/notifications/notifications.component';
import { NotificationsModalComponent } from '@shared/components/notifications/components/notifications-modal/notifications-modal.component';
import { BankDataComponent } from '@shared/components/bank-data/bank-data.component';
import { DatePickerComponent } from '@shared/components/date-picker/date-picker.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { PDFImageViewerComponent } from '@shared/components/pdf-image-viewer/pdf-image-viewer.component';
import { ImageCropComponent } from './components/image-crop/image-crop.component';
import { RangeDateComponent } from './components/range-date/range-date.component';
import { TogglePasswordDisplayDirective } from '@app/core/directives/toggle-password-display/toggle-password-display.directive';
import { InternationalTelephoneComponent } from './components/international-telephone/international-telephone.component';
import { CustomCurrencyMaskConfig } from '@app/core/interfaces/CORE/ICustomCurrency';
import { ChatDatePipe } from '@app/core/pipes/CORE/chat-date';
import { CustomDate } from '@app/core/pipes/CORE/custom-date';
import { SelectComponent } from './components/select/select.component';
import { PipesModule } from '@app/core/pipes/pipes.module';

const modules = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  ImageCropperModule,
  HttpClientModule,
  CurrencyMaskModule,
  RouterModule,
  NgxMaskDirective,
  NgxMaskPipe,
];

const components = [
  ButtonComponent,
  LoadingComponent,
  ListPaginationComponent,
  ImageUploadComponent,
  FormErrorComponent,
  AlertComponent,
  GraphicLineComponent,
  GraphIndicatorComponent,
  ButtonExportComponent,
  AudioComponent,
  LoaderComponent,
  ViewImageComponent,
  ReadComponent,
  FormPageComponent,
  FilterComponent,
  FormComponent,
  ListComponent,
  ListActionsButtonComponent,
  ListStatusButtonComponent,
  DetailsComponent,
  ModalComponent,
  CarouselComponent,
  NotificationsComponent,
  NotificationsModalComponent,
  BankDataComponent,
  DatePickerComponent,
  PDFImageViewerComponent,
  ImageCropComponent,
  RangeDateComponent,
  InternationalTelephoneComponent,
  SelectComponent,
];

const directives = [TogglePasswordDisplayDirective];

@NgModule({
  declarations: [...components, ...directives],
  imports: [...modules, PipesModule],
  exports: [...modules, ...components, ...directives, PipesModule],
  providers: [
    CustomDate,
    ChatDatePipe,
    DatePipe,
    CurrencyPipe,
    provideNgxMask(),
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
  ],
})
export class SharedModule {}
