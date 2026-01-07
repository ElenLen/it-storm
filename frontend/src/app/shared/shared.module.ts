import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PasswordRepeatDirective} from "./directives/password-repeat.directive";
import {RouterModule} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {LoaderComponent} from "./components/loader/loader.component";
import {ArticleCardComponent} from './components/article-card/article-card.component';
import {CommentCardComponent} from './components/comment-card/comment-card.component';

@NgModule({
  declarations: [PasswordRepeatDirective, LoaderComponent, ArticleCardComponent, CommentCardComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    FormsModule,
  ],
  exports: [PasswordRepeatDirective, LoaderComponent, ArticleCardComponent, CommentCardComponent],
})
export class SharedModule {
}
