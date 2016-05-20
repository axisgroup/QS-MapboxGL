# MapboxGL Extension for Qlik Sense

The MapboxGL extension is a small starter implementation of the [Mapbox GL JS] mapping library for Qlik Sense. Mapbox GL JS is a powerful web mapping tool that leverages vector tiles and WebGL to do client side rendering of highly performant and customizable maps.

This extension implements a point layer sized by a measure, allowing Qlik Sense users to load in their data points and plot them on a map as circles.

[Check out the demo.](http://sense.axisgroup.com/sense/app/6f716fc6-5d15-4315-a6cd-cdfa4f0a2ba8/sheet/PnL/state/analysis)

[Download the extension here.](http://viz.axisgroup.com/extensions/QS-mapboxgl.zip)

![GitHub Logo](https://raw.githubusercontent.com/axisgroup/QS-MapboxGL/master/examples/mapbox-gl-ext-sm.gif)

The following features can be customized from the properties panel:
- Mapbox Access Token - your API token that can be received for free from Mapbox
- Circle Color - the color of the circles rendered. Should be a hex color code
- Circle Opacity - the opacity of the circles
- Circle Size - the range of size from biggest to smallest circle based on the measure
- Map Style - the style of the background map rendered, based on map stylesheets provided by Mapbox



   [Mapbox Gl JS]: <https://www.mapbox.com/mapbox-gl-js/api/>
