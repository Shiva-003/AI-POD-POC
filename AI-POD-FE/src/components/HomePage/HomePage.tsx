import { useNavigate } from "react-router-dom";
import { FaceSmileIcon, EyeIcon, PlusCircleIcon  } from "@heroicons/react/24/solid"; 

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="h-[calc(100%-81px)] flex flex-col items-center justify-center bg-white px-4">
  {/* Main Content */}
  <h2 className="text-2xl font-semibold mb-6">What do you want to examine?</h2>
  <div className="flex gap-6">
    
    {/* Skin */}
    <div
      onClick={() => navigate("/skin-examination")}
      className="cursor-pointer bg-white border rounded-lg p-4 hover:shadow-md transition flex flex-col items-center"
    >
      <FaceSmileIcon className="w-20 h-20 text-blue-600 mb-2" />
      <div className="text-center text-blue-600 font-medium">Skin</div>
    </div>

    {/* Eye */}
    <div
      onClick={()=> navigate("/eye-examination")}
      className="cursor-pointer bg-white border rounded-lg p-4 hover:shadow-md transition flex flex-col items-center"
    >
      <EyeIcon className="w-20 h-20 text-blue-600 mb-2" />
      <div className="text-center text-blue-600 font-medium">Eye</div>
    </div>

    {/* Wound */}
    <div
      onClick={()=> navigate("/wound-examination")}
      className="cursor-pointer bg-white border rounded-lg p-4 hover:shadow-md transition flex flex-col items-center"
    >
      <PlusCircleIcon  className="w-20 h-20 text-blue-600 mb-2" />
      <div className="text-center text-blue-600 font-medium">Wound</div>
    </div>
  </div>
</div>

  );
}
