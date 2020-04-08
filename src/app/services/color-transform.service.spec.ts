import { TestBed } from '@angular/core/testing';

import { ColorTransformService } from './color-transform.service';

describe('ColorTransformService', () => {
  let service: ColorTransformService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorTransformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
