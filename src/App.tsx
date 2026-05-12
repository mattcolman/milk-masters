import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import heroPoster from '../assets/Barnbougle-Play-theDunes-banner-1.jpg';
import { TripCountdown } from './TripCountdown';
import { courses } from './data/courses';
import { itinerary } from './data/itinerary';
import { nearby } from './data/nearby';
import { players } from './data/players';
import { restaurants } from './data/restaurants';
import { rounds } from './data/rounds';
import {
  fetchScores,
  isSupabaseConfigured,
  mergeScores,
  saveScore,
  scoreKey,
  subscribeToScores,
  validateTripPassword,
} from './lib/scoring';
import type { Player, Round, ScoreEntry } from './types/trip';

const tabs = [
  'Players',
  'Itinerary',
  'Course',
  'Restaurant',
  'Nearby',
  'Rounds',
] as const;

type Tab = (typeof tabs)[number];

const sessionKey = 'milk-masters-session';
const coastlineImageUrl =
  'https://barnbougle.com.au/wp-content/uploads/2021/02/Barnbougle-Home-Discover4.jpg';
const nearbyImageUrl =
  'https://barnbougle.com.au/wp-content/uploads/2021/02/Barnbougle-Home-Discover5.jpg';

type StoredSession = {
  unlocked: boolean;
  playerId: string;
  password: string;
};

const publicAsset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
const journeyRouteMapSrc = publicAsset('maps/launceston-barnbougle-map.jpg');
const launcestonMapsUrl =
  'https://www.google.com/maps/search/?api=1&query=Launceston+Airport+LST+Tasmania';
const barnbougleMapsUrl =
  'https://www.google.com/maps/search/?api=1&query=Barnbougle+Golf+Bridport+Tasmania';
const playerImage = (path: string) =>
  path.startsWith('/players/') ? publicAsset(path) : path;

const loadSession = (): StoredSession => {
  const saved = window.localStorage.getItem(sessionKey);
  if (!saved) {
    return { unlocked: false, playerId: players[0].id, password: '' };
  }

  try {
    const parsed = JSON.parse(saved) as Partial<StoredSession>;
    return {
      unlocked: Boolean(parsed.unlocked),
      playerId: parsed.playerId ?? players[0].id,
      password: parsed.password ?? '',
    };
  } catch {
    return { unlocked: false, playerId: players[0].id, password: '' };
  }
};

const formatRelative = (strokes: number, par: number) => {
  const diff = strokes - par;
  if (diff === 0) return 'E';
  return diff > 0 ? `+${diff}` : `${diff}`;
};

const youtubeTourSearchUrl = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

const isYouTubeVideoId = (value: string) => /^[a-zA-Z0-9_-]{11}$/.test(value.trim());

const youtubeTourEmbedSrc = (videoId: string) =>
  `https://www.youtube-nocookie.com/embed/${videoId.trim()}`;

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Players');

  return (
    <div className="app-shell">
      <header
        className="hero"
        style={
          {
            '--hero-poster': `url(${heroPoster})`,
          } as CSSProperties
        }
      >
        <TripCountdown />
        <div className="hero__content">
          <div className="hero__eyebrow">Barnbougle Tasmania</div>
          <h1>Milk Masters</h1>
          <p>
            Wind over the dunes, firm links turf, Bass Strait on the horizon,
            and three rounds to decide the jacket.
          </p>

          <div className="hero__stats" aria-label="Trip summary">
            <span>3 rounds</span>
            <span>4 players</span>
            <span>1 coastline</span>
          </div>
        </div>
      </header>

      <nav className="tab-nav" aria-label="Primary navigation">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? 'tab-nav__item is-active' : 'tab-nav__item'}
            type="button"
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main>
        {activeTab === 'Players' && <PlayersTab />}
        {activeTab === 'Itinerary' && <ItineraryTab />}
        {activeTab === 'Course' && <CourseTab />}
        {activeTab === 'Restaurant' && <RestaurantTab />}
        {activeTab === 'Nearby' && <NearbyTab />}
        {activeTab === 'Rounds' && <RoundsTab />}
      </main>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="section-intro">
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function PlayersTab() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  return (
    <section>
      <ScenicBanner
        eyebrow="North-East Tasmania"
        title="A links trip wrapped in dunes, salt air, and big Tasmanian skies."
        imageUrl={coastlineImageUrl}
      />

      <SectionIntro eyebrow="Field" title="The Invitational Four">
        <p>
          Custom player cards are now in play for the full field, each with
          official artwork in the assets folder.
        </p>
      </SectionIntro>

      <div className="player-grid">
        {players.map((player) => (
          <button
            className="player-card"
            key={player.id}
            type="button"
            onClick={() => setSelectedPlayer(player)}
          >
            <img src={playerImage(player.imageUrl)} alt={`${player.name} player card`} />
            <div>
              <p className="card-kicker">Handicap {player.handicap}</p>
              <h3>{player.name}</h3>
              <p>{player.caption}</p>
              <span>{player.milkPreference}</span>
            </div>
          </button>
        ))}
      </div>

      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </section>
  );
}

function PlayerDetailModal({
  player,
  onClose,
}: {
  player: Player;
  onClose: () => void;
}) {
  return (
    <div
      className="player-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-modal-title"
      onClick={onClose}
    >
      <div className="player-modal__panel" onClick={(event) => event.stopPropagation()}>
        <button className="player-modal__close" type="button" onClick={onClose}>
          Close
        </button>

        <img
          className="player-modal__image"
          src={playerImage(player.imageUrl)}
          alt={`${player.name} player card enlarged`}
        />

        <div className="player-modal__details">
          <p className="card-kicker">Milk Masters profile</p>
          <h3 id="player-modal-title">{player.name}</h3>
          <p>{player.caption}</p>

          <dl>
            <div>
              <dt>Handicap</dt>
              <dd>{player.handicap}</dd>
            </div>
            <div>
              <dt>Milk preference</dt>
              <dd>{player.milkPreference}</dd>
            </div>
            <div>
              <dt>Card status</dt>
              <dd>
                {player.imageUrl.startsWith('/players/')
                  ? 'Placeholder artwork'
                  : 'Official player card'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function ItineraryTab() {
  return (
    <section>
      <div className="journey-panel">
        <div>
          <p className="card-kicker">Route</p>
          <h3>Launceston to Barnbougle</h3>
          <p>
            Land in the Tamar Valley, roll north-east through farm country, then
            trade airport asphalt for coastal dunes and links turf.
          </p>
        </div>
        <figure className="journey-panel__map">
          <img
            className="journey-panel__map-img"
            src={journeyRouteMapSrc}
            width={800}
            height={280}
            useMap="#journey-route-map"
            alt="North-east Tasmania: tap the west marker for Launceston or the east marker for Barnbougle to open maps."
            loading="lazy"
            decoding="async"
          />
          <map id="journey-route-map" name="journey-route-map">
            <area
              shape="circle"
              coords="168,142,56"
              href={launcestonMapsUrl}
              target="_blank"
              rel="noreferrer"
              alt="Open Launceston Airport in Google Maps"
            />
            <area
              shape="circle"
              coords="632,138,56"
              href={barnbougleMapsUrl}
              target="_blank"
              rel="noreferrer"
              alt="Open Barnbougle in Google Maps"
            />
          </map>
          <figcaption className="journey-panel__map-hint">
            Tap the markers on the image — Launceston (west) and Barnbougle (east) — to open
            Google Maps.
          </figcaption>
        </figure>
      </div>

      <SectionIntro eyebrow="Schedule" title="Three Days On The Links">
        <p>
          The trip runs from arrival in Launceston through the closing Lost Farm
          round before the afternoon flight home.
        </p>
      </SectionIntro>

      <div className="timeline">
        {itinerary.map((day) => (
          <article className="timeline-card" key={day.date}>
            <p>{day.day}</p>
            <h3>{day.date}</h3>
            <ul>
              {day.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function CourseTab() {
  return (
    <section>
      <SectionIntro eyebrow="Courses" title="Barnbougle Rotation">
        <p>
          Bougle Run warms the field up before Barnbougle Dunes and Lost Farm
          decide who earns the imaginary green jacket.
        </p>
      </SectionIntro>

      <p className="course-tours-preface">
        Full-course flyovers sit on each card below. When a tour is wired up you get the
        player in-page; otherwise the red button opens YouTube with a curated search
        (Golf Digest-style hole-by-hole for Dunes and Lost Farm, official Barnbougle clips
        for Bougle Run).
      </p>

      <div className="card-grid">
        {courses.map((course) => (
          <article className="feature-card course-card" key={course.id}>
            <div
              className="course-card__scene"
              style={{ backgroundImage: `url(${course.imageUrl})` }}
            >
              <span>{course.name}</span>
            </div>
            <div>
              <p className="card-kicker">
                {course.holes} holes · Par {course.par}
              </p>
              <h3>{course.name}</h3>
              <strong>{course.tagline}</strong>
              <p>{course.description}</p>
              <a href={course.link} target="_blank" rel="noreferrer">
                Course details
              </a>
              <div className="course-card__tour">
                <p className="course-card__tour-label">Full course tour</p>
                {course.fullCourseTourYoutubeId &&
                isYouTubeVideoId(course.fullCourseTourYoutubeId) ? (
                  <div className="course-tour-embed">
                    <iframe
                      title={`${course.name} full course tour`}
                      src={youtubeTourEmbedSrc(course.fullCourseTourYoutubeId)}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                ) : null}
                <div className="course-tour-actions">
                  <a
                    className="course-tour-yt-link"
                    href={youtubeTourSearchUrl(course.fullCourseTourYouTubeSearchQuery)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {course.fullCourseTourYoutubeId &&
                    isYouTubeVideoId(course.fullCourseTourYoutubeId)
                      ? 'Open this tour on YouTube'
                      : 'Find full course tour on YouTube'}
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RestaurantTab() {
  return (
    <section>
      <SectionIntro eyebrow="Dining" title="Clubhouse Tables">
        <p>
          Keep the trip logistics simple: Barnbougle is the home base, with Lost
          Farm available as a final-day flourish.
        </p>
      </SectionIntro>

      <div className="card-grid">
        {restaurants.map((venue) => (
          <article className="feature-card" key={venue.name}>
            <p className="card-kicker">Reservation notes</p>
            <h3>{venue.name}</h3>
            <p>{venue.description}</p>
            <ul>
              {venue.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function NearbyTab() {
  return (
    <section>
      <ScenicBanner
        eyebrow="Beyond the scorecard"
        title="Lavender fields, Tamar Valley wine, small towns, and the road back to Launceston."
        imageUrl={nearbyImageUrl}
      />

      <SectionIntro eyebrow="Around The Trip" title="Nearby Stops">
        <p>
          A compact shortlist for spare windows around the airport runs,
          weather delays, or anyone needing a non-golf diversion.
        </p>
      </SectionIntro>

      <div className="card-grid">
        {nearby.map((place) => (
          <article className="feature-card" key={place.name}>
            <p className="card-kicker">{place.category}</p>
            <h3>{place.name}</h3>
            <p>{place.description}</p>
            <a href={place.link} target="_blank" rel="noreferrer">
              Open details
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function ScenicBanner({
  eyebrow,
  title,
  imageUrl,
}: {
  eyebrow: string;
  title: string;
  imageUrl: string;
}) {
  return (
    <aside className="scenic-banner">
      <div>
        <p className="card-kicker">{eyebrow}</p>
        <h3>{title}</h3>
      </div>
      <div
        className="scenic-banner__photo"
        style={{ backgroundImage: `url(${imageUrl})` }}
        aria-hidden="true"
      />
    </aside>
  );
}

function RoundsTab() {
  const [session, setSession] = useState(loadSession);
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedRoundId, setSelectedRoundId] = useState(rounds[0].id);
  const [scoreEntries, setScoreEntries] = useState<ScoreEntry[]>([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedRound = rounds.find((round) => round.id === selectedRoundId) ?? rounds[0];
  const selectedPlayer =
    players.find((player) => player.id === session.playerId) ?? players[0];

  const scoreMap = useMemo(() => mergeScores(scoreEntries), [scoreEntries]);

  useEffect(() => {
    if (!session.unlocked) {
      return;
    }

    const refreshScores = async () => {
      try {
        setScoreEntries(await fetchScores());
      } catch {
        setStatus('Could not load scores. Check the Supabase configuration.');
      }
    };

    void refreshScores();
    return subscribeToScores(refreshScores);
  }, [session.unlocked]);

  useEffect(() => {
    window.localStorage.setItem(sessionKey, JSON.stringify(session));
  }, [session]);

  const leaderboard = useMemo(
    () =>
      players
        .map((player) => {
          const totals = rounds.reduce(
            (acc, round) => {
              round.holes.forEach((hole) => {
                const entry = scoreMap.get(scoreKey(round.id, player.id, hole.number));
                if (entry?.strokes) {
                  acc.strokes += entry.strokes;
                  acc.par += hole.par;
                  acc.holes += 1;
                }
              });
              return acc;
            },
            { strokes: 0, par: 0, holes: 0 },
          );

          return {
            player,
            ...totals,
            relative: totals.holes > 0 ? totals.strokes - totals.par : null,
          };
        })
        .sort((a, b) => {
          if (a.relative === null) return 1;
          if (b.relative === null) return -1;
          return a.relative - b.relative;
        }),
    [scoreMap],
  );

  const handleUnlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus('');

    try {
      const isValid = await validateTripPassword(passwordInput);
      if (!isValid) {
        setStatus('That password did not match. Try the shared trip password.');
        return;
      }

      setSession({
        unlocked: true,
        playerId: session.playerId,
        password: passwordInput,
      });
      setPasswordInput('');
    } catch {
      setStatus('Could not validate the password. Check Supabase and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreChange = async (
    round: Round,
    player: Player,
    holeNumber: number,
    value: string,
  ) => {
    const strokes = value === '' ? null : Number(value);
    const nextEntry = {
      roundId: round.id,
      playerId: player.id,
      holeNumber,
      strokes,
    };

    setScoreEntries((current) => {
      const rest = current.filter(
        (entry) =>
          entry.roundId !== nextEntry.roundId ||
          entry.playerId !== nextEntry.playerId ||
          entry.holeNumber !== nextEntry.holeNumber,
      );
      return strokes === null ? rest : [...rest, nextEntry];
    });

    try {
      await saveScore(nextEntry, session.password);
      setStatus('Score saved.');
    } catch {
      setStatus('Could not save that score. Check the password and connection.');
    }
  };

  if (!session.unlocked) {
    return (
      <section>
        <SectionIntro eyebrow="Scoring" title="Player Login">
          <p>
            Enter the shared trip password, then choose your player name before
            entering live scores. In local demo mode, use <strong>milk</strong>.
          </p>
        </SectionIntro>

        <form className="login-card" onSubmit={handleUnlock}>
          <label>
            Shared password
            <input
              value={passwordInput}
              type="password"
              onChange={(event) => setPasswordInput(event.target.value)}
              placeholder="Enter trip password"
              required
            />
          </label>

          <label>
            Player
            <select
              value={session.playerId}
              onChange={(event) =>
                setSession((current) => ({
                  ...current,
                  playerId: event.target.value,
                }))
              }
            >
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Checking...' : 'Unlock Rounds'}
          </button>
          {status && <p className="form-status">{status}</p>}
          {!isSupabaseConfigured && (
            <p className="form-note">
              Supabase is not configured yet, so scores save to this browser only.
            </p>
          )}
        </form>
      </section>
    );
  }

  return (
    <section>
      <SectionIntro eyebrow="Live Scoring" title="Rounds">
        <p>
          Enter scores hole-by-hole as {selectedPlayer.name}. The leaderboard
          updates from all saved scorecards.
        </p>
      </SectionIntro>

      <div className="rounds-layout">
        <aside className="leaderboard">
          <div className="leaderboard__header">
            <h3>Leaderboard</h3>
            <button
              type="button"
              onClick={() =>
                setSession({ unlocked: false, playerId: session.playerId, password: '' })
              }
            >
              Lock
            </button>
          </div>

          {leaderboard.map(({ player, strokes, par, holes, relative }, index) => (
            <div className="leaderboard-row" key={player.id}>
              <span>{index + 1}</span>
              <strong>{player.name}</strong>
              <small>{holes} holes</small>
              <b>{relative === null ? '-' : formatRelative(strokes, par)}</b>
            </div>
          ))}
        </aside>

        <div className="scorecard-panel">
          <div className="scorecard-toolbar">
            <label>
              Round
              <select
                value={selectedRound.id}
                onChange={(event) => setSelectedRoundId(event.target.value)}
              >
                {rounds.map((round) => (
                  <option key={round.id} value={round.id}>
                    {round.name} · {round.courseName}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Player
              <select
                value={session.playerId}
                onChange={(event) =>
                  setSession((current) => ({
                    ...current,
                    playerId: event.target.value,
                  }))
                }
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <Scorecard
            round={selectedRound}
            player={selectedPlayer}
            scoreMap={scoreMap}
            onScoreChange={handleScoreChange}
          />
          {status && <p className="form-status">{status}</p>}
        </div>
      </div>
    </section>
  );
}

function Scorecard({
  round,
  player,
  scoreMap,
  onScoreChange,
}: {
  round: Round;
  player: Player;
  scoreMap: Map<string, ScoreEntry>;
  onScoreChange: (
    round: Round,
    player: Player,
    holeNumber: number,
    value: string,
  ) => void;
}) {
  const enteredHoles = round.holes
    .map((hole) => ({
      par: hole.par,
      strokes: scoreMap.get(scoreKey(round.id, player.id, hole.number))?.strokes,
    }))
    .filter((hole): hole is { par: number; strokes: number } =>
      Boolean(hole.strokes),
    );
  const total = enteredHoles.reduce((sum, hole) => sum + hole.strokes, 0);
  const par = enteredHoles.reduce((sum, hole) => sum + hole.par, 0);

  return (
    <div className="scorecard">
      <div className="scorecard__title">
        <div>
          <p>{round.date}</p>
          <h3>{round.courseName}</h3>
        </div>
        <strong>
          {enteredHoles.length ? `${total} (${formatRelative(total, par)})` : 'No scores'}
        </strong>
      </div>

      <div className="scorecard-grid" role="table" aria-label={`${round.courseName} scores`}>
        <div className="scorecard-grid__head">Hole</div>
        <div className="scorecard-grid__head">Par</div>
        <div className="scorecard-grid__head">Score</div>
        {round.holes.map((hole) => {
          const entry = scoreMap.get(scoreKey(round.id, player.id, hole.number));
          return (
            <div className="scorecard-grid__row" key={hole.number}>
              <span>{hole.number}</span>
              <span>{hole.par}</span>
              <input
                inputMode="numeric"
                min={1}
                max={12}
                type="number"
                value={entry?.strokes ?? ''}
                aria-label={`Hole ${hole.number} score`}
                onChange={(event) =>
                  onScoreChange(round, player, hole.number, event.target.value)
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
