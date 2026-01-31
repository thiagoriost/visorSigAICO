import { MapNavButtonsInterface } from '@app/widget/map-nav-buttons/interfaces/map-nav-buttons.interface';
import { environment } from '@projects/aiso/environments/environment';

export function createMapNavButtonsConfig(
  isMobile: boolean,
  widgetData: Partial<MapNavButtonsInterface>
): MapNavButtonsInterface {
  return {
    ...(widgetData as MapNavButtonsInterface),
    showPan: true,
    showZoomIn: true,
    showZoomOut: true,
    showToggleMouseWheelZoom: false,
    showAdvancedZoomOut: false,
    showAdvancedZoomIn: false,
    isMouseWheelZoomEnabled: true,
    orderPan: 3,
    orderAdvancedZoomIn: 1,
    orderAdvancedZoomOut: 2,
    orderResetView: 4,
    gapButtons: isMobile ? 1 : 2,
    customIconStyles: {
      iconPanEnabled: environment.mapNavButtons.iconPanEnabled,
      iconPanDisabled: environment.mapNavButtons.iconPanDisabled,
      iconZoomIn: environment.mapNavButtons.iconZoomIn,
      iconZoomOut: environment.mapNavButtons.iconZoomOut,
      iconInactiveAdvancedZoom:
        environment.mapNavButtons.iconInactiveAdvancedZoom,
      iconResetView: environment.mapNavButtons.iconResetView,
      iconToggleMouseWheelZoomEnabled:
        environment.mapNavButtons.iconToggleMouseWheelZoomEnabled,
      iconToggleMouseWheelZoomDisabled:
        environment.mapNavButtons.iconToggleMouseWheelZoomDisabled,
    },
    rounded: true,
    buttomSeverity: 'primary',
  };
}
