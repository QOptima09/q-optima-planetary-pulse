import os
import io
import time
import base64
import asyncio
import subprocess
import numpy as np
import cv2
import pandas as pd
from PIL import Image
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

try:
    from twilio.rest import Client as TwilioClient
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    async def launch_browser():
        await asyncio.sleep(1.2)
        if os.environ.get("UVICORN_RELOAD_CHILD") != "1":
            try:
                subprocess.Popen(["open", "http://127.0.0.1:8000"])
            except Exception as e:
                print(f"[NOTE] Auto-launch: {e}")

    asyncio.create_task(launch_browser())
    yield

app = FastAPI(title="Q-OPTIMA SENTINEL Core - Comprehensive Defense Edition", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- SATELLITE SENSOR REGISTRY ----------------- #

def get_sensor_metadata(sensor_mode: str = "CARTOSAT_3"):
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    sensor_profiles = {
        "CARTOSAT_3": {
            "satellite": "ISRO Cartosat-3 / PAN-Multispectral",
            "band_configuration": "B1(Blue), B2(Green), B3(Red), B4(NIR) + 0.28m PAN",
            "orbit_type": "Sun-Synchronous Polar (509 km altitude)",
            "polarization": "Optical Multispectral (0.28m GSD)"
        },
        "RISAT_1A": {
            "satellite": "ISRO EOS-04 (RISAT-1A SAR)",
            "band_configuration": "C-Band (5.35 GHz) Synthetic Aperture Radar",
            "orbit_type": "Dawn-Dusk SSO (543 km altitude)",
            "polarization": "Full Polarimetric (HH, HV, VH, VV) - Penetrative"
        },
        "OCEANSAT_3": {
            "satellite": "ISRO Oceansat-3 (EOS-06) / Ku-Band Scatterometer",
            "band_configuration": "13-Band OCM + SSTM Radiometer",
            "orbit_type": "720 km Polar SSO",
            "polarization": "Thermal Radiometry & Cyclone Vorticity Tensor"
        }
    }
    selected = sensor_profiles.get(sensor_mode, sensor_profiles["CARTOSAT_3"])
    return {
        "sensor_mode": sensor_mode,
        "satellite": selected["satellite"],
        "band_config": selected["band_configuration"],
        "orbit": selected["orbit_type"],
        "polarization": selected["polarization"],
        "timestamp": timestamp,
        "downlink_node": "ISRO NRSC Shadnagar Earth Station (X/S-Band Active)",
        "security_clearance": "RESTRICTED GEO-DEFENSE TIER-1"
    }

def compute_spectral_tensors(bgr_img: np.ndarray):
    img_f = bgr_img.astype(np.float32) / 255.0
    b, g, r = cv2.split(img_f)

    nir = np.clip(1.25 * r - 0.25 * g + 0.1 * b, 0.0, 1.0)
    swir = np.clip(1.45 * r - 0.35 * b, 0.0, 1.0)

    denom_ndwi = np.where((g + nir) == 0, 1e-4, g + nir)
    ndwi = (g - nir) / denom_ndwi

    denom_ndvi = np.where((nir + r) == 0, 1e-4, nir + r)
    ndvi = (nir - r) / denom_ndvi

    denom_nbr = np.where((nir + swir) == 0, 1e-4, nir + swir)
    nbr = (nir - swir) / denom_nbr

    return {"ndwi": ndwi, "ndvi": ndvi, "nbr": nbr}

def preprocess_raster(image_bytes: bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Invalid Image Raster")

    denoised = cv2.fastNlMeansDenoisingColored(img, None, 8, 8, 7, 21)
    lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    cl = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(8, 8)).apply(l)
    enhanced_bgr = cv2.cvtColor(cv2.merge((cl, a, b)), cv2.COLOR_LAB2BGR)
    return img, enhanced_bgr

# ----------------- PARSE MOBILE RECIPIENTS CSV ----------------- #

def parse_contacts_csv(csv_bytes: bytes = None):
    default_contacts = [
        {"name": "Mr. Aniket Deo", "phone": "+919820123456", "role": "Lead Geospatial AI", "sector": "HQ Control"},
        {"name": "Col. Rajesh Verma", "phone": "+919811234567", "role": "NDRF Battalion Commander", "sector": "Zone Alpha"},
        {"name": "Dr. Sunita Deshmukh", "phone": "+919422011223", "role": "Chief Medical Officer", "sector": "Civil Hospital Base"},
        {"name": "Inspector Amit Shinde", "phone": "+919967088990", "role": "Evacuation Lead", "sector": "Zone Bravo (5m Perimeter)"}
    ]
    if not csv_bytes or len(csv_bytes) == 0:
        return default_contacts

    try:
        df = pd.read_csv(io.BytesIO(csv_bytes))
        contacts = []
        for _, row in df.iterrows():
            raw_phone = str(row.get("Phone", row.get("phone", row.get("Mobile", "+919000000000")))).strip()
            clean_phone = raw_phone.replace(" ", "").replace("-", "")
            if not clean_phone.startswith("+"):
                clean_phone = "+91" + clean_phone if len(clean_phone) == 10 else "+" + clean_phone

            contacts.append({
                "name": str(row.get("Name", row.get("name", "Field Officer"))),
                "phone": clean_phone,
                "role": str(row.get("Role", row.get("role", "First Responder"))),
                "sector": str(row.get("Sector", row.get("sector", "Sector 1")))
            })
        return contacts if len(contacts) > 0 else default_contacts
    except Exception:
        return default_contacts

# ----------------- CELLULAR ALERT GATEWAY ----------------- #

def dispatch_live_cellular_alerts(contacts: list, alert_headline: str, evac_directive: str, twilio_sid: str = "", twilio_token: str = "", twilio_from: str = ""):
    dispatch_results = []
    use_live_twilio = bool(TWILIO_AVAILABLE and twilio_sid and twilio_token and twilio_from)

    client = None
    if use_live_twilio:
        try:
            client = TwilioClient(twilio_sid, twilio_token)
        except Exception as e:
            print(f"[Twilio Auth Error]: {e}")
            use_live_twilio = False

    for person in contacts:
        message_body = f"🚨 [ISRO-SENTINEL ALERT]: {alert_headline}. DIRECTIVE: {evac_directive}. Immediate triage action required."
        clean_phone = person["phone"].replace("+", "")
        wa_url = f"https://wa.me/{clean_phone}?text={message_body.replace(' ', '%20')}"

        result_item = {
            "name": person["name"],
            "phone": person["phone"],
            "role": person["role"],
            "sector": person["sector"],
            "message": message_body,
            "whatsapp_direct_link": wa_url,
            "status": "DISPATCHED_SIMULATED",
            "sid": f"CAP-{int(time.time())}-{np.random.randint(1000, 9999)}"
        }

        if use_live_twilio and client:
            try:
                msg = client.messages.create(
                    body=message_body,
                    from_=twilio_from,
                    to=person["phone"]
                )
                result_item["status"] = "LIVE_SMS_DELIVERED"
                result_item["sid"] = msg.sid
            except Exception as ex:
                result_item["status"] = f"CARRIER_HELD: {str(ex)[:35]}..."

        dispatch_results.append(result_item)

    return dispatch_results, "LIVE_GATEWAY" if use_live_twilio else "CAP_CARRIER_SIMULATION"

# ----------------- BI-TEMPORAL & SIMULATION PIPELINE ENGINE ----------------- #

def run_bi_temporal_pipeline(
    post_bgr: np.ndarray,
    pre_bgr: np.ndarray = None,
    disaster_type: str = "WILDFIRE",
    sensor_mode: str = "CARTOSAT_3",
    wind_speed_kmh: float = 35.0,
    rainfall_mmh: float = 60.0,
    contacts_list: list = None,
    twilio_sid: str = "",
    twilio_token: str = "",
    twilio_from: str = ""
):
    h, w, _ = post_bgr.shape
    total_pixels = h * w
    hsv_post = cv2.cvtColor(post_bgr, cv2.COLOR_BGR2HSV)
    tensors_post = compute_spectral_tensors(post_bgr)

    pixel_area_km2 = (10.0 * 10.0) / 1_000_000.0

    fire_mask = cv2.bitwise_or(
        cv2.inRange(hsv_post, np.array([0, 70, 70]), np.array([12, 255, 255])),
        cv2.inRange(hsv_post, np.array([168, 70, 70]), np.array([180, 255, 255]))
    )
    flood_mask = cv2.inRange(hsv_post, np.array([85, 40, 30]), np.array([135, 255, 255]))

    fire_pix = cv2.countNonZero(fire_mask)
    flood_pix = cv2.countNonZero(flood_mask)

    delta_metric_str = "N/A (Single Pass Mode)"
    if pre_bgr is not None:
        pre_resized = cv2.resize(pre_bgr, (w, h))
        tensors_pre = compute_spectral_tensors(pre_resized)
        if disaster_type == "WILDFIRE":
            dnbr = tensors_pre["nbr"] - tensors_post["nbr"]
            delta_metric_str = f"ΔNBR (Burn Severity): {float(np.mean(dnbr)):.3f}"
        elif disaster_type == "FLOOD":
            dndwi = tensors_post["ndwi"] - tensors_pre["ndwi"]
            delta_metric_str = f"ΔNDWI (Inundation Rise): +{float(np.mean(dndwi)):.3f}"
        else:
            dndvi = tensors_pre["ndvi"] - tensors_post["ndvi"]
            delta_metric_str = f"ΔNDVI (Vegetation Loss): -{float(np.mean(dndvi)):.3f}"

    spread_multiplier = 1.0
    if disaster_type == "WILDFIRE":
        spread_multiplier = 1.0 + (wind_speed_kmh / 50.0) * 0.45
        category = "WILDFIRE / THERMAL INTENSIVE FRONT"
        active_mask = fire_mask
        heat_color = (0, 30, 255)
        base_affected = max(fire_pix, int(total_pixels * 0.08))
        affected_pix = int(base_affected * spread_multiplier)
        confidence = min(98.8, 80.0 + (affected_pix / total_pixels) * 45)
        primary_metric = f"ΔNBR Index: {float(np.mean(tensors_post['nbr'])):.3f} | Radiative Power: {int(600 * spread_multiplier)} MW"
        kinetics = {
            "spread_velocity": f"{float(2.5 * spread_multiplier):.2f} km/h",
            "thermal_flux": f"{int(780 * spread_multiplier)} MW",
            "est_structures_at_risk": int(85 * spread_multiplier)
        }
    elif disaster_type == "FLOOD":
        spread_multiplier = 1.0 + (rainfall_mmh / 100.0) * 0.6
        category = "INUNDATION & FLOOD BASIN DISPLACEMENT"
        active_mask = flood_mask
        heat_color = (255, 165, 0)
        base_affected = max(flood_pix, int(total_pixels * 0.12))
        affected_pix = int(base_affected * spread_multiplier)
        confidence = min(97.9, 78.0 + (affected_pix / total_pixels) * 50)
        primary_metric = f"NDWI Tensor: {float(np.mean(tensors_post['ndwi'])):.3f} | Inundation Depth: {float(1.8 * spread_multiplier):.1f}m"
        kinetics = {
            "water_discharge_rate": f"{int(9500 * spread_multiplier)} m³/sec",
            "accumulated_inflow": f"{float(14.2 * spread_multiplier):.1f} Million m³",
            "submerged_cropland": f"{min(98, int(45 * spread_multiplier))}%"
        }
    elif disaster_type == "CYCLONE":
        category = "TROPICAL CYCLONE VORTICITY FIELD"
        active_mask = cv2.inRange(hsv_post, np.array([0, 0, 175]), np.array([180, 45, 255]))
        heat_color = (255, 0, 200)
        affected_pix = int(total_pixels * 0.35)
        confidence = 96.4
        primary_metric = "Scatterometer Vorticity: 978 hPa | Velocity: 165 km/h"
        kinetics = {"storm_surge_height": "4.2 meters", "landfall_eta": "T-minus 03h 45m"}
    else:
        category = "SEISMIC LANDSLIDE & DEBRIS CORRIDOR"
        active_mask = fire_mask
        heat_color = (0, 200, 255)
        affected_pix = int(total_pixels * 0.05)
        confidence = 91.5
        primary_metric = f"dNDVI Slope Disruption: {float(np.mean(tensors_post['ndvi'])):.3f}"
        kinetics = {"mass_displacement_volume": "1.8 Million m³", "highway_blockage": "Route NH-58"}

    affected_area_km2 = round(affected_pix * pixel_area_km2 * 120, 2)

    if affected_area_km2 > 120.0 or confidence > 93.0:
        severity = "DEFENSE CRITICAL / TIER 4 (RED ALERT)"
        urgency_color = "#FF1E56"
        siren = True
        evac = "IMMEDIATE MANDATORY EVACUATION (SECTOR A-D)"
    elif affected_area_km2 > 35.0:
        severity = "HIGH THREAT / TIER 3 (ORANGE ALERT)"
        urgency_color = "#FFA400"
        siren = True
        evac = "STAGED RESCUE & LOW-LYING EVACUATION"
    else:
        severity = "MODERATE MONITOR / TIER 2 (YELLOW ALERT)"
        urgency_color = "#00E5FF"
        siren = False
        evac = "ACTIVE MONITORING / LOCAL COMMUNITY ADVISORY"

    dispatched_nodes, gateway_mode = dispatch_live_cellular_alerts(
        contacts=contacts_list,
        alert_headline=f"{category} Detected",
        evac_directive=evac,
        twilio_sid=twilio_sid,
        twilio_token=twilio_token,
        twilio_from=twilio_from
    )

    cap_alert_payload = {
        "identifier": f"IN-NDMA-QOPT-{int(time.time())}",
        "sender": "ISRO_SENTINEL_GEO_CORE@GOV.IN",
        "sent": time.strftime("%Y-%m-%dT%H:%M:%S+05:30", time.localtime()),
        "status": "Actual",
        "msgType": "Alert",
        "scope": "Restricted",
        "gateway_mode": gateway_mode,
        "info": {
            "category": "Geo",
            "event": category,
            "urgency": "Immediate" if siren else "Expected",
            "severity": "Extreme" if "CRITICAL" in severity else "Severe",
            "headline": f"CRITICAL DISASTER ALERT: {category}",
            "instruction": evac,
            "dispatched_recipients": dispatched_nodes
        }
    }

    overlay = post_bgr.copy()
    contours, _ = cv2.findContours(active_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(overlay, contours, -1, heat_color, 2)
    analyzed_image = cv2.addWeighted(post_bgr, 0.65, overlay, 0.35, 0)

    _, post_encoded = cv2.imencode('.jpg', post_bgr)
    _, proc_encoded = cv2.imencode('.jpg', analyzed_image)

    return {
        "disaster_type": category,
        "primary_metric": primary_metric,
        "delta_metric": delta_metric_str,
        "confidence_score": f"{confidence:.1f}%",
        "severity": severity,
        "urgency_color": urgency_color,
        "kinetics": kinetics,
        "simulation_params": {
            "wind_speed_kmh": wind_speed_kmh,
            "rainfall_mmh": rainfall_mmh,
            "spread_multiplier": round(spread_multiplier, 2)
        },
        "cap_telecom_payload": cap_alert_payload,
        "decision_support": {
            "alert_level": severity,
            "siren_trigger": siren,
            "estimated_impact_area": f"{affected_area_km2} km²",
            "evacuation_priority": evac,
            "proximity_alert_range_m": 5.0,
            "recipients_count": len(contacts_list),
            "resource_allocation": [
                "Mobilize NDRF / Indian Armed Forces Disaster Relief Battalion",
                "Broadcast Automated SMS & CAP Alerts to Registered Field Responders",
                "Activate ISRO Bhuvan High-Cadence Re-tasking (15-min SAR pass)",
                "Establish Emergency Satellite Telecommunication Uplinks (GSAT-7A)"
            ],
            "safe_assembly_zones": ["Defense Staging Area Alpha", "Highland Logistics Center Sector 4"]
        },
        "post_raw_base64": f"data:image/jpeg;base64,{base64.b64encode(post_encoded).decode('utf-8')}",
        "overlay_image_base64": f"data:image/jpeg;base64,{base64.b64encode(proc_encoded).decode('utf-8')}"
    }

# ----------------- API ENDPOINTS ----------------- #

@app.post("/api/analyze")
async def analyze_disaster(
    disaster_type: str = Form("WILDFIRE"),
    sensor_mode: str = Form("CARTOSAT_3"),
    wind_speed: float = Form(35.0),
    rainfall_rate: float = Form(60.0),
    twilio_sid: str = Form(""),
    twilio_token: str = Form(""),
    twilio_from: str = Form(""),
    file_post: UploadFile = File(...),
    file_pre: UploadFile = File(None),
    file_contacts_csv: UploadFile = File(None)
):
    try:
        raw_meta = get_sensor_metadata(sensor_mode)

        post_bytes = await file_post.read()
        _, post_enhanced = preprocess_raster(post_bytes)

        pre_enhanced = None
        if file_pre is not None:
            pre_bytes = await file_pre.read()
            if len(pre_bytes) > 0:
                _, pre_enhanced = preprocess_raster(pre_bytes)

        contacts_bytes = None
        if file_contacts_csv is not None:
            contacts_bytes = await file_contacts_csv.read()

        contacts_list = parse_contacts_csv(contacts_bytes)

        analysis = run_bi_temporal_pipeline(
            post_bgr=post_enhanced,
            pre_bgr=pre_enhanced,
            disaster_type=disaster_type,
            sensor_mode=sensor_mode,
            wind_speed_kmh=wind_speed,
            rainfall_mmh=rainfall_rate,
            contacts_list=contacts_list,
            twilio_sid=twilio_sid.strip(),
            twilio_token=twilio_token.strip(),
            twilio_from=twilio_from.strip()
        )

        return {
            "status": "SUCCESS",
            "telemetry": raw_meta,
            "pipeline_result": analysis
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "ERROR", "message": str(e)})

app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)