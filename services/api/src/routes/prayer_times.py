"""GET /api/v1/prayer-times — Daily prayer times via Aladhan API."""
from datetime import date
from fastapi import APIRouter, Query, HTTPException
import httpx

router = APIRouter()

ALADHAN_BASE = "https://api.aladhan.com/v1"


@router.get("/prayer-times")
async def get_prayer_times(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    method: int = Query(2, ge=0, le=23),  # 2 = ISNA, common default
):
    """
    Returns today's prayer times for the given coordinates.
    method parameter follows Aladhan calculation methods (0-23).
    """
    today = date.today().strftime("%d-%m-%Y")
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(
                f"{ALADHAN_BASE}/timings/{today}",
                params={"latitude": latitude, "longitude": longitude, "method": method},
            )
            resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=502, detail=f"Aladhan API error: {e.response.status_code}")
        except httpx.RequestError:
            raise HTTPException(status_code=502, detail="Unable to reach prayer times service")

    data = resp.json().get("data", {})
    timings = data.get("timings", {})
    date_info = data.get("date", {})

    return {
        "date": date_info.get("readable", ""),
        "hijri": {
            "date": date_info.get("hijri", {}).get("date", ""),
            "month": date_info.get("hijri", {}).get("month", {}).get("en", ""),
            "year": date_info.get("hijri", {}).get("year", ""),
        },
        "timings": {
            "Fajr":    timings.get("Fajr", ""),
            "Sunrise": timings.get("Sunrise", ""),
            "Dhuhr":   timings.get("Dhuhr", ""),
            "Asr":     timings.get("Asr", ""),
            "Maghrib": timings.get("Maghrib", ""),
            "Isha":    timings.get("Isha", ""),
        },
        "meta": {
            "latitude": latitude,
            "longitude": longitude,
            "method": method,
            "timezone": data.get("meta", {}).get("timezone", ""),
        },
    }
