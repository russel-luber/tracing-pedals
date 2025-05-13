// Import Mapbox as an ESM module
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

// Check that Mapbox GL JS is loaded
console.log('Mapbox GL JS Loaded:', mapboxgl);

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoicnNsLWxiciIsImEiOiJjbWFoeWxiZnMwYXBnMnFvaTFjYXEzOHpiIn0.M3SRUHpa6faqlyxPti2r3A'; // Replace with your actual token

// Initialize the map
const map = new mapboxgl.Map({
  container: "map", // ID of the <div> in index.html
  style: 'mapbox://styles/rsl-lbr/cmai0j3r000wm01sn9mu683me', // You can later replace with your custom style
  center: [-71.09407439974805, 42.361357592424625], // MIT
  zoom: 12,
  minZoom: 5,
  maxZoom: 18,
});

// Confirm it's loaded
console.log('Mapbox GL JS Loaded:', mapboxgl);

map.on('load', async () => {
  // Step 2.1: Add Boston bike lane data

  // 1. Add the data source
  map.addSource('boston_route', {
    type: 'geojson',
    data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson',
  });

  // 2. Add the visual layer
  map.addLayer({
    id: 'bike-lanes-boston',
    type: 'line',
    source: 'boston_route',
    paint: {
      'line-color': '#32D400',   // Bright green lines
      'line-width': 3,         // Line thickness
      'line-opacity': 0.4      // Slight transparency
    }
  });

  console.log('Boston bike lanes loaded!');
});