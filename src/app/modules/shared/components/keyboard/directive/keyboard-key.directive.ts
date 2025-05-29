import {
  Directive,
  Input,
  HostBinding,
  HostListener,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { KeyboardService } from '../service/keyboard.service';

@Directive({
  selector: '[appKeyboardKey]',
})
export class KeyboardKeyDirective implements OnInit, OnDestroy {
  private _values!: string[];
  private isShifted!: boolean;
  private isAlt!: boolean;

  @Input('appKeyboardKey') values!: string;

  @HostBinding('innerText') currentValue!: string;

  constructor(private keyboard: KeyboardService) {}

  ngOnInit() {
    this._values = this.values.split(' ');
    this.currentValue = this._values[0];

    this.keyboard.shiftChanged.subscribe((shift) => {
      this.isShifted = shift;
      this.updateCurrentValue();
    });
    this.keyboard.altChanged.subscribe((alt) => {
      this.isAlt = alt;
      this.updateCurrentValue();
    });
  }

  ngOnDestroy() {
    this.keyboard.shiftChanged.unsubscribe();
    this.keyboard.altChanged.unsubscribe();
  }

  updateCurrentValue() {
    if (!this.isAlt) {
      if (!this.isShifted) {
        this.currentValue = this._values[0];
      } else {
        this.currentValue = this._values[0].toUpperCase();
      }
    } else {
      if (!this.isShifted) {
        this.currentValue = this._values[1];
      } else {
        this.currentValue = this._values[2];
      }
    }
  }

  @HostListener('click')
  onClick() {
    this.keyboard.fireKeyPressed(this.currentValue);
  }
}
