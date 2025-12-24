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


  constructor() {
  }

  ngOnInit(): void {
  }

}
