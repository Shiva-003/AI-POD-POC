import { useState } from "react";
import axios from 'axios';
import SkinExaminationView from "./SkinExaminationView";
import { toast } from "react-toastify";

export default function SkinExamination(){

    const [file, setFile] = useState<File | null>(null);
    const [desc, setDesc] = useState('')
    const [location, setLocation] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
        setFile(e.target.files[0]); // Safe now
        }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please select a photo.');
    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append('image', file);
      form.append('description', desc);
      form.append('location', location);

      const resp = await axios.post('http://localhost:3000/api/user/skinAnalyze', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult({
        ...resp.data,
        report_status: 'processing'  // Initially set status as 'processing' after submission
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async (id: string) => {
    try {
      const resp = await axios.get(`http://localhost:3000/api/user/checkReportStatus/${id}`);
      setResult({
        ...result,
        report_status: resp.data.status,
        report_url: resp.data.report_url
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data || err.message);
    }
  };

  const handleDownloadReport = async (id: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/user/downloadReport/${id}`, { responseType: 'blob' });

      // Create a blob from the PDF file
      const file = new Blob([response.data], { type: 'application/pdf' });

      // Create a link element
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(file);
      link.href = url;
      link.setAttribute('download', `diagnosis_report_${id}.pdf`);

      // Append to the DOM and trigger the download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading the report:', error);
      toast.error('There was an issue downloading the report. Please try again.');
    }
  };


  return (
    <SkinExaminationView
      file={file}
      desc={desc}
      location={location}
      loading={loading}
      result={result}
      error={error}
      onFileChange={handleFileChange}
      onDescChange={setDesc}
      onLocationChange={setLocation}
      onSubmit={handleSubmit}
      onCheckStatus={handleCheckStatus}
      onReportDownload={handleDownloadReport}
    />
  );
}
