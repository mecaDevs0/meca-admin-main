import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { AlertMessages } from '@classes/AlertMessages';
import { ICountry } from '@app/core/interfaces/CORE/ICountry';
import { IState } from '@app/core/interfaces/CORE/IState';
import { IAddress } from '@app/core/interfaces/CORE/IAddress';
import { ICity } from '@app/core/interfaces/CORE/ICity';

@Injectable({
  providedIn: 'root',
})
export class MegaleiosService {
  URL = environment.megaleios;
  constructor(private http: HttpClient) {}

  getCountries(): Observable<{ data: ICountry[] }> {
    return this.http
      .get<{ data: ICountry[] }>(this.URL + '/api/v1/City/ListCountry')
      .pipe(
        take(1),
        catchError((error) => {
          const errorMessage = error?.message || 'Unknown error occurred';
          AlertMessages.error(errorMessage);
          return of({ data: [] });
        })
      );
  }

  getCEP(cep: string): Observable<{ data: IAddress }> {
    return this.http
      .get<{ data: IAddress }>(
        this.URL + '/api/v1/City/GetInfoFromZipCode/' + cep
      )
      .pipe(
        take(1),
        catchError((error) => {
          const errorMessage = error?.message || 'Unknown error occurred';
          AlertMessages.error(errorMessage);
          return of({ data: {} });
        })
      );
  }

  getStates(): Observable<{ data: IState[] }> {
    return this.http
      .get<{ data: IState[] }>(this.URL + '/api/v1/City/ListState/')
      .pipe(
        take(1),
        catchError((error) => {
          const errorMessage = error?.message || 'Unknown error occurred';
          AlertMessages.error(errorMessage);
          return of({ data: [] });
        })
      );
  }

  getCities(stateId: string): Observable<{ data: ICity[] }> {
    return this.http
      .get<{ data: ICity[] }>(this.URL + '/api/v1/City/' + stateId)
      .pipe(
        take(1),
        catchError((error) => {
          const errorMessage = error?.message || 'Unknown error occurred';
          AlertMessages.error(errorMessage);
          return of({ data: [] });
        })
      );
  }

  getIuguBanks(): Observable<{ data: {}[] }> {
    return this.http.get<{ data: {}[] }>(this.URL + '/api/v1/Bank/List').pipe(
      take(1),
      catchError((error) => {
        const errorMessage = error?.message || 'Unknown error occurred';
        AlertMessages.error(errorMessage);
        return of({ data: [] });
      })
    );
  }
}
