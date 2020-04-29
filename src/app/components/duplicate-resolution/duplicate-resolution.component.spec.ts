import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateResolutionComponent } from './duplicate-resolution.component';

describe('DuplicateResolutionComponent', () => {
  let component: DuplicateResolutionComponent;
  let fixture: ComponentFixture<DuplicateResolutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DuplicateResolutionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateResolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
