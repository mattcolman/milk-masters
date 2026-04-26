export type Player = {
  id: string;
  name: string;
  caption: string;
  handicap: number;
  milkPreference: string;
  imageUrl: string;
};

export type ItineraryDay = {
  day: string;
  date: string;
  highlights: string[];
};

export type Course = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  imageUrl: string;
  holes: number;
  par: number;
  link: string;
};

export type Venue = {
  name: string;
  description: string;
  details: string[];
};

export type NearbyPlace = {
  name: string;
  category: string;
  description: string;
  link: string;
};

export type Round = {
  id: string;
  name: string;
  courseName: string;
  date: string;
  holes: Hole[];
};

export type Hole = {
  number: number;
  par: number;
  strokeIndex?: number;
};

export type ScoreEntry = {
  roundId: string;
  playerId: string;
  holeNumber: number;
  strokes: number | null;
};
