import { TestBed } from '@angular/core/testing';

import { JsonWebTokenInterceptor } from './json-web-token.interceptor';

describe('JsonWebTokenInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      JsonWebTokenInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: JsonWebTokenInterceptor = TestBed.inject(JsonWebTokenInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
