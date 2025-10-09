import type { WoundExaminationViewProps } from "./WoundExamination";
import { useState } from "react";

export default function WoundExaminationView({
  desc,
  loading,
  result,
  error,
  onFileChange,
  onDescChange,
  onSubmit,
}: WoundExaminationViewProps) {
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("");
    }
    onFileChange(e);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-blue-50 to-white px-4 py-10">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Form */}
          <div className="bg-white p-8 rounded-2xl shadow-md flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Wound Examination
            </h2>

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Step 1: Upload */}
              <div>
                <label className="block font-medium mb-2 text-sm">
                  Step 1: Upload a photo of your wound
                </label>
                <label className="flex items-center gap-2 px-4 py-3 border rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 text-blue-600 font-medium text-sm">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  Take Photo / Upload
                </label>
                {fileName && (
                  <p className="mt-2 text-sm text-gray-600">Selected: {fileName}</p>
                )}
              </div>

              {/* Step 2: Description */}
              <div>
                <label className="block font-medium mb-2 text-sm">
                  Step 2: Describe your concern (optional)
                </label>
                <textarea
                  placeholder="e.g. infection, healing progress, swelling..."
                  value={desc}
                  onChange={(e) => onDescChange(e.target.value)}
                  className="w-full rounded-md border p-3 text-sm"
                  rows={3}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                {loading ? "Analyzing..." : "Analyze Wound"}
              </button>

              {/* Error */}
              {error && (
                <div className="text-sm text-red-600 mt-2">
                  {String(error)}
                </div>
              )}
            </form>

            {/* Disclaimer below form */}
            <p className="mt-6 text-xs text-gray-500 max-w-md">
              This AI-powered skin analysis is a supportive tool and does not replace professional medical advice. Please consult a healthcare provider for any urgent or serious concerns.
            </p>
          </div>

          {/* Right: Results */}
          <div className="bg-white p-8 rounded-2xl shadow-md min-h-[300px] flex flex-col justify-center">
            {result ? (
              <>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  Wound Analysis Result
                </h3>
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {result.annotated_image && (
                    <img
                      src={`data:image/png;base64,${result.annotated_image}`}
                      className="w-40 h-40 object-cover rounded-md border"
                      alt="wound"
                    />
                  )}
                  <div>
                    <div className="text-green-600 font-bold text-lg">
                      {result.prediction}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
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

                <div className="mt-6">
                  <button
                    className="px-4 py-2 border rounded-md hover:bg-gray-100 transition text-sm"
                    onClick={() =>
                      window.open(`/report?job=${result.id}`, "_blank")
                    }
                  >
                    Download Report
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center text-sm">
                Your results will appear here after submission.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* <p className="text-[11px] text-gray-400 text-center mt-10 max-w-2xl mx-auto px-4">
        This AI-assisted wound analysis is not a replacement for medical diagnosis. Always consult a healthcare professional for serious or worsening conditions.
      </p> */}
    </div>
  );
}
