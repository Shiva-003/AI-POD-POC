import { useNavigate } from "react-router-dom";
import { FaHandHoldingMedical, FaEye, FaBandAid } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();

  const options = [
    {
      label: "Skin",
      path: "/skin-examination",
      icon: <FaHandHoldingMedical size={50} />,
    },
    {
      label: "Eye",
      path: "/eye-examination",
      icon: <FaEye size={50} />,
    },
    {
      label: "Wound",
      path: "/wound-examination",
      icon: <FaBandAid size={50} />,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-81px)] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white px-6 py-10">
      {/* Heading */}
      <h2 className="text-4xl font-extrabold mb-14 text-gray-800 text-center">
        What would you like to examine?
      </h2>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-6xl place-items-center">
        {options.map(({ label, path, icon }) => (
          <div
            key={label}
            onClick={() => navigate(path)}
            className="cursor-pointer bg-white border border-gray-200 rounded-2xl p-8 w-64 h-64 flex flex-col items-center justify-center shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
          >
            <div className="text-blue-600 mb-5 group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
            <div className="text-2xl text-gray-800 font-semibold group-hover:text-blue-700 transition-colors">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
