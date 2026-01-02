import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollObserverService {
  private activeSectionSource = new BehaviorSubject<string>('');
  activeSection$ = this.activeSectionSource.asObservable();
  private observer!: IntersectionObserver;

  constructor() {
    this.initObserver();
  }

  private initObserver() {
    const options = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // Центральная область окна просмотра
      threshold: 0
    };

    this.observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = (entry.target as HTMLElement).id;
          if (sectionId) {
            this.activeSectionSource.next(sectionId);
          }
        }
      });
    }, options);
  }

  observeElement(element: HTMLElement) {
    if (element && this.observer) {
      this.observer.observe(element);
    }
  }

  unobserveElement(element: HTMLElement) {
    if (element && this.observer) {
      this.observer.unobserve(element);
    }
  }

  // Метод для ручной установки секции
  setActiveSection(section: string) {
    this.activeSectionSource.next(section);
  }
}
