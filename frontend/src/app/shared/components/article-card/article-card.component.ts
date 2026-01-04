import {Component, Input, OnInit} from '@angular/core';
import {PopularArticlesType} from "../../../../types/popular-articles.type";
import {ArticlesService} from "../../services/articles.service";
import {Router} from "@angular/router";

@Component({
  selector: 'article-card',
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.scss']
})
export class ArticleCardComponent implements OnInit {

  @Input() articles!: PopularArticlesType;

  constructor(private articlesService: ArticlesService,
              private router: Router,) {
  }

  ngOnInit(): void {
  }

  navigate() {
    this.router.navigate(['/articles/' + this.articles.url]);
  }
}
