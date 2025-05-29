import { TestBed } from '@angular/core/testing';

import { MegaleiosService } from './megaleios.service';

describe('MegaleiosService', () => {
  let service: MegaleiosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MegaleiosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
