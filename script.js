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
  let searchBar = document.querySelector("#osm-query")
  let request = "https://nominatim.openstreetmap.org/search/" + searchBar.value + "?format=json"
  let response = await fetch(request)
  let city = await response.json()

  request = "https://api.openbrewerydb.org/breweries?by_dist=" + city[0].lat + "," + city[0].lon + "&per_page=5"
  response = await fetch(request)
  let breweries = await response.json()
  console.log(breweries[0])

  request = "https://api.open-meteo.com/v1/forecast?latitude=" + breweries[0].latitude + "&longitude=" + breweries[0].longitude + "&hourly=temperature_2m,precipitation"
  response = await fetch(request)
  let weather = await response.json()
  console.log(weather);

  if (breweries[0].website_url) {
    let a = document.createElement("a")
    a.href = breweries[0].website_url
    a.innerHTML =
      breweries[0].name +
      ((breweries[0].street) ? ", " + breweries[0].street : "") +
      ((breweries[0].city) ? ", " + breweries[0].city : "")
    document.querySelector("#breweries-result").innerHTML = ""
    document.querySelector("#breweries-result").append(a)
  } else {
    document.querySelector("#breweries-result").innerHTML =
      breweries[0].name +
      ((breweries[0].street) ? ", " + breweries[0].street : "") +
      ((breweries[0].city) ? ", " + breweries[0].city : "")
  }

  let fromProjection = new OpenLayers.Projection("EPSG:4326");
  let toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
  let position       = new OpenLayers.LonLat(breweries[0].longitude, breweries[0].latitude).transform( fromProjection, toProjection);
  let zoom           = 15;
  map.setCenter(position, zoom );

  document.querySelector("#weather-result").innerHTML = "Temperatur: " + weather.hourly.temperature_2m[0] + "°C, Precipitation: " + weather.hourly.precipitation[0] + "mm"
}

function initMap() {
  map = new OpenLayers.Map("basicMap");
  let mapnik = new OpenLayers.Layer.OSM();

  map.addLayer(mapnik);
  map.zoomToMaxExtend();
}

// https://api.open-meteo.com/v1/
// https://api.openbrewerydb.org
