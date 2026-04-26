import type { Venue } from '../types/trip';

export const restaurants: Venue[] = [
  {
    name: 'Barnbougle Dining',
    description:
      'The default clubhouse base for breakfasts, post-round debriefs, and both scheduled dinners.',
    details: [
      'Sunday dinner after Bougle Run',
      'Monday breakfast before Barnbougle Dunes',
      'Monday dinner after the second round',
      'Tuesday breakfast before Lost Farm',
    ],
  },
  {
    name: 'Lost Farm Restaurant',
    description:
      'A strong option for the final-day lunch window if timing allows before the flight home.',
    details: ['Views across the course', 'Good candidate for a final leaderboard ceremony'],
  },
];
