'use client';

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { GROUPS, MATCHES, TEAMS, type GroupLetter, type Match, type Team } from '@/lib/data';
import { OFFICIAL_RESULTS, seededOfficialScores, type OfficialResult } from '@/lib/officialResults';
import {
  calculateStandings,
  formatInMonterrey,
  getKnockoutDecision,
  groupStageComplete,
  phaseOrder,
  rankThirdPlaces,
  resolveEntrant,
  scoreIsComplete,
  teamLabel,
  type ExtraTeamCriteria,
  type ScoresByMatch,
} from '@/lib/rules';

type Tab = 'faseGrupos' | 'estadisticas' | 'eliminatorias' | 'sedes' | 'criterios';

type DailyPromptState = {
  dateKey: string;
  matches: Match[];
  message?: string;
  loading?: boolean;
} | null;

const STORAGE_RESULTS = 'wc2026-results-v2';
const STORAGE_EXTRAS = 'wc2026-extra-criteria-v1';
const MATCH_DURATION_BUFFER_MS = 2.5 * 60 * 60 * 1000;

function defaultExtras(): ExtraTeamCriteria {
  return Object.fromEntries(Object.values(TEAMS).map((team) => [team.id, { fairPlay: 0, fifaRank: team.fifaRank }])) as ExtraTeamCriteria;
}

function parseScoreValue(value: string) {
  if (value.trim() === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function mergeMissingScores(base: ScoresByMatch, incoming: ScoresByMatch): ScoresByMatch {
  const next: ScoresByMatch = { ...base };
  for (const [matchNo, score] of Object.entries(incoming)) {
    const key = Number(matchNo);
    if (!scoreIsComplete(next[key])) next[key] = score;
  }
  return next;
}

function scoresFromOfficialResults(results: OfficialResult[]): ScoresByMatch {
  return Object.fromEntries(results.map((result) => [result.matchNo, { home: result.home, away: result.away }])) as ScoresByMatch;
}

function dateKeyInMonterrey(value: string | Date) {
  const dt = typeof value === 'string' ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Monterrey',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(dt);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${pick('year')}-${pick('month')}-${pick('day')}`;
}

function dateLabelFromKey(dateKey: string) {
  const noon = new Date(`${dateKey}T12:00:00-06:00`);
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Monterrey',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(noon);
}

function todayKeyInMonterrey() {
  return dateKeyInMonterrey(new Date());
}

function estimatedEndTime(match: Match) {
  return new Date(new Date(match.etKickoff).getTime() + MATCH_DURATION_BUFFER_MS);
}

function getMatchesForDate(dateKey: string, phase?: Match['phase']) {
  return MATCHES.filter((match) => dateKeyInMonterrey(match.etKickoff) === dateKey && (!phase || match.phase === phase));
}

function Header() {
  return (
    <header className="hero">
      <div>
        <p className="eyebrow">Copa Mundial FIFA 2026 · Horario de Monterrey</p>
        <h1>Simulador de resultados, grupos y eliminatorias</h1>
        <p className="heroText">
          Captura marcadores, calcula puntos, reordena grupos con criterios FIFA y actualiza la llave de eliminación directa.
        </p>
      </div>
      <div className="heroBadge">
        <span>🏆</span>
        <strong>104</strong>
        <small>partidos</small>
      </div>
    </header>
  );
}

function TeamName({ team, fallback }: { team?: Team; fallback?: string }) {
  return <span className="teamName">{team ? teamLabel(team) : (fallback ?? 'Pendiente')}</span>;
}

function ScoreInput({
  match,
  scores,
  setScores,
  extras,
}: {
  match: Match;
  scores: ScoresByMatch;
  setScores: Dispatch<SetStateAction<ScoresByMatch>>;
  extras: ExtraTeamCriteria;
}) {
  const score = scores[match.no] ?? {};
  const home = resolveEntrant(match.home, scores, extras).team;
  const away = resolveEntrant(match.away, scores, extras).team;
  const isKnockout = match.phase !== 'Grupo';
  const isDraw = scoreIsComplete(score) && score.home === score.away;

  const update = (key: 'home' | 'away', raw: string) => {
    setScores((prev) => ({
      ...prev,
      [match.no]: {
        ...(prev[match.no] ?? {}),
        [key]: parseScoreValue(raw),
        winnerId: undefined,
      },
    }));
  };

  const updateWinner = (winnerId: string) => {
    setScores((prev) => ({ ...prev, [match.no]: { ...(prev[match.no] ?? {}), winnerId: winnerId || undefined } }));
  };

  return (
    <div className="scoreBox">
      <input
        aria-label={`Goles de ${home?.name ?? 'equipo 1'} en partido ${match.no}`}
        type="number"
        min="0"
        inputMode="numeric"
        value={score.home ?? ''}
        onChange={(event) => update('home', event.target.value)}
        disabled={!home || !away}
      />
      <span className="scoreSep">-</span>
      <input
        aria-label={`Goles de ${away?.name ?? 'equipo 2'} en partido ${match.no}`}
        type="number"
        min="0"
        inputMode="numeric"
        value={score.away ?? ''}
        onChange={(event) => update('away', event.target.value)}
        disabled={!home || !away}
      />
      {isKnockout && isDraw && home && away && (
        <select value={score.winnerId ?? ''} onChange={(event) => updateWinner(event.target.value)} className="winnerSelect">
          <option value="">Ganador penales/TE</option>
          <option value={home.id}>{home.shortName}</option>
          <option value={away.id}>{away.shortName}</option>
        </select>
      )}
    </div>
  );
}

function MatchCard({
  match,
  scores,
  setScores,
  extras,
}: {
  match: Match;
  scores: ScoresByMatch;
  setScores: Dispatch<SetStateAction<ScoresByMatch>>;
  extras: ExtraTeamCriteria;
}) {
  const { date, time } = formatInMonterrey(match.etKickoff);
  const home = resolveEntrant(match.home, scores, extras);
  const away = resolveEntrant(match.away, scores, extras);
  const decision = match.phase === 'Grupo' ? null : getKnockoutDecision(match.no, scores, extras);

  return (
    <article className="matchCard">
      <div className="matchTop">
        <span className="matchNo">M{match.no}</span>
        <span className="phase">{match.phase}{match.group ? ` · Grupo ${match.group}` : ''}</span>
      </div>
      <div className="matchDate">{date} · {time} h MTY</div>
      <div className="matchTeams">
        <TeamName team={home.team} fallback={home.label} />
        <ScoreInput match={match} scores={scores} setScores={setScores} extras={extras} />
        <TeamName team={away.team} fallback={away.label} />
      </div>
      {decision && <p className="winnerLine">Avanza: <strong>{teamLabel(decision.winner)}</strong></p>}
      <p className="venue">{match.venue} · {match.city}</p>
    </article>
  );
}

function DailyResultsPrompt({
  prompt,
  onAccept,
  onManual,
  onDismiss,
}: {
  prompt: DailyPromptState;
  onAccept: () => void;
  onManual: () => void;
  onDismiss: () => void;
}) {
  if (!prompt) return null;
  return (
    <div className="dailyPrompt">
      <div>
        <strong>Ya concluyeron los partidos de hoy, ¿quieres que se registren automáticamente los resultados que no has ingresado?</strong>
        <p>{prompt.matches.length} partido(s) del {dateLabelFromKey(prompt.dateKey)} tienen marcador pendiente.</p>
        {prompt.message && <p className="promptMessage">{prompt.message}</p>}
      </div>
      <div className="promptActions">
        <button onClick={onAccept} disabled={prompt.loading}>Sí, registrar resultados</button>
        <button onClick={onManual} className="secondaryAction">No, yo los registro</button>
        <button onClick={onDismiss} className="iconButton" aria-label="Cerrar aviso">×</button>
      </div>
    </div>
  );
}

function GroupStageSection({
  scores,
  setScores,
  extras,
  dateFilter,
  setDateFilter,
}: {
  scores: ScoresByMatch;
  setScores: Dispatch<SetStateAction<ScoresByMatch>>;
  extras: ExtraTeamCriteria;
  dateFilter: string;
  setDateFilter: Dispatch<SetStateAction<string>>;
}) {
  const groupMatches = useMemo(() => MATCHES.filter((match) => match.phase === 'Grupo'), []);
  const dateOptions = useMemo(() => Array.from(new Set(groupMatches.map((match) => dateKeyInMonterrey(match.etKickoff)))).sort(), [groupMatches]);
  const matches = useMemo(() => {
    return groupMatches
      .filter((match) => dateFilter === 'todos' || dateKeyInMonterrey(match.etKickoff) === dateFilter)
      .sort((a, b) => new Date(a.etKickoff).getTime() - new Date(b.etKickoff).getTime() || a.no - b.no);
  }, [groupMatches, dateFilter]);

  return (
    <section>
      <div className="sectionTitle">
        <div>
          <h2>Fase de grupos</h2>
          <p>Calendario de la primera fase con captura de marcador. Todos los horarios se muestran en hora de Monterrey, México.</p>
        </div>
        <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
          <option value="todos">Todos los días</option>
          {dateOptions.map((dateKey) => <option key={dateKey} value={dateKey}>{dateLabelFromKey(dateKey)}</option>)}
        </select>
      </div>
      <div className="matchGrid">
        {matches.map((match) => <MatchCard key={match.no} match={match} scores={scores} setScores={setScores} extras={extras} />)}
      </div>
    </section>
  );
}

function StandingsTable({
  group,
  rows,
  selectedTeamId,
  onSelectTeam,
}: {
  group: GroupLetter;
  rows: ReturnType<typeof calculateStandings>['standings'][GroupLetter];
  selectedTeamId?: string;
  onSelectTeam: (teamId: string) => void;
}) {
  return (
    <div className="groupCard">
      <h3>Grupo {group}</h3>
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.team.id} className={`${index < 2 ? 'qualified' : index === 2 ? 'third' : ''} ${selectedTeamId === row.team.id ? 'selectedRow' : ''}`}>
                <td>{index + 1}</td>
                <td className="teamCell">
                  <button className="teamButton" onClick={() => onSelectTeam(row.team.id)}>{teamLabel(row.team)}</button>
                </td>
                <td>{row.played}</td>
                <td>{row.wins}</td>
                <td>{row.draws}</td>
                <td>{row.losses}</td>
                <td>{row.gf}</td>
                <td>{row.ga}</td>
                <td>{row.gd}</td>
                <td><strong>{row.points}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function resolveMatchTeams(match: Match, scores: ScoresByMatch, extras: ExtraTeamCriteria) {
  return {
    home: resolveEntrant(match.home, scores, extras),
    away: resolveEntrant(match.away, scores, extras),
  };
}

function TeamSchedulePanel({ teamId, scores, extras }: { teamId?: string; scores: ScoresByMatch; extras: ExtraTeamCriteria }) {
  if (!teamId) {
    return (
      <div className="detailPanel">
        <h3>Partidos por país</h3>
        <p className="muted">Da clic en cualquier país dentro de las tablas para ver sus partidos, contrincantes, fecha, hora y sede.</p>
      </div>
    );
  }
  const team = TEAMS[teamId];
  const matches = MATCHES.filter((match) => {
    const { home, away } = resolveMatchTeams(match, scores, extras);
    return home.team?.id === teamId || away.team?.id === teamId;
  }).sort((a, b) => new Date(a.etKickoff).getTime() - new Date(b.etKickoff).getTime() || a.no - b.no);

  return (
    <div className="detailPanel">
      <h3>{teamLabel(team)} · partidos</h3>
      <div className="tableWrap">
        <table>
          <thead><tr><th>Fase</th><th>Contrincante</th><th>Fecha</th><th>Hora MTY</th><th>Sede</th><th>Marcador</th></tr></thead>
          <tbody>
            {matches.map((match) => {
              const { home, away } = resolveMatchTeams(match, scores, extras);
              const opponent = home.team?.id === teamId ? away : home;
              const { date, time } = formatInMonterrey(match.etKickoff);
              const score = scores[match.no];
              const scoreText = scoreIsComplete(score) ? `${score.home}-${score.away}` : 'Pendiente';
              return (
                <tr key={match.no}>
                  <td>{match.phase}{match.group ? ` · G${match.group}` : ''}</td>
                  <td>{opponent.team ? teamLabel(opponent.team) : opponent.label}</td>
                  <td>{date}</td>
                  <td>{time}</td>
                  <td>{match.venue} · {match.city}</td>
                  <td>{scoreText}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatisticsSection({ scores, extras }: { scores: ScoresByMatch; extras: ExtraTeamCriteria }) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('MEX');
  const { standings } = useMemo(() => calculateStandings(scores, extras), [scores, extras]);
  const thirds = useMemo(() => rankThirdPlaces(scores, extras), [scores, extras]);

  return (
    <section>
      <div className="sectionTitle">
        <div>
          <h2>Estadísticas</h2>
          <p>Tablas por grupo, ranking de terceros y consulta de calendario por país.</p>
        </div>
      </div>
      <TeamSchedulePanel teamId={selectedTeamId} scores={scores} extras={extras} />
      <div className="legend">
        <span><i className="dot qualifiedDot" /> Clasificación directa</span>
        <span><i className="dot thirdDot" /> Zona de terceros</span>
      </div>
      <div className="groupsGrid">
        {(Object.keys(GROUPS) as GroupLetter[]).map((group) => (
          <StandingsTable key={group} group={group} rows={standings[group]} selectedTeamId={selectedTeamId} onSelectTeam={setSelectedTeamId} />
        ))}
      </div>
      <div className="thirdsPanel">
        <h3>Ranking de terceros lugares</h3>
        <div className="tableWrap">
          <table>
            <thead><tr><th>#</th><th>Equipo</th><th>Grupo</th><th>Pts</th><th>DG</th><th>GF</th><th>Fair play</th><th>Ranking FIFA</th></tr></thead>
            <tbody>
              {thirds.map((row, index) => (
                <tr key={row.team.id} className={index < 8 ? 'qualified' : ''}>
                  <td>{index + 1}</td>
                  <td className="teamCell"><button className="teamButton" onClick={() => setSelectedTeamId(row.team.id)}>{teamLabel(row.team)}</button></td>
                  <td>{row.group}</td><td>{row.points}</td><td>{row.gd}</td><td>{row.gf}</td><td>{row.fairPlay}</td><td>{row.fifaRank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function KnockoutSection({ scores, setScores, extras }: { scores: ScoresByMatch; setScores: Dispatch<SetStateAction<ScoresByMatch>>; extras: ExtraTeamCriteria }) {
  const knockout = useMemo(() => MATCHES.filter((match) => match.phase !== 'Grupo').sort((a, b) => phaseOrder(a.phase) - phaseOrder(b.phase) || a.no - b.no), []);
  const complete = groupStageComplete(scores);

  return (
    <section>
      <div className="sectionTitle">
        <div>
          <h2>Eliminatorias</h2>
          <p>Los cruces se alimentan automáticamente desde grupos, mejores terceros y ganadores de rondas previas.</p>
        </div>
      </div>
      {!complete && <div className="notice">Aún no están capturados todos los resultados de grupos. La llave mostrará equipos conforme se puedan resolver.</div>}
      <div className="roundGrid">
        {['16avos','Octavos','Cuartos','Semifinal','Tercer lugar','Final'].map((phase) => (
          <div className="roundColumn" key={phase}>
            <h3>{phase}</h3>
            {knockout.filter((match) => match.phase === phase).map((match) => (
              <MatchCard key={match.no} match={match} scores={scores} setScores={setScores} extras={extras} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function VenuesSection({ scores, extras }: { scores: ScoresByMatch; extras: ExtraTeamCriteria }) {
  const cities = useMemo(() => Array.from(new Set(MATCHES.map((match) => match.city))).sort((a, b) => a.localeCompare(b, 'es')), []);
  const [selectedCity, setSelectedCity] = useState<string>('Monterrey');
  const city = cities.includes(selectedCity) ? selectedCity : cities[0];
  const matches = useMemo(() => MATCHES.filter((match) => match.city === city).sort((a, b) => new Date(a.etKickoff).getTime() - new Date(b.etKickoff).getTime() || a.no - b.no), [city]);

  return (
    <section>
      <div className="sectionTitle">
        <div>
          <h2>Sedes</h2>
          <p>Consulta el calendario por ciudad. Los partidos de eliminación directa se actualizan con los países que vayan avanzando.</p>
        </div>
      </div>
      <div className="cityLayout">
        <div className="cityList">
          {cities.map((item) => (
            <button key={item} className={item === city ? 'cityButton activeCity' : 'cityButton'} onClick={() => setSelectedCity(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="detailPanel cityPanel">
          <h3>{city}</h3>
          <div className="tableWrap">
            <table>
              <thead><tr><th>Partido</th><th>Fase</th><th>País vs país</th><th>Fecha</th><th>Hora MTY</th><th>Sede</th></tr></thead>
              <tbody>
                {matches.map((match) => {
                  const { home, away } = resolveMatchTeams(match, scores, extras);
                  const { date, time } = formatInMonterrey(match.etKickoff);
                  return (
                    <tr key={match.no}>
                      <td>M{match.no}</td>
                      <td>{match.phase}{match.group ? ` · G${match.group}` : ''}</td>
                      <td>{home.team ? teamLabel(home.team) : home.label} vs {away.team ? teamLabel(away.team) : away.label}</td>
                      <td>{date}</td>
                      <td>{time}</td>
                      <td>{match.venue}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function CriteriaSection({ extras, setExtras }: { extras: ExtraTeamCriteria; setExtras: Dispatch<SetStateAction<ExtraTeamCriteria>> }) {
  const teams = Object.values(TEAMS).sort((a, b) => a.group.localeCompare(b.group) || a.fifaRank - b.fifaRank);

  const updateExtra = (teamId: string, key: 'fairPlay' | 'fifaRank', value: string) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    setExtras((prev) => ({
      ...prev,
      [teamId]: { ...(prev[teamId] ?? { fairPlay: 0, fifaRank: TEAMS[teamId].fifaRank }), [key]: n },
    }));
  };

  return (
    <section>
      <div className="sectionTitle">
        <div>
          <h2>Criterios FIFA implementados</h2>
          <p>Los criterios extra permiten completar desempates cuando los marcadores no bastan.</p>
        </div>
      </div>
      <div className="criteriaGrid">
        <div className="criteriaCard">
          <h3>Orden dentro de cada grupo</h3>
          <ol>
            <li>Puntos: victoria 3, empate 1, derrota 0.</li>
            <li>Puntos en partidos entre los equipos empatados.</li>
            <li>Diferencia de goles en partidos entre equipos empatados.</li>
            <li>Goles anotados en partidos entre equipos empatados.</li>
            <li>Diferencia de goles general.</li>
            <li>Goles anotados generales.</li>
            <li>Puntaje de conducta / fair play.</li>
            <li>Ranking FIFA/Coca-Cola masculino.</li>
          </ol>
        </div>
        <div className="criteriaCard">
          <h3>Mejores terceros</h3>
          <ol>
            <li>Puntos.</li>
            <li>Diferencia de goles.</li>
            <li>Goles anotados.</li>
            <li>Puntaje de conducta / fair play.</li>
            <li>Ranking FIFA/Coca-Cola masculino.</li>
          </ol>
        </div>
        <div className="criteriaCard">
          <h3>Eliminación directa</h3>
          <p>Si hay empate en fase de eliminación, la app permite elegir manualmente al ganador por tiempo extra o penales.</p>
        </div>
      </div>
      <div className="thirdsPanel">
        <h3>Ajustar fair play y ranking FIFA</h3>
        <p className="muted">Fair play: amarillo -1, doble amarilla -3, roja directa -4, amarilla + roja directa -5. El ranking FIFA menor es mejor.</p>
        <div className="tableWrap">
          <table>
            <thead><tr><th>Grupo</th><th>Equipo</th><th>Fair play</th><th>Ranking FIFA</th></tr></thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id}>
                  <td>{team.group}</td>
                  <td className="teamCell">{teamLabel(team)}</td>
                  <td><input className="smallInput" type="number" value={extras[team.id]?.fairPlay ?? 0} onChange={(event) => updateExtra(team.id, 'fairPlay', event.target.value)} /></td>
                  <td><input className="smallInput" type="number" min="1" value={extras[team.id]?.fifaRank ?? team.fifaRank} onChange={(event) => updateExtra(team.id, 'fifaRank', event.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('faseGrupos');
  const [scores, setScores] = useState<ScoresByMatch>({});
  const [extras, setExtras] = useState<ExtraTeamCriteria>(defaultExtras());
  const [hydrated, setHydrated] = useState(false);
  const [dailyPrompt, setDailyPrompt] = useState<DailyPromptState>(null);
  const [dateFilter, setDateFilter] = useState<string>('todos');
  const completed = Object.values(scores).filter(scoreIsComplete).length;

  useEffect(() => {
    try {
      const seed = seededOfficialScores();
      const storedScores = window.localStorage.getItem(STORAGE_RESULTS) ?? window.localStorage.getItem('wc2026-results-v1');
      const parsedScores = storedScores ? JSON.parse(storedScores) as ScoresByMatch : {};
      setScores(mergeMissingScores(parsedScores, seed));

      const storedExtras = window.localStorage.getItem(STORAGE_EXTRAS);
      if (storedExtras) setExtras({ ...defaultExtras(), ...JSON.parse(storedExtras) });
    } catch {
      setScores(seededOfficialScores());
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_RESULTS, JSON.stringify(scores));
  }, [scores, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_EXTRAS, JSON.stringify(extras));
  }, [extras, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const dateKey = todayKeyInMonterrey();
    const todaysMatches = getMatchesForDate(dateKey);
    if (todaysMatches.length === 0) return;
    const latestEnd = new Date(Math.max(...todaysMatches.map((match) => estimatedEndTime(match).getTime())));
    const missing = todaysMatches.filter((match) => !scoreIsComplete(scores[match.no]));
    if (new Date() >= latestEnd && missing.length > 0) setDailyPrompt({ dateKey, matches: missing });
  }, [scores, hydrated]);

  const reset = () => {
    if (!window.confirm('¿Borrar todos los marcadores manuales y criterios extra? Se conservarán los resultados oficiales precargados.')) return;
    setScores(seededOfficialScores());
    setExtras(defaultExtras());
  };

  const applyOfficialResults = async (dateKey: string) => {
    setDailyPrompt((prev) => prev ? { ...prev, loading: true, message: 'Consultando resultados disponibles...' } : prev);
    try {
      const response = await fetch(`/api/results?date=${dateKey}`);
      const payload = await response.json() as { results?: OfficialResult[] };
      const results = payload.results ?? [];
      if (results.length === 0) {
        setDailyPrompt((prev) => prev ? { ...prev, loading: false, message: 'Todavía no hay resultados cargados para este día. Puedes registrarlos manualmente.' } : prev);
        return;
      }
      setScores((prev) => mergeMissingScores(prev, scoresFromOfficialResults(results)));
      setDailyPrompt((prev) => prev ? { ...prev, loading: false, message: `Se registraron ${results.length} resultado(s) disponible(s).` } : prev);
      window.setTimeout(() => setDailyPrompt(null), 1200);
    } catch {
      setDailyPrompt((prev) => prev ? { ...prev, loading: false, message: 'No se pudo consultar la fuente de resultados. Regístralos manualmente.' } : prev);
    }
  };

  const manualEntryForDay = (dateKey: string) => {
    const dayMatches = getMatchesForDate(dateKey);
    setDateFilter(dateKey);
    setTab(dayMatches.some((match) => match.phase !== 'Grupo') ? 'eliminatorias' : 'faseGrupos');
    setDailyPrompt(null);
  };

  return (
    <main>
      <Header />
      <DailyResultsPrompt
        prompt={dailyPrompt}
        onAccept={() => dailyPrompt && applyOfficialResults(dailyPrompt.dateKey)}
        onManual={() => dailyPrompt && manualEntryForDay(dailyPrompt.dateKey)}
        onDismiss={() => setDailyPrompt(null)}
      />
      <nav className="tabs">
        <button className={tab === 'faseGrupos' ? 'active' : ''} onClick={() => setTab('faseGrupos')}>Fase de grupos</button>
        <button className={tab === 'estadisticas' ? 'active' : ''} onClick={() => setTab('estadisticas')}>Estadísticas</button>
        <button className={tab === 'eliminatorias' ? 'active' : ''} onClick={() => setTab('eliminatorias')}>Eliminatorias</button>
        <button className={tab === 'sedes' ? 'active' : ''} onClick={() => setTab('sedes')}>Sedes</button>
        <button className={tab === 'criterios' ? 'active' : ''} onClick={() => setTab('criterios')}>Criterios FIFA</button>
      </nav>
      <div className="statusBar">
        <span>{completed} / 104 marcadores capturados · Resultados del 11 de junio ya precargados</span>
        <button onClick={reset} className="ghostBtn">Reiniciar</button>
      </div>
      {tab === 'faseGrupos' && <GroupStageSection scores={scores} setScores={setScores} extras={extras} dateFilter={dateFilter} setDateFilter={setDateFilter} />}
      {tab === 'estadisticas' && <StatisticsSection scores={scores} extras={extras} />}
      {tab === 'eliminatorias' && <KnockoutSection scores={scores} setScores={setScores} extras={extras} />}
      {tab === 'sedes' && <VenuesSection scores={scores} extras={extras} />}
      {tab === 'criterios' && <CriteriaSection extras={extras} setExtras={setExtras} />}
    </main>
  );
}
