import { useEffect, useState } from "react";
import type { SkinExaminationViewProps } from "./SkinExamination.helper";
import { FaUpload, FaPen, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";

export default function SkinExaminationView({
  desc,
  location,
  loading,
  result,
  error,
  onFileChange,
  onDescChange,
  onLocationChange,
  onSubmit,
  onCheckStatus,
  onReportDownload,
}: SkinExaminationViewProps) {
  const [showProcessing, setShowProcessing] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    if (result?.report_status === "processing") {
      setShowProcessing(true);
      const timer = setTimeout(() => {
        setShowProcessing(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else if (result?.report_status === "completed") {
      setShowDownloadButton(true);
    } else {
      setShowProcessing(false);
      setShowDownloadButton(false);
    }
  }, [result?.report_status, result?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("");
    }
    onFileChange(e);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-blue-50 to-white px-4 py-10">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            🧴 Skin Examination
          </h2>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Step 1: Upload */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaUpload /> Step 1: Upload a photo
              </label>
              <label className="block border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer text-sm text-blue-600 font-medium transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {fileName ? `Selected: ${fileName}` : "Click to upload or take a photo"}
              </label>
            </div>

            {/* Step 2: Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaPen /> Step 2: Describe your concern (optional)
              </label>
              <textarea
                placeholder="e.g. mole has changed shape, itchy patch, etc."
                value={desc}
                onChange={(e) => onDescChange(e.target.value)}
                className="w-full border rounded-lg p-3 text-sm"
                rows={3}
              />
            </div>

            {/* Step 3: Location */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaMapMarkerAlt /> Step 3: Select body location
              </label>
              <select
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                className="w-full border p-3 rounded-lg text-sm"
              >
                <option value="">Choose a location</option>
                <option>Face</option>
                <option>Arm</option>
                <option>Leg</option>
                <option>Back</option>
                <option>Other</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {loading ? "Analyzing..." : "Analyze Skin"}
            </button>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600">{String(error)}</div>
            )}
          </form>
        </div>

        {/* RIGHT: Result Section */}
        <div className="bg-white p-8 rounded-2xl shadow-md flex flex-col items-center justify-center min-h-[300px]">
          {result ? (
            <>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-green-600" />
                Result Summary
              </h3>
              <div className="flex flex-col md:flex-row gap-6 items-center text-sm">
                {result.annotated_image && (
                  <img
                    src={`data:image/png;base64,${result.annotated_image}`}
                    className="w-36 h-36 object-cover border rounded-lg"
                    alt="Lesion"
                  />
                )}
                <div className="text-left">
                  <div className="text-lg font-semibold text-green-700">
                    {result.prediction}
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    Confidence: {Math.round(result.confidence * 100)}%
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col items-center">
                {result.report_status === "processing" && (
                  <button
                    className="text-sm border px-4 py-2 rounded-md hover:bg-gray-100 transition"
                    onClick={() => onCheckStatus(result.id)}
                  >
                    Check Report Status
                  </button>
                )}

                {showProcessing && (
                  <p className="text-yellow-600 mt-2 text-sm">Processing...</p>
                )}

                {showDownloadButton && (
                  <button
                    className="mt-4 text-sm border px-4 py-2 rounded-md hover:bg-gray-100 transition"
                    onClick={() => onReportDownload(result.id)}
                  >
                    Download Report
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm text-center">
              Submit your details to view analysis results here.
            </p>
          )}
        </div>
      </div>

      {/* <p className="text-[11px] text-gray-400 text-center mt-10 max-w-2xl mx-auto">
        This AI-powered skin analysis is a supportive tool and does not replace
        professional medical advice. Please consult a healthcare provider for
        any urgent or serious concerns.
      </p> */}
    </div>
  );
}
