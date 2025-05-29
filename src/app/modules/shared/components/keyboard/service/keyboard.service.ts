import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { multicast } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class KeyboardService {
  private _shift: boolean = false;

  private _alt: boolean = false;

  private _keyboardRequested: Subject<boolean>;
  private _shiftChanged: Subject<boolean>;
  private _altChanged: Subject<boolean>;
  private _keyPressed: Subject<string>;
  private _backspacePressed: Subject<void>;
  private _enterPressed: Subject<void>;

  message: string = '';

  constructor() {
    this._keyboardRequested = new Subject<boolean>();
    this._shiftChanged = new Subject<boolean>();
    this._altChanged = new Subject<boolean>();
    this._keyPressed = new Subject<string>();
    this._backspacePressed = new Subject<void>();
    this._enterPressed = new Subject<void>();
  }

  get shift(): boolean {
    return this._shift;
  }

  set shift(value: boolean) {
    this._shiftChanged.next((this._shift = value));
  }

  get alt(): boolean {
    return this._alt;
  }

  set alt(value: boolean) {
    this._altChanged.next((this._alt = value));
  }

  get keyboardRequested() {
    return this._keyboardRequested;
  }

  get shiftChanged() {
    return this._shiftChanged;
  }

  get altChanged() {
    return this._altChanged;
  }

  get keyPressed() {
    return this._keyPressed;
  }

  get backspacePressed() {
    return this._backspacePressed;
  }

  get enterPressed() {
    return this._enterPressed;
  }

  fireKeyboardRequested(show: boolean) {
    this._keyboardRequested.next(show);
  }

  fireKeyPressed(key: string) {
    this.message += key;
    this._keyPressed.next(key);
  }

  fireBackspacePressed() {
    this.message = this.message.substr(0, this.message.length - 1);
    this._backspacePressed.next();
  }

  fireEnterPressed() {
    if (this.message) {
      this._enterPressed.next();
      this.message = '';
    }
  }
}
