import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BigCheckboxComponent } from './big-checkbox.component';

describe('BigCheckboxComponent', () => {
  let component: BigCheckboxComponent;
  let fixture: ComponentFixture<BigCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BigCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BigCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
