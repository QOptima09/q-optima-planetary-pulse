const NASA_DATASETS = [
    {
        id: "grace_tws",
        name: "Terrestrial Water Storage Anomaly (GRACE / GRACE-FO)",
        unit: "cm Liquid Water Equivalent",
        source: "NASA JPL GRACE Tellus",
        driverNote: "Shared Global Driver (Hydrological Cycle Intensification): Warming atmosphere accelerates glacial melt and groundwater pumping in arid basins while increasing moisture transport into high-latitude basins.",
        regions: [
            {
                id: "greenland",
                name: "Greenland Ice Sheet (Severe Mass Loss)",
                years: [2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025],
                values: [0.0, -4.2, -9.8, -14.1, -21.5, -26.0, -32.4, -41.2, -48.9, -62.1, -65.4, -71.0, -78.3, -84.5, -86.2, -89.0, -102.4, -108.1, -113.5, -119.2, -125.8, -131.4, -137.0]
            },
            {
                id: "okavango_zambezi",
                name: "Upper Zambezi & High-Latitude Basins (Wetland Storage Gain)",
                years: [2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025],
                values: [0.0, 1.4, 0.8, 3.2, 4.9, 6.1, 7.8, 8.5, 9.2, 8.1, 10.4, 11.9, 11.2, 13.5, 15.1, 16.4, 15.8, 18.2, 19.6, 21.0, 22.3, 23.1, 24.5]
            },
            {
                id: "california",
                name: "California Central Valley (Aquifer Depletion)",
                years: [2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025],
                values: [0.0, -1.8, 2.4, 3.1, -2.5, -6.8, -9.4, -7.2, -4.1, -9.8, -15.2, -21.4, -25.8, -24.1, -19.5, -22.3, -20.8, -25.6, -30.1, -33.4, -28.9, -31.2, -33.8]
            }
        ]
    },
    {
        id: "modis_ndvi",
        name: "Vegetation Greenness Index (MODIS NDVI)",
        unit: "NDVI Index [-1 to +1]",
        source: "NASA Terra/Aqua MODIS (MOD13A2)",
        driverNote: "Shared Global Driver (CO2 Fertilization & Thermal Shift): Elevated atmospheric CO2 and warmer springs drive Arctic/Boreal greening, while extreme heat stress and vapor pressure deficit cause tropical forest browning.",
        regions: [
            {
                id: "boreal_siberia",
                name: "Siberian & Alaskan Boreal Tundra (Arctic Greening)",
                years: [2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025],
                values: [0.412, 0.418, 0.425, 0.421, 0.434, 0.439, 0.442, 0.448, 0.455, 0.461, 0.459, 0.468, 0.474, 0.481, 0.485, 0.489, 0.496, 0.504, 0.509, 0.515, 0.521, 0.526, 0.532]
            },
            {
                id: "amazon_south",
                name: "Southern Amazonia Transition Zone (Canopy Browning)",
                years: [2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025],
                values: [0.785, 0.781, 0.764, 0.772, 0.768, 0.761, 0.758, 0.742, 0.749, 0.744, 0.738, 0.731, 0.719, 0.715, 0.718, 0.712, 0.704, 0.698, 0.692, 0.687, 0.675, 0.669, 0.662]
            }
        ]
    },
    {
        id: "airs_temp",
        name: "Surface Air Temperature Anomaly (AIRS / GISTEMP)",
        unit: "°C Anomaly vs 1951–1980 Baseline",
        source: "NASA Aqua AIRS & GISS",
        driverNote: "Shared Global Driver (Radiative Forcing & Ocean Heat Transport): Arctic Amplification warms polar latitudes at 3–4x the global average, while subpolar North Atlantic meltwater influx creates a localized 'Cold Blob' cooling anomaly.",
        regions: [
            {
                id: "arctic_circle",
                name: "Arctic Polar Region (Rapid Amplification Warming)",
                years: [2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025],
                values: [1.12, 0.98, 1.45, 1.38, 1.62, 1.49, 1.55, 1.84, 1.79, 1.92, 1.74, 1.98, 2.15, 2.48, 2.31, 2.24, 2.52, 2.71, 2.45, 2.63, 2.89, 3.04, 3.12]
            },
            {
                id: "north_atlantic_gyre",
                name: "Subpolar North Atlantic Gyre (AMOC Freshwater Cooling)",
                years: [2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025],
                values: [0.35, 0.31, 0.28, 0.22, 0.15, 0.11, 0.04, -0.05, -0.12, -0.18, -0.24, -0.35, -0.48, -0.41, -0.39, -0.44, -0.47, -0.52, -0.49, -0.55, -0.51, -0.58, -0.61]
            }
        ]
    }
];

let chartInstance = null;

// Standard Normal CDF Error Function Approximation
function erf(x) {
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
}

// Non-Parametric Mann-Kendall Test & Theil-Sen Slope Estimator
function computeMannKendall(years, y, alpha = 0.05) {
    const n = y.length;
    let s = 0;
    const slopes = [];

    for (let k = 0; k < n - 1; k++) {
        for (let j = k + 1; j < n; j++) {
            const diff = y[j] - y[k];
            if (diff > 0) s += 1;
            else if (diff < 0) s -= 1;
            slopes.push(diff / (years[j] - years[k]));
        }
    }

    const varS = (n * (n - 1) * (2 * n + 5)) / 18.0;
    let z = 0;
    if (s > 0) z = (s - 1) / Math.sqrt(varS);
    else if (s < 0) z = (s + 1) / Math.sqrt(varS);

    const pValue = 2.0 * (1.0 - 0.5 * (1.0 + erf(Math.abs(z) / Math.sqrt(2.0))));
    slopes.sort((a, b) => a - b);
    const mid = Math.floor(slopes.length / 2);
    const sensSlope = slopes.length % 2 !== 0 ? slopes[mid] : (slopes[mid - 1] + slopes[mid]) / 2.0;

    // Median intercept for Sen's trendline
    const intercepts = y.map((val, idx) => val - sensSlope * years[idx]).sort((a, b) => a - b);
    const intercept = intercepts[Math.floor(intercepts.length / 2)];
    const trendline = years.map(yr => Number((sensSlope * yr + intercept).toFixed(3)));

    const isSignificant = pValue < alpha;
    let trend = "No Significant Trend";
    if (isSignificant && sensSlope > 0) trend = "Significant Increase";
    else if (isSignificant && sensSlope < 0) trend = "Significant Decline";

    return {
        trend,
        isSignificant,
        pValue: pValue < 0.0001 ? "< 0.0001" : pValue.toFixed(4),
        zScore: z.toFixed(2),
        sensSlope: sensSlope.toFixed(4),
        trendline
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const varSelect = document.getElementById("varSelect");
    NASA_DATASETS.forEach(ds => {
        const opt = document.createElement("option");
        opt.value = ds.id;
        opt.textContent = ds.name;
        varSelect.appendChild(opt);
    });

    populateRegions();
    runAnalysis();

    varSelect.addEventListener("change", () => {
        populateRegions();
        runAnalysis();
    });
    document.getElementById("regionSelect").addEventListener("change", runAnalysis);
    document.getElementById("regionBSelect").addEventListener("change", runAnalysis);
    document.getElementById("analyzeBtn").addEventListener("click", runAnalysis);
    document.getElementById("compareToggle").addEventListener("change", (e) => {
        const showB = e.target.checked;
        document.getElementById("regionBGroup").style.display = showB ? "flex" : "none";
        document.getElementById("panelB").style.display = showB ? "block" : "none";
        runAnalysis();
    });
});

function populateRegions() {
    const ds = NASA_DATASETS.find(d => d.id === document.getElementById("varSelect").value);
    const regA = document.getElementById("regionSelect");
    const regB = document.getElementById("regionBSelect");
    regA.innerHTML = "";
    regB.innerHTML = "";

    ds.regions.forEach((r, idx) => {
        const optA = document.createElement("option");
        optA.value = r.id;
        optA.textContent = r.name;
        regA.appendChild(optA);

        const optB = document.createElement("option");
        optB.value = r.id;
        optB.textContent = r.name;
        if (idx === 1) optB.selected = true;
        regB.appendChild(optB);
    });
}

function updatePanel(suffix, region, stats, source) {
    document.getElementById(`panel${suffix}Title`).textContent = region.name;
    const labelEl = document.getElementById(`trendLabel${suffix}`);
    labelEl.textContent = stats.trend;
    labelEl.style.color = stats.trend.includes("Increase") ? "#10b981" : (stats.trend.includes("Decline") ? "#f43f5e" : "#94a3b8");

    document.getElementById(`sourceHint${suffix}`).textContent = source;
    document.getElementById(`pValue${suffix}`).textContent = stats.pValue;
    const sigEl = document.getElementById(`pSig${suffix}`);
    sigEl.textContent = stats.isSignificant ? "Statistically Significant (p < 0.05)" : "Within Natural Noise (p ≥ 0.05)";
    sigEl.style.color = stats.isSignificant ? "#10b981" : "#94a3b8";

    document.getElementById(`sensSlope${suffix}`).textContent = `${stats.sensSlope} / yr`;
    document.getElementById(`zScore${suffix}`).textContent = `Mann-Kendall Z: ${stats.zScore}`;
}

function runAnalysis() {
    const ds = NASA_DATASETS.find(d => d.id === document.getElementById("varSelect").value);
    const regA = ds.regions.find(r => r.id === document.getElementById("regionSelect").value);
    const regB = ds.regions.find(r => r.id === document.getElementById("regionBSelect").value);
    const compareMode = document.getElementById("compareToggle").checked;

    document.getElementById("driverExplanation").textContent = ds.driverNote;

    const statsA = computeMannKendall(regA.years, regA.values);
    updatePanel("A", regA, statsA, ds.source);

    const datasets = [
        {
            label: `${regA.name} (Observed)`,
            data: regA.values,
            borderColor: "#38bdf8",
            backgroundColor: "rgba(56, 189, 248, 0.1)",
            borderWidth: 2.5,
            pointRadius: 3,
            tension: 0.2
        },
        {
            label: `${regA.name} (Sen's Trend)`,
            data: statsA.trendline,
            borderColor: "#0284c7",
            borderDash: [6, 4],
            borderWidth: 2,
            pointRadius: 0
        }
    ];

    if (compareMode && regB) {
        const statsB = computeMannKendall(regB.years, regB.values);
        updatePanel("B", regB, statsB, ds.source);
        datasets.push(
            {
                label: `${regB.name} (Observed)`,
                data: regB.values,
                borderColor: "#f59e0b",
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                borderWidth: 2.5,
                pointRadius: 3,
                tension: 0.2
            },
            {
                label: `${regB.name} (Sen's Trend)`,
                data: statsB.trendline,
                borderColor: "#d97706",
                borderDash: [6, 4],
                borderWidth: 2,
                pointRadius: 0
            }
        );
    }

    const ctx = document.getElementById("trendChart").getContext("2d");
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: "line",
        data: { labels: regA.years, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            scales: {
                x: { grid: { color: "#1e293b" }, ticks: { color: "#94a3b8" } },
                y: {
                    title: { display: true, text: ds.unit, color: "#94a3b8" },
                    grid: { color: "#1e293b" },
                    ticks: { color: "#94a3b8" }
                }
            },
            plugins: { legend: { labels: { color: "#f8fafc", font: { size: 11 } } } }
        }
    });
}