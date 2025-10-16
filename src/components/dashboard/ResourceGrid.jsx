const resources = [
  { name: "Servers", count: 1 },
  { name: "Primary IPs", count: 2 },
  { name: "Volumes", count: 0 },
  { name: "Firewalls", count: 0 },
  { name: "Storage Boxes", count: 0 },
  { name: "Load Balancers", count: 0 },
  { name: "Floating IPs", count: 0 },
  { name: "Networks", count: 0 },
  { name: "Buckets", count: 0 },
  { name: "DNS Zones", count: 0 },
];

const ResourceGrid = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">All Locations</h2>
      <div className="grid grid-cols-2 gap-4">
        {resources.map((res) => (
          <div key={res.name} className="flex items-center gap-2">
            <span className="text-red-500">{res.count}</span>
            <span className="text-gray-300 text-sm">{res.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceGrid;
