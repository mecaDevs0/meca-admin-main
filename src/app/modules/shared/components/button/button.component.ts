import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input()
  buttonType = 'button';

  @Input()
  buttonClass?: string;

  @Input()
  buttonDisabled?: boolean;

  @Input()
  buttonLoading?: boolean;

  @Input()
  label = 'Salvar';

  @Input()
  height = '50px';

  @Input()
  backgroundColor = 'var(--secondaryColor)';

  @Input()
  buttonLoadingColor = '#ffffff';
}
