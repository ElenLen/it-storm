import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-agree',
  templateUrl: './agree.component.html',
  styleUrls: ['./agree.component.scss']
})
export class AgreeComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Обработка фрагмента URL (якоря) для автоматической прокрутки
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.scrollToFragment(fragment);
      }
    });
  }

  private scrollToFragment(fragment: string): void {
    setTimeout(() => {
      const element = document.getElementById(fragment);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100); // Небольшая задержка для рендеринга
  }
}
