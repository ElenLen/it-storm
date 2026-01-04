import {Component, HostListener, OnInit} from '@angular/core';
import {PopularArticlesType} from "../../../../types/popular-articles.type";
import {ArticlesService} from "../../../shared/services/articles.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CategoryService} from "../../../shared/services/category.service";
import {CategoryType} from "../../../../types/category.type";
import {ActiveParamsType} from "../../../../types/active-params.type";
import {debounceTime} from "rxjs";

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {

  // список категорий для фильтра
  category: CategoryType[] = [];
  // Массив выбранных url категорий
  selectedCategoryUrl: string[] = [];
  // для хранения услуг
  articles: PopularArticlesType[] = [];
  // открытие\закрытие фильтра
  open = false;
  // выбранная категория в фильтре
  activeParams: ActiveParamsType = {categories: []};
  // для пагинации
  pages: number[] = [];

  constructor(private articlesService: ArticlesService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private categoryService: CategoryService,) {
  }

  ngOnInit(): void {
    // Сначала парсим параметры из URL
    const snapshotParams = this.activatedRoute.snapshot.queryParams;
    this.parseUrlParams(snapshotParams);

    // Подписываемся на изменения параметров URL
    this.activatedRoute.queryParams
      .pipe(
        // задержка на отправку запроса
        debounceTime(500),
      )
      .subscribe(params => {
      this.parseUrlParams(params);

      // Загружаем категории и статьи
      this.loadCategoriesAndArticles();
    });
  }

  // Метод для парсинга параметров из URL
  private parseUrlParams(params: { [key: string]: any }) {
    // Очищаем текущие выбранные категории
    this.selectedCategoryUrl = [];

    // Если в URL есть параметр categories
    if (params['categories']) {
      // Параметр categories может быть строкой или массивом
      const categoriesParam = params['categories'];

      if (Array.isArray(categoriesParam)) {
        // Если несколько категорий: ?categories=smm&categories=target
        this.selectedCategoryUrl = [...categoriesParam];
      } else if (typeof categoriesParam === 'string') {
        // Если одна категория: ?categories=smm
        this.selectedCategoryUrl = [categoriesParam];
      }

      // Обновляем activeParams
      this.activeParams.categories = [...this.selectedCategoryUrl];
    } else {
      // Если нет параметров categories в URL
      this.activeParams.categories = [];
    }
  }

  // Загрузка категорий и статей
  private loadCategoriesAndArticles() {
    // Загружаем категории
    this.categoryService.getCategories()
      .subscribe((data: CategoryType[]) => {
        this.category = data;

        // После загрузки категорий загружаем статьи
        this.loadAllArticles();
      });
  }

  // открытие\закрытие фильтра
  toggle(): void {
    this.open = !this.open;
  }

  //   для отслеживания клика вне фильтра
  @HostListener('document:click', ['$event'])
  click(event: Event) {
    const target = event.target as HTMLElement;
    //  сворачиваем блок с классом фильтра
    if (this.open && target && target.className.indexOf('articles-filters-head') === -1) {
      this.open = false;
    }
  }

  // добавление параметров в url
  // Переключение категории (множественный выбор)
  updateFilterParam(url: string) {
    const index = this.selectedCategoryUrl.indexOf(url);

    // если выбрана категория
    if (index === -1) {
      // Добавляем категорию
      // this.selectedCategoryUrl.push(url);
      this.selectedCategoryUrl = [...this.selectedCategoryUrl, url];
    } else {
      // Удаляем категорию
      this.selectedCategoryUrl.splice(index, 1);
    }

    if (this.activeParams.categories && this.activeParams.categories.length > 0) {
      const existingTypeInParams = this.activeParams.categories.find(item => item === url);
      if (existingTypeInParams && !(index === -1)) {
        this.activeParams.categories = this.activeParams.categories.filter(item => item !== url);
      } else if (!existingTypeInParams && (index === -1)) {
        this.activeParams.categories = [...this.activeParams.categories, url];
      }
    } else if  (index === -1) {
      this.activeParams.categories = [url];
    }

    // обновляем стр с новыми параметрами
    this.activeParams.page = 1;
    this.router.navigate(['/articles'], {
      queryParams: this.activeParams
    });

  }

  // Проверка, выбрана ли категория
  isCategorySelected(url: string): boolean {
    return this.selectedCategoryUrl.includes(url);
  }

  // загрузка все статей
  private loadAllArticles() {
    // чтобы передавать параметры на бэк this.activeParams
    this.articlesService.getArticles(this.activeParams)
      .subscribe(data => {
        //   страницы для пагинации
        this.pages = [];
        for (let i = 1; i <= data.pages; i++) {
          this.pages.push(i);
        }
        // статьи
        this.articles = data.items;
      })
  }

  // Получение имени категории по URL
  getCategoryName(url: string): string {
    const category = this.category.find(cat => cat.url === url);
    return category ? category.name : url;
  }

// Удаление категории
  removeCategory(url: string) {
    this.updateFilterParam(url); // Используем тот же метод
  }

  // при клике по цифре
  openPage(page: number) {
    this.activeParams.page = page;

    this.router.navigate(['/articles'], {
      queryParams: this.activeParams
    });
  }

  // при клике по стрелке назад
  openPrevPage() {
    if (this.activeParams.page && this.activeParams.page > 1) {
      this.activeParams.page--;
      this.router.navigate(['/articles'], {
        queryParams: this.activeParams
      });
    }
  }

// при клике по стрелке вперед
  openNextPage() {
    if (!this.activeParams.page && this.pages.length > 0) {
      this.activeParams.page = 1;
    }

    if (this.activeParams.page && this.activeParams.page < this.pages.length) {
      this.activeParams.page++;
      this.router.navigate(['/articles'], {
        queryParams: this.activeParams
      });
    }

  }

}
