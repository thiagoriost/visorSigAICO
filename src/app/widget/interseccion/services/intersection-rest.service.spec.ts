import { TestBed } from '@angular/core/testing';
import axios, { AxiosInstance } from 'axios';
import { IntersectionRestService } from './intersection-rest.service';
import { FeatureCollection } from 'geojson';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('IntersectionRestService', () => {
  let service: IntersectionRestService;
  let postSpy: jasmine.Spy;
  const dummyResult: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };

  beforeEach(() => {
    postSpy = jasmine
      .createSpy('post')
      .and.returnValue(Promise.resolve({ data: dummyResult }));

    spyOn(axios, 'create').and.returnValue({
      post: postSpy,
    } as unknown as AxiosInstance);

    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      providers: [IntersectionRestService],
    });

    service = TestBed.inject(IntersectionRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debe respetar el tiempo de espera de axios', () => {
    expect(axios.create).toHaveBeenCalledWith({
      timeout: 60000,
    });
  });
});
