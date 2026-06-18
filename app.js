// Zone lookup
document.getElementById("zoneBtn").addEventListener("click", lookupZone);
document.getElementById("zipInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") lookupZone();
});

async function lookupZone() {
  const zip = document.getElementById("zipInput").value.trim();
  const result = document.getElementById("zoneResult");

  if (!/^\d{5}$/.test(zip)) {
    result.textContent = "Please enter a 5-digit ZIP code.";
    return;
  }

  result.textContent = "Looking up...";

  try {
    const response = await fetch(`https://phzmapi.com/${zip}.json`);
    if (!response.ok) throw new Error("Not found");
    const data = await response.json();
    const zone = data.zone;
    const range = data.temperature_range;
    result.textContent = `Zone ${zone} — ${range}`;
  } catch {
    result.textContent = "Zone not found. Check your ZIP and try again.";
  }
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
    .map(el => el.value);
}

function filterPlants() {
  const selectedLight      = getCheckedValues("light");
  const selectedMoisture   = getCheckedValues("moisture");
  const selectedType       = getCheckedValues("type");
  const selectedColor      = getCheckedValues("color");
  const selectedDifficulty = getCheckedValues("difficulty");
  const selectedRegion     = getCheckedValues("region");
  const maxHeight          = parseInt(document.getElementById("heightFilter").value);
  const nativeOnly         = document.getElementById("nativeOnly").checked;
  const pollinatorOnly     = document.getElementById("pollinatorOnly").checked;

  return plants.filter(plant => {
    const plantRegion = plant.region || "east";
    if (selectedLight.length > 0 && !selectedLight.some(l => plant.light.includes(l))) return false;
    if (selectedMoisture.length > 0 && !selectedMoisture.some(m => plant.moisture.includes(m))) return false;
    if (selectedType.length > 0 && !selectedType.includes(plant.type)) return false;
    if (selectedColor.length > 0 && !selectedColor.some(c => plant.color.includes(c))) return false;
    if (selectedDifficulty.length > 0 && !selectedDifficulty.includes(plant.difficulty)) return false;
    if (selectedRegion.length > 0 && !selectedRegion.includes(plantRegion)) return false;
    if (plant.heightMin > maxHeight) return false;
    if (nativeOnly && !plant.native) return false;
    if (pollinatorOnly && !plant.pollinatorValue) return false;
    return true;
  });
}

function colorHex(name) {
  return {
    white: "#f0f0f0", yellow: "#f5c842", orange: "#e8872a",
    pink: "#e87aab", red: "#c0392b", blue: "#4a7fc1",
    purple: "#7d5ab5", lavender: "#b39ddb", silver: "#aaa",
    green: "#5a8a5a"
  }[name] || "#ccc";
}

function lightLabel(val) {
  return { sun: "Full Sun", "part-sun": "Part Sun", "part-shade": "Part Shade", shade: "Full Shade" }[val] || val;
}

function moistureLabel(val) {
  return { wet: "Wet", moist: "Moist", dry: "Dry" }[val] || val;
}

function renderPlants(list) {
  const grid = document.getElementById("plantGrid");
  const count = document.getElementById("resultCount");

  count.textContent = `${list.length} plant${list.length !== 1 ? "s" : ""} found`;

  if (list.length === 0) {
    grid.innerHTML = '<p class="no-results">No plants match your current filters. Try relaxing a condition.</p>';
    return;
  }

  grid.innerHTML = list.map(plant => `
    <div class="plant-card">
      <h3>${plant.commonName}</h3>
      <p class="scientific">${plant.scientificName}</p>

      <div class="plant-tags">
        ${plant.light.map(l => `<span class="tag">${lightLabel(l)}</span>`).join("")}
        ${plant.moisture.map(m => `<span class="tag moisture">${moistureLabel(m)}</span>`).join("")}
        <span class="tag type">${plant.type.charAt(0).toUpperCase() + plant.type.slice(1)}</span>
      </div>

      <p class="plant-meta">
        Height: ${plant.heightMin === plant.heightMax ? plant.heightMin : plant.heightMin + "–" + plant.heightMax} ft
        ${plant.native ? " &nbsp;·&nbsp; Native" : ""}
      </p>

      <p class="plant-meta">
        <span class="difficulty difficulty-${plant.difficulty}">${plant.difficulty.charAt(0).toUpperCase() + plant.difficulty.slice(1)}</span>
        ${plant.color.filter(c => c !== "foliage").length > 0
          ? "&nbsp;·&nbsp; " + plant.color.filter(c => c !== "foliage").map(c => `<span class="color-dot" style="background:${colorHex(c)}" title="${c}"></span>`).join(" ")
          : "&nbsp;·&nbsp; <em style='font-size:0.8rem;color:#888'>foliage</em>"}
      </p>

      ${plant.pollinatorValue ? '<p class="pollinator-badge">🌿 Pollinator friendly</p>' : ""}
      ${plant.notes ? `<p class="plant-notes">${plant.notes}</p>` : ""}
    </div>
  `).join("");
}

function update() {
  renderPlants(filterPlants());
}

document.getElementById("heightFilter").addEventListener("input", function () {
  document.getElementById("heightDisplay").textContent =
    this.value == 10 ? "Up to 10 ft" : `Up to ${this.value} ft`;
  update();
});

document.getElementById("resetBtn").addEventListener("click", function () {
  document.querySelectorAll("input[type=checkbox]").forEach(cb => {
    if (cb.id === "nativeOnly") {
      cb.checked = true;
    } else {
      cb.checked = false;
    }
  });
  document.getElementById("heightFilter").value = 10;
  document.getElementById("heightDisplay").textContent = "Up to 10 ft";
  update();
});

document.querySelectorAll("input[type=checkbox]").forEach(cb => {
  cb.addEventListener("change", update);
});

update();
