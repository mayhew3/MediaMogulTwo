import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaytimePopupComponent } from './playtime-popup.component';

describe('PlaytimePopupComponent', () => {
  let component: PlaytimePopupComponent;
  let fixture: ComponentFixture<PlaytimePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaytimePopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaytimePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
