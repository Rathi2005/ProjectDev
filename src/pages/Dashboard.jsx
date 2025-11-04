import Sidebar from "../components/user/Sidebar";
import Header from "../components/user/Header";
import DashboardPage from "../components/user/dashboard/DashboardPage";
import CreateServerPage from "../components/user/server/CreateServerPage";
import ImageSelector from "../components/server/ImageSelector";
import TypeSelector from "../components/server/TypeSelector";

export default function Dashboard() {
  return (
    <div className="bg-[#0e1525] min-h-screen flex text-gray-100">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e1525] border-b border-indigo-900/30">
        <Header />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className="flex-1 flex flex-col ml-64"
        style={{
          height: "calc(100vh - 72px)",
        }}
      >
        <div
          id="main-content"
          className="flex-1 mt-[50px]"
          style={{
            overflow: "hidden", // disables manual scroll
            scrollBehavior: "smooth", // enables smooth programmatic scroll
          }}
        >
          {/* Sections */}
          <section id="dashboard" className="min-h-screen p-10">
            <DashboardPage />
          </section>

          <section id="servers" className="min-h-screen p-10">
            <div id="create-server" className="mb-20">
              <CreateServerPage />
            </div>

            <div id="server-image" className="mb-20 -ml-2">
              <ImageSelector />
            </div>

            <div id="server-type" className="mb-20 -ml-2">
              <TypeSelector />
            </div>
          </section>

          <section id="security" className="min-h-screen p-10">
            <h1 className="text-3xl font-bold">Security</h1>
          </section>

          <section id="settings" className="min-h-screen p-10">
            <h1 className="text-3xl font-bold">Settings</h1>
          </section>
        </div>
      </div>
    </div>
  );
}

