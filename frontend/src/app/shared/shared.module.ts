import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PasswordRepeatDirective} from "./directives/password-repeat.directive";
import {RouterModule} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {LoaderComponent} from "./components/loader/loader.component";

@NgModule({
  declarations: [PasswordRepeatDirective, LoaderComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    FormsModule,
  ],
  exports: [PasswordRepeatDirective, LoaderComponent],
})
export class SharedModule {
}
