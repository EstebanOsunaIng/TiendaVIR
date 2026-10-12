/**
 * Barras simples en CSS, sin librería de gráficos: el alcance real son un
 * par de visualizaciones fijas (ver plan de rediseño), así que no amerita
 * una dependencia nueva. Los valores exactos ya están en la tabla
 * adyacente de cada página -- esto es solo el apoyo visual de tendencia,
 * por eso usa role="img" con un resumen en vez de listar cada barra.
 */
export function BarChart({
  data,
  formatValue,
}: {
  data: { label: string; value: number }[];
  formatValue: (value: number) => string;
}) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const summary = `Gráfico de barras con ${data.length} valores, de ${formatValue(
    Math.min(...data.map((d) => d.value)),
  )} a ${formatValue(max)}.`;

  return (
    <div role="img" aria-label={summary} className="flex h-40 items-end gap-1.5">
      {data.map((point, index) => (
        <div key={index} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1">
          <div
            className="w-full min-w-1 rounded-sm bg-primary/80 transition-colors group-hover:bg-primary"
            style={{ height: `${Math.max((point.value / max) * 100, point.value > 0 ? 3 : 0)}%` }}
          />
          <span className="pointer-events-none absolute -top-7 hidden rounded-md bg-foreground px-2 py-1 text-xs whitespace-nowrap text-background group-hover:block">
            {point.label}: {formatValue(point.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
