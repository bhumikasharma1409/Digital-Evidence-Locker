import { useNavigate } from "react-router-dom";
import { useState } from "react";

const cases = [
  {
    id: "CASE-9042",
    title: "Phishing Attempt Report",
    description: "Suspicious email reported by user with potential credential harvesting",
    time: "2h ago",
    status: "PENDING",
    priority: "HIGH",
    category: "Security Threat",
  },
  {
    id: "CASE-8812",
    title: "Unauthorized Login Logs",
    description: "Multiple failed login attempts detected from unknown IP addresses",
    time: "Yesterday",
    status: "ASSIGNED",
    priority: "MEDIUM",
    category: "Access Control",
  },
  {
    id: "CASE-7231",
    title: "Digital Assets Recovery",
    description: "Recovery process initiated for compromised digital wallet",
    time: "3 days ago",
    status: "VERIFIED",
    priority: "HIGH",
    category: "Asset Recovery",
  },
  {
    id: "CASE-6102",
    title: "Suspected Malware File",
    description: "Malicious file detected and quarantined in system scan",
    time: "Oct 12",
    status: "CLOSED",
    priority: "LOW",
    category: "Malware",
  },
];

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
  const [hoveredCase, setHoveredCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "ALL" || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: cases.length,
    pending: cases.filter(c => c.status === "PENDING").length,
    active: cases.filter(c => c.status === "ASSIGNED" || c.status === "VERIFIED").length,
    closed: cases.filter(c => c.status === "CLOSED").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0b1220] to-[#0a0f1c] text-white">
      {/* Animated Background Gradient Overlay */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-8 md:p-12 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            My Cases
          </h1>
          <p className="text-gray-400">Track and manage your security incidents</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Cases</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>
          <div className="bg-yellow-500/10 backdrop-blur-lg border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm">Pending</p>
                <p className="text-2xl font-bold mt-1">{stats.pending}</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>
          <div className="bg-blue-500/10 backdrop-blur-lg border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Active</p>
                <p className="text-2xl font-bold mt-1">{stats.active}</p>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
          </div>
          <div className="bg-green-500/10 backdrop-blur-lg border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Closed</p>
                <p className="text-2xl font-bold mt-1">{stats.closed}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl focus:outline-none focus:border-blue-400/50 transition-all"
              />
              <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
            </div>
          </div>
          <div className="flex gap-2">
            {["ALL", "PENDING", "ASSIGNED", "VERIFIED", "CLOSED"].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filterStatus === status 
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
                    : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Cases List */}
        <div className="space-y-4">
          {filteredCases.map((c, index) => (
            <div
              key={c.id}
              onClick={() => navigate(`/case/${c.id}`)}
              onMouseEnter={() => setHoveredCase(c.id)}
              onMouseLeave={() => setHoveredCase(null)}
              className="group cursor-pointer relative overflow-hidden"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="relative p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 hover:border-blue-400/30 transition-all duration-300 hover:transform hover:scale-[1.02]">
                {/* Hover Gradient Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold group-hover:text-blue-300 transition-colors">
                          {c.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[c.priority]}`}>
                          {c.priority}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-1">
                        {c.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500 flex items-center gap-1">
                          <span className="text-xs">🔖</span> {c.id}
                        </span>
                        <span className="text-gray-500 flex items-center gap-1">
                          <span className="text-xs">📁</span> {c.category}
                        </span>
                        <span className="text-gray-500 flex items-center gap-1">
                          <span className="text-xs">🕒</span> {c.time}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border backdrop-blur-lg flex items-center gap-1.5 ${statusColors[c.status]}`}>
                        <span>{statusIcons[c.status]}</span>
                        {c.status}
                      </span>
                      <span className={`text-2xl transition-transform duration-300 ${hoveredCase === c.id ? 'translate-x-1' : ''}`}>
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold mb-2">No cases found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
