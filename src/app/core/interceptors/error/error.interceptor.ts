import {
  HttpEvent,
  HttpHandler,
  HttpHeaderResponse,
  HttpInterceptor,
  HttpProgressEvent,
  HttpRequest,
  HttpResponse,
  HttpSentEvent,
  HttpUserEvent,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, delay, switchMap } from 'rxjs/operators';
import { AuthenticationService } from '@services/authentication/authentication.service';
import { HttpService } from '@services/http/http.service';
import { Router } from '@angular/router';
import { AlertMessages } from '@app/core/classes/AlertMessages';
import { StorageService } from '../../services/storage/storage.service';
import { IToken } from '@app/core/interfaces/CORE/IToken';

@Injectable()
export class ErrorInterceptor<T> implements HttpInterceptor {
  constructor(
    private authenticationService: AuthenticationService,
    private httpService: HttpService<T>,
    private router: Router,
    private storageService: StorageService
  ) {}

  intercept(
    req: HttpRequest<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent>,
    next: HttpHandler
  ): Observable<
    HttpEvent<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent>
  > {
    return next.handle(req).pipe(
      catchError((responseOne: { status: number; error: string }) => {
        if (responseOne.status === 401) {
          const data = {
            refreshToken:
              this.authenticationService.getAuthentication()?.refresh_token,
          };
          return this.httpService.post('UserAdministrator/Token', data).pipe(
            delay(1100),
            switchMap((responseTwo: { data: IToken }) => {
              this.storageService.remove('session');
              this.authenticationService.setAuthentication(responseTwo.data);
              req = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${responseTwo?.data.access_token}`,
                },
              });
              return next.handle(req);
            }),
            catchError((responseTwo: { error: string }) => {
              AlertMessages.error('Sessão expirada! Efetue o login novamente');
              this.authenticationService.unsetAuthentication();
              return throwError(responseTwo.error);
            })
          );
        }

        if (responseOne.status === 403) {
          this.router.navigate(['/access-denied']);
        }

        return throwError(responseOne.error || responseOne);
      })
    );
  }
}
