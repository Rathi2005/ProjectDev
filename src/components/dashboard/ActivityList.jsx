const activities = [
  { action: "Server started", time: "4 minutes ago" },
  { action: "Server created", time: "4 minutes ago" },
  { action: "Primary IP created", time: "4 minutes ago" },
  { action: "Primary IP created", time: "4 minutes ago" },
  { action: "Server is being created", time: "4 minutes ago" },
];

const ActivityList = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Activities</h2>
        <button className="text-sm text-indigo-400 hover:underline">View all</button>
      </div>
      <ul className="space-y-3">
        {activities.map((activity, index) => (
          <li key={index} className="flex items-start gap-2">
            <div className="w-2 h-2 mt-2 bg-green-500 rounded-full" />
            <div>
              <p className="text-sm text-white">{activity.action}</p>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityList;
