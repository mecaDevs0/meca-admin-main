import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { KeyboardComponent } from './keyboard.component';
import { KeyboardKeyDirective } from './directive/keyboard-key.directive';
import { OskInputDirective } from './directive/osk-input.directive';

const components = [KeyboardComponent];

const directives = [KeyboardKeyDirective, OskInputDirective];

@NgModule({
  declarations: [...components, ...directives],
  exports: [...components, ...directives],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class KeyboardModule {}
