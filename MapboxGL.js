define([
        'jquery', './mapbox-gl-v0.18.0', './turf-v2.0.0'
    ],
    function($, mapboxgl, turf) {

        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            href: require.toUrl("extensions/MapboxGL/mapbox-gl-v0.18.0.css")
        }).appendTo("head");

        // Initial properties to track through repaints
        var init = false;
        var map;
        var mapPromise;
        var color;
        var opacity = 1;
        var style = 'streets-v9';

        return {
            initialProperties: {
                version: 1.0,
                qHyperCubeDef: {
                    qDimensions: [],
                    qMeasures: [],
                    qInitialDataFetch: [{
                        qWidth: 2,
                        qHeight: 5000
                    }]
                }
            },
            definition: {
                type: "items",
                component: "accordion",
                items: {
                    dimensions: {
                        uses: "dimensions",
                        min: 1,
                        max: 1
                    },
                    measures: {
                        uses: "measures",
                        min: 1,
                        max: 1
                    },
                    sorting: {
                        uses: "sorting"
                    },
                    settings: {
                        uses: "settings",
                        items: {
                            token: {
                                ref: "prop.token",
                                label: "Mapbox Access Token",
                                type: "string",
                                defaultValue: "pk.eyJ1Ijoic2tva2VuZXMiLCJhIjoiMjA0ZjBhMmQxM2VlOTk4Nzg4ZGNkZTg4ZGEzMzVlMmIifQ.KLx_nUNkguWjPm6v176iVQ"
                            },
                            circleColor: {
                                ref: "prop.circleColor",
                                label: "Circle Color",
                                type: "string",
                                defaultValue: "#000000"
                            },
                            circleOpacity: {
                                ref: "prop.circleOpacity",
                                label: "Circle Opacity",
                                type: "number",
                                component: "slider",
                                min: 0,
                                max: 1,
                                step: 0.01,
                                defaultValue: 1
                            },
                            circleSize: {
                                type: "array",
                                component: "slider",
                                label: "Circle Size",
                                ref: "prop.range",
                                min: 1,
                                max: 30,
                                step: 1,
                                defaultValue: [3, 10]
                            },
                            style: {
                                type: "string",
                                component: "dropdown",
                                label: "Map Style",
                                ref: "prop.style",
                                options: [{
                                    label: 'Streets',
                                    value: 'streets-v9'
                                }, {
                                    label: 'Basic',
                                    value: 'basic-v9'
                                }, {
                                    label: 'Bright',
                                    value: 'bright-v9'
                                }, {
                                    label: 'Light',
                                    value: 'light-v9'
                                }, {
                                    label: 'Dark',
                                    value: 'dark-v9'
                                }, {
                                    label: 'Emerald',
                                    value: 'emerald-v8'
                                }, {
                                    label: 'Satellite',
                                    value: 'satellite-v9'
                                }, {
                                    label: 'Empty',
                                    value: 'empty-v9'
                                }],
                                defaultValue: 'streets-v9'
                            }
                        }
                    }
                }
            },
            paint: function($element, layout) {

                // Min and Max measure size for size calculation
                var min = layout.qHyperCube.qMeasureInfo[0].qMin;
                var max = layout.qHyperCube.qMeasureInfo[0].qMax;

                // Initialize geojson data source for points
                var sourceGeojson = {
                    "type": "FeatureCollection",
                    "features": []
                };

                // Apply Mapbox access token
                mapboxgl.accessToken = layout.prop.token;

                // On first paint, create the map
                if (!init) {
                    map = new mapboxgl.Map({
                        container: $element[0], // container id
                        style: 'mapbox://styles/mapbox/' + style, //stylesheet location
                        center: [-74.50, 40], // starting position
                        zoom: 0 // starting zoom
                    });

                    // Create a promise that will keep track of when the map's style loads for the first time
                    mapPromise = new Promise(function(resolve, reject) {
                        map.on('style.load', function() {

                            // Add a data source
                            map.addSource('pts', {
                                "type": "geojson",
                                "data": sourceGeojson
                            });

                            // Add a layer
                            map.addLayer({
                                "id": "pts",
                                "source": "pts",
                                "type": "circle",
                                "layout": {},
                                "paint": {
                                    "circle-color": color,
                                    "circle-opacity": opacity,
                                    "circle-radius": {
                                        property: 'metric',
                                        stops: [
                                            [min, layout.prop.range[0]],
                                            [max, layout.prop.range[1]]
                                        ]
                                    }
                                }
                            });

                            resolve();

                        });

                    });

                    // Mark initial setup complete
                    init = true;
                }

                // Build the geojson based on your hypercube data
                sourceGeojson.features = layout.qHyperCube.qDataPages[0].qMatrix.map(function(d) {
                    return {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": JSON.parse(d[0].qText)
                        },
                        "properties": {
                            "metric": d[1].qNum
                        }
                    }
                });

                // Data updates - once the style and layers have been set up, update your layer data, rendering, and zoom
                mapPromise.then(function() {
                    map.getSource('pts').setData(sourceGeojson);
                    map.setPaintProperty('pts', 'circle-radius', {
                        property: 'metric',
                        stops: [
                            [min, layout.prop.range[0]],
                            [max, layout.prop.range[1]]
                        ]
                    });
                    if (sourceGeojson.features.length > 1) {
                        var bbox = turf.extent(sourceGeojson);
                        map.fitBounds([
                            [bbox[0], bbox[1]],
                            [bbox[2], bbox[3]]
                        ]);
                    } else if (sourceGeojson.features.length == 1) {
                        map.flyTo({
                            "center": sourceGeojson.features[0].geometry.coordinates,
                            "zoom": 12
                        });
                    }

                });

                // Color updates
                var curColor = layout.prop.circleColor.length > 0 ? layout.prop.circleColor : "black";
                if (curColor != color) {
                    color = curColor;
                    mapPromise.then(function() {
                        map.setPaintProperty('pts', 'circle-color', color);
                    });
                }

                // Opacity updates
                var curOp = layout.prop.circleOpacity;
                if (curOp != opacity) {
                    opacity = curOp;
                    mapPromise.then(function() {
                        map.setPaintProperty('pts', 'circle-opacity', opacity);
                    });
                }

                // Style update
                if (style != layout.prop.style) {
                    style = layout.prop.style;
                    map.setStyle('mapbox://styles/mapbox/' + style);
                }
            },
            resize: function() {
                if(init) map.resize();
            }
        };

    });
