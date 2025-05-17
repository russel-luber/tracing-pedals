import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

mapboxgl.accessToken = 'pk.eyJ1IjoicnNsLWxiciIsImEiOiJjbWFoeWxiZnMwYXBnMnFvaTFjYXEzOHpiIn0.M3SRUHpa6faqlyxPti2r3A';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/rsl-lbr/cmai0j3r000wm01sn9mu683me',
  center: [-71.09407439974805, 42.361357592424625],
  zoom: 12,
  minZoom: 5,
  maxZoom: 18,
});

let trips, stations, radiusScale, circles;

const slider = document.getElementById('time-slider');
const selectedTime = document.getElementById('selected-time');
const anyTime = document.getElementById('any-time');

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

function computeTraffic(filteredTrips) {
  const departures = d3.rollup(filteredTrips, v => v.length, d => d.start_station_id);
  const arrivals = d3.rollup(filteredTrips, v => v.length, d => d.end_station_id);

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

const stationFlow = d3.scaleQuantize()
  .domain([0, 1])
  .range([0, 0.5, 1]);

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
    .style('--departure-ratio', d =>
      stationFlow(d.totalTraffic === 0 ? 0.5 : d.departures / d.totalTraffic)
    );

  circles.select('title')
    .text(d => `${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
}

function formatAMPM(minutes) {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const ampm = h24 < 12 ? 'a.m.' : 'p.m.';
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function updateTimeLabel() {
  const cutoff = +slider.value;
  if (cutoff === -1) {
    selectedTime.textContent = '';
    anyTime.style.display = 'inline';
  } else {
    selectedTime.textContent = formatAMPM(cutoff);
    anyTime.style.display = 'none';
  }
}


map.on('load', async () => {
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

  const stationData = await d3.json('https://dsc106.com/labs/lab07/data/bluebikes-stations.json');
  stations = stationData.data.stations;

  trips = await d3.csv('https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv', d => {
    d.started_at = new Date(d.started_at);
    d.ended_at = new Date(d.ended_at);
    return d;
  });

  computeTraffic(trips);

  radiusScale = d3.scaleSqrt()
    .domain([0, d3.max(stations, d => d.totalTraffic)])
    .range([0, 25]);

  const svg = d3.select('#map').select('svg');

  svg.selectAll('circle')
    .data(stations, d => d.short_name)
    .enter()
    .append('circle')
    .attr('r', d => radiusScale(d.totalTraffic))
    .attr('stroke', 'white')
    .attr('stroke-width', 1)
    .attr('opacity', 0.8)
    .style('--departure-ratio', d =>
      stationFlow(d.totalTraffic === 0 ? 0.5 : d.departures / d.totalTraffic)
    )
    .each(function (d) {
      d3.select(this)
        .append('title')
        .text(`${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
    });

  circles = svg.selectAll('circle');

  updatePositions();
  updateTrafficAndCircles();
  updateTimeLabel();

  map.on('move', updatePositions);
  map.on('zoom', updatePositions);
  map.on('resize', updatePositions);
  map.on('moveend', updatePositions);

  slider.addEventListener('input', () => {
    updateTimeLabel();
    updateTrafficAndCircles();
  });
});