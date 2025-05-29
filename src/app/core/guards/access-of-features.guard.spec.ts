import { TestBed } from '@angular/core/testing';

import { AccessOfFeaturesGuard } from './access-of-features.guard';

describe('AccessOfFeaturesGuard', () => {
  let guard: AccessOfFeaturesGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AccessOfFeaturesGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
