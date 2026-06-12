import type { ScoresByMatch } from './rules';

export type OfficialResult = {
  matchNo: number;
  date: string; // Fecha local de Monterrey, YYYY-MM-DD
  home: number;
  away: number;
  source: string;
  sourceUrl?: string;
  lastUpdated: string;
};

export const OFFICIAL_RESULTS: OfficialResult[] = [
  {
    matchNo: 1,
    date: '2026-06-11',
    home: 2,
    away: 0,
    source: 'Reuters / ESPN / FOX Sports',
    sourceUrl: 'https://www.reuters.com/sports/soccer/quinones-and-jimenez-fire-mexico-opening-world-cup-win-over-nine-man-south-africa-2026-06-11/',
    lastUpdated: '2026-06-12T12:00:00-06:00',
  },
  {
    matchNo: 2,
    date: '2026-06-11',
    home: 2,
    away: 1,
    source: 'Reuters / ESPN / The Guardian',
    sourceUrl: 'https://www.reuters.com/sports/soccer/south-korea-snatch-2-1-win-over-czech-republic-world-cup-opener-2026-06-12/',
    lastUpdated: '2026-06-12T12:00:00-06:00',
  },
];

export function seededOfficialScores(): ScoresByMatch {
  return Object.fromEntries(
    OFFICIAL_RESULTS.map((result) => [result.matchNo, { home: result.home, away: result.away }])
  ) as ScoresByMatch;
}
