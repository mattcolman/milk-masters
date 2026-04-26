import { players } from '../data/players';
import { rounds } from '../data/rounds';
import { isSupabaseConfigured, supabase } from './supabase';
import type { ScoreEntry } from '../types/trip';

export { isSupabaseConfigured } from './supabase';

type ScoreRow = {
  round_id: string;
  player_id: string;
  hole_number: number;
  strokes: number | null;
};

const storageKey = 'milk-masters-demo-scores';

const rowToEntry = (row: ScoreRow): ScoreEntry => ({
  roundId: row.round_id,
  playerId: row.player_id,
  holeNumber: row.hole_number,
  strokes: row.strokes,
});

const entryToRow = (entry: ScoreEntry): ScoreRow => ({
  round_id: entry.roundId,
  player_id: entry.playerId,
  hole_number: entry.holeNumber,
  strokes: entry.strokes,
});

const demoScores = (): ScoreEntry[] => {
  const saved = window.localStorage.getItem(storageKey);
  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved) as ScoreEntry[];
  } catch {
    return [];
  }
};

const saveDemoScores = (scores: ScoreEntry[]) => {
  window.localStorage.setItem(storageKey, JSON.stringify(scores));
};

export const validateTripPassword = async (password: string) => {
  if (!isSupabaseConfigured || !supabase) {
    return password.trim().toLowerCase() === 'milk';
  }

  const { data, error } = await supabase.rpc('verify_trip_password', {
    p_password: password,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
};

export const fetchScores = async () => {
  if (!isSupabaseConfigured || !supabase) {
    return demoScores();
  }

  const { data, error } = await supabase
    .from('score_entries')
    .select('round_id, player_id, hole_number, strokes');

  if (error) {
    throw error;
  }

  return (data ?? []).map(rowToEntry);
};

export const saveScore = async (entry: ScoreEntry, tripPassword: string) => {
  if (!isSupabaseConfigured || !supabase) {
    const nextScores = demoScores().filter(
      (score) =>
        score.roundId !== entry.roundId ||
        score.playerId !== entry.playerId ||
        score.holeNumber !== entry.holeNumber,
    );

    if (entry.strokes !== null) {
      nextScores.push(entry);
    }

    saveDemoScores(nextScores);
    return;
  }

  const { error } = await supabase.rpc('upsert_score_entry', {
    p_trip_password: tripPassword,
    p_round_id: entry.roundId,
    p_player_id: entry.playerId,
    p_hole_number: entry.holeNumber,
    p_strokes: entry.strokes,
  });

  if (error) {
    throw error;
  }
};

export const subscribeToScores = (onScoresChanged: () => void) => {
  if (!isSupabaseConfigured || !supabase) {
    return () => undefined;
  }

  const client = supabase;
  const channel = client
    .channel('score-entry-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'score_entries' },
      onScoresChanged,
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
};

export const scoreKey = (
  roundId: string,
  playerId: string,
  holeNumber: number,
) => `${roundId}:${playerId}:${holeNumber}`;

export const emptyScoreEntries = () =>
  rounds.flatMap((round) =>
    players.flatMap((player) =>
      round.holes.map((hole) => ({
        roundId: round.id,
        playerId: player.id,
        holeNumber: hole.number,
        strokes: null,
      })),
    ),
  );

export const mergeScores = (scores: ScoreEntry[]) => {
  const merged = new Map<string, ScoreEntry>();

  emptyScoreEntries().forEach((entry) => {
    merged.set(scoreKey(entry.roundId, entry.playerId, entry.holeNumber), entry);
  });

  scores.forEach((entry) => {
    merged.set(scoreKey(entry.roundId, entry.playerId, entry.holeNumber), entry);
  });

  return merged;
};

export const serializeScoreEntry = entryToRow;
