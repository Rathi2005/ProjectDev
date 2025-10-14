import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
export default function Dashboard() {
  return (
    <div className="bg-[#0e1525] min-h-screen flex text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <div
          className="flex-1 flex flex-col overflow-y-auto scroll-smooth"
          id="main-content"
        >
          <section id="dashboard" className="min-h-screen p-10">
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </section>

          <section id="servers" className="min-h-screen p-10">
            <h1 className="text-3xl font-bold">Servers</h1>
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
