import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '@services/authentication/authentication.service';

@Injectable()
export class JsonWebTokenInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService) {}

  intercept(
    httpRequest: HttpRequest<unknown>,
    httpHandler: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const authentication = this.authenticationService.getAuthentication(
      this.authenticationService.router.url.includes('/user/')
        ? 'sessionUserApp'
        : 'session'
    );

    if (authentication?.access_token) {
      httpRequest = httpRequest.clone({
        setHeaders: {
          authorization: `Bearer ${authentication.access_token}`,
        },
      });
    }
    return httpHandler.handle(httpRequest);
  }
}
