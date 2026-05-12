import type { ItineraryDay } from '../types/trip';

/** Launceston arrival on Day 1 — Australia/Hobart (AEST, UTC+10). */
export const tripCountdownTargetMs = new Date('2026-05-17T09:10:00+10:00').getTime();

export const itinerary: ItineraryDay[] = [
  {
    day: 'Day 1',
    date: 'Sunday 17 May',
    highlights: [
      'Arrive in Launceston at 9:10am',
      'Bougle Run booked for the afternoon',
      'Dinner at Barnbougle',
    ],
  },
  {
    day: 'Day 2',
    date: 'Monday 18 May',
    highlights: [
      'Breakfast at Barnbougle',
      'Golf at Barnbougle Dunes',
      'Dinner at Barnbougle',
    ],
  },
  {
    day: 'Day 3',
    date: 'Tuesday 19 May',
    highlights: [
      'Breakfast at Barnbougle',
      'Golf at Lost Farm',
      'Fly out at 3:40pm',
    ],
  },
];
