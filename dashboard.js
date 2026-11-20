
// =====================================
// 1. DAFTAR LAYER KOMODITAS
// =====================================

const commodityLayers = {
    "Palm Oil": layer_PalmOil_2,
    "Rubber": layer_Rubber_3,
    "Coconut": layer_Coconut_4,
    "Cocoa": layer_Cocoa_5,
    "Cayenne Pepper": layer_CayyenePepper_6,
    "Curly Chili": layer_CurlyChili_7,
    "Water Spinach": layer_WaterSpinach_8,
    "Spinach": layer_Spinach_9,
    "Carrot": layer_Carrot_10,
    "Coffee Beans": layer_CoffeeBeansFIX_11
};

// =====================================
// 2. PENGATURAN INDIKATOR
// =====================================

const indicatorColors = [
    '#ffffcc',
    '#a9db8e',
    '#49af60',
    '#006837'
];

let currentIndicator = 'Potential_';

// Batas kelas indikator hektare
const hectareBreaks = [
    9.25,
    207,
    2795.25
];

// Batas kelas indikator production (ton)
const productionBreaks = [
    39.25,
    529.43,
    4003.75
];


// =====================================
// 3. COMBINED DROPDOWN CONTROL
// =====================================

const selectorControl = L.control({
    position: 'bottomleft'
});

selectorControl.onAdd = function() {
    const div = L.DomUtil.create('div', 'selector-control');

    div.style.background = 'white';
    div.style.padding = '10px';
    div.style.borderRadius = '7px';
    div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
    div.style.display = 'flex';
    div.style.flexDirection = 'row';
    div.style.alignItems = 'flex-end';
    div.style.gap = '10px';

    div.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:5px;">
            <label for="commoditySelect">
                <b>Select Commodity</b>
            </label>

            <select id="commoditySelect" style="width:145px;">
                ${Object.keys(commodityLayers).map(name =>
                    `<option value="${name}">${name}</option>`
                ).join('')}
            </select>
        </div>

        <div style="display:flex; flex-direction:column; gap:5px;">
            <label for="indicatorSelect">
                <b>Select Indicator</b>
            </label>

            <select id="indicatorSelect" style="width:145px;">
                <option value="Plantation">Plantation (ha)</option>
                <option value="Production">Production (ton)</option>
                <option value="Harvested_">Harvested (ha)</option>
                <option value="Potential_">Potential (ha)</option>
            </select>
        </div>
    `;

    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);

    return div;
};

selectorControl.addTo(map);

const commoditySelect =
    document.getElementById('commoditySelect');

const indicatorSelect =
    document.getElementById('indicatorSelect');

indicatorSelect.value = currentIndicator;


// =====================================
// DYNAMIC LEGEND CONTROL
// =====================================

const legendControl = L.control({
    position: 'bottomright'
});

legendControl.onAdd = function() {
    const div = L.DomUtil.create('div', 'dynamic-legend');

    div.id = 'dynamicLegend';

    div.style.background = 'white';
    div.style.padding = '10px 12px';
    div.style.borderRadius = '6px';
    div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
    div.style.minWidth = '200px';
    div.style.lineHeight = '1.5';

    L.DomEvent.disableClickPropagation(div);

    return div;
};

legendControl.addTo(map);

// =====================================
// 5. MEMBACA NILAI DATA
// =====================================

function getAllValues(layer, field) {
    const values = [];

    layer.eachLayer(function(featureLayer) {
        const properties = featureLayer.feature.properties;
        const rawValue = properties[field];

        if (
            rawValue === null ||
            rawValue === undefined ||
            String(rawValue).trim() === ''
        ) {
            return;
        }

        const value = Number(rawValue);

        if (Number.isFinite(value)) {
            values.push(value);
        }
    });

    return values;
}

// =====================================
// 6. MENENTUKAN WARNA POLYGON
// =====================================

function getColor(value, breaks) {
    if (!Number.isFinite(value)) {
        return '#cccccc';
    }

    if (value <= breaks[0]) {
        return indicatorColors[0];
    }

    if (value <= breaks[1]) {
        return indicatorColors[1];
    }

    if (value <= breaks[2]) {
        return indicatorColors[2];
    }

    return indicatorColors[3];
}

// =====================================
// UPDATE DYNAMIC LEGEND
// =====================================

function updateLegend() {

    const selectedCommodity = commoditySelect.value;

    const isProduction = currentIndicator === 'Production';

    const breaks = isProduction
        ? productionBreaks
        : hectareBreaks;

    const unit = isProduction ? 'ton' : 'ha';

    const maxValue = isProduction
        ? 1650018
        : 402861;

    const indicatorNames = {
        'Plantation': 'Plantation',
        'Production': 'Production',
        'Harvested_': 'Harvested',
        'Potential_': 'Potential'
    };

    const indicatorName = indicatorNames[currentIndicator];

    // Format angka Indonesia
    const formatNumber = function(value) {
        return new Intl.NumberFormat('id-ID', {
            maximumFractionDigits: 2
        }).format(value);
    };

    // Rentang setiap kelas warna
    const ranges = [
        `0 – ${formatNumber(breaks[0])} ${unit}`,
        `> ${formatNumber(breaks[0])} – ${formatNumber(breaks[1])} ${unit}`,
        `> ${formatNumber(breaks[1])} – ${formatNumber(breaks[2])} ${unit}`,
        `> ${formatNumber(breaks[2])} – ${formatNumber(maxValue)} ${unit}`
    ];

    const legendDiv = document.getElementById('dynamicLegend');

    if (!legendDiv) return;

    legendDiv.innerHTML = `
        <div style="font-weight: bold; font-size: 14px;">
            LEGEND
        </div>

        <div style="font-size: 13px; font-weight: bold;">
            ${selectedCommodity}
        </div>

        <div style="font-size: 12px; margin-bottom: 8px; color: #555;">
            ${indicatorName} (${unit})
        </div>

        ${indicatorColors.map((color, index) => `
            <div style="
                display: flex;
                align-items: center;
                gap: 7px;
                margin-bottom: 5px;
                font-size: 12px;
            ">
                <div style="
                    width: 20px;
                    height: 16px;
                    background: ${color};
                    border: 1px solid #777;
                    flex-shrink: 0;
                "></div>

                <span>${ranges[index]}</span>
            </div>
        `).join('')}
    `;
}

// =====================================
// 7. UPDATE WARNA PETA
// =====================================

function updateMapStyle() {
    const selectedCommodity = commoditySelect.value;
    const layer = commodityLayers[selectedCommodity];

    updateLegend();
    renderTop10Chart();

    // Pilih batas kelas berdasarkan satuan indikator
    const breaks = currentIndicator === 'Production'
        ? productionBreaks
        : hectareBreaks;

    const values = getAllValues(layer, currentIndicator);

    console.log('Komoditas:', selectedCommodity);
    console.log('Indikator:', currentIndicator);
    console.log('Jumlah data:', values.length);
    console.log('Batas kelas:', breaks);

    if (values.length === 0) {
        console.warn(
            'Tidak ada data untuk indikator:',
            currentIndicator
        );
        return;
    }

    layer.setStyle(function(feature) {
        const rawValue = feature.properties[currentIndicator];

        const value =
            rawValue === null ||
            rawValue === undefined ||
            String(rawValue).trim() === ''
                ? NaN
                : Number(rawValue);

        return {
            pane: layer.options.pane,
            opacity: 1,
            color: 'rgba(35,35,35,1)',
            weight: 1,
            fill: true,
            fillOpacity: 1,
            fillColor: getColor(value, breaks),
            interactive: true
        };
    });

    console.log(
        'Style berhasil diperbarui:',
        selectedCommodity,
        currentIndicator
    );
}

// =====================================
// 8. MENAMPILKAN SATU KOMODITAS
// =====================================

function showCommodity(selectedCommodity) {
    Object.keys(commodityLayers).forEach(function(name) {
        const layer = commodityLayers[name];

        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    });

    const selectedLayer = commodityLayers[selectedCommodity];

    if (selectedLayer) {
        map.addLayer(selectedLayer);
    }

    updateMapStyle();
    renderDistrictTable();
}

// =====================================
// 9. EVENT DROPDOWN KOMODITAS
// =====================================

commoditySelect.addEventListener('change', function() {
    showCommodity(this.value);
});

// =====================================
// 10. EVENT DROPDOWN INDIKATOR
// =====================================

indicatorSelect.addEventListener('change', function() {
    currentIndicator = this.value;
    updateMapStyle();
});

// =====================================
// 11. DYNAMIC DISTRICT TABLE
// =====================================

let activeTableRows = [];

function escapeTableText(value) {
    return String(value ?? '').replace(/[&<>"']/g, function(char) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[char];
    });
}

function formatTableValue(value) {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ''
    ) {
        return '-';
    }

    const number = Number(value);

    if (Number.isFinite(number)) {
        return new Intl.NumberFormat('id-ID', {
            maximumFractionDigits: 2
        }).format(number);
    }

    return escapeTableText(value);
}

function renderDistrictTable() {

    const selectedCommodity = commoditySelect.value;
    const layer = commodityLayers[selectedCommodity];

    const tableBody =
        document.getElementById('districtTableBody');

    const tableTitle =
        document.getElementById('tableTitle');

    const searchInput =
        document.getElementById('districtSearch');

    if (!layer || !tableBody) return;

    const rows = [];

    layer.eachLayer(function(featureLayer) {

        const properties =
            featureLayer.feature.properties;

        const district =
            properties['NAMA_BARU'] ||
            properties['KAB_KOTA'] ||
            properties['KAB_BARU'] ||
            properties['WADMKK'] ||
            'Unknown';

        rows.push({
            district: district,
            plantation: properties['Plantation'],
            production: properties['Production'],
            harvested: properties['Harvested_'],
            potential: properties['Potential_']
        });
    });

    rows.sort(function(a, b) {
        return String(a.district).localeCompare(
            String(b.district),
            'id'
        );
    });

    const keyword = searchInput.value
        .trim()
        .toLocaleLowerCase('id-ID');

    activeTableRows = rows.filter(function(row) {
        return String(row.district)
            .toLocaleLowerCase('id-ID')
            .includes(keyword);
    });

    tableTitle.textContent =
        'District Data — ' + selectedCommodity;

    if (activeTableRows.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    No district data found.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = activeTableRows.map(function(row) {
        return `
            <tr>
                <td>${escapeTableText(row.district)}</td>
                <td>${formatTableValue(row.plantation)}</td>
                <td>${formatTableValue(row.production)}</td>
                <td>${formatTableValue(row.harvested)}</td>
                <td>${formatTableValue(row.potential)}</td>
            </tr>
        `;
    }).join('');

    console.log(
        'Table berhasil dimuat:',
        selectedCommodity,
        activeTableRows.length,
        'kabupaten/kota'
    );
}

// Search Kabupaten/Kota
document.getElementById('districtSearch')
    .addEventListener('input', renderDistrictTable);

// =====================================
// TOP 10 DYNAMIC BAR CHART
// =====================================

function renderTop10Chart() {

    const selectedCommodity = commoditySelect.value;
    const layer = commodityLayers[selectedCommodity];

    const chartContainer =
        document.getElementById('top10Chart');

    const chartTitle =
        document.getElementById('chartTitle');

    const chartSubtitle =
        document.getElementById('chartSubtitle');

    if (!layer || !chartContainer) return;

    // Nama indikator
    const indicatorNames = {
        'Plantation': 'Plantation',
        'Production': 'Production',
        'Harvested_': 'Harvested',
        'Potential_': 'Potential'
    };

    const unit = currentIndicator === 'Production'
        ? 'ton'
        : 'ha';

    const indicatorName = indicatorNames[currentIndicator];

    // Mengambil nilai dari setiap polygon
    const districtValues = [];

    layer.eachLayer(function(featureLayer) {

        const properties =
            featureLayer.feature.properties;

        const district =
            properties['NAMA_BARU'] ||
            properties['KAB_KOTA'] ||
            properties['KAB_BARU'] ||
            properties['WADMKK'] ||
            'Unknown';

        const rawValue = properties[currentIndicator];

        if (
            rawValue === null ||
            rawValue === undefined ||
            String(rawValue).trim() === ''
        ) {
            return;
        }

        const value = Number(rawValue);

        if (!Number.isFinite(value)) return;

        districtValues.push({
            district: district,
            value: value
        });
    });

    // Urutkan nilai terbesar ke terkecil
    districtValues.sort(function(a, b) {
        return b.value - a.value;
    });

    // Ambil 10 nilai tertinggi
    const top10 = districtValues.slice(0, 10);

    chartTitle.textContent = 'Top 10 Districts';

    chartSubtitle.textContent =
        selectedCommodity + ' · ' +
        indicatorName + ' (' + unit + ')';

    if (top10.length === 0) {
        chartContainer.innerHTML =
            '<p>No data available.</p>';
        return;
    }

    const maxValue = top10[0].value;

    const formatNumber = function(value) {
        return new Intl.NumberFormat('id-ID', {
            maximumFractionDigits: 2
        }).format(value);
    };

    chartContainer.innerHTML = top10.map(
        function(row, index) {

            const barWidth = maxValue > 0
                ? (row.value / maxValue) * 100
                : 0;

            return `
                <div class="chart-item">

                    <div class="chart-label">
                        <span>
                            ${index + 1}. ${escapeTableText(row.district)}
                        </span>

                        <strong>
                            ${formatNumber(row.value)}
                        </strong>
                    </div>

                    <div class="chart-track">
                        <div
                            class="chart-bar"
                            style="width: ${barWidth}%;">
                        </div>
                    </div>

                </div>
            `;
        }
    ).join('');

    console.log(
        'Top 10 chart berhasil diperbarui:',
        selectedCommodity,
        currentIndicator
    );
}


// =====================================
// 11. TAMPILAN AWAL DASHBOARD
// =====================================

showCommodity('Palm Oil');

console.log('Dashboard berhasil dimuat!');

 // =====================================
 // 12. CEK DISTRIBUSI NILAI INDIKATOR
 // =====================================

function getDataSummary(values) {
    const sorted = values.slice().sort((a, b) => a - b);

    if (sorted.length === 0) {
        return {
            count: 0,
            min: null,
            Q1: null,
            median: null,
            Q3: null,
            max: null
        };
    }

    function percentile(p) {
        const index = (sorted.length - 1) * p;
        const lower = Math.floor(index);
        const upper = Math.ceil(index);

        return sorted[lower] +
            (sorted[upper] - sorted[lower]) * (index - lower);
    }

    return {
        count: sorted.length,
        min: sorted[0],
        Q1: percentile(0.25),
        median: percentile(0.50),
        Q3: percentile(0.75),
        max: sorted[sorted.length - 1]
    };
}

const indicatorFields = [
    'Plantation',
    'Harvested_',
    'Potential_',
    'Production'
];

const summaryRows = [];

indicatorFields.forEach(field => {
    let allValues = [];

    Object.values(commodityLayers).forEach(layer => {
        allValues = allValues.concat(
            getAllValues(layer, field)
        );
    });

    summaryRows.push({
        indicator: field,
        ...getDataSummary(allValues)
    });
});

console.log(
    "STATISTIK LENGKAP:",
    JSON.stringify(summaryRows, null, 2)
);

// =====================================
// 13. BATAS KELAS GABUNGAN
// =====================================

const hectareValues = [];
const productionValues = [];

Object.values(commodityLayers).forEach(layer => {

    // Gabungkan semua indikator bersatuan hektare
    ['Plantation', 'Harvested_', 'Potential_'].forEach(field => {
        hectareValues.push(...getAllValues(layer, field));
    });

    // Production dihitung terpisah
    productionValues.push(...getAllValues(layer, 'Production'));
});

console.log(
    'BATAS KELAS GABUNGAN HEKTARE:',
    getDataSummary(hectareValues)
);

console.log(
    'BATAS KELAS PRODUCTION:',
    getDataSummary(productionValues)
);


// =====================================
// 12. EXPORT TABLE TO CSV
// =====================================

document.getElementById('exportCSV')
    .addEventListener('click', function() {

        const headers = [
            'Regency / Municipality',
            'Plantation (ha)',
            'Production (ton)',
            'Harvested (ha)',
            'Potential (ha)'
        ];

        const csvRows = [
            headers,
            ...activeTableRows.map(row => [
                row.district,
                row.plantation,
                row.production,
                row.harvested,
                row.potential
            ])
        ];

        const csv = csvRows.map(row =>
            row.map(value =>
                `"${String(value ?? '').replace(/"/g, '""')}"`
            ).join(',')
        ).join('\r\n');

        const blob = new Blob(
            ['\uFEFF' + csv],
            { type: 'text/csv;charset=utf-8;' }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = url;
        link.download =
            commoditySelect.value.replace(/\s+/g, '_') +
            '_district_data.csv';

        link.click();

        URL.revokeObjectURL(url);
    });
