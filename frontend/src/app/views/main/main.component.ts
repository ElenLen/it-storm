import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {CarouselComponent, OwlOptions} from "ngx-owl-carousel-o";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit {
  @ViewChild('owlCar') owlCar!: CarouselComponent; // Связь с шаблоном
  activeSlideIndex = 0;

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

  constructor() {
  }

  ngOnInit(): void {
  }

}
