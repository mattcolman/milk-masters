import type { Round } from '../types/trip';

const parFor = (pars: number[]) =>
  pars.map((par, index) => ({
    number: index + 1,
    par,
  }));

export const rounds: Round[] = [
  {
    id: 'bougle-run',
    name: 'Round 1',
    courseName: 'Bougle Run',
    date: 'Sunday 17 May',
    holes: parFor([3, 4, 3, 4, 3, 4, 3, 4, 3, 3, 4, 3, 4, 3]),
  },
  {
    id: 'barnbougle-dunes',
    name: 'Round 2',
    courseName: 'Barnbougle Dunes',
    date: 'Monday 18 May',
    holes: parFor([4, 4, 4, 3, 4, 5, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 4]),
  },
  {
    id: 'lost-farm',
    name: 'Round 3',
    courseName: 'Lost Farm',
    date: 'Tuesday 19 May',
    holes: parFor([5, 4, 4, 3, 4, 4, 5, 3, 4, 4, 5, 3, 4, 4, 4, 3, 5, 4]),
  },
];
