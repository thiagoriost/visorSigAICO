import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDataComponent } from './add-data.component';
import { UrlWMSService } from '@app/shared/services/urlWMS/url-wms.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StoreModule } from '@ngrx/store';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('AddDataComponent', () => {
  let component: AddDataComponent;
  let fixture: ComponentFixture<AddDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDataComponent, StoreModule.forRoot({})],
      providers: [
        UrlWMSService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
