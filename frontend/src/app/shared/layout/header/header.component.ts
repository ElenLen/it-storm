import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "../../../core/auth/auth.service";
import {UserService} from "../../services/user.service";
import {UserInfoType} from "../../../../types/user-info.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {ScrollObserverService} from "../../services/scroll-observer.service";
import {Subject, takeUntil} from "rxjs";

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
  // burger
  menuOpen = false;

  constructor(private authService: AuthService,
              private _snackBar: MatSnackBar,
              private userService: UserService,
              private router: Router,
              private scrollObserver: ScrollObserverService,
  ) {
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

    // Если уже залогинен при инициализации, запрашиваем данные
    if (this.isLogged) {
      this.getUserInfo();
    }
  }

  // burger
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    const headerMenu = document.querySelector('.header-menu');
    if (headerMenu) {
      if (this.menuOpen) {
        headerMenu.classList.add('active');
      } else {
        headerMenu.classList.remove('active');
      }
    }
  }

  navigateToSection(section: string, event: MouseEvent) {
    event.preventDefault();

    this.activeSection = section;
    this.scrollObserver.setActiveSection(section);

    // Всегда переходим на главную с фрагментом
    // Angular Router автоматически прокрутит к фрагменту
    this.router.navigate(['/'], {fragment: section}).then(() => {
      // После навигации дополнительная прокрутка для точности
      setTimeout(() => {
        this.scrollToElement(section);
      }, 100);
    });

    this.menuOpen = false; // Закрываем меню после клика
  }

  private scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      const elementTop = element.getBoundingClientRect().top + window.pageYOffset;

      window.scrollTo({
        top: elementTop,
        behavior: 'smooth'
      });
    }
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
          this.userName = userInfo.name;
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
    this.userName = '';
    this._snackBar.open('Вы вышли из системы');
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
