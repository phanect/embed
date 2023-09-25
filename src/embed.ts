/**
 * @file Entry for embed.js
 */

import { geolonia } from './module';
import { renderGeoloniaMap } from './lib/render';

window.geolonia =
  window.maplibregl =
  window.mapboxgl = geolonia;

renderGeoloniaMap();
