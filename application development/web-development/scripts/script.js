document.addEventListener("DOMContentLoaded", function () {
  // === Task 1: Marker calculation ===
  const markerMapEl = document.getElementById("map-task1");
  if (markerMapEl) {
    const map1 = L.map("map-task1").setView([47.8095, 13.0550], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map1);

    const markerData = [
      [47.81, 13.05],
      [47.808, 13.06],
      [47.807, 13.07],
      [47.805, 13.08],
      [47.804, 13.09]
    ];

    const markers = markerData.map(([lat, lng]) => L.marker([lat, lng]).addTo(map1));

    function getDistance(lat1, lon1, lat2, lon2) {
      const R = 6371e3; // Earth radius in meters
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(Δφ/2)**2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2)**2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    }

    map1.on('click', function (e) {
      const { lat, lng } = e.latlng;
      let count = 0;

      markers.forEach(marker => {
        const mLatLng = marker.getLatLng();
        const dist = getDistance(lat, lng, mLatLng.lat, mLatLng.lng);
        if (dist <= 1000) count++;
      });

      alert(`You clicked at (${lat.toFixed(4)}, ${lng.toFixed(4)}). ${count} marker(s) are within 1km.`);
    });
  }

  // === Task 2: Polygon calculation ===
  const polygonMapEl = document.getElementById("map-task2");
  if (polygonMapEl) {
    const map2 = L.map("map-task2").setView([47.8095, 13.0550], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map2);

    const polygons = [
      { id: "polygon1", latlngs: [[47.81, 13.05], [47.812, 13.055], [47.811, 13.06]] },
      { id: "polygon2", latlngs: [[47.808, 13.05], [47.809, 13.052], [47.807, 13.057]] },
      { id: "polygon3", latlngs: [[47.807, 13.06], [47.808, 13.063], [47.806, 13.065]] },
      { id: "polygon4", latlngs: [[47.805, 13.07], [47.806, 13.072], [47.804, 13.075]] },
      { id: "polygon5", latlngs: [[47.804, 13.08], [47.805, 13.082], [47.803, 13.085]] }
    ];

    const polygonLayers = polygons.map(p => {
      return {
        id: p.id,
        layer: L.polygon(p.latlngs, { color: 'blue' }).addTo(map2)
      };
    });

    function getCentroid(latlngs) {
      let latSum = 0, lngSum = 0;
      latlngs.forEach(([lat, lng]) => {
        latSum += lat;
        lngSum += lng;
      });
      return [latSum / latlngs.length, lngSum / latlngs.length];
    }

    function getDistance(lat1, lon1, lat2, lon2) {
      const R = 6371e3;
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(Δφ/2)**2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2)**2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    }

    map2.on('click', function (e) {
      const { lat, lng } = e.latlng;

      let closest = null;
      let minDistance = Infinity;

      polygons.forEach(p => {
        const [centLat, centLng] = getCentroid(p.latlngs);
        const dist = getDistance(lat, lng, centLat, centLng);

        if (dist < minDistance) {
          minDistance = dist;
          closest = p.id;
        }
      });

      polygonLayers.forEach(p => {
        if (p.id === closest) {
          p.layer.setStyle({ color: 'red' });
        } else {
          p.layer.setStyle({ color: 'blue' });
        }
      });

      const listItems = document.querySelectorAll("#polygon-list li");
      listItems.forEach(item => {
        item.style.fontWeight = item.id === closest ? "bold" : "normal";
        item.style.color = item.id === closest ? "red" : "#333";
      });
    });
  }
});
