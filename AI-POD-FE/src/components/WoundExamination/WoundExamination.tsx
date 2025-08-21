import { useState } from "react";
import axios from "axios";
import WoundExaminationView from "./WoundExaminationView";

export default function WoundExamination() {
  const [file, setFile] = useState<File | null>(null);
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!file) return alert("Please select a photo.");
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("description", desc);

      // Wound endpoint instead of eye
      const resp = await axios.post("http://localhost:3000/analyze_wound", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(resp.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WoundExaminationView
      file={file}
      desc={desc}
      loading={loading}
      result={result}
      error={error}
      onFileChange={handleFileChange}
      onDescChange={setDesc}
      onSubmit={handleSubmit}
    />
  );
}

export type WoundExaminationViewProps = {
  file: File | null;
  desc: string;
  loading: boolean;
  result: any;
  error: any;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};
