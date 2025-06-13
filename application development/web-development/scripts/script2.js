// Execute all actions below once the DOM is loaded 
document.addEventListener("DOMContentLoaded", () => {

  // Initialize the map
  const map = L.map("map").setView([47.8095, 13.0550], 12);

  // Add the OSM layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // I used Gen AI to generate the polygon list
  const polygons = [
    L.polygon([[47.81, 13.0], [47.82, 13.01], [47.81, 13.02]]).bindTooltip("Polygon 1", { permanent: true }),
    L.polygon([[47.82, 13.03], [47.83, 13.04], [47.82, 13.05]]).bindTooltip("Polygon 2", { permanent: true }),
    L.polygon([[47.80, 13.03], [47.79, 13.04], [47.80, 13.05]]).bindTooltip("Polygon 3", { permanent: true }),
    L.polygon([[47.80, 12.98], [47.79, 12.97], [47.78, 12.99]]).bindTooltip("Polygon 4", { permanent: true }),
    L.polygon([[47.83, 12.99], [47.84, 13.0], [47.83, 13.01]]).bindTooltip("Polygon 5", { permanent: true })
  ];

  // Add the polygons to the map
  polygons.forEach(polygon => polygon.addTo(map));

  // Calculate and store the centroids of all polygons
  const centroids = polygons.map(polygon => polygon.getBounds().getCenter());

  // Get the distance between 2 points in the map
  function getDistance(p1, p2) {
    return map.distance(p1, p2);
  }

  // Handle user click in the map
  map.on("click", function (x) {
    // This gets the specific position where we clciked 
    const clickPoly = x.latlng;

    let nearestPolygonIdx = -1;
    let minDistance = Infinity;

    // Find the closest polygon centroid next to the clicked point
    centroids.forEach((center, index) => {
      const distance = getDistance(clickPoly, center);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPolygonIdx = index;
      }
    });

    // Color the nearest polygon red, color all others black
    polygons.forEach((x, index) => {
      const polycolor = document.getElementById(`polygon${index + 1}`);

      if (index === nearestPolygonIdx) {
        x.setStyle({ color: "red" });
        if (polycolor) polycolor.style.color = "red";
      } else {
        x.setStyle({ color: "black" });
        if (polycolor) polycolor.style.color = "black";
      }
    });
  });
});
