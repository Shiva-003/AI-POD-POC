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
  const [imageName, setImageName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageName(file.name);
    }
    onFileChange(e);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Form */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Eye Examination</h2>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Step 1 */}
            <div>
              <label className="block font-medium mb-2">
                Step 1: Take or upload a photo of your eye
              </label>
              <label className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer bg-white hover:bg-gray-100">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-blue-600 font-medium">
                  Take Photo / Upload
                </span>
              </label>
              {imageName && (
                <p className="mt-2 text-sm text-gray-600">Selected: {imageName}</p>
              )}
            </div>

            {/* Step 2 */}
            <div>
              <label className="block font-medium mb-2">
                Step 2: Describe your concern (optional)
              </label>
              <textarea
                placeholder="e.g. redness, irritation, blurred vision..."
                value={desc}
                onChange={(e) => onDescChange(e.target.value)}
                className="w-full rounded-md border p-3 text-sm"
                rows={3}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {loading ? "Analyzing..." : "Submit for Analysis"}
            </button>
          </form>

          {error && (
            <div className="mt-4 text-red-600 text-sm">{String(error)}</div>
          )}
        </div>

        {/* Right: Results */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm min-h-[300px]">
          {result ? (
            <>
              <h3 className="text-2xl font-bold mb-4">Eye Analysis Result</h3>
              <div className="flex flex-col md:flex-row items-start gap-6">
                {result.annotated_image && (
                  <img
                    src={`data:image/png;base64,${result.annotated_image}`}
                    className="w-40 h-40 object-cover rounded-md border"
                    alt="eye"
                  />
                )}
                <div>
                  <div className="text-green-600 font-bold text-xl">
                    {result.prediction}
                  </div>
                  <div className="text-sm text-gray-600">
                    Confidence: {Math.round(result.confidence * 100)}%
                  </div>
                  {result.recommendation && (
                    <div className="mt-4">
                      <h4 className="font-medium">Recommendations</h4>
                      <p className="text-sm text-gray-700">
                        {result.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <button
                  className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
                  onClick={() =>
                    window.open(`/report?job=${result.id}`, "_blank")
                  }
                >
                  Download Report
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-lg">
              Your results will appear here after submission.
            </p>
          )}
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-400 text-center">
        This analysis is AI-assisted and not a substitute for a professional
        medical diagnosis. If in doubt, consult a healthcare provider.
      </p>
    </>
  );
}
