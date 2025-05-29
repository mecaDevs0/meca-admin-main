import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  HostBinding,
  ElementRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { KeyboardService } from './service/keyboard.service';

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.scss'],
})
export class KeyboardComponent implements OnInit {
  @HostBinding('class.shown')
  private shown: boolean = false;

  private keyboardSubscription!: Subscription;

  constructor(private el: ElementRef, public keyboard: KeyboardService) {}

  ngOnInit() {
    this.keyboardSubscription = this.keyboard.keyboardRequested.subscribe(
      (show) => {
        if (show) {
          this.shown = true;
        } else {
          this.shown = false;
        }
      }
    );
  }

  ngOnDestroy() {
    this.keyboardSubscription.unsubscribe();
  }

  onShift() {
    this.keyboard.shift = !this.keyboard.shift;
  }

  onAlt() {
    this.keyboard.alt = !this.keyboard.alt;
    this.keyboard.shift = false;
  }

  onBackspace() {
    this.keyboard.fireBackspacePressed();
  }

  onEnter() {
    this.keyboard.fireEnterPressed();
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('click', ['$event'])
  onMouseEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
}
