import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentifyVersionTwoComponent } from './identify-version-two.component';
import { StoreModule } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('IdentifyVersionTwoComponent', () => {
  let component: IdentifyVersionTwoComponent;
  let fixture: ComponentFixture<IdentifyVersionTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IdentifyVersionTwoComponent,
        StoreModule.forRoot({}),
        BrowserAnimationsModule,
      ],
      providers: [MessageService, HttpClient, HttpHandler],
    }).compileComponents();

    fixture = TestBed.createComponent(IdentifyVersionTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
