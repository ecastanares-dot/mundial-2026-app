# Mundial 2026 · Simulador de resultados

Aplicación web en Next.js para consultar el calendario del Mundial FIFA 2026 en horario de Monterrey, capturar marcadores, actualizar tablas de grupo y propagar equipos en eliminatorias.

## Funciones incluidas

- Calendario completo de 104 partidos.
- Pestaña **Fase de grupos** con filtro por día y captura de marcadores.
- Aviso diario al cierre estimado del último partido para registrar resultados pendientes automáticamente o capturarlos manualmente.
- Resultados del 11 de junio de 2026 precargados: México 2-0 Sudáfrica y Corea del Sur 2-1 Chequia.
- Horarios formateados en zona horaria `America/Monterrey`.
- Captura de marcador al lado de cada equipo.
- Cálculo de puntos de fase de grupos: 3 por triunfo, 1 por empate, 0 por derrota.
- Ordenamiento de grupos con criterios FIFA: enfrentamiento directo entre equipos empatados, diferencia de goles, goles a favor, fair play y ranking FIFA.
- Ranking de mejores terceros.
- Pestaña **Estadísticas** con tablas de grupo y ficha de partidos por país al dar clic en una selección.
- Pestaña **Sedes** con calendario por ciudad; los cruces de eliminación se actualizan conforme se resuelven.
- Dieciseisavos, octavos, cuartos, semifinales, tercer lugar y final.
- Propagación automática de ganadores en eliminatorias.
- Selector de ganador cuando una eliminatoria queda empatada en marcador capturado, para simular tiempo extra/penales.
- Banderas junto a cada selección.
- Persistencia local en el navegador con `localStorage`.

## Cómo ejecutar localmente

```bash
npm install
npm run dev
```

Después abre `http://localhost:3000`.

## Cómo subir a GitHub y Vercel

1. Crea un repositorio en GitHub.
2. Sube todos los archivos de esta carpeta.
3. En Vercel, selecciona **Add New Project** e importa el repositorio.
4. Framework preset: **Next.js**.
5. Build command: `npm run build`.
6. Output: automático para Next.js.
7. Deploy.

## Notas de mantenimiento

- Los equipos, grupos y partidos están en `lib/data.ts`.
- Las reglas de cálculo y ordenamiento están en `lib/rules.ts`.
- Los resultados precargados y el endpoint interno `/api/results` están en `lib/officialResults.ts`.
- Los ajustes manuales de fair play y ranking FIFA están en la pestaña **Criterios FIFA**.
- Si FIFA modifica horarios o sedes, actualiza el arreglo `MATCHES` en `lib/data.ts`.
- Para conexión automática con resultados oficiales en vivo se requiere integrar un feed/API autorizado; la versión actual incluye resultados precargados y un endpoint interno para mantenimiento diario.

## Fuentes usadas

- FIFA World Cup 26 Match Schedule, versión consultada con grupos oficiales y nota de horarios ET.
- FIFA World Cup 2026 Regulations, artículos 12, 13 y 14 para formato, clasificación, desempates, mejores terceros y eliminatorias.
