import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';
import { StoreModule } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { UrlWMSService } from '@app/shared/services/urlWMS/url-wms.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let urlWmsService: jasmine.SpyObj<UrlWMSService>;
  beforeEach(async () => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    urlWmsService = jasmine.createSpyObj('urlWmsService', [''], {
      http: httpClientSpy,
    });
    await TestBed.configureTestingModule({
      imports: [
        SidebarComponent,
        StoreModule.forRoot({}),
        NoopAnimationsModule,
      ],
      providers: [
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: UrlWMSService, useValue: urlWmsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
