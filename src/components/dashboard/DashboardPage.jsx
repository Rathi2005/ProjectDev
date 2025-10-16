import LocationMap from "./LocationMap";
import ResourceGrid from "./ResourceGrid";
import ActivityList from "./ActivityList";

const DashboardPage = () => {
  return (
      <main className="flex-1 flex flex-col md:flex-row gap-4 mt-10">
        {/* Map Section */}
        <div className="flex-1 bg-[#121a2a] rounded-xl shadow-lg p-4">
          <LocationMap />
        </div>

        {/* Resource Grid */}
        <div className="w-full md:w-[300px] bg-[#121a2a] rounded-xl shadow-lg p-4">
          <ResourceGrid />
        </div>

        {/* Activity List */}
        <div className="w-full md:w-[300px] bg-[#121a2a] rounded-xl shadow-lg p-4">
          <ActivityList />
        </div> 
          
        </main>
  );
};

export default DashboardPage;
