// Execute all actions below once the DOM is loaded 
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the map
  const map = L.map("map").setView([47.8095, 13.0550], 13);

  // Add the OSM layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // I used Gen AI to generate the coordinate list
  const markerList = [
    [47.8095, 13.0550],
    [47.8130, 13.0480],
    [47.8070, 13.0400],
    [47.8155, 13.0600],
    [47.8050, 13.0650],
    [47.8100, 13.0700],
    [47.8120, 13.0520],
    [47.8080, 13.0580],
    [47.8060, 13.0500],
    [47.8140, 13.0570]
  ];

  // Set an emoji for all markers
  const emojiIcon = L.divIcon({
    className: "emoji-marker", // I used this for the css to increase the size
    html: "📍"
  });

  // Create and add the markers to the map with the emoji
  const markers = markerList.map(coord =>
    L.marker(coord, { icon: emojiIcon }).addTo(map)
  );

  // Handle user click in the map
  map.on("click", function (x) {
    const clickLocation = x.latlng;
    let count = 0;

    // Iterate over all markers and calculate the distance to the clicked point
    markers.forEach(marker => {
      const dist = map.distance(clickLocation, marker.getLatLng());
      if (dist <= 1000) {
        count++;
      }
    });

    // Show the result as alert (msg box in the browser)
    alert(`There are ${count} marker(s) within 1 km of the clicked point.`);
  });
});
