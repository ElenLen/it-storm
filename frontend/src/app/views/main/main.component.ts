import {Component, OnInit, ViewChild} from '@angular/core';
import {CarouselComponent, OwlOptions} from "ngx-owl-carousel-o";
import {ArticlesService} from "../../shared/services/articles.service";
import {PopularArticlesType} from "../../../types/popular-articles.type";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HttpErrorResponse} from "@angular/common/http";
import {OrderType} from "../../../types/order.type";
import {OrderService} from "../../shared/services/order.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit {
  @ViewChild('owlCar') owlCar!: CarouselComponent; // Связь с шаблоном
  @ViewChild('owlCarRev') owlCarRev!: CarouselComponent;


  // Флаги для управления модальными окнами
  showOrderPopup = false;
  showThankYouPopup = false;
  isSubmitting = false;
  submitError = false;

  // Форма заявки
  orderForm: FormGroup;

  customOptions: OwlOptions = {
    loop: true, // Бесконечная циклическая прокрутка
    mouseDrag: true, // Перетаскивание мышью
    touchDrag: true, // Перетаскивание на сенсорных экранах
    pullDrag: false, // Возможность тянуть слайды
    dots: true, // Отображение маркеров (точек) внизу
    navSpeed: 700, // Скорость навигации
    navText: ['', ''],//стрелки
    responsive: {
      0: {
        items: 1, // На мобильных 1 слайд
      },
      768: {
        items: 1,// На планшетах 1 слайда
      },
      992: {
        items: 1, // На десктопах 1 слайда
      }

    },
    nav: false, // Включение кнопок навигации (влево/вправо)
    margin: 20, // Добавьте отступы между слайдами!
    autoWidth: true, // Фиксированная ширина слайдов
    autoHeight: true, // Фиксированная высота слайдов
    startPosition: 0, // Начинаем с первого слайда
    slideBy: 1, // Листать по 1 слайду
  };

  services = [
    {
      image: 'card1.png',
      title: 'Создание сайтов',
      text: 'В краткие сроки мы создадим качественный и самое главное продающий сайт для продвижения Вашего бизнеса!',
      price: 'От 7 500₽',
    },
    {
      image: 'card2.png',
      title: 'Продвижение',
      text: 'Вам нужен качественный SMM-специалист или грамотный таргетолог? Мы готовы оказать Вам услугу “Продвижения” на наивысшем уровне!',
      price: 'От 3 500₽',
    },
    {
      image: 'card3.png',
      title: 'Реклама',
      text: 'Без рекламы не может обойтись ни один бизнес или специалист. Обращаясь к нам, мы гарантируем быстрый прирост клиентов за счёт правильно настроенной рекламы.',
      price: 'От 1 000₽',
    },
    {
      image: 'card4.png',
      title: 'Копирайтинг',
      text: 'Наши копирайтеры готовы написать Вам любые продающие текста, которые не только обеспечат рост охватов, но и помогут выйти на новый уровень в продажах.',
      price: 'От 750₽',
    },
  ];

  customOptionsReviews: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 26,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      }
    },
    nav: false
  };

  reviews = [
    {
      name: 'Станислав',
      image: 'review1.png',
      text: 'Спасибо огромное АйтиШторму за прекрасный блог с полезными статьями! Именно они и побудили меня углубиться в тему SMM и начать свою карьеру.'
    },
    {
      name: 'Алёна',
      image: 'review2.png',
      text: 'Обратилась в АйтиШторм за помощью копирайтера. Ни разу ещё не пожалела! Ребята действительно вкладывают душу в то, что делают, и каждый текст, который я получаю, с нетерпением хочется выложить в сеть.'
    },
    {
      name: 'Мария',
      image: 'review3.png',
      text: 'Команда АйтиШторма за такой короткий промежуток времени сделала невозможное: от простой фирмы по услуге продвижения выросла в мощный блог о важности личного бренда. Класс!'
    },
    {
      name: 'Аделина',
      image: 'review4.jpg',
      text: 'Хочу поблагодарить всю команду АйтиШторма за помощь в продвижении! Все просто в восторге!'
    },
    {
      name: 'Юрий',
      image: 'review7.jpg',
      text: 'Хочу поблагодарить консультанта Ирину за помощь в выборе сайта. Я ещё никогда не видел такого трепетного отношения к весьма непростому клиенту, которому сложно угодить! Сервис – огонь!'
    },
    {
      name: 'Яника',
      image: 'review5.jpg',
      text: 'Спасибо большое за мою обновлённую коллекцию услуг! Сервис просто на 5+: быстро, удобно, недорого. Что ещё нужно клиенту для счастья?'
    },
    {
      name: 'Марина',
      image: 'review6.jpg',
      text: 'Для меня всегда важным аспектом было наличие не только физического магазина, но и онлайн-маркета, ведь не всегда есть возможность прийти на место. Ещё нигде не встречала такого огромного ассортимента!'
    },
  ];

  // пустой массив услуг
  articles: PopularArticlesType[] = [];

  constructor(private articlesService: ArticlesService,
              private fb: FormBuilder,
              private orderService: OrderService
              ) {
    // Инициализация формы
    this.orderForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^(\+7|8)[0-9]{10}$/)]],
      service: ['', Validators.required],
      type: ['order', Validators.required]
    });
  }

  ngOnInit(): void {
    this.articlesService.getPopularArticles()
      .subscribe((data: PopularArticlesType[]) => {
        this.articles = data;
    })
  }

  // Открытие модального окна с формой заказа
  createRequest(service?: any): void {
    this.submitError = false;

    // Сбрасываем форму
    this.orderForm.reset({
      type: 'order'
    });

    // Если передана конкретная услуга, устанавливаем ее в форме
    if (service) {
      this.orderForm.patchValue({
        service: service.title
      });
    }

    this.showOrderPopup = true;
    this.showThankYouPopup = false;
  }

  // Закрытие модального окна формы заказа
  closeOrderPopup(): void {
    this.showOrderPopup = false;
    this.orderForm.reset({
      type: 'order'
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
      service: this.orderForm.value.service,
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
          type: 'order'
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
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
