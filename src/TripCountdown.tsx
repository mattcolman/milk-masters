import { useEffect, useState } from 'react';
import { tripCountdownTargetMs } from './data/itinerary';

type Remaining = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getRemaining(targetMs: number): Remaining {
  const total = Math.max(0, targetMs - Date.now());
  const seconds = Math.floor(total / 1000) % 60;
  const minutes = Math.floor(total / (1000 * 60)) % 60;
  const hours = Math.floor(total / (1000 * 60 * 60)) % 24;
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds };
}

const pad2 = (n: number) => String(n).padStart(2, '0');

export function TripCountdown() {
  const [remaining, setRemaining] = useState(() => getRemaining(tripCountdownTargetMs));

  useEffect(() => {
    const id = window.setInterval(
      () => setRemaining(getRemaining(tripCountdownTargetMs)),
      1000,
    );
    return () => window.clearInterval(id);
  }, []);

  if (remaining.total <= 0) {
    return (
      <div className="trip-countdown" role="status" aria-live="polite">
        <p className="trip-countdown__label">Trip week</p>
        <p className="trip-countdown__done">Launceston arrival — enjoy Barnbougle.</p>
      </div>
    );
  }

  const units = [
    { display: String(remaining.days), label: 'Days', id: 'days' as const },
    { display: pad2(remaining.hours), label: 'Hrs', id: 'hrs' as const },
    { display: pad2(remaining.minutes), label: 'Min', id: 'min' as const },
    { display: pad2(remaining.seconds), label: 'Sec', id: 'sec' as const },
  ];

  return (
    <div
      className="trip-countdown"
      role="timer"
      aria-live="polite"
      aria-label="Countdown until Launceston arrival"
    >
      <p className="trip-countdown__label">Until wheels down Launceston</p>
      <div className="trip-countdown__grid" aria-hidden="true">
        {units.map(({ display, label, id }) => (
          <div className={`trip-countdown__unit trip-countdown__unit--${id}`} key={id}>
            <span className="trip-countdown__value">{display}</span>
            <span className="trip-countdown__unit-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
