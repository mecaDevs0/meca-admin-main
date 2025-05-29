import { NgModule } from '@angular/core';

import { ProfileComponent } from './profile.component';
import { SharedModule } from '@shared/shared.module';

// Containers
import { ProfileRoutingModule } from './profile-edit-routing.module';
import { ProfileReadPageComponent } from './containers/profile-read-page/profile-read-page.component';
import { ProfileUpdatePageComponent } from './containers/profile-update-page/profile-update-page.component';
import { ProfilePasswordUpdatePageComponent } from './containers/profile-password-update-page/profile-password-update-page.component';

@NgModule({
  declarations: [
    ProfileComponent,
    ProfileReadPageComponent,
    ProfileUpdatePageComponent,
    ProfilePasswordUpdatePageComponent,
  ],
  imports: [SharedModule, ProfileRoutingModule],
})
export class ProfileModule {}
