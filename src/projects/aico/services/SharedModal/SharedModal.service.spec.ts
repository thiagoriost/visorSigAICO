import { TestBed } from '@angular/core/testing';
import { SharedModalService } from './SharedModal.service';
import { GeoJSONData } from '@projects/aico/interfaces/interfaces';

describe('SharedModalService', () => {
  let service: SharedModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have initial state with modal closed and no data', done => {
      service.modalState$.subscribe(state => {
        expect(state.isOpen).toBe(false);
        expect(state.data).toBeNull();
        done();
      });
    });
  });

  describe('openModal', () => {
    it('should open modal with provided data', done => {
      const mockGeoJSONData: GeoJSONData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'Test Feature', id: 1 },
            geometry: {
              type: 'Point',
              coordinates: [-74.0721, 4.711],
            },
          },
        ],
      };

      service.openModal(mockGeoJSONData);

      service.modalState$.subscribe(state => {
        expect(state.isOpen).toBe(true);
        expect(state.data).toEqual(mockGeoJSONData);
        done();
      });
    });

    it('should update state when opening modal multiple times', () => {
      const firstData: GeoJSONData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'First' },
            geometry: {
              type: 'Point',
              coordinates: [0, 0],
            },
          },
        ],
      };

      const secondData: GeoJSONData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'Second' },
            geometry: {
              type: 'Point',
              coordinates: [1, 1],
            },
          },
        ],
      };

      service.openModal(firstData);
      service.openModal(secondData);

      let emissionCount = 0;
      service.modalState$.subscribe(state => {
        emissionCount++;
        if (emissionCount === 1) {
          // Should be the latest state (secondData)
          expect(state.isOpen).toBe(true);
          expect(state.data).toEqual(secondData);
        }
      });
    });

    it('should emit the new state to all subscribers', () => {
      const mockData: GeoJSONData = {
        type: 'FeatureCollection',
        features: [],
      };

      const states: { isOpen: boolean; data: GeoJSONData | null }[] = [];

      service.modalState$.subscribe(state => {
        states.push(state);
      });

      service.openModal(mockData);

      expect(states.length).toBeGreaterThanOrEqual(2); // Initial + after open
      expect(states[states.length - 1].isOpen).toBe(true);
      expect(states[states.length - 1].data).toEqual(mockData);
    });
  });

  describe('closeModal', () => {
    it('should close modal and clear data', done => {
      const mockData: GeoJSONData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { test: 'data' },
            geometry: {
              type: 'Point',
              coordinates: [0, 0],
            },
          },
        ],
      };

      // First open the modal
      service.openModal(mockData);

      // Then close it
      service.closeModal();

      service.modalState$.subscribe(state => {
        expect(state.isOpen).toBe(false);
        expect(state.data).toBeNull();
        done();
      });
    });

    it('should reset state to initial values', () => {
      const mockData: GeoJSONData = {
        type: 'FeatureCollection',
        features: [],
      };

      service.openModal(mockData);
      service.closeModal();

      let lastState: { isOpen: boolean; data: GeoJSONData | null } | undefined;
      service.modalState$.subscribe(state => {
        lastState = state;
      });

      expect(lastState).toBeDefined();
      expect(lastState?.isOpen).toBe(false);
      expect(lastState?.data).toBeNull();
    });

    it('should handle closing already closed modal', done => {
      service.closeModal();

      service.modalState$.subscribe(state => {
        expect(state.isOpen).toBe(false);
        expect(state.data).toBeNull();
        done();
      });
    });
  });

  describe('modalState$ Observable', () => {
    it('should be subscribable', () => {
      const subscription = service.modalState$.subscribe();
      expect(subscription).toBeDefined();
      subscription.unsubscribe();
    });

    it('should emit state changes in correct order', () => {
      const states: { isOpen: boolean; data: GeoJSONData | null }[] = [];
      const mockData: GeoJSONData = {
        type: 'FeatureCollection',
        features: [],
      };

      service.modalState$.subscribe(state => {
        states.push({ ...state });
      });

      // Initial state should be emitted first
      expect(states[0].isOpen).toBe(false);
      expect(states[0].data).toBeNull();

      service.openModal(mockData);
      expect(states[states.length - 1].isOpen).toBe(true);
      expect(states[states.length - 1].data).toEqual(mockData);

      service.closeModal();
      expect(states[states.length - 1].isOpen).toBe(false);
      expect(states[states.length - 1].data).toBeNull();
    });

    it('should support multiple subscribers', () => {
      const mockData: GeoJSONData = {
        type: 'FeatureCollection',
        features: [],
      };

      const subscriber1States: {
        isOpen: boolean;
        data: GeoJSONData | null;
      }[] = [];
      const subscriber2States: {
        isOpen: boolean;
        data: GeoJSONData | null;
      }[] = [];

      service.modalState$.subscribe(state => {
        subscriber1States.push({ ...state });
      });

      service.modalState$.subscribe(state => {
        subscriber2States.push({ ...state });
      });

      service.openModal(mockData);

      // Both subscribers should receive the same states
      expect(subscriber1States.length).toBeGreaterThan(0);
      expect(subscriber2States.length).toBeGreaterThan(0);
      expect(subscriber1States[subscriber1States.length - 1].isOpen).toBe(true);
      expect(subscriber2States[subscriber2States.length - 1].isOpen).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle opening modal with empty features array', done => {
      const emptyData: GeoJSONData = {
        type: 'FeatureCollection',
        features: [],
      };

      service.openModal(emptyData);

      service.modalState$.subscribe(state => {
        expect(state.isOpen).toBe(true);
        expect(state.data).toEqual(emptyData);
        expect(state.data?.features).toEqual([]);
        done();
      });
    });

    it('should handle complex GeoJSON data structures', done => {
      const complexData: GeoJSONData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              name: 'Complex Feature',
              metadata: {
                nested: {
                  value: 'deep',
                },
              },
              tags: ['tag1', 'tag2', 'tag3'],
            },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, 1],
                  [0, 0],
                ],
              ],
            },
          },
        ],
      };

      service.openModal(complexData);

      service.modalState$.subscribe(state => {
        expect(state.data).toEqual(complexData);
        expect(state.data?.features[0].properties['name']).toBe(
          'Complex Feature'
        );
        done();
      });
    });

    it('should maintain data integrity during rapid open/close cycles', () => {
      const data1: GeoJSONData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { id: 1 },
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
        ],
      };

      const data2: GeoJSONData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { id: 2 },
            geometry: { type: 'Point', coordinates: [1, 1] },
          },
        ],
      };

      service.openModal(data1);
      service.closeModal();
      service.openModal(data2);
      service.closeModal();

      let finalState: { isOpen: boolean; data: GeoJSONData | null } | undefined;
      service.modalState$.subscribe(state => {
        finalState = state;
      });

      expect(finalState?.isOpen).toBe(false);
      expect(finalState?.data).toBeNull();
    });
  });
});
