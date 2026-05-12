import type { Course } from '../types/trip';

/** Optional `fullCourseTourYoutubeId`: paste the 11-char id from YouTube → Share for each course’s flyover. */
export const courses: Course[] = [
  {
    id: 'bougle-run',
    name: 'Bougle Run',
    tagline: 'A short-course opener with teeth.',
    description:
      'Fast, fun, and ideal for shaking off the travel day before the main event begins.',
    imageUrl:
      'https://barnbougle.com.au/wp-content/uploads/2021/02/Barnbougle-Home-Discover1.jpg',
    holes: 14,
    par: 42,
    link: 'https://barnbougle.com.au/golf/bougle-run/',
    fullCourseTourYouTubeSearchQuery: 'Barnbougle Bougle Run full course flyover',
  },
  {
    id: 'barnbougle-dunes',
    name: 'Barnbougle Dunes',
    tagline: 'The headline links test.',
    description:
      'Rolling dunes, ocean winds, firm turf, and enough trouble to expose any loose swing.',
    imageUrl:
      'https://barnbougle.com.au/wp-content/uploads/2021/03/Barnbougle-Dunes-17-Gary-Lisbon-730x712.jpg',
    holes: 18,
    par: 71,
    link: 'https://barnbougle.com.au/golf/the-dunes/',
    fullCourseTourYouTubeSearchQuery: 'Golf Digest every hole Barnbougle Dunes',
  },
  {
    id: 'lost-farm',
    name: 'Lost Farm',
    tagline: 'The final round among the dunes.',
    description:
      'A dramatic closing course with broad views, sharp contours, and plenty of match-play theatre.',
    imageUrl:
      'https://barnbougle.com.au/wp-content/uploads/2021/02/Barnbougle-Home-Discover3-e1731981694169.jpg',
    holes: 20,
    par: 78,
    link: 'https://barnbougle.com.au/golf/lost-farm/',
    fullCourseTourYouTubeSearchQuery: 'Golf Digest every hole Barnbougle Lost Farm',
  },
];
