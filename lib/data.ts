export type GroupLetter = 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L';

export type Team = {
  id: string;
  name: string;
  shortName: string;
  group: GroupLetter;
  flag: string;
  fifaRank: number;
};

export type MatchPhase = 'Grupo' | '16avos' | 'Octavos' | 'Cuartos' | 'Semifinal' | 'Tercer lugar' | 'Final';
export type ThirdSlot = '1A'|'1B'|'1D'|'1E'|'1G'|'1I'|'1K'|'1L';

export type Entrant =
  | { type: 'team'; teamId: string }
  | { type: 'groupRank'; group: GroupLetter; rank: 1 | 2 }
  | { type: 'thirdPlace'; allowedGroups: GroupLetter[]; slot: ThirdSlot }
  | { type: 'winner'; matchNo: number }
  | { type: 'loser'; matchNo: number };

export type Match = {
  no: number;
  phase: MatchPhase;
  group?: GroupLetter;
  etKickoff: string; // horario oficial Eastern Time. Se formatea en la app como America/Monterrey.
  venue: string;
  city: string;
  home: Entrant;
  away: Entrant;
};

export const GROUPS: Record<GroupLetter, string[]> = {
  A: ['MEX','RSA','KOR','CZE'],
  B: ['CAN','BIH','QAT','SUI'],
  C: ['BRA','MAR','HAI','SCO'],
  D: ['USA','PAR','AUS','TUR'],
  E: ['GER','CUW','CIV','ECU'],
  F: ['NED','JPN','SWE','TUN'],
  G: ['BEL','EGY','IRN','NZL'],
  H: ['ESP','CPV','KSA','URU'],
  I: ['FRA','SEN','IRQ','NOR'],
  J: ['ARG','ALG','AUT','JOR'],
  K: ['POR','COD','UZB','COL'],
  L: ['ENG','CRO','GHA','PAN'],
};

export const TEAMS: Record<string, Team> = {
  MEX: { id:'MEX', name:'México', shortName:'México', group:'A', flag:'🇲🇽', fifaRank:15 },
  RSA: { id:'RSA', name:'Sudáfrica', shortName:'Sudáfrica', group:'A', flag:'🇿🇦', fifaRank:56 },
  KOR: { id:'KOR', name:'Corea del Sur', shortName:'Corea', group:'A', flag:'🇰🇷', fifaRank:23 },
  CZE: { id:'CZE', name:'Chequia', shortName:'Chequia', group:'A', flag:'🇨🇿', fifaRank:37 },

  CAN: { id:'CAN', name:'Canadá', shortName:'Canadá', group:'B', flag:'🇨🇦', fifaRank:30 },
  BIH: { id:'BIH', name:'Bosnia y Herzegovina', shortName:'Bosnia', group:'B', flag:'🇧🇦', fifaRank:66 },
  QAT: { id:'QAT', name:'Catar', shortName:'Catar', group:'B', flag:'🇶🇦', fifaRank:53 },
  SUI: { id:'SUI', name:'Suiza', shortName:'Suiza', group:'B', flag:'🇨🇭', fifaRank:19 },

  BRA: { id:'BRA', name:'Brasil', shortName:'Brasil', group:'C', flag:'🇧🇷', fifaRank:6 },
  MAR: { id:'MAR', name:'Marruecos', shortName:'Marruecos', group:'C', flag:'🇲🇦', fifaRank:8 },
  HAI: { id:'HAI', name:'Haití', shortName:'Haití', group:'C', flag:'🇭🇹', fifaRank:75 },
  SCO: { id:'SCO', name:'Escocia', shortName:'Escocia', group:'C', flag:'🏴', fifaRank:39 },

  USA: { id:'USA', name:'Estados Unidos', shortName:'EE. UU.', group:'D', flag:'🇺🇸', fifaRank:16 },
  PAR: { id:'PAR', name:'Paraguay', shortName:'Paraguay', group:'D', flag:'🇵🇾', fifaRank:48 },
  AUS: { id:'AUS', name:'Australia', shortName:'Australia', group:'D', flag:'🇦🇺', fifaRank:27 },
  TUR: { id:'TUR', name:'Turquía', shortName:'Turquía', group:'D', flag:'🇹🇷', fifaRank:22 },

  GER: { id:'GER', name:'Alemania', shortName:'Alemania', group:'E', flag:'🇩🇪', fifaRank:10 },
  CUW: { id:'CUW', name:'Curazao', shortName:'Curazao', group:'E', flag:'🇨🇼', fifaRank:82 },
  CIV: { id:'CIV', name:'Costa de Marfil', shortName:'C. de Marfil', group:'E', flag:'🇨🇮', fifaRank:44 },
  ECU: { id:'ECU', name:'Ecuador', shortName:'Ecuador', group:'E', flag:'🇪🇨', fifaRank:23 },

  NED: { id:'NED', name:'Países Bajos', shortName:'P. Bajos', group:'F', flag:'🇳🇱', fifaRank:7 },
  JPN: { id:'JPN', name:'Japón', shortName:'Japón', group:'F', flag:'🇯🇵', fifaRank:18 },
  SWE: { id:'SWE', name:'Suecia', shortName:'Suecia', group:'F', flag:'🇸🇪', fifaRank:28 },
  TUN: { id:'TUN', name:'Túnez', shortName:'Túnez', group:'F', flag:'🇹🇳', fifaRank:49 },

  BEL: { id:'BEL', name:'Bélgica', shortName:'Bélgica', group:'G', flag:'🇧🇪', fifaRank:9 },
  EGY: { id:'EGY', name:'Egipto', shortName:'Egipto', group:'G', flag:'🇪🇬', fifaRank:32 },
  IRN: { id:'IRN', name:'Irán', shortName:'Irán', group:'G', flag:'🇮🇷', fifaRank:21 },
  NZL: { id:'NZL', name:'Nueva Zelanda', shortName:'N. Zelanda', group:'G', flag:'🇳🇿', fifaRank:89 },

  ESP: { id:'ESP', name:'España', shortName:'España', group:'H', flag:'🇪🇸', fifaRank:2 },
  CPV: { id:'CPV', name:'Cabo Verde', shortName:'Cabo Verde', group:'H', flag:'🇨🇻', fifaRank:63 },
  KSA: { id:'KSA', name:'Arabia Saudita', shortName:'Arabia S.', group:'H', flag:'🇸🇦', fifaRank:58 },
  URU: { id:'URU', name:'Uruguay', shortName:'Uruguay', group:'H', flag:'🇺🇾', fifaRank:17 },

  FRA: { id:'FRA', name:'Francia', shortName:'Francia', group:'I', flag:'🇫🇷', fifaRank:1 },
  SEN: { id:'SEN', name:'Senegal', shortName:'Senegal', group:'I', flag:'🇸🇳', fifaRank:20 },
  IRQ: { id:'IRQ', name:'Irak', shortName:'Irak', group:'I', flag:'🇮🇶', fifaRank:60 },
  NOR: { id:'NOR', name:'Noruega', shortName:'Noruega', group:'I', flag:'🇳🇴', fifaRank:31 },

  ARG: { id:'ARG', name:'Argentina', shortName:'Argentina', group:'J', flag:'🇦🇷', fifaRank:3 },
  ALG: { id:'ALG', name:'Argelia', shortName:'Argelia', group:'J', flag:'🇩🇿', fifaRank:35 },
  AUT: { id:'AUT', name:'Austria', shortName:'Austria', group:'J', flag:'🇦🇹', fifaRank:24 },
  JOR: { id:'JOR', name:'Jordania', shortName:'Jordania', group:'J', flag:'🇯🇴', fifaRank:64 },

  POR: { id:'POR', name:'Portugal', shortName:'Portugal', group:'K', flag:'🇵🇹', fifaRank:5 },
  COD: { id:'COD', name:'RD Congo', shortName:'RD Congo', group:'K', flag:'🇨🇩', fifaRank:61 },
  UZB: { id:'UZB', name:'Uzbekistán', shortName:'Uzbekistán', group:'K', flag:'🇺🇿', fifaRank:51 },
  COL: { id:'COL', name:'Colombia', shortName:'Colombia', group:'K', flag:'🇨🇴', fifaRank:12 },

  ENG: { id:'ENG', name:'Inglaterra', shortName:'Inglaterra', group:'L', flag:'🏴', fifaRank:4 },
  CRO: { id:'CRO', name:'Croacia', shortName:'Croacia', group:'L', flag:'🇭🇷', fifaRank:11 },
  GHA: { id:'GHA', name:'Ghana', shortName:'Ghana', group:'L', flag:'🇬🇭', fifaRank:71 },
  PAN: { id:'PAN', name:'Panamá', shortName:'Panamá', group:'L', flag:'🇵🇦', fifaRank:33 },
};

const T = (teamId: string): Entrant => ({ type: 'team', teamId });
const R = (group: GroupLetter, rank: 1 | 2): Entrant => ({ type: 'groupRank', group, rank });
const Third = (allowed: string, slot: ThirdSlot): Entrant => ({
  type: 'thirdPlace',
  allowedGroups: allowed.split('') as GroupLetter[],
  slot,
});
const W = (matchNo: number): Entrant => ({ type: 'winner', matchNo });
const L = (matchNo: number): Entrant => ({ type: 'loser', matchNo });

export const MATCHES: Match[] = [
  { no:1, phase:'Grupo', group:'A', etKickoff:'2026-06-11T15:00:00-04:00', venue:'Estadio Azteca', city:'Ciudad de México', home:T('MEX'), away:T('RSA') },
  { no:2, phase:'Grupo', group:'A', etKickoff:'2026-06-11T22:00:00-04:00', venue:'Estadio Akron', city:'Guadalajara', home:T('KOR'), away:T('CZE') },
  { no:3, phase:'Grupo', group:'B', etKickoff:'2026-06-12T15:00:00-04:00', venue:'BMO Field', city:'Toronto', home:T('CAN'), away:T('BIH') },
  { no:4, phase:'Grupo', group:'D', etKickoff:'2026-06-12T21:00:00-04:00', venue:'SoFi Stadium', city:'Los Ángeles', home:T('USA'), away:T('PAR') },
  { no:5, phase:'Grupo', group:'C', etKickoff:'2026-06-13T21:00:00-04:00', venue:'Gillette Stadium', city:'Boston', home:T('HAI'), away:T('SCO') },
  { no:6, phase:'Grupo', group:'D', etKickoff:'2026-06-13T00:00:00-04:00', venue:'BC Place', city:'Vancouver', home:T('AUS'), away:T('TUR') },
  { no:7, phase:'Grupo', group:'C', etKickoff:'2026-06-13T18:00:00-04:00', venue:'MetLife Stadium', city:'Nueva York / Nueva Jersey', home:T('BRA'), away:T('MAR') },
  { no:8, phase:'Grupo', group:'B', etKickoff:'2026-06-13T15:00:00-04:00', venue:"Levi's Stadium", city:'San Francisco Bay Area', home:T('QAT'), away:T('SUI') },
  { no:9, phase:'Grupo', group:'E', etKickoff:'2026-06-14T19:00:00-04:00', venue:'Lincoln Financial Field', city:'Filadelfia', home:T('CIV'), away:T('ECU') },
  { no:10, phase:'Grupo', group:'E', etKickoff:'2026-06-14T13:00:00-04:00', venue:'NRG Stadium', city:'Houston', home:T('GER'), away:T('CUW') },
  { no:11, phase:'Grupo', group:'F', etKickoff:'2026-06-14T16:00:00-04:00', venue:'AT&T Stadium', city:'Dallas', home:T('NED'), away:T('JPN') },
  { no:12, phase:'Grupo', group:'F', etKickoff:'2026-06-14T22:00:00-04:00', venue:'Estadio BBVA', city:'Monterrey', home:T('SWE'), away:T('TUN') },
  { no:13, phase:'Grupo', group:'H', etKickoff:'2026-06-15T18:00:00-04:00', venue:'Hard Rock Stadium', city:'Miami', home:T('KSA'), away:T('URU') },
  { no:14, phase:'Grupo', group:'H', etKickoff:'2026-06-15T12:00:00-04:00', venue:'Mercedes-Benz Stadium', city:'Atlanta', home:T('ESP'), away:T('CPV') },
  { no:15, phase:'Grupo', group:'G', etKickoff:'2026-06-15T21:00:00-04:00', venue:'SoFi Stadium', city:'Los Ángeles', home:T('IRN'), away:T('NZL') },
  { no:16, phase:'Grupo', group:'G', etKickoff:'2026-06-15T15:00:00-04:00', venue:'Lumen Field', city:'Seattle', home:T('BEL'), away:T('EGY') },
  { no:17, phase:'Grupo', group:'I', etKickoff:'2026-06-16T15:00:00-04:00', venue:'MetLife Stadium', city:'Nueva York / Nueva Jersey', home:T('FRA'), away:T('SEN') },
  { no:18, phase:'Grupo', group:'I', etKickoff:'2026-06-16T18:00:00-04:00', venue:'Gillette Stadium', city:'Boston', home:T('IRQ'), away:T('NOR') },
  { no:19, phase:'Grupo', group:'J', etKickoff:'2026-06-16T21:00:00-04:00', venue:'Arrowhead Stadium', city:'Kansas City', home:T('ARG'), away:T('ALG') },
  { no:20, phase:'Grupo', group:'J', etKickoff:'2026-06-16T00:00:00-04:00', venue:"Levi's Stadium", city:'San Francisco Bay Area', home:T('AUT'), away:T('JOR') },
  { no:21, phase:'Grupo', group:'L', etKickoff:'2026-06-17T19:00:00-04:00', venue:'BMO Field', city:'Toronto', home:T('GHA'), away:T('PAN') },
  { no:22, phase:'Grupo', group:'L', etKickoff:'2026-06-17T16:00:00-04:00', venue:'AT&T Stadium', city:'Dallas', home:T('ENG'), away:T('CRO') },
  { no:23, phase:'Grupo', group:'K', etKickoff:'2026-06-17T13:00:00-04:00', venue:'NRG Stadium', city:'Houston', home:T('POR'), away:T('COD') },
  { no:24, phase:'Grupo', group:'K', etKickoff:'2026-06-17T22:00:00-04:00', venue:'Estadio Azteca', city:'Ciudad de México', home:T('UZB'), away:T('COL') },
  { no:25, phase:'Grupo', group:'A', etKickoff:'2026-06-18T12:00:00-04:00', venue:'Mercedes-Benz Stadium', city:'Atlanta', home:T('CZE'), away:T('RSA') },
  { no:26, phase:'Grupo', group:'B', etKickoff:'2026-06-18T15:00:00-04:00', venue:'SoFi Stadium', city:'Los Ángeles', home:T('SUI'), away:T('BIH') },
  { no:27, phase:'Grupo', group:'B', etKickoff:'2026-06-18T18:00:00-04:00', venue:'BC Place', city:'Vancouver', home:T('CAN'), away:T('QAT') },
  { no:28, phase:'Grupo', group:'A', etKickoff:'2026-06-18T21:00:00-04:00', venue:'Estadio Akron', city:'Guadalajara', home:T('MEX'), away:T('KOR') },
  { no:29, phase:'Grupo', group:'C', etKickoff:'2026-06-19T21:00:00-04:00', venue:'Lincoln Financial Field', city:'Filadelfia', home:T('BRA'), away:T('HAI') },
  { no:30, phase:'Grupo', group:'C', etKickoff:'2026-06-19T18:00:00-04:00', venue:'Gillette Stadium', city:'Boston', home:T('SCO'), away:T('MAR') },
  { no:31, phase:'Grupo', group:'D', etKickoff:'2026-06-19T23:00:00-04:00', venue:"Levi's Stadium", city:'San Francisco Bay Area', home:T('TUR'), away:T('PAR') },
  { no:32, phase:'Grupo', group:'D', etKickoff:'2026-06-19T15:00:00-04:00', venue:'Lumen Field', city:'Seattle', home:T('USA'), away:T('AUS') },
  { no:33, phase:'Grupo', group:'E', etKickoff:'2026-06-20T16:00:00-04:00', venue:'BMO Field', city:'Toronto', home:T('GER'), away:T('CIV') },
  { no:34, phase:'Grupo', group:'E', etKickoff:'2026-06-20T20:00:00-04:00', venue:'Arrowhead Stadium', city:'Kansas City', home:T('ECU'), away:T('CUW') },
  { no:35, phase:'Grupo', group:'F', etKickoff:'2026-06-20T13:00:00-04:00', venue:'NRG Stadium', city:'Houston', home:T('NED'), away:T('SWE') },
  { no:36, phase:'Grupo', group:'F', etKickoff:'2026-06-20T00:00:00-04:00', venue:'Estadio BBVA', city:'Monterrey', home:T('TUN'), away:T('JPN') },
  { no:37, phase:'Grupo', group:'H', etKickoff:'2026-06-21T18:00:00-04:00', venue:'Hard Rock Stadium', city:'Miami', home:T('URU'), away:T('CPV') },
  { no:38, phase:'Grupo', group:'H', etKickoff:'2026-06-21T12:00:00-04:00', venue:'Mercedes-Benz Stadium', city:'Atlanta', home:T('ESP'), away:T('KSA') },
  { no:39, phase:'Grupo', group:'G', etKickoff:'2026-06-21T15:00:00-04:00', venue:'SoFi Stadium', city:'Los Ángeles', home:T('BEL'), away:T('IRN') },
  { no:40, phase:'Grupo', group:'G', etKickoff:'2026-06-21T21:00:00-04:00', venue:'BC Place', city:'Vancouver', home:T('NZL'), away:T('EGY') },
  { no:41, phase:'Grupo', group:'I', etKickoff:'2026-06-22T20:00:00-04:00', venue:'MetLife Stadium', city:'Nueva York / Nueva Jersey', home:T('NOR'), away:T('SEN') },
  { no:42, phase:'Grupo', group:'I', etKickoff:'2026-06-22T17:00:00-04:00', venue:'Lincoln Financial Field', city:'Filadelfia', home:T('FRA'), away:T('IRQ') },
  { no:43, phase:'Grupo', group:'J', etKickoff:'2026-06-22T13:00:00-04:00', venue:'AT&T Stadium', city:'Dallas', home:T('ARG'), away:T('AUT') },
  { no:44, phase:'Grupo', group:'J', etKickoff:'2026-06-22T23:00:00-04:00', venue:"Levi's Stadium", city:'San Francisco Bay Area', home:T('JOR'), away:T('ALG') },
  { no:45, phase:'Grupo', group:'L', etKickoff:'2026-06-23T16:00:00-04:00', venue:'Gillette Stadium', city:'Boston', home:T('ENG'), away:T('GHA') },
  { no:46, phase:'Grupo', group:'L', etKickoff:'2026-06-23T19:00:00-04:00', venue:'BMO Field', city:'Toronto', home:T('PAN'), away:T('CRO') },
  { no:47, phase:'Grupo', group:'K', etKickoff:'2026-06-23T13:00:00-04:00', venue:'NRG Stadium', city:'Houston', home:T('POR'), away:T('UZB') },
  { no:48, phase:'Grupo', group:'K', etKickoff:'2026-06-23T22:00:00-04:00', venue:'Estadio Akron', city:'Guadalajara', home:T('COL'), away:T('COD') },
  { no:49, phase:'Grupo', group:'C', etKickoff:'2026-06-24T18:00:00-04:00', venue:'Hard Rock Stadium', city:'Miami', home:T('SCO'), away:T('BRA') },
  { no:50, phase:'Grupo', group:'C', etKickoff:'2026-06-24T18:00:00-04:00', venue:'Mercedes-Benz Stadium', city:'Atlanta', home:T('MAR'), away:T('HAI') },
  { no:51, phase:'Grupo', group:'B', etKickoff:'2026-06-24T15:00:00-04:00', venue:'BC Place', city:'Vancouver', home:T('SUI'), away:T('CAN') },
  { no:52, phase:'Grupo', group:'B', etKickoff:'2026-06-24T15:00:00-04:00', venue:'Lumen Field', city:'Seattle', home:T('BIH'), away:T('QAT') },
  { no:53, phase:'Grupo', group:'A', etKickoff:'2026-06-24T21:00:00-04:00', venue:'Estadio Azteca', city:'Ciudad de México', home:T('CZE'), away:T('MEX') },
  { no:54, phase:'Grupo', group:'A', etKickoff:'2026-06-24T21:00:00-04:00', venue:'Estadio BBVA', city:'Monterrey', home:T('RSA'), away:T('KOR') },
  { no:55, phase:'Grupo', group:'E', etKickoff:'2026-06-25T16:00:00-04:00', venue:'Lincoln Financial Field', city:'Filadelfia', home:T('CUW'), away:T('CIV') },
  { no:56, phase:'Grupo', group:'E', etKickoff:'2026-06-25T16:00:00-04:00', venue:'MetLife Stadium', city:'Nueva York / Nueva Jersey', home:T('ECU'), away:T('GER') },
  { no:57, phase:'Grupo', group:'F', etKickoff:'2026-06-25T19:00:00-04:00', venue:'AT&T Stadium', city:'Dallas', home:T('JPN'), away:T('SWE') },
  { no:58, phase:'Grupo', group:'F', etKickoff:'2026-06-25T19:00:00-04:00', venue:'Arrowhead Stadium', city:'Kansas City', home:T('TUN'), away:T('NED') },
  { no:59, phase:'Grupo', group:'D', etKickoff:'2026-06-25T22:00:00-04:00', venue:'SoFi Stadium', city:'Los Ángeles', home:T('TUR'), away:T('USA') },
  { no:60, phase:'Grupo', group:'D', etKickoff:'2026-06-25T22:00:00-04:00', venue:"Levi's Stadium", city:'San Francisco Bay Area', home:T('PAR'), away:T('AUS') },
  { no:61, phase:'Grupo', group:'I', etKickoff:'2026-06-26T15:00:00-04:00', venue:'Gillette Stadium', city:'Boston', home:T('NOR'), away:T('FRA') },
  { no:62, phase:'Grupo', group:'I', etKickoff:'2026-06-26T15:00:00-04:00', venue:'BMO Field', city:'Toronto', home:T('SEN'), away:T('IRQ') },
  { no:63, phase:'Grupo', group:'G', etKickoff:'2026-06-26T23:00:00-04:00', venue:'Lumen Field', city:'Seattle', home:T('EGY'), away:T('IRN') },
  { no:64, phase:'Grupo', group:'G', etKickoff:'2026-06-26T23:00:00-04:00', venue:'BC Place', city:'Vancouver', home:T('NZL'), away:T('BEL') },
  { no:65, phase:'Grupo', group:'H', etKickoff:'2026-06-26T20:00:00-04:00', venue:'NRG Stadium', city:'Houston', home:T('CPV'), away:T('KSA') },
  { no:66, phase:'Grupo', group:'H', etKickoff:'2026-06-26T20:00:00-04:00', venue:'Estadio Akron', city:'Guadalajara', home:T('URU'), away:T('ESP') },
  { no:67, phase:'Grupo', group:'L', etKickoff:'2026-06-27T17:00:00-04:00', venue:'MetLife Stadium', city:'Nueva York / Nueva Jersey', home:T('PAN'), away:T('ENG') },
  { no:68, phase:'Grupo', group:'L', etKickoff:'2026-06-27T17:00:00-04:00', venue:'Lincoln Financial Field', city:'Filadelfia', home:T('CRO'), away:T('GHA') },
  { no:69, phase:'Grupo', group:'J', etKickoff:'2026-06-27T22:00:00-04:00', venue:'Arrowhead Stadium', city:'Kansas City', home:T('ALG'), away:T('AUT') },
  { no:70, phase:'Grupo', group:'J', etKickoff:'2026-06-27T22:00:00-04:00', venue:'AT&T Stadium', city:'Dallas', home:T('JOR'), away:T('ARG') },
  { no:71, phase:'Grupo', group:'K', etKickoff:'2026-06-27T19:30:00-04:00', venue:'Hard Rock Stadium', city:'Miami', home:T('COL'), away:T('POR') },
  { no:72, phase:'Grupo', group:'K', etKickoff:'2026-06-27T19:30:00-04:00', venue:'Mercedes-Benz Stadium', city:'Atlanta', home:T('COD'), away:T('UZB') },

  { no:73, phase:'16avos', etKickoff:'2026-06-28T15:00:00-04:00', venue:'SoFi Stadium', city:'Los Ángeles', home:R('A',2), away:R('B',2) },
  { no:74, phase:'16avos', etKickoff:'2026-06-29T16:30:00-04:00', venue:'Gillette Stadium', city:'Boston', home:R('E',1), away:Third('ABCDF','1E') },
  { no:75, phase:'16avos', etKickoff:'2026-06-29T21:00:00-04:00', venue:'Estadio BBVA', city:'Monterrey', home:R('F',1), away:R('C',2) },
  { no:76, phase:'16avos', etKickoff:'2026-06-29T13:00:00-04:00', venue:'NRG Stadium', city:'Houston', home:R('C',1), away:R('F',2) },
  { no:77, phase:'16avos', etKickoff:'2026-06-30T17:00:00-04:00', venue:'MetLife Stadium', city:'Nueva York / Nueva Jersey', home:R('I',1), away:Third('CDFGH','1I') },
  { no:78, phase:'16avos', etKickoff:'2026-06-30T13:00:00-04:00', venue:'AT&T Stadium', city:'Dallas', home:R('E',2), away:R('I',2) },
  { no:79, phase:'16avos', etKickoff:'2026-06-30T21:00:00-04:00', venue:'Estadio Azteca', city:'Ciudad de México', home:R('A',1), away:Third('CEFHI','1A') },
  { no:80, phase:'16avos', etKickoff:'2026-07-01T12:00:00-04:00', venue:'Mercedes-Benz Stadium', city:'Atlanta', home:R('L',1), away:Third('EHIJK','1L') },
  { no:81, phase:'16avos', etKickoff:'2026-07-01T20:00:00-04:00', venue:"Levi's Stadium", city:'San Francisco Bay Area', home:R('D',1), away:Third('BEFIJ','1D') },
  { no:82, phase:'16avos', etKickoff:'2026-07-01T16:00:00-04:00', venue:'Lumen Field', city:'Seattle', home:R('G',1), away:Third('AEHIJ','1G') },
  { no:83, phase:'16avos', etKickoff:'2026-07-02T19:00:00-04:00', venue:'BMO Field', city:'Toronto', home:R('K',2), away:R('L',2) },
  { no:84, phase:'16avos', etKickoff:'2026-07-02T15:00:00-04:00', venue:'SoFi Stadium', city:'Los Ángeles', home:R('H',1), away:R('J',2) },
  { no:85, phase:'16avos', etKickoff:'2026-07-02T23:00:00-04:00', venue:'BC Place', city:'Vancouver', home:R('B',1), away:Third('EFGIJ','1B') },
  { no:86, phase:'16avos', etKickoff:'2026-07-03T18:00:00-04:00', venue:'Hard Rock Stadium', city:'Miami', home:R('J',1), away:R('H',2) },
  { no:87, phase:'16avos', etKickoff:'2026-07-03T21:30:00-04:00', venue:'Arrowhead Stadium', city:'Kansas City', home:R('K',1), away:Third('DEIJL','1K') },
  { no:88, phase:'16avos', etKickoff:'2026-07-03T14:00:00-04:00', venue:'AT&T Stadium', city:'Dallas', home:R('D',2), away:R('G',2) },

  { no:89, phase:'Octavos', etKickoff:'2026-07-04T17:00:00-04:00', venue:'Lincoln Financial Field', city:'Filadelfia', home:W(74), away:W(77) },
  { no:90, phase:'Octavos', etKickoff:'2026-07-04T13:00:00-04:00', venue:'NRG Stadium', city:'Houston', home:W(73), away:W(75) },
  { no:91, phase:'Octavos', etKickoff:'2026-07-05T16:00:00-04:00', venue:'MetLife Stadium', city:'Nueva York / Nueva Jersey', home:W(76), away:W(78) },
  { no:92, phase:'Octavos', etKickoff:'2026-07-05T20:00:00-04:00', venue:'Estadio Azteca', city:'Ciudad de México', home:W(79), away:W(80) },
  { no:93, phase:'Octavos', etKickoff:'2026-07-06T15:00:00-04:00', venue:'AT&T Stadium', city:'Dallas', home:W(83), away:W(84) },
  { no:94, phase:'Octavos', etKickoff:'2026-07-06T20:00:00-04:00', venue:'Lumen Field', city:'Seattle', home:W(81), away:W(82) },
  { no:95, phase:'Octavos', etKickoff:'2026-07-07T12:00:00-04:00', venue:'Mercedes-Benz Stadium', city:'Atlanta', home:W(86), away:W(88) },
  { no:96, phase:'Octavos', etKickoff:'2026-07-07T16:00:00-04:00', venue:'BC Place', city:'Vancouver', home:W(85), away:W(87) },

  { no:97, phase:'Cuartos', etKickoff:'2026-07-09T16:00:00-04:00', venue:'Gillette Stadium', city:'Boston', home:W(89), away:W(90) },
  { no:98, phase:'Cuartos', etKickoff:'2026-07-10T15:00:00-04:00', venue:'SoFi Stadium', city:'Los Ángeles', home:W(93), away:W(94) },
  { no:99, phase:'Cuartos', etKickoff:'2026-07-11T17:00:00-04:00', venue:'Hard Rock Stadium', city:'Miami', home:W(91), away:W(92) },
  { no:100, phase:'Cuartos', etKickoff:'2026-07-11T21:00:00-04:00', venue:'Arrowhead Stadium', city:'Kansas City', home:W(95), away:W(96) },

  { no:101, phase:'Semifinal', etKickoff:'2026-07-14T15:00:00-04:00', venue:'AT&T Stadium', city:'Dallas', home:W(97), away:W(98) },
  { no:102, phase:'Semifinal', etKickoff:'2026-07-15T15:00:00-04:00', venue:'Mercedes-Benz Stadium', city:'Atlanta', home:W(99), away:W(100) },
  { no:103, phase:'Tercer lugar', etKickoff:'2026-07-18T17:00:00-04:00', venue:'Hard Rock Stadium', city:'Miami', home:L(101), away:L(102) },
  { no:104, phase:'Final', etKickoff:'2026-07-19T15:00:00-04:00', venue:'MetLife Stadium', city:'Nueva York / Nueva Jersey', home:W(101), away:W(102) },
];

export const MONTERREY_TIME_ZONE = 'America/Monterrey';
