import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from './alert.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { trimWhiteSpace } from '@app/core/functions/validators.function';

export interface IConfigAlert {
  open: boolean;
  title: string;
  isReason: boolean;
}

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent implements OnDestroy {
  config: IConfigAlert = {
    open: false,
    title: '',
    isReason: false,
  };
  private subscription!: Subscription;

  reasonForm: FormGroup;

  constructor(public alertService: AlertService, private fb: FormBuilder) {
    this.listenChanges();

    this.reasonForm = this.fb.group({
      reason: [null, [trimWhiteSpace, Validators.required]],
    });
  }

  listenChanges = () => {
    this.subscription = this.alertService.observer
      .asObservable()
      .subscribe((config: IConfigAlert) => {
        if (config) {
          this.config = config;
          this.reasonForm.reset();
        }
      });
  };

  onClose = () => (this.config.open = false);

  handlerResponse = (response: boolean) => {
    this.alertService.response = response;
    this.config.open = false;
  };

  handlerReasonResponse = (response: boolean) => {
    if (response && this.reasonForm.invalid) {
      this.reasonForm.get('reason')?.markAllAsTouched();
      return;
    }

    this.alertService.reasonResponse = this.reasonForm.value.reason;
    this.alertService.hasReasonResponse = response;
    this.config.open = false;
  };

  displayFieldCss(field: string): any {
    return { 'has-error': this.isFieldValid(field) };
  }

  isFieldValid = (field: string): any => {
    return (
      this.reasonForm.get(field)?.touched &&
      this.reasonForm?.get(field)?.invalid
    );
  };

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
