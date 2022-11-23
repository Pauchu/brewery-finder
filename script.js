let darkModeEnabled = false

function darkMode() {
  let element = document.querySelector("body")
  let button = document.querySelector("#darkmode-button")
  if (darkModeEnabled) {
    element.style.color = "black"
    element.style.backgroundColor = "white"
    button.innerHTML = "Dark Mode"
    darkModeEnabled = false
  } else {
    element.style.color = "white"
    element.style.backgroundColor = "black"
    button.innerHTML = "Light Mode"
    darkModeEnabled = true
  }
}

async function searchOSM() {
  // Find coordinates of entered location
  let searchBar = document.querySelector("#osm-query")
  let request = "https://nominatim.openstreetmap.org/search/" + searchBar.value + "?format=json"
  let response = await fetch(request)
  let location = await response.json()

  // Find the 5 breweries closest to the most likely result
  request = "https://api.openbrewerydb.org/breweries?by_dist=" + location[0].lat + "," + location[0].lon + "&per_page=5"
  response = await fetch(request)
  let breweries = await response.json()

  breweries_ul = document.querySelector("#breweries-result")
  breweries_ul.innerHTML = ""
  let lat_avg = 0
  let lon_avg = 0
  let markers = map.getLayersByName("Markers")[0]
  markers.clearMarkers()

  breweries.forEach((brewery, i) => {
    lat_avg += brewery.latitude/5;
    lon_avg += brewery.longitude/5;

    let position = new OpenLayers.LonLat(brewery.longitude, brewery.latitude)
      .transform(
        new OpenLayers.Projection("EPSG:4326"),
        new OpenLayers.Projection("EPSG:900913")
      );
    markers.addMarker(new OpenLayers.Marker(position));

    let li = document.createElement("li")
    if (brewery.website_url) {
      let a = document.createElement("a")
      a.href = brewery.website_url
      a.innerHTML =
        brewery.name +
        ((brewery.street) ? ", " + brewery.street : "") +
        ((brewery.city) ? ", " + brewery.city : "")
      li.append(a)
    } else {
      li.innerHTML =
        brewery.name +
        ((brewery.street) ? ", " + brewery.street : "") +
        ((brewery.city) ? ", " + brewery.city : "")
    }
    breweries_ul.append(li);
  });

  let position = new OpenLayers.LonLat(lon_avg, lat_avg)
    .transform(
      new OpenLayers.Projection("EPSG:4326"),
      new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
    );
  map.setCenter(position, 12);

  // Get the weather for the average position of breweries
  request = "https://api.open-meteo.com/v1/forecast?latitude=" + lat_avg + "&longitude=" + lon_avg + "&hourly=temperature_2m,precipitation"
  response = await fetch(request)
  let weather = await response.json()

  let temp_avg = 0
  let prec_total = 0

  for (i = 0; i < 5; i++) {
    temp_avg += weather.hourly.temperature_2m[i]/5;
    prec_total += weather.hourly.precipitation[0];
  };

  console.log(temp_avg);


  document.querySelector("#weather-result").innerHTML = "Temperature: " + temp_avg.toFixed(1) + "°C<br> Precipitation: " + prec_total + "mm"
}

function initMap() {
  map = new OpenLayers.Map("basicMap");
  let mapnik = new OpenLayers.Layer.OSM();
  let markers = new OpenLayers.Layer.Markers( "Markers" );

  map.addLayer(mapnik);
  map.addLayer(markers)
  map.zoomToMaxExtent();
}

// https://api.open-meteo.com/v1/
// https://api.openbrewerydb.org
