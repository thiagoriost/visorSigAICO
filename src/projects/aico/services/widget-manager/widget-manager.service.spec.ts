import { TestBed } from '@angular/core/testing';
import { WidgetManagerService } from './widget-manager.service';
import ImageLayer from 'ol/layer/Image';
import { ImageWMS } from 'ol/source';

describe('WidgetManagerService', () => {
  let service: WidgetManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WidgetManagerService],
    });
    service = TestBed.inject(WidgetManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initializeWidgets', () => {
    it('should initialize multiple widgets with their configurations', () => {
      // Arrange
      const configs = [
        { name: 'widget1', position: { x: 10, y: 20 }, title: 'Widget 1' },
        { name: 'widget2', position: { x: 30, y: 40 }, title: 'Widget 2' },
      ];

      // Act
      service.initializeWidgets(configs);

      // Assert
      expect(service.isWidgetVisible('widget1')).toBe(false);
      expect(service.isWidgetVisible('widget2')).toBe(false);
      expect(service.getWidgetPosition('widget1')).toEqual({ x: 10, y: 20 });
      expect(service.getWidgetPosition('widget2')).toEqual({ x: 30, y: 40 });
      expect(service.getWidgetTitle('widget1')).toBe('Widget 1');
      expect(service.getWidgetTitle('widget2')).toBe('Widget 2');
    });

    it('should set widget name as title when title is not provided', () => {
      // Arrange
      const configs = [
        { name: 'widget1', position: { x: 10, y: 20 }, title: '' },
      ];

      // Act
      service.initializeWidgets(configs);

      // Assert
      expect(service.getWidgetTitle('widget1')).toBe('widget1');
    });

    it('should initialize widgets with false visibility by default', () => {
      // Arrange
      const configs = [
        { name: 'testWidget', position: { x: 0, y: 0 }, title: 'Test' },
      ];

      // Act
      service.initializeWidgets(configs);

      // Assert
      expect(service.isWidgetVisible('testWidget')).toBe(false);
    });

    it('should handle empty configs array', () => {
      // Arrange
      const configs: {
        name: string;
        position: { x: number; y: number };
        title: string;
      }[] = [];

      // Act & Assert
      expect(() => service.initializeWidgets(configs)).not.toThrow();
    });
  });

  describe('toggleWidget', () => {
    beforeEach(() => {
      service.initializeWidgets([
        { name: 'widget1', position: { x: 10, y: 20 }, title: 'Widget 1' },
      ]);
    });

    it('should toggle widget visibility from false to true', () => {
      // Act
      service.toggleWidget('widget1');

      // Assert
      expect(service.isWidgetVisible('widget1')).toBe(true);
    });

    it('should toggle widget visibility from true to false', () => {
      // Arrange
      service.toggleWidget('widget1'); // Make it visible first

      // Act
      service.toggleWidget('widget1');

      // Assert
      expect(service.isWidgetVisible('widget1')).toBe(false);
    });

    it('should toggle widget multiple times', () => {
      // Act & Assert
      expect(service.isWidgetVisible('widget1')).toBe(false);

      service.toggleWidget('widget1');
      expect(service.isWidgetVisible('widget1')).toBe(true);

      service.toggleWidget('widget1');
      expect(service.isWidgetVisible('widget1')).toBe(false);

      service.toggleWidget('widget1');
      expect(service.isWidgetVisible('widget1')).toBe(true);
    });

    it('should not affect non-initialized widgets', () => {
      // Act
      service.toggleWidget('nonExistentWidget');

      // Assert
      expect(service.isWidgetVisible('nonExistentWidget')).toBe(false);
    });

    it('should only toggle the specified widget', () => {
      // Arrange
      service.initializeWidgets([
        { name: 'widget2', position: { x: 30, y: 40 }, title: 'Widget 2' },
      ]);

      // Act
      service.toggleWidget('widget1');

      // Assert
      expect(service.isWidgetVisible('widget1')).toBe(true);
      expect(service.isWidgetVisible('widget2')).toBe(false);
    });
  });

  describe('isWidgetVisible', () => {
    beforeEach(() => {
      service.initializeWidgets([
        { name: 'visibleWidget', position: { x: 10, y: 20 }, title: 'Visible' },
      ]);
    });

    it('should return false for non-initialized widget', () => {
      // Act
      const isVisible = service.isWidgetVisible('nonExistent');

      // Assert
      expect(isVisible).toBe(false);
    });

    it('should return false for initialized but hidden widget', () => {
      // Act
      const isVisible = service.isWidgetVisible('visibleWidget');

      // Assert
      expect(isVisible).toBe(false);
    });

    it('should return true for visible widget', () => {
      // Arrange
      service.toggleWidget('visibleWidget');

      // Act
      const isVisible = service.isWidgetVisible('visibleWidget');

      // Assert
      expect(isVisible).toBe(true);
    });

    it('should return false for empty string widget name', () => {
      // Act
      const isVisible = service.isWidgetVisible('');

      // Assert
      expect(isVisible).toBe(false);
    });
  });

  describe('getWidgetPosition', () => {
    beforeEach(() => {
      service.initializeWidgets([
        { name: 'widget1', position: { x: 150, y: 250 }, title: 'Widget 1' },
      ]);
    });

    it('should return correct position for initialized widget', () => {
      // Act
      const position = service.getWidgetPosition('widget1');

      // Assert
      expect(position).toEqual({ x: 150, y: 250 });
    });

    it('should return default position for non-initialized widget', () => {
      // Act
      const position = service.getWidgetPosition('nonExistent');

      // Assert
      expect(position).toEqual({ x: 100, y: 100 });
    });

    it('should return default position for empty string widget name', () => {
      // Act
      const position = service.getWidgetPosition('');

      // Assert
      expect(position).toEqual({ x: 100, y: 100 });
    });

    it('should handle position with zero coordinates', () => {
      // Arrange
      service.initializeWidgets([
        { name: 'zeroWidget', position: { x: 0, y: 0 }, title: 'Zero' },
      ]);

      // Act
      const position = service.getWidgetPosition('zeroWidget');

      // Assert
      expect(position).toEqual({ x: 0, y: 0 });
    });

    it('should handle negative coordinates', () => {
      // Arrange
      service.initializeWidgets([
        {
          name: 'negativeWidget',
          position: { x: -10, y: -20 },
          title: 'Negative',
        },
      ]);

      // Act
      const position = service.getWidgetPosition('negativeWidget');

      // Assert
      expect(position).toEqual({ x: -10, y: -20 });
    });
  });

  describe('getWidgetTitle', () => {
    beforeEach(() => {
      service.initializeWidgets([
        { name: 'widget1', position: { x: 10, y: 20 }, title: 'Custom Title' },
      ]);
    });

    it('should return custom title for initialized widget', () => {
      // Act
      const title = service.getWidgetTitle('widget1');

      // Assert
      expect(title).toBe('Custom Title');
    });

    it('should return widget name for non-initialized widget', () => {
      // Act
      const title = service.getWidgetTitle('nonExistent');

      // Assert
      expect(title).toBe('nonExistent');
    });

    it('should return widget name when title is empty', () => {
      // Arrange
      service.initializeWidgets([
        { name: 'noTitle', position: { x: 10, y: 20 }, title: '' },
      ]);

      // Act
      const title = service.getWidgetTitle('noTitle');

      // Assert
      expect(title).toBe('noTitle');
    });

    it('should handle special characters in title', () => {
      // Arrange
      service.initializeWidgets([
        {
          name: 'specialWidget',
          position: { x: 10, y: 20 },
          title: 'Title with @#$% special chars',
        },
      ]);

      // Act
      const title = service.getWidgetTitle('specialWidget');

      // Assert
      expect(title).toBe('Title with @#$% special chars');
    });
  });

  describe('obtenerLeyendaDesdeCapa', () => {
    let mockLayer: jasmine.SpyObj<ImageLayer<ImageWMS>>;
    let mockSource: jasmine.SpyObj<ImageWMS>;

    beforeEach(() => {
      mockSource = jasmine.createSpyObj('ImageWMS', ['getLegendUrl']);
      mockLayer = jasmine.createSpyObj('ImageLayer', ['getSource']);
    });

    it('should return legend URL when layer and source are valid', () => {
      // Arrange
      const expectedUrl = 'http://example.com/legend.png';
      mockSource.getLegendUrl.and.returnValue(expectedUrl);
      mockLayer.getSource.and.returnValue(mockSource);

      // Act
      const result = service.obtenerLeyendaDesdeCapa(mockLayer);

      // Assert
      expect(result).toBe(expectedUrl);
      expect(mockLayer.getSource).toHaveBeenCalled();
      expect(mockSource.getLegendUrl).toHaveBeenCalledWith(1);
    });

    it('should throw error when layer is null', () => {
      // Act & Assert
      expect(() =>
        service.obtenerLeyendaDesdeCapa(null as unknown as ImageLayer<ImageWMS>)
      ).toThrowError('La capa proporcionada es nula o indefinida.');
    });

    it('should throw error when layer is undefined', () => {
      // Act & Assert
      expect(() =>
        service.obtenerLeyendaDesdeCapa(
          undefined as unknown as ImageLayer<ImageWMS>
        )
      ).toThrowError('La capa proporcionada es nula o indefinida.');
    });

    it('should throw error when source is null', () => {
      // Arrange
      mockLayer.getSource.and.returnValue(null);

      // Act & Assert
      expect(() => service.obtenerLeyendaDesdeCapa(mockLayer)).toThrowError(
        'La capa no tiene una fuente WMS válida.'
      );
    });

    it('should throw error when getLegendUrl returns null', () => {
      // Arrange
      mockSource.getLegendUrl.and.returnValue(null as unknown as string);
      mockLayer.getSource.and.returnValue(mockSource);

      // Act & Assert
      expect(() => service.obtenerLeyendaDesdeCapa(mockLayer)).toThrowError(
        'No se pudo obtener la URL de la leyenda desde la fuente WMS.'
      );
    });

    it('should throw error when getLegendUrl returns undefined', () => {
      // Arrange
      mockSource.getLegendUrl.and.returnValue(undefined as unknown as string);
      mockLayer.getSource.and.returnValue(mockSource);

      // Act & Assert
      expect(() => service.obtenerLeyendaDesdeCapa(mockLayer)).toThrowError(
        'No se pudo obtener la URL de la leyenda desde la fuente WMS.'
      );
    });

    it('should call getLegendUrl with resolution parameter', () => {
      // Arrange
      const expectedUrl = 'http://example.com/legend.png';
      mockSource.getLegendUrl.and.returnValue(expectedUrl);
      mockLayer.getSource.and.returnValue(mockSource);

      // Act
      service.obtenerLeyendaDesdeCapa(mockLayer);

      // Assert
      expect(mockSource.getLegendUrl).toHaveBeenCalledWith(1);
      expect(mockSource.getLegendUrl).toHaveBeenCalledTimes(1);
    });

    it('should handle different legend URL formats', () => {
      // Arrange
      const urls = [
        'http://example.com/legend.png',
        'https://secure.example.com/wms/legend?layer=test',
        '/relative/path/legend.png',
      ];

      urls.forEach(url => {
        mockSource.getLegendUrl.and.returnValue(url);
        mockLayer.getSource.and.returnValue(mockSource);

        // Act
        const result = service.obtenerLeyendaDesdeCapa(mockLayer);

        // Assert
        expect(result).toBe(url);
      });
    });
  });

  describe('Integration tests', () => {
    it('should handle complete widget lifecycle', () => {
      // Arrange
      const configs = [
        {
          name: 'lifecycleWidget',
          position: { x: 50, y: 75 },
          title: 'Lifecycle Test',
        },
      ];

      // Act & Assert - Initialize
      service.initializeWidgets(configs);
      expect(service.isWidgetVisible('lifecycleWidget')).toBe(false);
      expect(service.getWidgetPosition('lifecycleWidget')).toEqual({
        x: 50,
        y: 75,
      });
      expect(service.getWidgetTitle('lifecycleWidget')).toBe('Lifecycle Test');

      // Act & Assert - Show
      service.toggleWidget('lifecycleWidget');
      expect(service.isWidgetVisible('lifecycleWidget')).toBe(true);

      // Act & Assert - Hide
      service.toggleWidget('lifecycleWidget');
      expect(service.isWidgetVisible('lifecycleWidget')).toBe(false);
    });

    it('should handle multiple widgets independently', () => {
      // Arrange
      const configs = [
        { name: 'widget1', position: { x: 10, y: 20 }, title: 'Widget 1' },
        { name: 'widget2', position: { x: 30, y: 40 }, title: 'Widget 2' },
        { name: 'widget3', position: { x: 50, y: 60 }, title: 'Widget 3' },
      ];

      // Act
      service.initializeWidgets(configs);
      service.toggleWidget('widget1');
      service.toggleWidget('widget3');

      // Assert
      expect(service.isWidgetVisible('widget1')).toBe(true);
      expect(service.isWidgetVisible('widget2')).toBe(false);
      expect(service.isWidgetVisible('widget3')).toBe(true);
    });

    it('should maintain widget state across multiple operations', () => {
      // Arrange
      service.initializeWidgets([
        {
          name: 'stateWidget',
          position: { x: 100, y: 200 },
          title: 'State Test',
        },
      ]);

      // Act & Assert
      const position1 = service.getWidgetPosition('stateWidget');
      service.toggleWidget('stateWidget');
      const position2 = service.getWidgetPosition('stateWidget');

      expect(position1).toEqual(position2);
      expect(service.getWidgetTitle('stateWidget')).toBe('State Test');
      expect(service.isWidgetVisible('stateWidget')).toBe(true);
    });
  });
});
