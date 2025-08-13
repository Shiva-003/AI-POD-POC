export type SkinExaminationViewProps = {
  file: File | null;
  desc: string;
  location: string;
  loading: boolean;
  result: any;
  error: any;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescChange: (val: string) => void;
  onLocationChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};