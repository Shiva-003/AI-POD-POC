export type SkinExaminationViewProps = {
  file: File | null;
  desc: string;
  location: string;
  loading: boolean;
  result: {
    prediction: string;
    confidence: number;
    annotated_image: string;
    id: string;
    report_status: string;
  } | null;
  error: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescChange: (val: string) => void;
  onLocationChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCheckStatus: (jobId: string) => void;
  onReportDownload: (jobId: string) => void
};
