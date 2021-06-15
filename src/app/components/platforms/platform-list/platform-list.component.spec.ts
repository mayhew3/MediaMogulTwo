import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatformListComponent } from './platform-list.component';

describe('PlatformListComponent', () => {
  let component: PlatformListComponent;
  let fixture: ComponentFixture<PlatformListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlatformListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlatformListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
