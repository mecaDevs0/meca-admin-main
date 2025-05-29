import { Directive, ElementRef, Input, OnInit } from '@angular/core';

type TInputType = 'text' | 'password';

@Directive({
  selector: '[appTogglePasswordDisplay]',
})
export class TogglePasswordDisplayDirective implements OnInit {
  @Input() top = '46px';
  @Input() position: 'absolute' | 'relative' | 'fixed' = 'absolute';
  @Input() right = '15px';
  readonly settings = {
    text: { img: 'assets/icons/eye-slash-regular.svg' },
    password: { img: 'assets/icons/eyes.svg' },
  };

  constructor(private inputElement: ElementRef<HTMLInputElement>) {}

  ngOnInit(): void {
    this.createImgTag();
  }

  createImgTag(): void {
    const $ = this.inputElement.nativeElement;
    const img = document.createElement('img');
    img.src = this.settings.password.img;
    const parent = $.parentNode;
    parent?.appendChild(img);
    const style = `
    position: ${this.position};
    right: ${this.right};
    top: ${this.top};
    cursor: pointer;
    width: 24px;
    height: 24px
    `;
    img.setAttribute('style', style);
    img.addEventListener('click', () => {
      const type = $.getAttribute('type') as TInputType;
      if (type == 'password') {
        $.setAttribute('type', 'text');
        img.src = this.settings.text.img;
      } else {
        $.setAttribute('type', 'password');
        img.src = this.settings.password.img;
      }
    });
  }
}
