import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrivateRoutingModule } from './private-routing.module';
import { PrivateComponent } from './private.component';
import { SharedModule } from '@shared/shared.module';
import { AsideMenuComponent } from './components/aside-menu/aside-menu.component';
import { MenuComponent } from './components/menu/menu.component';

@NgModule({
  declarations: [PrivateComponent, AsideMenuComponent, MenuComponent],
  imports: [CommonModule, SharedModule, PrivateRoutingModule],
})
export class PrivateModule {}
