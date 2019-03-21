import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageModalPage } from './message-modal.page';

describe('MessageModalPage', () => {
  let component: MessageModalPage;
  let fixture: ComponentFixture<MessageModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
