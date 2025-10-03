import { useEffect, useState } from "react";
import type { SkinExaminationViewProps } from "./SkinExamination.helper";

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

  // Show "Processing..." for 5 seconds, then check for report status
  useEffect(() => {
    if (result?.report_status === 'processing') {
      setShowProcessing(true);

      // Set a timer to check status after 5 seconds
      const timer = setTimeout(() => {
        setShowProcessing(false);
      }, 5000);

      // Cleanup timer if the component is unmounted
      return () => clearTimeout(timer);
    } else if (result?.report_status === 'completed') {
      setShowDownloadButton(true);
    } else {
      setShowProcessing(false);
      setShowDownloadButton(false);
    }
  }, [result?.report_status, result?.id, onCheckStatus]);
  
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
    <div className="flex flex-col bg-white px-6 py-4 overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Form */}
        <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Skin Examination</h2>

          <form onSubmit={onSubmit} className="space-y-4 text-sm">
            {/* Step 1 */}
            <div>
              <label className="block font-medium mb-2">
                Step 1: Take or upload a photo
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
              {fileName && (
                <p className="mt-1 text-xs text-gray-600">Selected: {fileName}</p>
              )}
            </div>

            {/* Step 2 */}
            <div>
              <label className="block font-medium mb-2">
                Step 2: Describe your concern (optional)
              </label>
              <textarea
                placeholder="e.g. mole has changed shape, itchy patch, new spot, etc."
                value={desc}
                onChange={(e) => onDescChange(e.target.value)}
                className="w-full rounded-md border p-2 text-sm"
                rows={3}
              />
            </div>

            {/* Step 3 */}
            <div>
              <label className="block font-medium mb-2">
                Step 3: Select location on body
              </label>
              <select
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                className="w-full p-2 rounded-md border text-sm"
              >
                <option value="">Select location</option>
                <option>Face</option>
                <option>Arm</option>
                <option>Leg</option>
                <option>Back</option>
                <option>Other</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {loading ? "Analyzing..." : "Submit for Analysis"}
            </button>
          </form>

          {error && (
            <div className="mt-3 text-red-600 text-xs">{String(error)}</div>
          )}
        </div>

        {/* Right: Results */}
        <div className="bg-gray-50 p-5 rounded-lg shadow-sm min-h-[280px] flex flex-col justify-center items-center">
          {result ? (
            <>
              <h3 className="text-xl font-bold mb-4">Skin Analysis Result</h3>
              <div className="flex flex-col md:flex-row items-start gap-4 text-sm">
                {result.annotated_image && (
                  <img
                    src={`data:image/png;base64,${result.annotated_image}`}
                    className="w-36 h-36 object-cover rounded-md border"
                    alt="lesion"
                  />
                )}
                <div>
                  <div className="text-green-600 font-bold text-base">{result.prediction}</div>
                  <div className="text-xs text-gray-600">
                    Confidence: {Math.round(result?.confidence * 100)}%
                  </div>
                </div>
              </div>

              {/* Check Status / Download Report */}
              <div className="mt-5">
                {
                  result.report_status === 'processing' &&
                <button
                  className="px-3 py-1 border rounded-md hover:bg-gray-100 transition"
                  onClick={() => onCheckStatus(result.id)}
                >
                  Check Report Status
                </button>
                }

                {showProcessing && <p className="mt-2 text-yellow-600">Processing...</p>}

                {showDownloadButton && (
                  <button
                    className="px-3 py-1 border rounded-md hover:bg-gray-100 transition mt-4"
                    onClick={() => onReportDownload(result.id)}
                  >
                    Download Report
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm text-center">
              Your results will appear here after submission.
            </p>
          )}
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-4 text-[10px] text-gray-400 text-center">
        This analysis is AI-assisted and not a substitute for a professional
        medical diagnosis. If in doubt, consult a healthcare provider.
      </p>
    </div>
  );
}
