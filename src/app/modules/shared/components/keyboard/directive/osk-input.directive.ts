import {
  Directive,
  OnInit,
  ElementRef,
  Renderer2,
  HostListener,
  EventEmitter,
  Output,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { KeyboardService } from '../service/keyboard.service';

@Directive({
  selector: '[appOskInput]',
})
export class OskInputDirective implements OnInit {
  private keySubscription!: Subscription;
  private backspaceSubscription!: Subscription;
  private enterSubscription!: Subscription;
  private measure!: HTMLElement;

  @Output() enterPressed = new EventEmitter<string>();

  constructor(private el: ElementRef, private keyboard: KeyboardService) {}

  ngOnInit() {
    let thisStyle = window.getComputedStyle(this.el.nativeElement);
    this.measure = document.createElement('span');
    this.measure.style.position = 'absolute';
    this.measure.style.right = '100%';
    this.measure.style.font = thisStyle.font;
    document.body.appendChild(this.measure);
  }

  @HostListener('focus')
  private onFocus() {
    this.keyboard.fireKeyboardRequested(true);
    this.subscribeToKeyboardEvents();
  }

  @HostListener('blur')
  private onBlur() {
    this.keyboard.fireKeyboardRequested(false);
    this.unsubscribeFromKeyboardEvents();
  }

  private subscribeToKeyboardEvents() {
    this.keySubscription = this.keyboard.keyPressed.subscribe((key) =>
      this.onKey(key)
    );
    this.backspaceSubscription = this.keyboard.backspacePressed.subscribe((_) =>
      this.onBackspace()
    );
    this.enterSubscription = this.keyboard.enterPressed.subscribe((_) =>
      this.onEnter()
    );
  }

  private unsubscribeFromKeyboardEvents() {
    this.keySubscription.unsubscribe();
    this.backspaceSubscription.unsubscribe();
    this.enterSubscription.unsubscribe();
  }

  private onKey(key: string) {
    let element = this.el.nativeElement,
      start = element.selectionStart,
      end = element.selectionEnd;

    this.measure.textContent = element.value.substr(0, start) + key;
    element.value =
      element.value.substr(0, start) + key + element.value.substr(end);
    element.focus();
    element.selectionStart = element.selectionEnd = start + 1;

    this.updateScrollPosition();
  }

  private onBackspace() {
    let element = this.el.nativeElement,
      start = element.selectionStart,
      end = element.selectionEnd;

    if (start == 0) {
      return;
    }

    if (start == end) {
      start--;
    }

    this.measure.textContent = element.value.substr(0, start);
    element.value = element.value.substr(0, start) + element.value.substr(end);
    element.focus();
    element.selectionStart = element.selectionEnd = start;

    this.updateScrollPosition();
  }

  private updateScrollPosition() {
    let element = this.el.nativeElement;
    element.scrollLeft = this.measure.offsetWidth - (element.clientWidth - 10);
  }

  private onEnter() {
    this.enterPressed.emit(this.keyboard.message);
  }
}
