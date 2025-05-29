import { TestBed } from '@angular/core/testing';

import { AgoraIoService } from './agora-io.service';

describe('AgoraIoService', () => {
  let service: AgoraIoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgoraIoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
