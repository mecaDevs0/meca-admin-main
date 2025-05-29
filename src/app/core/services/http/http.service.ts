import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { AlertMessages } from '@classes/AlertMessages';
import { FirebaseConfig } from '@services/firebase/firebase.service';
import { CONFIG_BASE } from '@app/core/config';
import { IOptionsBlob } from '@app/core/interfaces/CORE/IOptionsBlob';
import { IOptionsJson } from '@app/core/interfaces/CORE/IOptionsJson';

export interface IApiResponse<T> {
  data: T;
  erro: boolean;
  errors: Object[];
  message: string;
  messageEx: string;
}

@Injectable({
  providedIn: 'root',
})
export class HttpService<T> {
  private url: string = environment.url;

  constructor(
    private http: HttpClient,
    private firebaseConfig: FirebaseConfig
  ) {}

  private isOnline() {
    return navigator.onLine;
  }

  get(
    route: string,
    successMessage = false,
    options?: IOptionsJson
  ): Observable<IApiResponse<T> | HttpEvent<IApiResponse<T>> | any> {
    if (!this.isOnline()) {
      const errorMessage = 'Sem conexão com a internet.';
      AlertMessages.error(errorMessage);
      return throwError({ message: errorMessage });
    }

    return options
      ? this.http.get<IApiResponse<T>>(`${this.url}/api/v1/${route}`, options)
      : this.http.get<IApiResponse<T>>(`${this.url}/api/v1/${route}`).pipe(
          take(1),
          catchError((error) => {
            if (CONFIG_BASE.withLogFireBaseErrors) {
              this.firebaseConfig.createAndSendErrorLog(
                error,
                'GET',
                `${this.url}/api/v1/${route}`
              );
            }
            AlertMessages.error(error?.message);
            return throwError(error);
          }),
          tap(({ message }: IApiResponse<T>) => {
            if (successMessage) AlertMessages.success(message);
          })
        );
  }

  post(
    route: string,
    value: Object,
    successMessage = false,
    options?: IOptionsJson
  ): Observable<IApiResponse<T> | HttpEvent<IApiResponse<T>> | any> {
    if (!this.isOnline()) {
      const errorMessage = 'Sem conexão com a internet.';
      AlertMessages.error(errorMessage);
      return throwError({ message: errorMessage });
    }

    return options
      ? this.http.post<IApiResponse<T>>(
          `${this.url}/api/v1/${route}`,
          value,
          options
        )
      : this.http
          .post<IApiResponse<T>>(`${this.url}/api/v1/${route}`, value)
          .pipe(
            take(1),
            catchError((error) => {
              if (CONFIG_BASE.withLogFireBaseErrors) {
                this.firebaseConfig.createAndSendErrorLog(
                  error,
                  'POST',
                  `${this.url}/api/v1/${route}`
                );
              }
              AlertMessages.error(error?.message);
              return throwError(error);
            }),
            tap(({ message }: IApiResponse<T>) => {
              if (successMessage) AlertMessages.success(message);
            })
          );
  }

  download(
    route: string,
    value: Object,
    successMessage = false,
    options?: IOptionsBlob | any
  ): Observable<IApiResponse<T> | HttpEvent<IApiResponse<T>> | any> {
    if (!this.isOnline()) {
      const errorMessage = 'Sem conexão com a internet.';
      AlertMessages.error(errorMessage);
      return throwError({ message: errorMessage });
    }

    return options
      ? this.http.post<IApiResponse<T>>(
          `${this.url}/api/v1/${route}`,
          value,
          options
        )
      : this.http
          .post<IApiResponse<T>>(`${this.url}/api/v1/${route}`, value)
          .pipe(
            take(1),
            catchError((error) => {
              if (CONFIG_BASE.withLogFireBaseErrors) {
                this.firebaseConfig.createAndSendErrorLog(
                  error,
                  'POST',
                  `${this.url}/api/v1/${route}`
                );
              }
              AlertMessages.error(error?.message);
              return throwError(error);
            }),
            tap(({ message }: IApiResponse<T>) => {
              if (successMessage) AlertMessages.success(message);
            })
          );
  }

  patch(
    route: string,
    value: Object,
    successMessage = false,
    options?: IOptionsJson
  ): Observable<IApiResponse<T> | HttpEvent<IApiResponse<T>> | any> {
    if (!this.isOnline()) {
      const errorMessage = 'Sem conexão com a internet.';
      AlertMessages.error(errorMessage);
      return throwError({ message: errorMessage });
    }

    return options
      ? this.http.patch<IApiResponse<T>>(
          `${this.url}/api/v1/${route}`,
          value,
          options
        )
      : this.http
          .patch<IApiResponse<T>>(`${this.url}/api/v1/${route}`, value)
          .pipe(
            take(1),
            catchError((error) => {
              if (CONFIG_BASE.withLogFireBaseErrors) {
                this.firebaseConfig.createAndSendErrorLog(
                  error,
                  'PATCH',
                  `${this.url}/api/v1/${route}`
                );
              }
              AlertMessages.error(error?.message);
              return throwError(error);
            }),
            tap(({ message }: IApiResponse<T>) => {
              if (successMessage) AlertMessages.success(message);
            })
          );
  }

  delete(
    route: string,
    successMessage = false,
    options?: IOptionsJson
  ): Observable<IApiResponse<T> | HttpEvent<IApiResponse<T>> | any> {
    if (!this.isOnline()) {
      const errorMessage = 'Sem conexão com a internet.';
      AlertMessages.error(errorMessage);
      return throwError({ message: errorMessage });
    }

    return options
      ? this.http.delete<IApiResponse<T>>(
          `${this.url}/api/v1/${route}`,
          options
        )
      : this.http.delete<IApiResponse<T>>(`${this.url}/api/v1/${route}`).pipe(
          take(1),
          catchError((error) => {
            if (CONFIG_BASE.withLogFireBaseErrors) {
              this.firebaseConfig.createAndSendErrorLog(
                error,
                'DELETE',
                `${this.url}/api/v1/${route}`
              );
            }
            AlertMessages.error(error?.message);
            return throwError(error);
          }),
          tap(({ message }: IApiResponse<T>) => {
            if (successMessage) AlertMessages.success(message);
          })
        );
  }

  uploadFile(
    file: File,
    successMessage = false,
    stringPath = '',
    returnWithUrl = false
  ): Observable<IApiResponse<T> | HttpEvent<IApiResponse<T>> | any> {
    if (!this.isOnline()) {
      const errorMessage = 'Sem conexão com a internet.';
      AlertMessages.error(errorMessage);
      return throwError({ message: errorMessage });
    }

    const formData = new FormData();

    formData.append('file', file, file?.name);

    if (stringPath) {
      formData.append('path', stringPath);
    }

    if (returnWithUrl === true) {
      formData.append('returnWithUrl', 'true');
    }

    const headers = new HttpHeaders({
      processData: 'false',
      ContentType: 'multipart/form-data',
    });

    return this.http
      .post<IApiResponse<T>>(this.url + '/api/v1/File/Upload', formData, {
        headers,
      })
      .pipe(
        take(1),
        catchError((error) => {
          if (CONFIG_BASE.withLogFireBaseErrors) {
            this.firebaseConfig.createAndSendErrorLog(
              error,
              'POST',
              `${this.url}/api/v1/File/Upload`
            );
          }
          AlertMessages.error(error?.message);
          return throwError(error);
        }),
        tap(({ message }: IApiResponse<T>) => {
          if (successMessage) AlertMessages.success(message);
        })
      );
  }

  uploadFiles(
    files: FileList,
    successMessage = false,
    stringPath = '',
    returnWithUrl = false,
    checkLength = false
  ): Observable<IApiResponse<T> | HttpEvent<IApiResponse<T>> | any> {
    if (!this.isOnline()) {
      const errorMessage = 'Sem conexão com a internet.';
      AlertMessages.error(errorMessage);
      return throwError({ message: errorMessage });
    }

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    if (stringPath) {
      formData.append('path', stringPath);
    }

    if (returnWithUrl === true) {
      formData.append('returnWithUrl', 'true');
    }

    formData.append('checkLength', `${checkLength}`);

    const headers = new HttpHeaders({
      processData: 'false',
      ContentType: 'multipart/form-data',
    });

    return this.http
      .post<IApiResponse<T>>(this.url + '/api/v1/File/Uploads', formData, {
        headers,
      })
      .pipe(
        take(1),
        catchError((error) => {
          if (CONFIG_BASE.withLogFireBaseErrors) {
            this.firebaseConfig.createAndSendErrorLog(
              error,
              'POST',
              `${this.url}/api/v1/File/Uploads`
            );
          }
          AlertMessages.error(error?.message);
          return throwError(error);
        }),
        tap(({ message }: IApiResponse<T>) => {
          if (successMessage) AlertMessages.success(message);
        })
      );
  }

  export(
    route: string,
    value: FormData
  ): Observable<IApiResponse<T> | HttpEvent<IApiResponse<T>> | any> {
    if (!this.isOnline()) {
      const errorMessage = 'Sem conexão com a internet.';
      AlertMessages.error(errorMessage);
      return throwError({ message: errorMessage });
    }

    return this.http
      .post(`${this.url}/api/v1/${route}`, value, {
        responseType: 'blob',
      })
      .pipe(
        take(1),
        catchError(({ error }) => {
          AlertMessages.error(error?.message);
          return of();
        })
      );
  }
}
