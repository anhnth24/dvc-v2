// document types skeleton
export interface DocumentDto {
  id: string;
  name: string;
  status: 'new' | 'processing' | 'done';
}
