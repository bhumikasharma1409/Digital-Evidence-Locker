import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const statusColors = {
  PENDING: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  ASSIGNED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  VERIFIED: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  CLOSED: "bg-green-500/20 text-green-300 border-green-500/30",
};

const priorityColors = {
  HIGH: "text-red-400",
  MEDIUM: "text-yellow-400",
  LOW: "text-green-400",
};

const statusIcons = {
  PENDING: "⏳",
  ASSIGNED: "👤",
  VERIFIED: "✓",
  CLOSED: "✅",
};

export default function MyCases() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [hoveredCase, setHoveredCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // FETCH CASES FROM BACKEND
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cases");
        const data = await res.json();

        if (data.success) {
          setCases(data.data);
        }
      } catch (error) {
        console.error("Error fetching cases:", error);
      }
    };

    fetchCases();
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c._id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "ALL" || c.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: cases.length,
    pending: cases.filter((c) => c.status === "PENDING").length,
    active: cases.filter(
      (c) => c.status === "ASSIGNED" || c.status === "VERIFIED"
    ).length,
    closed: cases.filter((c) => c.status === "CLOSED").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0b1220] to-[#0a0f1c] text-white">
      <div className="relative z-10 p-8 md:p-12 max-w-7xl mx-auto">

        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          My Cases
        </h1>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border rounded-xl p-4">
            <p>Total Cases</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>

          <div className="bg-yellow-500/10 border rounded-xl p-4">
            <p>Pending</p>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </div>

          <div className="bg-blue-500/10 border rounded-xl p-4">
            <p>Active</p>
            <p className="text-2xl font-bold">{stats.active}</p>
          </div>

          <div className="bg-green-500/10 border rounded-xl p-4">
            <p>Closed</p>
            <p className="text-2xl font-bold">{stats.closed}</p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border rounded-xl"
          />
        </div>

        {/* CASE LIST */}
        <div className="space-y-4">
          {filteredCases.map((c) => (
            <div
              key={c._id}
              onClick={() => navigate(`/case/${c._id}`)}
              onMouseEnter={() => setHoveredCase(c._id)}
              onMouseLeave={() => setHoveredCase(null)}
              className="cursor-pointer p-6 rounded-xl bg-white/5 border hover:bg-white/10 transition"
            >
              <div className="flex justify-between">

                <div>
                  <h3 className="text-xl font-semibold">{c.title}</h3>

                  <p className="text-gray-400 text-sm mt-1">
                    {c.description}
                  </p>

                  <div className="text-gray-500 text-sm mt-2">
                    Case ID: {c._id}
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-lg text-xs border ${
                    statusColors[c.status] || ""
                  }`}
                >
                  {statusIcons[c.status] || "📁"} {c.status || "NEW"}
                </span>

              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <h3>No cases found</h3>
          </div>
        )}

      </div>
    </div>
  );
}