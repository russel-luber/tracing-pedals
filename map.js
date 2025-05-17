// // Import Mapbox as an ESM module
// import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
// import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// // Check that Mapbox GL JS is loaded
// console.log('Mapbox GL JS Loaded:', mapboxgl);

// // Set your Mapbox access token
// mapboxgl.accessToken = 'pk.eyJ1IjoicnNsLWxiciIsImEiOiJjbWFoeWxiZnMwYXBnMnFvaTFjYXEzOHpiIn0.M3SRUHpa6faqlyxPti2r3A'; // Replace with your actual token

// // Initialize the map
// const map = new mapboxgl.Map({
//   container: "map", // ID of the <div> in index.html
//   style: 'mapbox://styles/rsl-lbr/cmai0j3r000wm01sn9mu683me', // You can later replace with your custom style
//   center: [-71.09407439974805, 42.361357592424625], // MIT
//   zoom: 12,
//   minZoom: 5,
//   maxZoom: 18,
// });

// // Confirm it's loaded
// console.log('Mapbox GL JS Loaded:', mapboxgl);

// let trips, stations, circles, radiusScale;

// /** FUNCTIONS **/

// // Reusable func for paint style color of bike routes
// function getBikeLaneStyle(color) {
//   return {
//     'line-color': color,
//     'line-width': 3,
//     'line-opacity': 0.4,
//   };
// }

// function getCoords(station) {
//   const point = new mapboxgl.LngLat(+station.lon, +station.lat);
//   const { x, y } = map.project(point);
//   return { cx: x, cy: y };
// }

// const slider = document.getElementById('time-slider');
// const selectedTime = document.getElementById('selected-time');
// const anyTime = document.getElementById('any-time');

// function filterTripsByTime(trips) {
//   const cutoff = +slider.value;
//   if (cutoff === -1) {
//     selectedTime.textContent = '';
//     anyTime.style.display = 'inline';
//     return trips;
//   }

//   selectedTime.textContent = `${Math.floor(cutoff / 60)}:${(cutoff % 60).toString().padStart(2, '0')}`;
//   anyTime.style.display = 'none';

//   return trips.filter((trip) => {
//     return trip.started_at.getHours() * 60 + trip.started_at.getMinutes() <= cutoff &&
//            trip.ended_at.getHours() * 60 + trip.ended_at.getMinutes() >= cutoff;
//   });
// }

// function computeTraffic(trips, stations) {
//   const departures = d3.rollup(trips, v => v.length, d => d.start_station_id);
//   const arrivals = d3.rollup(trips, v => v.length, d => d.end_station_id);

//   return stations.map(station => {
//     const id = station.short_name;
//     station.departures = departures.get(id) ?? 0;
//     station.arrivals = arrivals.get(id) ?? 0;
//     station.totalTraffic = station.departures + station.arrivals;
//     return station;
//   });
// }

// function updateTrafficAndCircles() {
//   const filteredTrips = filterTripsByTime(trips);
//   computeTraffic(filteredTrips, stations);

//   const maxTraffic = d3.max(stations, d => d.totalTraffic);
//   radiusScale.domain([0, maxTraffic]);

//   circles
//     .attr('r', d => radiusScale(d.totalTraffic));

//   circles.select('title')
//     .text(d => `${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
// }

// // Function to update circle positions when the map moves/zooms
// function updatePositions() {
//   circles
//   .attr('cx', d => getCoords(d).cx)
//   .attr('cy', d => getCoords(d).cy);
// }


// map.on('load', async () => {
//   // Add Boston bike lane data

//   // Add the data source
//   map.addSource('boston_route', {
//     type: 'geojson',
//     data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson',
//   });

//   // Add the visual layer
//   map.addLayer({
//     id: 'bike-lanes-boston',
//     type: 'line',
//     source: 'boston_route',
//     paint: getBikeLaneStyle('#32D400'),
//   });

//   console.log('Boston bike lanes loaded!');

//   // Add Cambridge bike lane data
//   map.addSource('cambridge_route', {
//     type: 'geojson',
//     data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson',
//   });

//   map.addLayer({
//     id: 'bike-lanes-cambridge',
//     type: 'line',
//     source: 'cambridge_route',
//     paint: getBikeLaneStyle('blue'),
//   });

//   console.log('Cambridge bike lanes loaded!');
  
//   // Load Bluebike station data using D3
//   let jsonData;
//   try {
//     const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
//     jsonData = await d3.json(jsonurl);

//     // Await JSON fetch
//     console.log('Loaded JSON Data:', jsonData);

//   } catch (error) {
//     console.error('Error loading JSON:', error); // Handle errors
//   }
  
//   let stations = jsonData.data.stations;
//   console.log('Stations Array:', stations);

//    // Load trips data
//   const trips = await d3.csv(
//     'https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv',
//     (trip) => {
//       trip.started_at = new Date(trip.started_at);
//       trip.ended_at = new Date(trip.ended_at);
//       return trip;
//     }
//   );

//   computeTraffic(trips, stations);

//   const radiusScale = d3.scaleSqrt()
//     .domain([0, d3.max(stations, d => d.totalTraffic)])
//     .range([0, 25]);

//   const svg = d3.select('#map').select('svg');

//   circles = svg
//     .selectAll('circle')
//     .data(stations)
//     .enter()
//     .append('circle')
//     .attr('r', d => radiusScale(d.totalTraffic))
//     .attr('fill', 'steelblue')
//     .attr('stroke', 'white')
//     .attr('stroke-width', 1)
//     .attr('opacity', 0.8)
//     .each(function (d) {
//       d3.select(this)
//         .append('title')
//         .text(`${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
//     });

//   updatePositions();
//   updateTrafficAndCircles(); // Run on load

//   map.on('move', updatePositions);
//   map.on('zoom', updatePositions);
//   map.on('resize', updatePositions);
//   map.on('moveend', updatePositions);

//   slider.addEventListener('input', updateTrafficAndCircles);
// });

// Import modules
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Access token
mapboxgl.accessToken = 'pk.eyJ1IjoicnNsLWxiciIsImEiOiJjbWFoeWxiZnMwYXBnMnFvaTFjYXEzOHpiIn0.M3SRUHpa6faqlyxPti2r3A';

// Create map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/rsl-lbr/cmai0j3r000wm01sn9mu683me',
  center: [-71.09407439974805, 42.361357592424625],
  zoom: 12,
  minZoom: 5,
  maxZoom: 18,
});

console.log('Mapbox GL JS Loaded:', mapboxgl);

// Globals
let trips, stations, radiusScale, circles;

// Helpers
function getBikeLaneStyle(color) {
  return {
    'line-color': color,
    'line-width': 3,
    'line-opacity': 0.4,
  };
}

function getCoords(station) {
  const { x, y } = map.project([+station.lon, +station.lat]);
  return { cx: x, cy: y };
}

function computeTraffic(tripsSubset) {
  const departures = d3.rollup(tripsSubset, v => v.length, d => d.start_station_id);
  const arrivals = d3.rollup(tripsSubset, v => v.length, d => d.end_station_id);
  stations.forEach(station => {
    const id = station.short_name;
    station.departures = departures.get(id) ?? 0;
    station.arrivals = arrivals.get(id) ?? 0;
    station.totalTraffic = station.departures + station.arrivals;
  });
}

function updatePositions() {
  circles
    .attr('cx', d => getCoords(d).cx)
    .attr('cy', d => getCoords(d).cy);
}

function updateTrafficAndCircles() {
  const cutoff = +slider.value;
  const filteredTrips = cutoff === -1
    ? trips
    : trips.filter(t => {
        const min = t.started_at.getHours() * 60 + t.started_at.getMinutes();
        const max = t.ended_at.getHours() * 60 + t.ended_at.getMinutes();
        return min <= cutoff && max >= cutoff;
      });

  computeTraffic(filteredTrips);

  const maxT = d3.max(stations, d => d.totalTraffic);
  radiusScale.domain([0, maxT]);

  circles
    .attr('r', d => radiusScale(d.totalTraffic))
    .select('title')
    .text(d => `${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
}

// Slider UI
const slider = document.getElementById('time-slider');
const selectedTime = document.getElementById('selected-time');
const anyTime = document.getElementById('any-time');

function updateTimeLabel() {
  const cutoff = +slider.value;
  if (cutoff === -1) {
    selectedTime.textContent = '';
    anyTime.style.display = 'inline';
  } else {
    const h = Math.floor(cutoff / 60);
    const m = String(cutoff % 60).padStart(2, '0');
    selectedTime.textContent = `${h}:${m}`;
    anyTime.style.display = 'none';
  }
}

// Main load sequence
map.on('load', async () => {
  // Add bike lanes
  map.addSource('boston_route', {
    type: 'geojson',
    data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson',
  });
  map.addLayer({
    id: 'bike-lanes-boston',
    type: 'line',
    source: 'boston_route',
    paint: getBikeLaneStyle('#32D400'),
  });

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

  // Load stations
  const jsonData = await d3.json('https://dsc106.com/labs/lab07/data/bluebikes-stations.json');
  stations = jsonData.data.stations;

  // Load trips
  trips = await d3.csv('https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv', d => {
    d.started_at = new Date(d.started_at);
    d.ended_at = new Date(d.ended_at);
    return d;
  });

  // Compute traffic & radius
  computeTraffic(trips);
  radiusScale = d3.scaleSqrt()
    .domain([0, d3.max(stations, d => d.totalTraffic)])
    .range([0, 25]);

  const svg = d3.select('#map').select('svg');

  circles = svg.selectAll('circle')
    .data(stations, d => d.short_name)
    .enter()
    .append('circle')
    .attr('r', d => radiusScale(d.totalTraffic))
    .attr('fill', 'steelblue')
    .attr('stroke', 'white')
    .attr('stroke-width', 1)
    .attr('opacity', 0.8)
    .each(function(d) {
      d3.select(this).append('title')
        .text(`${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
    });

  updatePositions();
  updateTrafficAndCircles();
  updateTimeLabel();

  // Sync circle positions with map movement
  map.on('move', updatePositions);
  map.on('zoom', updatePositions);
  map.on('resize', updatePositions);
  map.on('moveend', updatePositions);

  // Sync filtering with slider
  slider.addEventListener('input', () => {
    updateTimeLabel();
    updateTrafficAndCircles();
  });
});
