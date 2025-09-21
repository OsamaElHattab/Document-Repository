export interface Document {
  id: string;
  title: string;
  description: string;
  access_level: string;
  file_path: string;
  current_version_id: string;
}

export interface VersionItem {
  id: string;
  document_id: string;
  version_number: number;
  title?: string;
  description?: string;
  file_path: string;
  uploaded_by?: string;
  uploaded_at?: string | null;
  access_level?: string;
}