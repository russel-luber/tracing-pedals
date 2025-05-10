// Import Mapbox as an ESM module
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

// Check that Mapbox GL JS is loaded
console.log('Mapbox GL JS Loaded:', mapboxgl);

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoicnNsLWxiciIsImEiOiJjbWFoeWxiZnMwYXBnMnFvaTFjYXEzOHpiIn0.M3SRUHpa6faqlyxPti2r3A'; // Replace with your actual token

// Initialize the map
const map = new mapboxgl.Map({
  container: "map", // ID of the <div> in index.html
  style: 'mapbox://styles/mapbox/streets-v12', // You can later replace with your custom style
  center: [-71.09407439974805, 42.361357592424625], // MIT
  zoom: 12,
  minZoom: 5,
  maxZoom: 18
});

// Confirm it's loaded
console.log('Mapbox GL JS Loaded:', mapboxgl);
