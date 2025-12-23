import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UserRoutingModule} from './user-routing.module';
import {LoginComponent} from './login/login.component';
import {SignupComponent} from './signup/signup.component';
import {ReactiveFormsModule} from "@angular/forms";
import { AgreeComponent } from './agree/agree.component';


@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    AgreeComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    ReactiveFormsModule
  ]
})
export class UserModule {
}
