import {Component, OnDestroy, OnInit} from '@angular/core';
import {filter, Subject, takeUntil} from "rxjs";
import {NavigationEnd, Router} from "@angular/router";
import {ScrollObserverService} from "../../services/scroll-observer.service";
import {OrderType} from "../../../../types/order.type";
import {HttpErrorResponse} from "@angular/common/http";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {OrderService} from "../../services/order.service";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  activeSection: string = '';
  private destroy$ = new Subject<void>();

  // Флаги для управления модальными окнами
  showOrderPopup = false;
  showThankYouPopup = false;
  isSubmitting = false;
  submitError = false;

  // Форма заявки
  orderForm: FormGroup;

  constructor(private router: Router,
              private fb: FormBuilder,
              private orderService: OrderService,
              private scrollObserver: ScrollObserverService
  ) {
    // Инициализация формы
    this.orderForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^(\+7|8)[0-9]{10}$/)]],
      type: ['consultation', Validators.required]
    });
  }

  ngOnInit(): void {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Открытие модального окна с формой заказа
  createCallMeRequest(): void {
    this.submitError = false;

    // Сбрасываем форму
    this.orderForm.reset({
      type: 'consultation'
    });

    this.showOrderPopup = true;
    this.showThankYouPopup = false;
  }

  // Закрытие модального окна формы заказа
  closeOrderPopup(): void {
    this.showOrderPopup = false;
    this.orderForm.reset({
      type: 'consultation'
    });
    this.submitError = false;
  }

  // Отправка заявки
  submitOrder(): void {
    if (this.orderForm.invalid) {
      // Пометить все поля как touched для показа ошибок
      Object.keys(this.orderForm.controls).forEach(key => {
        const control = this.orderForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.submitError = false;

    const orderData: OrderType = {
      name: this.orderForm.value.name,
      phone: this.orderForm.value.phone,
      type: this.orderForm.value.type
    };

    // Отправка заявки на сервер
    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        // Закрываем окно формы и открываем окно "Спасибо"
        this.showOrderPopup = false;
        this.showThankYouPopup = true;

        // Сброс формы
        this.orderForm.reset({
          type: 'consultation'
        });
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.submitError = true;
        console.error('Ошибка при отправке заявки:', error);

        // Прокрутка к верху формы для показа ошибки
        setTimeout(() => {
          const formElement = document.querySelector('.order-popup-content');
          if (formElement) {
            formElement.scrollIntoView({behavior: 'smooth', block: 'start'});
          }
        }, 100);
      }
    });
  }

  // Закрытие модального окна "Спасибо"
  closeThankYouPopup(): void {
    this.showThankYouPopup = false;
  }
}
