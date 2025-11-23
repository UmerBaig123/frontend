
export type ProjectStatus = 'active' | 'pending' | 'completed';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'supervisor' | 'worker';
  avatar: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  assignedTo?: string;
  description?: string;
}

export interface Bid {
  id: string;
  projectId: string;
  amount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt?: Date;
  notes?: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'bid' | 'plan' | 'pricing' | 'other';
  createdAt: Date;
  content: {
    fileUrl?: string;
    bidAmount?: number;
    approved?: boolean;
    demolitionItems?: string[];
    exclusions?: string[];
    [key: string]: any;
  };
}

export interface Project {
  id: string;
  title: string;
  client: string;
  address: string;
  dueDate: Date;
  budget: number;
  status: ProjectStatus;
  progress: number;
  description: string;
  contactEmail: string;
  contactPhone: string;
  tasks: Task[];
  team: TeamMember[];
  documents: ProjectDocument[];
  bids: Bid[];
  notes?: string;
  name?: string;
  location?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  manager?: string;
}
