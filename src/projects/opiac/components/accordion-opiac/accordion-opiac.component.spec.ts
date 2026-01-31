import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionOpiacComponent } from './accordion-opiac.component';
import { StoreModule } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { UrlWMSService } from '@app/shared/services/urlWMS/url-wms.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AccordionOpiacComponent', () => {
  let component: AccordionOpiacComponent;
  let fixture: ComponentFixture<AccordionOpiacComponent>;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let urlWMSServiceSpy: jasmine.SpyObj<UrlWMSService>;
  beforeEach(async () => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    urlWMSServiceSpy = jasmine.createSpyObj(
      'UrlWMSService',
      ['getCapabilities', 'XMLToJSON', 'mapLayers'],
      {
        http: httpClientSpy,
      }
    );
    await TestBed.configureTestingModule({
      imports: [
        AccordionOpiacComponent,
        StoreModule.forRoot({}),
        NoopAnimationsModule,
      ],
      providers: [
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: UrlWMSService, useValue: urlWMSServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionOpiacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
