import { OFFICIAL_RESULTS } from '@/lib/officialResults';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const results = date ? OFFICIAL_RESULTS.filter((result) => result.date === date) : OFFICIAL_RESULTS;

  return Response.json({
    date,
    results,
    note: 'Resultados precargados en la app a partir de marcadores publicados. Para conexión oficial en vivo se debe integrar un feed/API autorizado.',
  });
}
