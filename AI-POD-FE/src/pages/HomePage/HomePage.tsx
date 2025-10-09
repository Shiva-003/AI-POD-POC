import { useNavigate } from "react-router-dom";
import { FaHandHoldingMedical, FaEye, FaBandAid } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();

  const options = [
    {
      label: "Skin Examination",
      path: "/skin-examination",
      icon: <FaHandHoldingMedical size={28} />,
      description: "Check for skin-related conditions using advanced AI models.",
    },
    {
      label: "Eye Examination",
      path: "/eye-examination",
      icon: <FaEye size={28} />,
      description: "Analyze eye images for potential issues like infections or cataracts.",
    },
    {
      label: "Wound Examination",
      path: "/wound-examination",
      icon: <FaBandAid size={28} />,
      description: "Assess wound severity and receive treatment suggestions.",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-81px)] bg-gradient-to-b from-blue-50 to-white py-12 px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          Choose Your Examination
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto text-lg">
          Select an examination type below to begin your diagnostic journey.
        </p>
      </div>

      {/* Vertical List of Exams */}
      <div className="space-y-10 max-w-2xl mx-auto">
        {options.map(({ label, path, icon, description }) => (
          <div
            key={label}
            className="bg-white rounded-xl shadow-md p-6 flex items-start hover:shadow-xl transition-shadow duration-300"
          >
            {/* Icon */}
            <div className="text-blue-600 mr-5 mt-1">{icon}</div>

            {/* Text Content */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                {label}
              </h2>
              <p className="text-gray-500 text-sm mb-4">{description}</p>
              <button
                onClick={() => navigate(path)}
                className="bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition"
              >
                Analyze Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
