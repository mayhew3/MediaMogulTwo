import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPlatformsComponent } from './my-platforms.component';

describe('MyPlatformsComponent', () => {
  let component: MyPlatformsComponent;
  let fixture: ComponentFixture<MyPlatformsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyPlatformsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPlatformsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
