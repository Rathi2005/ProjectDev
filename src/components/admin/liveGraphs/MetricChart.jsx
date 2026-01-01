import Chart from "react-apexcharts";
import { useMemo } from "react";

export default function MetricChart({
  title,
  data,
  extract,
  color = "#6366f1",
  height = 280,
  points = 30,
}) {
  const series = useMemo(() => {
    if (!data) return [{ name: title, data: [] }];

    const source =
      data.history && data.history.length > 0
        ? data.history
        : data.current
        ? [data.current]
        : [];

    return [
      {
        name: title,
        data: source.slice(-points).map((h) => ({
          x: new Date((h.time ?? Date.now() / 1000) * 1000),
          y: extract(h),
        })),
      },
    ];
  }, [data, extract, points, title]);

  const options = useMemo(
    () => ({
      chart: {
        animations: { enabled: true },
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      xaxis: { type: "datetime" },
      stroke: { curve: "smooth", width: 3 },
      colors: [color],
      tooltip: { theme: "dark" },
      grid: { borderColor: "#334155" },
      yaxis: {
        labels: { formatter: (v) => `${v}` },
      },
    }),
    [color]
  );

  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
      <h3 className="text-sm text-gray-300 mb-2">{title}</h3>
      <Chart options={options} series={series} type="line" height={height} />
    </div>
  );
}
