import { TestBed } from '@angular/core/testing';

import { WorkshopServicesService } from './workshop-services.service';

describe('WorkshopServicesService', () => {
  let service: WorkshopServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkshopServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
