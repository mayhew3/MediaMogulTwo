import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlatformsComponent } from './add-platforms.component';

describe('AddGameComponent', () => {
  let component: AddPlatformsComponent;
  let fixture: ComponentFixture<AddPlatformsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPlatformsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPlatformsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
