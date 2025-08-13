import { useState } from "react"
import axios from 'axios'
import SkinExaminationView from "./SkinExaminationView";

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

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        if (!file) return alert('Please select a photo.')
        setLoading(true)
        setError(null)
        try {
        const form = new FormData()
        form.append('image', file)
        form.append('description', desc)
        form.append('location', location)
        const resp = await axios.post('http://localhost:3000/analyze', form, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        setResult(resp.data)
        } catch (err: any) {
        console.error(err)
        setError(err?.response?.data || err.message)
        } finally {
        setLoading(false)
        }
    }

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
    />
  );
};