import { useParams } from "react-router-dom";

const CaseDetails = () => {
  const { id } = useParams();

  // TEMP STATIC DATA (we'll connect backend later)
  const caseData = {
    id: "CASE-9042",
    title: "Phishing Attempt Report",
    status: "Pending",
    description: "Suspicious email asking for bank details.",
    category: "Cyber Fraud",
    createdAt: "3 March 2026",
    lastUpdated: "3 March 2026",
  };

  const evidences = [
    {
      fileName: "screenshot.png",
      uploadedAt: "3 March 2026",
      hash: "83f9ab3e1c4d8e9f...",
      status: "Pending",
    },
  ];

  return (
    <div className="p-8 text-white">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {caseData.title}
        </h1>
        <p className="text-gray-400 mt-2">
          Case ID: {caseData.id}
        </p>
        <span className="inline-block mt-3 px-3 py-1 text-sm rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500">
          {caseData.status}
        </span>
      </div>

      {/* Case Info Card */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Case Information</h2>
        <p className="text-gray-300 mb-2">
          <span className="font-medium text-white">Description:</span>{" "}
          {caseData.description}
        </p>
        <p className="text-gray-300 mb-2">
          <span className="font-medium text-white">Category:</span>{" "}
          {caseData.category}
        </p>
        <p className="text-gray-300">
          <span className="font-medium text-white">Created:</span>{" "}
          {caseData.createdAt}
        </p>
      </div>

      {/* Evidence Section */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Evidence</h2>

          {caseData.status !== "Closed" && (
            <button className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition">
              + Upload Evidence
            </button>
          )}
        </div>

        {/* Evidence List */}
        <div className="space-y-4">
          {evidences.map((evidence, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{evidence.fileName}</p>
                <p className="text-sm text-gray-400">
                  Uploaded: {evidence.uploadedAt}
                </p>
                <p className="text-sm text-gray-400 break-all">
                  Hash: {evidence.hash}
                </p>
              </div>

              <span className="px-3 py-1 text-sm rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500">
                {evidence.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CaseDetails;