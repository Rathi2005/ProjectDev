import LocationSelector from "./TypeSelector";
import ImageSelector from "./ImageSelector";
import SummarySidebar from "./SummarySidebar";

const CreateServerPage = () => {
  return (
    <div className="flex bg-[#0e1525] text-white min-h-screen">
      {/* Left: Main content */}
      <div className="flex-1 p-8">
        <div className="text-sm text-gray-400 mb-4 cursor-pointer hover:underline">
          ← Back to servers
        </div>

        <h1 className="text-3xl font-bold mb-10">Create a server</h1>

        <div className="space-y-12">
          {/* Location Selection */}
          <div>
            <h2 className="text-xl font-semibold mb-2">✅ Location</h2>
            <p className="text-gray-400 text-sm mb-4 max-w-3xl">
              Choose a location for your server. You can only select some features, such as private Networks and Load Balancers,
              if they are in the same network zone as the server. You can only select Primary IPs and Volumes that are in the
              same location as the server.
            </p>
            <LocationSelector />
          </div>
        </div>
      </div>

      {/* Right: Summary Sidebar */}
      <SummarySidebar />
    </div>
  );
};

export default CreateServerPage;
