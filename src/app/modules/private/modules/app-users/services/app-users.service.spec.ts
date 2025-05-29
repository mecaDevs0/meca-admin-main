import { TestBed } from '@angular/core/testing';

import { AppUsersService } from './app-users.service';

describe('AppUsersService', () => {
  let service: AppUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
