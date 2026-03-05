import { useState } from "react";
import { useNavigate } from "react-router-dom";

const cases = [
  {
    id: "CASE-9042",
    title: "Phishing Attempt Report",
    time: "2h ago",
    status: "PENDING",
  },
  {
    id: "CASE-8812",
    title: "Unauthorized Login Logs",
    time: "Yesterday",
    status: "ASSIGNED",
  },
  {
    id: "CASE-7231",
    title: "Digital Assets Recovery",
    time: "3 days ago",
    status: "VERIFIED",
  },
  {
    id: "CASE-6102",
    title: "Suspected Malware File",
    time: "Oct 12",
    status: "CLOSED",
  },
];

const statusStyles = {
  PENDING:
    "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
  ASSIGNED:
    "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  VERIFIED:
    "bg-green-500/10 text-green-400 border border-green-500/30",
  CLOSED:
    "bg-red-500/10 text-red-400 border border-red-500/30",
};

export default function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0f172a] via-[#0b1220] to-[#0a0f1c] text-white">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 p-6 backdrop-blur-xl bg-white/5 border-r border-white/10">
        <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-10">
          Digital Evidence Locker
        </h2>

        <nav className="flex flex-col gap-3">
          {["Dashboard", "My Cases", "Alerts", "Settings"].map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`text-left px-4 py-2 rounded-lg transition-all duration-300 ${activeTab === item
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 md:p-12">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Alex Rivera
              </span>
            </h1>
            <p className="text-gray-400 mt-1">
              Here’s what’s happening with your cases today.
            </p>
          </div>

          <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 hover:scale-105 transition">
            👤
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Total Cases", value: 12 },
            { label: "Active Cases", value: 4 },
            { label: "Closed Cases", value: 8 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.02]"
            >
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-4xl font-bold mt-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Create Button */}
        {/* Create Button */}
<div className="mb-10">
  <button
    onClick={async () => {
      try {
        const response = await fetch("http://localhost:5000/api/cases", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "New Case From Dashboard",
            description: "Case created using frontend button",
          }),
        });

        const data = await response.json();

        if (data.success) {
          alert("Case created successfully!");
        } else {
          alert("Error creating case");
        }

      } catch (error) {
        console.error(error);
        alert("Server error");
      }
    }}
    className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 font-semibold shadow-lg shadow-blue-500/20 hover:scale-105 hover:shadow-blue-500/40 transition-all duration-300"
  >
    + Create New Case
  </button>
</div>

        {/* Recent Cases */}
        <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Cases</h2>
            <button
  onClick={() => navigate("/my-cases")}
  className="text-sm text-blue-400 hover:text-blue-300 transition"
>
  View All
</button>
          </div>

          <div className="space-y-4">
            {cases.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.01]"
              >
                <div>
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {c.id} · {c.time}
                  </p>
                </div>

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-md ${statusStyles[c.status]}`}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}