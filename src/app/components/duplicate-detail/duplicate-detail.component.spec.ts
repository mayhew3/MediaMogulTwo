import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateDetailComponent } from './duplicate-detail.component';

describe('DuplicateDetailComponent', () => {
  let component: DuplicateDetailComponent;
  let fixture: ComponentFixture<DuplicateDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DuplicateDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
