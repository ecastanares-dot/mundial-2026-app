'use client';

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { GROUPS, MATCHES, TEAMS, type GroupLetter, type Match, type Team } from '@/lib/data';
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

type Tab = 'calendario' | 'grupos' | 'eliminatorias' | 'criterios';

const STORAGE_RESULTS = 'wc2026-results-v1';
const STORAGE_EXTRAS = 'wc2026-extra-criteria-v1';

function defaultExtras(): ExtraTeamCriteria {
  return Object.fromEntries(Object.values(TEAMS).map((team) => [team.id, { fairPlay: 0, fifaRank: team.fifaRank }])) as ExtraTeamCriteria;
}

function parseScoreValue(value: string) {
  if (value.trim() === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
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
        <span>⚽</span>
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
        winnerId: key === 'home' || key === 'away' ? prev[match.no]?.winnerId : undefined,
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
        onChange={(e) => update('home', e.target.value)}
        disabled={!home || !away}
      />
      <span className="scoreSep">-</span>
      <input
        aria-label={`Goles de ${away?.name ?? 'equipo 2'} en partido ${match.no}`}
        type="number"
        min="0"
        inputMode="numeric"
        value={score.away ?? ''}
        onChange={(e) => update('away', e.target.value)}
        disabled={!home || !away}
      />
      {isKnockout && isDraw && home && away && (
        <select value={score.winnerId ?? ''} onChange={(e) => updateWinner(e.target.value)} className="winnerSelect">
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
        <span className={`phase phase-${match.phase.replaceAll(' ', '-').toLowerCase()}`}>{match.phase}{match.group ? ` · Grupo ${match.group}` : ''}</span>
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

function CalendarSection({ scores, setScores, extras }: { scores: ScoresByMatch; setScores: Dispatch<SetStateAction<ScoresByMatch>>; extras: ExtraTeamCriteria }) {
  const [filter, setFilter] = useState<'todos' | Match['phase']>('todos');
  const matches = useMemo(() => {
    return [...MATCHES]
      .filter((m) => filter === 'todos' || m.phase === filter)
      .sort((a, b) => new Date(a.etKickoff).getTime() - new Date(b.etKickoff).getTime() || a.no - b.no);
  }, [filter]);

  const phases = ['todos','Grupo','16avos','Octavos','Cuartos','Semifinal','Tercer lugar','Final'] as const;

  return (
    <section>
      <div className="sectionTitle">
        <div>
          <h2>Calendario y captura de marcadores</h2>
          <p>Todos los horarios se muestran en hora de Monterrey, México.</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          {phases.map((p) => <option key={p} value={p}>{p === 'todos' ? 'Todos los partidos' : p}</option>)}
        </select>
      </div>
      <div className="matchGrid">
        {matches.map((match) => <MatchCard key={match.no} match={match} scores={scores} setScores={setScores} extras={extras} />)}
      </div>
    </section>
  );
}

function StandingsTable({ group, rows }: { group: GroupLetter; rows: ReturnType<typeof calculateStandings>['standings'][GroupLetter] }) {
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
              <tr key={row.team.id} className={index < 2 ? 'qualified' : index === 2 ? 'third' : ''}>
                <td>{index + 1}</td>
                <td className="teamCell">{teamLabel(row.team)}</td>
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

function GroupsSection({ scores, extras }: { scores: ScoresByMatch; extras: ExtraTeamCriteria }) {
  const { standings } = useMemo(() => calculateStandings(scores, extras), [scores, extras]);
  const thirds = useMemo(() => rankThirdPlaces(scores, extras), [scores, extras]);

  return (
    <section>
      <div className="sectionTitle">
        <div>
          <h2>Grupos actualizados</h2>
          <p>Clasifican los dos primeros de cada grupo y los ocho mejores terceros.</p>
        </div>
      </div>
      <div className="legend">
        <span><i className="dot qualifiedDot" /> Clasificación directa</span>
        <span><i className="dot thirdDot" /> Zona de terceros</span>
      </div>
      <div className="groupsGrid">
        {(Object.keys(GROUPS) as GroupLetter[]).map((group) => <StandingsTable key={group} group={group} rows={standings[group]} />)}
      </div>
      <div className="thirdsPanel">
        <h3>Ranking de terceros lugares</h3>
        <div className="tableWrap">
          <table>
            <thead><tr><th>#</th><th>Equipo</th><th>Grupo</th><th>Pts</th><th>DG</th><th>GF</th><th>Fair play</th><th>Ranking FIFA</th></tr></thead>
            <tbody>
              {thirds.map((row, idx) => (
                <tr key={row.team.id} className={idx < 8 ? 'qualified' : ''}>
                  <td>{idx + 1}</td><td className="teamCell">{teamLabel(row.team)}</td><td>{row.group}</td><td>{row.points}</td><td>{row.gd}</td><td>{row.gf}</td><td>{row.fairPlay}</td><td>{row.fifaRank}</td>
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
  const knockout = useMemo(() => MATCHES.filter((m) => m.phase !== 'Grupo').sort((a, b) => phaseOrder(a.phase) - phaseOrder(b.phase) || a.no - b.no), []);
  const complete = groupStageComplete(scores);

  return (
    <section>
      <div className="sectionTitle">
        <div>
          <h2>Eliminatorias directas</h2>
          <p>Los cruces se alimentan automáticamente desde grupos, mejores terceros y ganadores de rondas previas.</p>
        </div>
      </div>
      {!complete && <div className="notice">Aún no están capturados todos los resultados de grupos. La llave mostrará equipos conforme se puedan resolver.</div>}
      <div className="roundGrid">
        {['16avos','Octavos','Cuartos','Semifinal','Tercer lugar','Final'].map((phase) => (
          <div className="roundColumn" key={phase}>
            <h3>{phase}</h3>
            {knockout.filter((m) => m.phase === phase).map((match) => (
              <MatchCard key={match.no} match={match} scores={scores} setScores={setScores} extras={extras} />
            ))}
          </div>
        ))}
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
                  <td><input className="smallInput" type="number" value={extras[team.id]?.fairPlay ?? 0} onChange={(e) => updateExtra(team.id, 'fairPlay', e.target.value)} /></td>
                  <td><input className="smallInput" type="number" min="1" value={extras[team.id]?.fifaRank ?? team.fifaRank} onChange={(e) => updateExtra(team.id, 'fifaRank', e.target.value)} /></td>
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
  const [tab, setTab] = useState<Tab>('calendario');
  const [scores, setScores] = useState<ScoresByMatch>({});
  const [extras, setExtras] = useState<ExtraTeamCriteria>(defaultExtras());
  const completed = Object.values(scores).filter(scoreIsComplete).length;

  useEffect(() => {
    try {
      const storedScores = window.localStorage.getItem(STORAGE_RESULTS);
      if (storedScores) setScores(JSON.parse(storedScores));
      const storedExtras = window.localStorage.getItem(STORAGE_EXTRAS);
      if (storedExtras) setExtras({ ...defaultExtras(), ...JSON.parse(storedExtras) });
    } catch {
      // Si el almacenamiento local está corrupto, la app arranca limpia.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_RESULTS, JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_EXTRAS, JSON.stringify(extras));
  }, [extras]);

  const reset = () => {
    if (!window.confirm('¿Borrar todos los marcadores y criterios extra?')) return;
    setScores({});
    setExtras(defaultExtras());
  };

  return (
    <main>
      <Header />
      <nav className="tabs">
        <button className={tab === 'calendario' ? 'active' : ''} onClick={() => setTab('calendario')}>Calendario</button>
        <button className={tab === 'grupos' ? 'active' : ''} onClick={() => setTab('grupos')}>Grupos</button>
        <button className={tab === 'eliminatorias' ? 'active' : ''} onClick={() => setTab('eliminatorias')}>Eliminatorias</button>
        <button className={tab === 'criterios' ? 'active' : ''} onClick={() => setTab('criterios')}>Criterios FIFA</button>
      </nav>
      <div className="statusBar">
        <span>{completed} / 104 marcadores capturados</span>
        <button onClick={reset} className="ghostBtn">Reiniciar</button>
      </div>
      {tab === 'calendario' && <CalendarSection scores={scores} setScores={setScores} extras={extras} />}
      {tab === 'grupos' && <GroupsSection scores={scores} extras={extras} />}
      {tab === 'eliminatorias' && <KnockoutSection scores={scores} setScores={setScores} extras={extras} />}
      {tab === 'criterios' && <CriteriaSection extras={extras} setExtras={setExtras} />}
    </main>
  );
}
