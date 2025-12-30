import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PasswordRepeatDirective} from "./directives/password-repeat.directive";
import {RouterModule} from "@angular/router";

@NgModule({
  declarations: [PasswordRepeatDirective],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [PasswordRepeatDirective],
})
export class SharedModule {
}
