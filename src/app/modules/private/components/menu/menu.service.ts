import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  currentRouteSubject: Subject<string> = new Subject();

  handleCurrentRoute = (currentRoute: string) =>
    this.currentRouteSubject.next(currentRoute);
  listenCurrentRoute = () => this.currentRouteSubject.asObservable();
}
