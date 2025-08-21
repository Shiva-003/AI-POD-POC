import { useNavigate } from "react-router-dom";
import { FaceSmileIcon, EyeIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

export default function Home() {
  const navigate = useNavigate();

  const options = [
    { label: "Skin", icon: FaceSmileIcon, path: "/skin-examination" },
    { label: "Eye", icon: EyeIcon, path: "/eye-examination" },
    { label: "Wound", icon: PlusCircleIcon, path: "/wound-examination" },
  ];

  return (
    <div className="h-[calc(100%-81px)] flex flex-col items-center justify-center bg-white px-6">
      {/* Heading */}
      <h2 className="text-3xl font-bold mb-12 text-gray-800 text-center">
        What do you want to examine?
      </h2>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 w-full max-w-5xl place-items-center">
        {options.map(({ label, icon: Icon, path }) => (
          <div
            key={label}
            onClick={() => navigate(path)}
            className="cursor-pointer bg-white border border-gray-200 rounded-2xl p-8 w-56 h-56 flex flex-col items-center justify-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
          >
            <Icon className="w-20 h-20 text-blue-600 mb-5 group-hover:scale-110 transition-transform duration-200" />
            <div className="text-xl text-blue-600 font-semibold">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
