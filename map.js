// Import Mapbox as an ESM module
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

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

// Reusable func for paint style color of bike routes
function getBikeLaneStyle(color) {
  return {
    'line-color': color,
    'line-width': 3,
    'line-opacity': 0.4,
  };
}

function getCoords(station) {
  const point = new mapboxgl.LngLat(+station.lon, +station.lat);
  const { x, y } = map.project(point);
  return { cx: x, cy: y };
}

map.on('load', async () => {
  // Add Boston bike lane data

  // Add the data source
  map.addSource('boston_route', {
    type: 'geojson',
    data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson',
  });

  // Add the visual layer
  map.addLayer({
    id: 'bike-lanes-boston',
    type: 'line',
    source: 'boston_route',
    paint: getBikeLaneStyle('#32D400'),
  });

  console.log('Boston bike lanes loaded!');

  // Add Cambridge bike lane data
  map.addSource('cambridge_route', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson',
  });

  map.addLayer({
    id: 'bike-lanes-cambridge',
    type: 'line',
    source: 'cambridge_route',
    paint: getBikeLaneStyle('blue'),
  });

  console.log('Cambridge bike lanes loaded!');
  
  // Load Bluebike station data using D3
  let jsonData;
  try {
    const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
    jsonData = await d3.json(jsonurl);

    // Await JSON fetch
    console.log('Loaded JSON Data:', jsonData);

  } catch (error) {
    console.error('Error loading JSON:', error); // Handle errors
  }
  
  let stations = jsonData.data.stations;
  console.log('Stations Array:', stations);

  const svg = d3.select('#map').select('svg');

  const circles = svg
    .selectAll('circle')
    .data(stations)
    .enter()
    .append('circle')
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .attr('stroke', 'white')
    .attr('stroke-width', 1)
    .attr('opacity', 0.8);

  // Function to update circle positions when the map moves/zooms
  function updatePositions() {
    circles
    .attr('cx', d => getCoords(d).cx)
    .attr('cy', d => getCoords(d).cy);
  }

  updatePositions();

  map.on('move', updatePositions);
  map.on('zoom', updatePositions);
  map.on('resize', updatePositions);
  map.on('moveend', updatePositions);
});
