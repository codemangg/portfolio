let vaccinationData = {};
let vaccines = [];
let years = [];

let currentVaccine = null;
let currentYear = null;

let isPlaying = false;
let playIntervalId = null;
const PLAY_DELAY_MS = 5000;

let geojsonLayer = null;
let legendControl = null;

const yearSelect = document.getElementById("yearSelect");
const vaccineSelect = document.getElementById("vaccineSelect");
const tooltipEl = document.getElementById("mapTooltip");
const playButton = document.getElementById("playButton");
let hideTooltipTimeout = null;
const map = L.map("map", {
  center: [20, 0],
  zoom: 2,
  minZoom: 2,
  maxBounds: [
    [-60, -180],
    [85, 180]
  ],
  maxBoundsViscosity: 1.0
});

const InfoButton = L.Control.extend({
  options: { position: "topright" },
  onAdd: function () {
    const btn = L.DomUtil.create("button", "leaflet-control info-button");
    btn.textContent = "i";
    btn.onclick = () => openInfoModal();
    return btn;
  } 
});
map.addControl(new InfoButton());


L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  minZoom: 2,
  maxZoom: 50,
  noWrap: true,
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

function showTooltip(html, e) {
  if (hideTooltipTimeout) {
    clearTimeout(hideTooltipTimeout);
    hideTooltipTimeout = null;
  }
  tooltipEl.innerHTML = html;
  const x = e.originalEvent.pageX + 12;
  const y = e.originalEvent.pageY - 12;
  tooltipEl.style.left = `${x}px`;
  tooltipEl.style.top = `${y}px`;
  tooltipEl.classList.add("show");
}

function moveTooltip(e) {
  tooltipEl.style.left = `${e.originalEvent.pageX + 12}px`;
  tooltipEl.style.top = `${e.originalEvent.pageY - 12}px`;
}

function hideTooltipWithDelay() {
  hideTooltipTimeout = setTimeout(() => {
    tooltipEl.classList.remove("show");
  }, 60);
}

function getColor(rate) {
  return rate > 90
    ? "#0d7313"
    : rate > 80
      ? "#1fb51f"
      : rate > 70
        ? "#3fdc3f"
        : rate > 60
          ? "#7be87b"
          : rate >= 1
            ? "#c8f7c8"
            : "#c8f7c8";
}

function getIsoCode(feature) {
  const p = feature.properties || {};
  if (p.ISO_A3 && p.ISO_A3 !== "-99") return p.ISO_A3;
  if (p.ISO_A3_EH && p.ISO_A3_EH !== "-99") return p.ISO_A3_EH;
  if (p.ADM0_A3 && p.ADM0_A3 !== "-99") return p.ADM0_A3;
  if (p.ADM0_ISO && p.ADM0_ISO !== "-99") return p.ADM0_ISO;
  if (p.WB_A3 && p.WB_A3 !== "-99") return p.WB_A3;
  if (p.GU_A3 && p.GU_A3 !== "-99") return p.GU_A3;
  if (p.SU_A3 && p.SU_A3 !== "-99") return p.SU_A3;
  if (p.SOV_A3 && p.SOV_A3 !== "-99") return p.SOV_A3;
  return null;
}

fetch("full_vaccination_data.json")
  .then((res) => res.json())
  .then((rawData) => {
    const vaccineSet = new Set();
    rawData.forEach((row) => {
      const v = row.vaccine;
      const iso = row.iso3;
      const year = String(row.year);
      const cov = row.coverage;
      if (!v || !iso || cov == null) return;
      vaccineSet.add(v);
      if (!vaccinationData[v]) vaccinationData[v] = {};
      if (!vaccinationData[v][iso]) vaccinationData[v][iso] = {};
      vaccinationData[v][iso][year] = cov;
    });
    vaccines = Array.from(vaccineSet).sort();
    currentVaccine = vaccines[0];
    initVaccineOptions();
    updateYearsForCurrentVaccine();
    return fetch("Regions.geojson");
  })
  .then((res) => res.json())
  .then((geojsonData) => {
    geojsonLayer = L.geoJSON(geojsonData, {
      style: styleFeature,
      onEachFeature: onEachFeature
    }).addTo(map);
    createLegend();
  });

function initVaccineOptions() {
  vaccineSelect.innerHTML = "";
  vaccines.forEach((v) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    if (v === currentVaccine) o.selected = true;
    vaccineSelect.appendChild(o);
  });
}

function updateYearsForCurrentVaccine() {
  const yearsSet = new Set();
  const byCountry = vaccinationData[currentVaccine] || {};
  Object.values(byCountry).forEach((obj) => {
    Object.keys(obj).forEach((y) => yearsSet.add(y));
  });
  years = Array.from(yearsSet).sort((a, b) => Number(a) - Number(b));
  currentYear = years[years.length - 1];
  initYearOptions();
}

function initYearOptions() {
  yearSelect.innerHTML = "";
  years.forEach((y) => {
    const o = document.createElement("option");
    o.value = y;
    o.textContent = y;
    if (y === currentYear) o.selected = true;
    yearSelect.appendChild(o);
  });
}

vaccineSelect.addEventListener("change", () => {
  stopAnimation();
  currentVaccine = vaccineSelect.value;
  updateYearsForCurrentVaccine();
  if (geojsonLayer) geojsonLayer.setStyle(styleFeature);
  updateLegendTitle();
});

yearSelect.addEventListener("change", () => {
  stopAnimation();
  currentYear = yearSelect.value;
  if (geojsonLayer) geojsonLayer.setStyle(styleFeature);
  updateLegendTitle();
});

function styleFeature(feature) {
  const rawIso = getIsoCode(feature);
  const iso = rawIso === "GRL" ? "DNK" : rawIso;
  const byCountry = vaccinationData[currentVaccine] || {};
  const rates = iso ? (byCountry[iso] || {}) : {};
  const rate = rates[currentYear];
  return {
    fillColor: rate ? getColor(rate) : "#cccccc",
    weight: 1,
    opacity: 1,
    color: "#ffffff",
    dashArray: "3",
    fillOpacity: 0.8
  };
}

function highlightFeature(e) {
  const layer = e.target;
  layer.setStyle({
    weight: 3,
    color: "#111111",
    dashArray: "",
    fillOpacity: 0.9
  });
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

function resetHighlight(e) {
  if (geojsonLayer) geojsonLayer.resetStyle(e.target);
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  const rawIso = getIsoCode(feature);
  const iso = rawIso === "GRL" ? "DNK" : rawIso;
  const name =
    feature.properties.ADMIN ||
    feature.properties.NAME ||
    feature.properties.name ||
    iso;
  function tooltipHTML() {
    const byCountry = vaccinationData[currentVaccine] || {};
    const val = iso ? byCountry[iso]?.[currentYear] : null;
    const rate = val != null ? `${val}%` : "No data";
    return `
      <b>${name}</b><br>
      Vaccine: ${currentVaccine}<br>
      Year: ${currentYear}<br>
      Coverage: ${rate}
    `;
  }
  layer.on({
    mouseover: (e) => {
      highlightFeature(e);
      showTooltip(tooltipHTML(), e);
    },
    mousemove: (e) => moveTooltip(e),
    mouseout: (e) => {
      resetHighlight(e);
      hideTooltipWithDelay();
    },
    click: (e) => {
      zoomToFeature(e);
      showTooltip(tooltipHTML(), e);
    }
  });
}

function createLegend() {
  legendControl = L.control({ position: "bottomleft" });
  legendControl.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    div.innerHTML = `<div class="title">${currentVaccine} coverage (${currentYear})</div>`;
    div.innerHTML += `<i style="background:${getColor(1)}"></i><span>&lt; 50%</span><br>`;
    div.innerHTML += `<i style="background:${getColor(50.1)}"></i><span>50–60%</span><br>`;
    div.innerHTML += `<i style="background:${getColor(60.1)}"></i><span>60–70%</span><br>`;
    div.innerHTML += `<i style="background:${getColor(70.1)}"></i><span>70–80%</span><br>`;
    div.innerHTML += `<i style="background:${getColor(80.1)}"></i><span>80–90%</span><br>`;
    div.innerHTML += `<i style="background:${getColor(90.1)}"></i><span>&gt; 90%</span><br>`;
    div.innerHTML += `<i style="background:#cccccc"></i><span>No data</span><br>`;
    return div;
  };
  legendControl.addTo(map);
}

function updateLegendTitle() {
  const div = legendControl?.getContainer();
  const title = div?.querySelector(".title");
  if (title) title.textContent = `${currentVaccine} coverage (${currentYear})`;
}

function startAnimation() {
  if (!years.length) return;
  if (!currentYear || years.indexOf(currentYear) === -1) {
    currentYear = years[0];
  }
  isPlaying = true;
  playButton.textContent = "⏸ Pause";
  playButton.classList.add("playing");
  yearSelect.value = currentYear;
  if (geojsonLayer) geojsonLayer.setStyle(styleFeature);
  updateLegendTitle();
  if (playIntervalId) clearInterval(playIntervalId);
  playIntervalId = setInterval(() => {
    const idx = years.indexOf(currentYear);
    if (idx === -1 || idx === years.length - 1) {
      stopAnimation();
      return;
    }
    currentYear = years[idx + 1];
    yearSelect.value = currentYear;
    if (geojsonLayer) geojsonLayer.setStyle(styleFeature);
    updateLegendTitle();
  }, PLAY_DELAY_MS);
}

function stopAnimation() {
  if (!isPlaying && !playIntervalId) return;
  isPlaying = false;
  playButton.textContent = "▶ Play";
  playButton.classList.remove("playing");
  if (playIntervalId) {
    clearInterval(playIntervalId);
    playIntervalId = null;
  }
}

function toggleAnimation() {
  if (isPlaying) stopAnimation();
  else startAnimation();
}

playButton.addEventListener("click", toggleAnimation);

const infoModal = document.getElementById("infoModal");
const modalClose = document.getElementById("modalClose");

function openInfoModal() {
  infoModal.classList.add("visible");
}

function closeInfoModal() {
  infoModal.classList.remove("visible");
}

modalClose.addEventListener("click", closeInfoModal);

infoModal.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-backdrop")) {
    closeInfoModal();
  }
});
