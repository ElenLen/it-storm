import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogRoutingModule } from './blog-routing.module';
import { DetailComponent } from './detail/detail.component';
import { ArticlesComponent } from './articles/articles.component';
import {SharedModule} from "../../shared/shared.module";


@NgModule({
  declarations: [
    DetailComponent,
    ArticlesComponent
  ],
  imports: [
    CommonModule,
    BlogRoutingModule,
    SharedModule
  ]
})
export class BlogModule { }
