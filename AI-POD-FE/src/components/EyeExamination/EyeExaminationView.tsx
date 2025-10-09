import { useState } from "react";
import type { EyeExaminationViewProps } from "./EyeExamination";

export default function EyeExaminationView({
  desc,
  loading,
  result,
  error,
  onFileChange,
  onDescChange,
  onSubmit,
}: EyeExaminationViewProps) {
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("");
    }
    onFileChange(e);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-blue-50 to-white px-4 py-10">
      {/* Main Content: Form + Results */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Form */}
          <div className="bg-white p-8 rounded-2xl shadow-md flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Eye Examination</h2>

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Step 1: Upload */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  Step 1: Upload a photo of your eye
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
                  Step 2: Describe your concern (optional)
                </label>
                <textarea
                  placeholder="e.g. redness, irritation, blurred vision..."
                  value={desc}
                  onChange={(e) => onDescChange(e.target.value)}
                  className="w-full border rounded-lg p-3 text-sm"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                {loading ? "Analyzing..." : "Submit for Analysis"}
              </button>

              {/* Error */}
              {error && (
                <div className="text-sm text-red-600 mt-2">{String(error)}</div>
              )}
            </form>

            {/* Disclaimer */}
            <p className="mt-6 text-xs text-gray-500 max-w-md">
              This AI-assisted eye analysis is a supportive tool and does not replace professional medical advice. Please consult a healthcare provider for urgent concerns.
            </p>
          </div>

          {/* Right: Result Section */}
          <div className="bg-white p-8 rounded-2xl shadow-md min-h-[300px] flex flex-col justify-center">
            {result ? (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Eye Analysis Result</h3>
                <div className="flex flex-col md:flex-row gap-6 items-center text-sm">
                  {result.annotated_image && (
                    <img
                      src={`data:image/png;base64,${result.annotated_image}`}
                      className="w-36 h-36 object-cover border rounded-lg"
                      alt="Eye lesion"
                    />
                  )}
                  <div className="text-left">
                    <div className="text-lg font-semibold text-green-700">
                      {result.prediction}
                    </div>
                    <div className="text-gray-600 text-xs mt-1">
                      Confidence: {Math.round(result.confidence * 100)}%
                    </div>
                    {result.recommendation && (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm text-gray-800">
                          Recommendations
                        </h4>
                        <p className="text-sm text-gray-700 mt-1">
                          {result.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex flex-col items-center">
                  <button
                    className="text-sm border px-4 py-2 rounded-md hover:bg-gray-100 transition"
                    onClick={() => window.open(`/report?job=${result.id}`, "_blank")}
                  >
                    Download Report
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm text-center">
                Submit your details to view analysis results here.
              </p>
            )}
          </div>
        </div>
      </div>

{/*       
      <p className="text-[11px] text-gray-400 text-center mt-10 max-w-2xl mx-auto px-4">
        This AI-assisted eye analysis is not a replacement for medical diagnosis. Always consult a healthcare professional for serious or worsening conditions.
      </p> */}
    </div>
  );
}
