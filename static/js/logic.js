// API endpoint for earthquake query
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform GET request to query API
d3.json(queryURL, function (data) {
  createFeatures(data.features);

  // Container for circle markers to bind to layer
  var earthquakeMarkers = [];

  // Collect coordinates for earthquakeMarkers
  for (var i = 0; i < data.features.length; i++) {
    var location = data.features[i].geometry;
    var magnitude = data.features[i].properties.mag;

    // Conditionals for color of earthquake markers
    var color = "";
    if (magnitude > 5) {
      color = "#cc0000";  // red
    }
    else if (magnitude > 4) {
      color = "#ff6600";  // orange
    }
    else if (magnitude > 3) {
      color = "#ffcc00";  // yellow-orange
    }
    else if (magnitude > 2) {
      color = "#ffff00";  // yellow
    }
    else if (magnitude > 1) {
      color = "#99ff33";  // yellow-green
    }
    else {
      color = "#33cc33";  // green
    }

    // Add circles to earthquakeMarkers
    earthquakeMarkers.push(
      L.circle([location.coordinates[1], location.coordinates[0]], {
        fillOpacity: 0.75,
        color: color,
        radius: magnitude ** 3 * 500  // adjust radius to magnitude of earthquake
      }).bindPopup("<h3>" + data.features[i].properties.title + "</h3>")
    )
  }

  // Bind earthquakeMarkers to earthquakeLayer
  var earthquakeLayer = L.layerGroup(earthquakeMarkers);

  // Base tile layer options
  var light = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var dark = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Radio buttons for base layers
  var baseMaps = {
    Light: light,
    Dark: dark
  };

  /////////////////  ATTEMPTING TO ADD TECTONIC PLATES LAYER
  // var tectonicJSON = "PB2002_boundaries.geojson";
  // var tectonicLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
  // var tectonicData = 
  // d3.json(tectonicLink, function(data) {
  //   console.log(`data: ${data}`)
  // // }
  //   // Once we get a response, send the data.features object to the createFeatures function
  //   createFeatures(data.features);
  // });
  // // );
  // console.log(`Tectonic data: ${tectonicData}`)

  // var tectonicLayer = L.layerGroup(tectonicData);


  // Overlays that may be toggled on or off
  var overlayMaps = {
    Earthquakes: earthquakeLayer
    // ,
    // Tectonic: tectonicLayer
  };

  // Create map object and set default layers
  var myMap = L.map("map", {
    center: [30, -90.67],  // centered over United States/Central America
    zoom: 4,
    layers: [dark, earthquakeLayer]
  });

  // Pass map layers into layer control
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create legend
  var legend = L.control({position: 'bottomleft'});
  
  legend.onAdd = function (myMap) {
    // Create new <div> in DOM
    var div = L.DomUtil.create('div', 'info legend'),

    // Dictionary of magnitudes and associated colors
    magnitude = {0: "#33cc33", 1: "#99ff33", 2: "#ffff00", 3: "#ffcc00", 4: "#ff6600", 5: "#cc0000"};
    
    // Header for legend
    div.innerHTML += "<h3 style='margin:5px'>Magnitude</h3><div class='leaflet-control-layers-separator'></div>"

    // Loop to add color boxes and associated values
    for (var i = 0; i < Object.keys(magnitude).length; i++) {
      div.innerHTML +=
        '<i class="legend" style="background: ' + magnitude[i] + '">&nbsp;&nbsp;&nbsp;&nbsp;</i> ' +  // magnitude[i] on this line assigns the box color
        i + (magnitude[i + 1] ? ' &le; ' + (i + 1) + '<br>' : '+');  // this line prints i, then if i+1 exists, prints &le; symbol and i+1, otherwise prints i +
    };
    return div;
  };
  legend.addTo(myMap);  
});

function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.title +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature
  });
}