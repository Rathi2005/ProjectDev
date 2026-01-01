import { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";

export default function LiveDemoChart({
  title = "CPU Usage",
  min = 20,
  max = 80,
  color = "#22c55e",
  height = 320,
  points = 20,
  intervalMs = 1000,
}) {
  const [series, setSeries] = useState([
    { name: title, data: [] },
  ]);

  const generateMetric = (min, max) =>
    +(Math.random() * (max - min) + min).toFixed(2);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeries((prev) => [
        {
          ...prev[0],
          data: [
            ...prev[0].data.slice(-points),
            {
              x: new Date(),
              y: generateMetric(min, max),
            },
          ],
        },
      ]);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [min, max, points, intervalMs]);

  const options = useMemo(
    () => ({
      chart: {
        type: "line",
        animations: { enabled: true },
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      xaxis: { type: "datetime" },
      yaxis: {
        min: 0,
        max: 100,
        labels: { style: { colors: "#cbd5f5" } },
      },
      stroke: { curve: "smooth", width: 3 },
      colors: [color],
      grid: { borderColor: "#334155" },
      tooltip: { theme: "dark" },
    }),
    [color]
  );

  return (
    <div className="bg-slate-900 p-4 rounded-xl shadow-lg w-full h-full">
      <h2 className="text-white mb-3 text-sm font-medium">{title}</h2>
      <Chart
        options={options}
        series={series}
        type="line"
        height={height}
        width="100%"
      />
    </div>
  );
}
