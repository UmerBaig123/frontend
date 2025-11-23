export interface DataItem {
  id: string;
  name: string;
  price: number;
  category?: string;
  isEditing?: boolean;
}

export type ViewMode = 'icons' | 'table' | 'list';

export interface DataEntryTableProps {
  onDataChange?: (data: DataItem[]) => void;
  initialData?: DataItem[];
}

export interface EditingData {
  name: string;
  price: string;
  category: string;
}
