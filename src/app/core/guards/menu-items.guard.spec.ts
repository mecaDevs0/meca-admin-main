import { TestBed } from '@angular/core/testing';

import { MenuItemsGuard } from './menu-items.guard';

describe('MenuItemsGuard', () => {
  let guard: MenuItemsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(MenuItemsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
