import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  get = (key: string) => JSON.parse(localStorage.getItem(key) || '{}');

  set = (key: string, obj: Object) =>
    localStorage.setItem(key, JSON.stringify(obj));

  remove = (key: string) => localStorage.removeItem(key);
}
