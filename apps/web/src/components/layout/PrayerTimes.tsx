'use client';

import { useEffect, useState } from 'react';

interface PrayerTimings {
  Fajr: string; Sunrise: string; Dhuhr: string;
  Asr: string; Maghrib: string; Isha: string;
}
interface PrayerData {
  date: string;
  hijri: { date: string; month: string; year: string };
  timings: PrayerTimings;
}

const PRAYER_ICONS: Record<string, string> = {
  Fajr: '🌙', Sunrise: '🌅', Dhuhr: '☀️', Asr: '🌤️', Maghrib: '🌇', Isha: '🌃',
};

function getNextPrayer(timings: PrayerTimings): string | null {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  for (const [name, time] of Object.entries(timings)) {
    const [h, m] = time.split(':').map(Number);
    if (h * 60 + m > nowMins) return name;
  }
  return 'Fajr'; // wrap to next day
}

export function PrayerTimes() {
  const [data, setData] = useState<PrayerData | null>(null);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        fetch(`/api/prayer-times?latitude=${coords.latitude}&longitude=${coords.longitude}`)
          .then(r => r.json())
          .then(setData)
          .catch(() => setError(true));
      },
      () => {
        // Default to Makkah if no permission
        fetch('/api/prayer-times?latitude=21.3891&longitude=39.8579')
          .then(r => r.json())
          .then(setData)
          .catch(() => setError(true));
      }
    );
  }, []);

  if (error || !data) return null;

  const next = getNextPrayer(data.timings);

  return (
    <div style={{
      margin: '8px 10px',
      background: 'var(--forest)',
      borderRadius: 10,
      overflow: 'hidden',
      border: '1px solid rgba(184,134,42,0.2)',
    }}>
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', padding: '10px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'transparent', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 14 }}>🕌</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontFamily: 'Lora, serif', fontWeight: 600, color: 'var(--gold-light)' }}>
              Prayer Times
            </div>
            {next && (
              <div style={{ fontSize: 10, fontFamily: 'Lora, serif', color: 'rgba(212,168,75,0.7)' }}>
                Next: {next} {data.timings[next as keyof PrayerTimings]}
              </div>
            )}
          </div>
        </div>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Expanded prayer list */}
      {expanded && (
        <div style={{ padding: '0 12px 10px', borderTop: '1px solid rgba(184,134,42,0.15)' }}>
          <div style={{ fontSize: 9.5, fontFamily: 'Lora, serif', color: 'rgba(212,168,75,0.5)', marginBottom: 8, paddingTop: 8 }}>
            {data.hijri.date} {data.hijri.month} {data.hijri.year} AH
          </div>
          {Object.entries(data.timings).map(([name, time]) => (
            <div key={name} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '5px 0',
              borderBottom: '1px solid rgba(184,134,42,0.08)',
              background: name === next ? 'rgba(184,134,42,0.08)' : 'transparent',
              borderRadius: 4, paddingLeft: name === next ? 4 : 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11 }}>{PRAYER_ICONS[name] ?? '🕐'}</span>
                <span style={{
                  fontSize: 11, fontFamily: 'Lora, serif',
                  color: name === next ? 'var(--gold-light)' : 'rgba(212,168,75,0.75)',
                  fontWeight: name === next ? 600 : 400,
                }}>{name}</span>
              </div>
              <span style={{
                fontSize: 11, fontFamily: 'Lora, serif',
                color: name === next ? 'var(--gold-light)' : 'rgba(212,168,75,0.6)',
                fontWeight: name === next ? 600 : 400,
              }}>{time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
