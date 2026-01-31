import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { MessageService } from 'primeng/api';

import { PlaygroundPageComponent } from './playground-page.component';

describe('PlaygroundPageComponent', () => {
  let component: PlaygroundPageComponent;
  let fixture: ComponentFixture<PlaygroundPageComponent>;

  const mockUserInterfaceService = {
    widgetsConfig: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaygroundPageComponent],
      providers: [
        provideMockStore(),
        { provide: UserInterfaceService, useValue: mockUserInterfaceService },
        { provide: MessageService, useValue: {} },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaygroundPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
