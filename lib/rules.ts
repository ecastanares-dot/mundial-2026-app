import { GROUPS, MATCHES, TEAMS, type Entrant, type GroupLetter, type Match, type Team } from './data';

export type Score = { home?: number; away?: number; winnerId?: string };
export type ScoresByMatch = Record<number, Score>;
export type ExtraTeamCriteria = Record<string, { fairPlay: number; fifaRank: number }>;

export type TeamStats = {
  team: Team;
  group: GroupLetter;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  fairPlay: number;
  fifaRank: number;
};

const groupMatches = MATCHES.filter((m) => m.phase === 'Grupo');

export function scoreIsComplete(score?: Score) {
  return typeof score?.home === 'number' && Number.isFinite(score.home) && typeof score?.away === 'number' && Number.isFinite(score.away);
}

export function teamLabel(team?: Team) {
  return team ? `${team.flag} ${team.shortName}` : 'Pendiente';
}

export function getGroupMatches(group: GroupLetter) {
  return groupMatches.filter((m) => m.group === group);
}

function baseStats(teamId: string, extras: ExtraTeamCriteria = {}): TeamStats {
  const team = TEAMS[teamId];
  return {
    team,
    group: team.group,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0,
    fairPlay: extras[teamId]?.fairPlay ?? 0,
    fifaRank: extras[teamId]?.fifaRank ?? team.fifaRank,
  };
}

export function calculateAllStats(scores: ScoresByMatch, extras: ExtraTeamCriteria = {}) {
  const byTeam: Record<string, TeamStats> = {};
  Object.keys(TEAMS).forEach((teamId) => { byTeam[teamId] = baseStats(teamId, extras); });

  for (const match of groupMatches) {
    const homeId = match.home.type === 'team' ? match.home.teamId : undefined;
    const awayId = match.away.type === 'team' ? match.away.teamId : undefined;
    const score = scores[match.no];
    if (!homeId || !awayId || !scoreIsComplete(score)) continue;

    const home = byTeam[homeId];
    const away = byTeam[awayId];
    const h = Number(score.home);
    const a = Number(score.away);

    home.played += 1;
    away.played += 1;
    home.gf += h; home.ga += a;
    away.gf += a; away.ga += h;
    home.gd = home.gf - home.ga;
    away.gd = away.gf - away.ga;

    if (h > a) {
      home.wins += 1; away.losses += 1; home.points += 3;
    } else if (a > h) {
      away.wins += 1; home.losses += 1; away.points += 3;
    } else {
      home.draws += 1; away.draws += 1; home.points += 1; away.points += 1;
    }
  }

  return byTeam;
}

function h2hStats(teamId: string, subset: string[], scores: ScoresByMatch) {
  let pts = 0;
  let gf = 0;
  let ga = 0;
  let played = 0;
  for (const match of groupMatches) {
    const homeId = match.home.type === 'team' ? match.home.teamId : undefined;
    const awayId = match.away.type === 'team' ? match.away.teamId : undefined;
    if (!homeId || !awayId) continue;
    if (homeId !== teamId && awayId !== teamId) continue;
    const opponent = homeId === teamId ? awayId : homeId;
    if (!subset.includes(opponent)) continue;
    const score = scores[match.no];
    if (!scoreIsComplete(score)) continue;

    const ownGoals = homeId === teamId ? Number(score.home) : Number(score.away);
    const oppGoals = homeId === teamId ? Number(score.away) : Number(score.home);
    played += 1;
    gf += ownGoals;
    ga += oppGoals;
    if (ownGoals > oppGoals) pts += 3;
    else if (ownGoals === oppGoals) pts += 1;
  }
  return { pts, gf, ga, gd: gf - ga, played };
}

function splitByValue(teamIds: string[], valueFn: (teamId: string) => number, desc = true) {
  const sorted = [...teamIds].sort((a, b) => {
    const delta = valueFn(b) - valueFn(a);
    return desc ? delta : -delta;
  });
  const groups: string[][] = [];
  for (const id of sorted) {
    const last = groups[groups.length - 1];
    if (!last || valueFn(last[0]) !== valueFn(id)) groups.push([id]);
    else last.push(id);
  }
  return groups;
}

function allOneGroup(groups: string[][]) {
  return groups.length === 1;
}

function resolveHeadToHead(teamIds: string[], scores: ScoresByMatch): string[] | null {
  if (teamIds.length <= 1) return teamIds;
  const criteria = [
    (id: string) => h2hStats(id, teamIds, scores).pts,
    (id: string) => h2hStats(id, teamIds, scores).gd,
    (id: string) => h2hStats(id, teamIds, scores).gf,
  ];

  for (const criterion of criteria) {
    const groups = splitByValue(teamIds, criterion, true);
    if (!allOneGroup(groups)) {
      return groups.flatMap((g) => {
        if (g.length <= 1) return g;
        const recursive = resolveHeadToHead(g, scores);
        return recursive ?? g;
      });
    }
  }
  return null;
}

function resolveRemaining(teamIds: string[], statsByTeam: Record<string, TeamStats>) {
  let buckets = [teamIds];
  const criteria: Array<{ fn: (id: string) => number; desc: boolean }> = [
    { fn: (id) => statsByTeam[id].gd, desc: true },
    { fn: (id) => statsByTeam[id].gf, desc: true },
    { fn: (id) => statsByTeam[id].fairPlay, desc: true },
    { fn: (id) => statsByTeam[id].fifaRank, desc: false },
  ];
  for (const criterion of criteria) {
    buckets = buckets.flatMap((bucket) => {
      if (bucket.length <= 1) return [bucket];
      return splitByValue(bucket, criterion.fn, criterion.desc);
    });
  }
  return buckets.flatMap((b) => b.sort((a, b) => statsByTeam[a].team.name.localeCompare(statsByTeam[b].team.name, 'es')));
}

function rankGroupTeamIds(group: GroupLetter, statsByTeam: Record<string, TeamStats>, scores: ScoresByMatch) {
  const teamIds = GROUPS[group];
  const byPoints = splitByValue(teamIds, (id) => statsByTeam[id].points, true);
  const ranked: string[] = [];
  for (const bucket of byPoints) {
    if (bucket.length === 1) {
      ranked.push(bucket[0]);
      continue;
    }
    const h2h = resolveHeadToHead(bucket, scores);
    if (h2h && h2h.length === bucket.length && new Set(h2h).size === bucket.length) {
      // Si el desempate H2H deja empates residuales, el paso posterior se maneja con criterios globales.
      const h2hBuckets = splitByValue(h2h, (id) => {
        const idx = h2h.indexOf(id);
        return -idx;
      }, true);
      ranked.push(...h2hBuckets.flatMap((g) => g.length === 1 ? g : resolveRemaining(g, statsByTeam)));
    } else {
      ranked.push(...resolveRemaining(bucket, statsByTeam));
    }
  }
  return ranked;
}

export function calculateStandings(scores: ScoresByMatch, extras: ExtraTeamCriteria = {}) {
  const stats = calculateAllStats(scores, extras);
  const standings = Object.keys(GROUPS).reduce((acc, group) => {
    const g = group as GroupLetter;
    acc[g] = rankGroupTeamIds(g, stats, scores).map((id) => stats[id]);
    return acc;
  }, {} as Record<GroupLetter, TeamStats[]>);
  return { standings, stats };
}

export function rankThirdPlaces(scores: ScoresByMatch, extras: ExtraTeamCriteria = {}) {
  const { standings } = calculateStandings(scores, extras);
  const thirds = (Object.keys(GROUPS) as GroupLetter[]).map((g) => standings[g][2]).filter(Boolean);
  return thirds.sort((a, b) => {
    return (b.points - a.points)
      || (b.gd - a.gd)
      || (b.gf - a.gf)
      || (b.fairPlay - a.fairPlay)
      || (a.fifaRank - b.fifaRank)
      || a.team.name.localeCompare(b.team.name, 'es');
  });
}

const THIRD_SLOTS: Record<string, { matchNo: number; allowed: GroupLetter[] }> = {
  '1E': { matchNo: 74, allowed: ['A','B','C','D','F'] },
  '1I': { matchNo: 77, allowed: ['C','D','F','G','H'] },
  '1A': { matchNo: 79, allowed: ['C','E','F','H','I'] },
  '1L': { matchNo: 80, allowed: ['E','H','I','J','K'] },
  '1D': { matchNo: 81, allowed: ['B','E','F','I','J'] },
  '1G': { matchNo: 82, allowed: ['A','E','H','I','J'] },
  '1B': { matchNo: 85, allowed: ['E','F','G','I','J'] },
  '1K': { matchNo: 87, allowed: ['D','E','I','J','L'] },
};

export function assignThirdPlaceSlots(scores: ScoresByMatch, extras: ExtraTeamCriteria = {}) {
  const topThirds = rankThirdPlaces(scores, extras).slice(0, 8);
  const thirdGroups = topThirds.map((t) => t.group);
  const groupToTeamId = Object.fromEntries(topThirds.map((t) => [t.group, t.team.id])) as Partial<Record<GroupLetter, string>>;
  const slots = Object.keys(THIRD_SLOTS) as Array<keyof typeof THIRD_SLOTS>;

  const slotCandidateCount = (slot: keyof typeof THIRD_SLOTS, remaining: GroupLetter[]) => (
    remaining.filter((g) => THIRD_SLOTS[slot].allowed.includes(g)).length
  );

  function backtrack(remainingSlots: string[], remainingGroups: GroupLetter[], acc: Record<string, GroupLetter>): Record<string, GroupLetter> | null {
    if (remainingSlots.length === 0) return acc;
    const [slot, ...restSlots] = [...remainingSlots].sort((a, b) => slotCandidateCount(a, remainingGroups) - slotCandidateCount(b, remainingGroups));
    const candidates = remainingGroups
      .filter((g) => THIRD_SLOTS[slot].allowed.includes(g))
      .sort((a, b) => thirdGroups.indexOf(a) - thirdGroups.indexOf(b));
    for (const group of candidates) {
      const next = backtrack(restSlots, remainingGroups.filter((g) => g !== group), { ...acc, [slot]: group });
      if (next) return next;
    }
    return null;
  }

  const groupAssignment = topThirds.length === 8 ? backtrack(slots, thirdGroups, {}) : null;
  const assignment: Record<string, string | undefined> = {};
  if (groupAssignment) {
    Object.entries(groupAssignment).forEach(([slot, group]) => { assignment[slot] = groupToTeamId[group as GroupLetter]; });
  }
  return { topThirds, assignment, groupAssignment };
}

export type ResolvedEntrant = { team?: Team; label: string; source?: string };

export function resolveEntrant(entrant: Entrant, scores: ScoresByMatch, extras: ExtraTeamCriteria = {}): ResolvedEntrant {
  const { standings } = calculateStandings(scores, extras);
  if (entrant.type === 'team') return { team: TEAMS[entrant.teamId], label: teamLabel(TEAMS[entrant.teamId]) };
  if (entrant.type === 'groupRank') {
    const team = standings[entrant.group]?.[entrant.rank - 1]?.team;
    return { team, label: team ? teamLabel(team) : `${entrant.rank}${entrant.group}` };
  }
  if (entrant.type === 'thirdPlace') {
    const { assignment } = assignThirdPlaceSlots(scores, extras);
    const teamId = assignment[entrant.slot];
    const team = teamId ? TEAMS[teamId] : undefined;
    return { team, label: team ? teamLabel(team) : `3.º de ${entrant.allowedGroups.join('/')}`, source: entrant.slot };
  }
  if (entrant.type === 'winner') {
    const team = getKnockoutDecision(entrant.matchNo, scores, extras)?.winner;
    return { team, label: team ? teamLabel(team) : `Ganador M${entrant.matchNo}` };
  }
  const team = getKnockoutDecision(entrant.matchNo, scores, extras)?.loser;
  return { team, label: team ? teamLabel(team) : `Perdedor M${entrant.matchNo}` };
}

export function getKnockoutDecision(matchNo: number, scores: ScoresByMatch, extras: ExtraTeamCriteria = {}) {
  const match = MATCHES.find((m) => m.no === matchNo);
  if (!match || match.phase === 'Grupo') return null;
  const home = resolveEntrant(match.home, scores, extras).team;
  const away = resolveEntrant(match.away, scores, extras).team;
  const score = scores[matchNo];
  if (!home || !away || !scoreIsComplete(score)) return null;
  const h = Number(score.home);
  const a = Number(score.away);
  let winner: Team | undefined;
  if (h > a) winner = home;
  else if (a > h) winner = away;
  else if (score.winnerId === home.id) winner = home;
  else if (score.winnerId === away.id) winner = away;
  if (!winner) return null;
  return { winner, loser: winner.id === home.id ? away : home };
}

export function groupStageComplete(scores: ScoresByMatch) {
  return groupMatches.every((m) => scoreIsComplete(scores[m.no]));
}

export function formatInMonterrey(iso: string) {
  const dt = new Date(iso);
  const date = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Monterrey', weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  }).format(dt);
  const time = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Monterrey', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).format(dt);
  return { date, time };
}

export function phaseOrder(phase: Match['phase']) {
  const order = ['Grupo','16avos','Octavos','Cuartos','Semifinal','Tercer lugar','Final'];
  return order.indexOf(phase);
}
