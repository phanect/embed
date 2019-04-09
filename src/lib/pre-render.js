import mapboxgl from 'mapbox-gl'
import TilecloudControl from '@tilecloud/mbgl-tilecloud-control'
import GestureHandling from '@tilecloud/mbgl-gesture-handling'
import { isDisplayed } from './bound'

/**
 * ex. start rendering if map.top - screen.bottom < 100px
 * @type {number}
 */
const defaultBuffer = 100

// stores map container ids already rendered to prevent run twice
const onceRendered = {}

/**
 * render map if it in users view
 * @param  {{container:HTMLElement, style: object}} maps          map container element and it's style
 * @param  {object|void}                            renderOptions option for rendering
 * @return {Promise}                                              Promise to all all map has started rendering
 */
export const preRender = (maps, renderOptions) => {
  const { buffer = defaultBuffer } = renderOptions || { buffer: defaultBuffer }

  const mapOptionsBase = {
    attributionControl: true,
    localIdeographFontFamily: 'sans-serif',
    bearing: 0,
    pitch: 0,
    hash: false,
  }

  // normalize
  const _maps = Array.isArray(maps) ? maps : [maps]

  return Promise.all(
    _maps.map(({ container, style }) => {
      return new Promise((resolve, reject) => {
        // define scroll handler
        const onScrollEventHandler = () => {
          const elementId = container.id
          if (!onceRendered[elementId] && isDisplayed(container, { buffer })) {
            onceRendered[elementId] = true
            let map
            try {
              const lat = parseFloat(container.dataset.lat)
              const lng = parseFloat(container.dataset.lng)
              const zoom = parseFloat(container.dataset.zoom)
              const bearing = parseFloat(container.dataset.bearing)
              const pitch = parseFloat(container.dataset.pitch)
              const customMarkerClass = container.dataset.markerClass || null
              const hash =
                (container.dataset.hash || 'false').toUpperCase() === 'TRUE'
              const center = lat && lng ? [lng, lat] : false
              const gestureHandling = (container.dataset['gesture-handling'] || 'true').toUpperCase() === 'TRUE'
              const mapOptions = {
                style,
                ...mapOptionsBase,
                container,
                center: center ? center : mapOptionsBase.center,
                bearing: bearing ? bearing : mapOptionsBase.bearing,
                pitch: pitch ? pitch : mapOptionsBase.pitch,
                zoom: zoom || mapOptionsBase.center,
                hash,
              }

              // Getting content should be fire just before initialize the map.
              const content = container.innerHTML.trim()
              container.innerHTML = ''

              map = new mapboxgl.Map(mapOptions)

              if (gestureHandling) {
                new GestureHandling().addTo(map)
              }

              map.addControl(new mapboxgl.NavigationControl())
              map.addControl(new mapboxgl.GeolocateControl())
              map.addControl(new TilecloudControl())

              map.on('load', event => {
                const map = event.target
                if (center) {
                  if (content) {
                    const popup = new mapboxgl.Popup().setHTML(content)
                    if (customMarkerClass) {
                      const el = document.createElement('div')
                      el.className = customMarkerClass;
                      new mapboxgl.Marker(el).setLngLat(center).addTo(map).setPopup(popup)
                    } else {
                      new mapboxgl.Marker().setLngLat(center).addTo(map).setPopup(popup)
                    }
                  } else {
                    new mapboxgl.Marker().setLngLat(center).addTo(map)
                  }
                }
              })
            } catch (e) {
              reject(e)
            } finally {
              // handler should fire once
              window.removeEventListener('scroll', onScrollEventHandler)
              // check all finished
              resolve(map)
            }
          }
        }

        // enable handler
        window.addEventListener('scroll', onScrollEventHandler, false)

        // detect whether map are already in view
        onScrollEventHandler()
      })
    }),
  )
}

export default preRender
