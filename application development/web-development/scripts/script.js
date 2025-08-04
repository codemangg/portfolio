document.addEventListener("DOMContentLoaded", function () {
  const markerMapEl = document.getElementById("map-task1");
  if (markerMapEl) {
    const map = L.map("map-task1").setView([47.8095, 13.0550], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const emojiIcon = L.divIcon({
      className: 'emoji-marker',
      html: '📍'
    });

    const markerData = [
      [47.8101, 13.0551],
      [47.8109, 13.0510],
      [47.8112, 13.0589],
      [47.8099, 13.0602],
      [47.8087, 13.0548],
      [47.8075, 13.0579],
      [47.8053, 13.0581],
      [47.8051, 13.0635],
      [47.8044, 13.0614],
      [47.8038, 13.0597],
      [47.8030, 13.0622],
      [47.8023, 13.0640]
    ];

    const markers = markerData.map(([lat, lng]) =>
      L.marker([lat, lng], { icon: emojiIcon }).addTo(map)
    );

    function getDistance(lat1, lon1, lat2, lon2) {
      const R = 6371e3;
      const toRad = deg => deg * Math.PI / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    map.on('click', function (e) {
      const { lat, lng } = e.latlng;
      const count = markers.filter(marker => {
        const pos = marker.getLatLng();
        return getDistance(lat, lng, pos.lat, pos.lng) <= 1000;
      }).length;

      alert(`You clicked at (${lat.toFixed(4)}, ${lng.toFixed(4)}). ${count} marker(s) are within 1km.`);
    });
  }

  const polygonMapEl = document.getElementById("map-task2");
  if (polygonMapEl) {
    const map = L.map("map-task2").setView([47.8095, 13.0550], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

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
        latlngs: p.latlngs,
        layer: L.polygon(p.latlngs, { color: 'blue' }).addTo(map)
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
      const toRad = deg => deg * Math.PI / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    map.on('click', function (e) {
      const { lat, lng } = e.latlng;

      let closest = null;
      let minDistance = Infinity;

      polygonLayers.forEach(p => {
        const [centLat, centLng] = getCentroid(p.latlngs);
        const dist = getDistance(lat, lng, centLat, centLng);
        if (dist < minDistance) {
          minDistance = dist;
          closest = p;
        }
      });

      polygonLayers.forEach(p => {
        p.layer.setStyle({ color: p === closest ? 'red' : 'blue' });
      });

      const listItems = document.querySelectorAll("#polygon-list li");
      listItems.forEach(item => {
        const isActive = item.id === closest.id;
        item.style.fontWeight = isActive ? "bold" : "normal";
        item.style.color = isActive ? "red" : "#333";
      });
    });
  }
});
