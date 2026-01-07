import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "../../../core/auth/auth.service";
import {UserService} from "../../services/user.service";
import {UserInfoType} from "../../../../types/user-info.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {ScrollObserverService} from "../../services/scroll-observer.service";
import {filter, Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLogged: boolean = false;
  userName: string = ''; // Добавляем переменную для имени пользователя
  activeSection: string = '';
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService,
              private _snackBar: MatSnackBar,
              private userService: UserService,
              private router: Router,
              private scrollObserver: ScrollObserverService) {
    this.isLogged = this.authService.getIsLoggedId();
  }

  ngOnInit(): void {
    // Подписываемся на изменения статуса логина
    this.authService.isLogged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn: boolean) => {
        this.isLogged = isLoggedIn;

        if (isLoggedIn) {
          this.getUserInfo();
        } else {
          this.userName = '';
        }
      });

    // Подписываемся на изменение активной секции
    this.scrollObserver.activeSection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(section => {
        this.activeSection = section;
      });

    // Отслеживаем завершение навигации
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: any) => {
        // Извлекаем якорь из URL
        const urlTree = this.router.parseUrl(event.urlAfterRedirects);
        const fragment = urlTree.fragment;

        if (fragment && ['services', 'info', 'blog', 'reviews', 'contacts'].includes(fragment)) {
          // Устанавливаем активную секцию сразу
          this.activeSection = fragment;

          // Даем время для прокрутки, затем обновляем через сервис
          setTimeout(() => {
            this.scrollObserver.setActiveSection(fragment);
          }, 300);
        }
      });

    // Если уже залогинен при инициализации, запрашиваем данные
    if (this.isLogged) {
      this.getUserInfo();
    }
  }

  // Метод для ручной установки активной секции при клике
  navigateToSection(section: string, event: MouseEvent) {
    event.preventDefault(); // Предотвращаем нативный переход

    // Сразу устанавливаем активную секцию
    this.activeSection = section;
    this.scrollObserver.setActiveSection(section);

    // Используем Angular Router для навигации
    this.router.navigate(['/'], {fragment: section}).then(() => {
      // Прокручиваем к элементу после навигации
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
      }, 100);
    });
  }

  // Выносим логику получения данных пользователя в отдельный метод
  getUserInfo(): void {
    this.userService.getUserInfo()
      .subscribe({
        next: (data: UserInfoType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          const userInfo = data as UserInfoType;
          this.userName = userInfo.name; // Сохраняем имя пользователя
        },
        error: (error) => {
          console.error('Ошибка при получении данных пользователя:', error);
        }
      });
  }

  logout(): void {
    this.authService.logout()
      .subscribe({
        next: () => {
          this.doLogout();
        },
        error: () => {
          this.doLogout();
        }
      });
  }

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this.userName = ''; // Очищаем имя при выходе
    this._snackBar.open('Вы вышли из системы');
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
