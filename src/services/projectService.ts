
import { Project, ProjectStatus, ProjectDocument, TeamMember, Task, Bid } from "@/types/project";

// Function to sync projects with localStorage
const syncProjectsWithLocalStorage = (): Project[] => {
  try {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      // Parse projects from localStorage and ensure dates are Date objects
      const parsedProjects = JSON.parse(storedProjects);
      return parsedProjects.map((project: any) => ({
        ...project,
        dueDate: new Date(project.dueDate),
        startDate: project.startDate ? new Date(project.startDate) : undefined,
        endDate: project.endDate ? new Date(project.endDate) : undefined,
        documents: Array.isArray(project.documents) 
          ? project.documents.map((doc: any) => ({
              ...doc,
              createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date()
            }))
          : [], // Ensure documents is always an array
        tasks: Array.isArray(project.tasks) 
          ? project.tasks.map((task: any) => ({
              ...task,
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined
            }))
          : [], // Ensure tasks is always an array
        team: Array.isArray(project.team) ? project.team : [], // Ensure team is always an array
        bids: Array.isArray(project.bids) ? project.bids : [] // Ensure bids is always an array
      }));
    }
  } catch (error) {
    console.error("Error parsing projects from localStorage:", error);
  }
  
  // If no valid projects in localStorage or error occurred, return default projects
  return defaultProjects;
};

// Mock data for projects
const defaultProjects: Project[] = [
  {
    id: "1",
    title: "Downtown Office Renovation",
    client: "Acme Corporation",
    address: "123 Main St, Downtown",
    dueDate: new Date(2025, 5, 15),
    budget: 250000,
    status: "active",
    progress: 35,
    description: "Complete renovation of 10,000 sq ft office space including electrical, plumbing, and interior finishes.",
    contactEmail: "contact@acme.com",
    contactPhone: "555-123-4567",
    tasks: [
      { id: "t1", title: "Demolition", completed: true },
      { id: "t2", title: "Electrical Rewiring", completed: false, dueDate: new Date(2025, 2, 20) },
      { id: "t3", title: "Drywall Installation", completed: false, dueDate: new Date(2025, 3, 10) }
    ],
    team: [
      { id: "m1", name: "John Smith", email: "john@example.com", role: "manager", avatar: "" },
      { id: "m2", name: "Lisa Johnson", email: "lisa@example.com", role: "supervisor", avatar: "" }
    ],
    documents: [
      {
        id: "d1",
        name: "Initial Proposal",
        type: "bid", 
        createdAt: new Date(2025, 0, 15),
        content: {
          bidAmount: 245000,
          approved: true
        }
      },
      {
        id: "d2",
        name: "Floor Plans",
        type: "plan",
        createdAt: new Date(2025, 0, 20),
        content: {
          fileUrl: "#"
        }
      }
    ],
    bids: [],
    // Additional fields for the Project type
    type: "Commercial",
    location: "Downtown Business District",
    startDate: new Date(2025, 2, 1),
    endDate: new Date(2025, 8, 30),
    manager: "John Smith",
    notes: "Client has requested premium finishes throughout the space."
  },
  {
    id: "2",
    title: "Riverside Apartment Complex",
    client: "Riverside Development LLC",
    address: "456 River Rd, Westside",
    dueDate: new Date(2025, 8, 30),
    budget: 1200000,
    status: "pending",
    progress: 0,
    description: "New construction of 24-unit apartment complex with amenities including gym and pool.",
    contactEmail: "info@riverside.dev",
    contactPhone: "555-987-6543",
    tasks: [],
    team: [],
    documents: [],
    bids: [],
    // Additional fields for the Project type
    type: "Residential",
    location: "Westside Riverfront",
    startDate: new Date(2025, 5, 1),
    endDate: new Date(2026, 4, 30),
    manager: "Maria Rodriguez",
    notes: "Project requires special environmental permits due to proximity to river."
  },
  {
    id: "3",
    title: "AAA Ridgeland Mississippi",
    client: "AAA Insurance",
    address: "789 Highland Dr, Ridgeland, MS",
    dueDate: new Date(2025, 11, 15),
    budget: 450000,
    status: "active",
    progress: 15,
    description: "Complete renovation of insurance office including new reception area and client meeting rooms.",
    contactEmail: "office@aaa.com",
    contactPhone: "555-456-7890",
    tasks: [
      { id: "t4", title: "Site Survey", completed: true },
      { id: "t5", title: "Permits", completed: true },
      { id: "t6", title: "Initial Demo", completed: false, dueDate: new Date(2025, 5, 10) }
    ],
    team: [
      { id: "m3", name: "Robert Johnson", email: "robert@example.com", role: "manager", avatar: "" },
      { id: "m4", name: "Sarah Williams", email: "sarah@example.com", role: "worker", avatar: "" }
    ],
    documents: [
      {
        id: "d3",
        name: "Building Permits",
        type: "other", 
        createdAt: new Date(2025, 3, 5),
        content: {
          fileUrl: "#"
        }
      }
    ],
    bids: [],
    type: "Commercial",
    location: "Ridgeland Business District",
    startDate: new Date(2025, 4, 1),
    endDate: new Date(2025, 11, 15),
    manager: "Robert Johnson",
    notes: "Client requires work to be done after hours to minimize business disruption."
  }
];

// Initialize localStorage with default projects if it's empty
const initializeLocalStorage = () => {
  if (!localStorage.getItem('projects')) {
    localStorage.setItem('projects', JSON.stringify(defaultProjects));
  }
};

// Initialize localStorage on module load
initializeLocalStorage();

// Get all projects - synchronize with localStorage
export const getProjects = (): Project[] => {
  return syncProjectsWithLocalStorage();
};

// Get a single project by ID
export const getProject = (id: string): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const allProjects = syncProjectsWithLocalStorage();
    const project = allProjects.find(p => p.id === id);
    if (project) {
      resolve(project);
    } else {
      reject(new Error("Project not found"));
    }
  });
};

// Update a project
export const updateProject = (id: string, updatedProject: Partial<Project>): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const allProjects = syncProjectsWithLocalStorage();
    const index = allProjects.findIndex(p => p.id === id);
    if (index !== -1) {
      allProjects[index] = { ...allProjects[index], ...updatedProject };
      localStorage.setItem('projects', JSON.stringify(allProjects));
      resolve(allProjects[index]);
    } else {
      reject(new Error("Project not found"));
    }
  });
};

// Add a document to a project
export const addDocument = (projectId: string, document: ProjectDocument): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const allProjects = syncProjectsWithLocalStorage();
    const index = allProjects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      if (!Array.isArray(allProjects[index].documents)) {
        allProjects[index].documents = [];
      }
      allProjects[index].documents.push(document);
      localStorage.setItem('projects', JSON.stringify(allProjects));
      resolve(allProjects[index]);
    } else {
      reject(new Error("Project not found"));
    }
  });
};

// Remove a document from a project
export const removeDocument = (projectId: string, documentId: string): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const allProjects = syncProjectsWithLocalStorage();
    const index = allProjects.findIndex(p => p.id === projectId);
    if (index !== -1 && Array.isArray(allProjects[index].documents)) {
      const docIndex = allProjects[index].documents.findIndex(d => d.id === documentId);
      if (docIndex !== -1) {
        allProjects[index].documents.splice(docIndex, 1);
        localStorage.setItem('projects', JSON.stringify(allProjects));
        resolve(allProjects[index]);
      } else {
        reject(new Error("Document not found"));
      }
    } else {
      reject(new Error("Project not found or no documents array"));
    }
  });
};

// Add/remove task methods
export const addTask = (projectId: string, task: Task): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const allProjects = syncProjectsWithLocalStorage();
    const index = allProjects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      if (!Array.isArray(allProjects[index].tasks)) {
        allProjects[index].tasks = [];
      }
      allProjects[index].tasks.push(task);
      localStorage.setItem('projects', JSON.stringify(allProjects));
      resolve(allProjects[index]);
    } else {
      reject(new Error("Project not found"));
    }
  });
};

export const updateTask = (projectId: string, taskId: string, completed: boolean): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const allProjects = syncProjectsWithLocalStorage();
    const projIndex = allProjects.findIndex(p => p.id === projectId);
    if (projIndex !== -1 && Array.isArray(allProjects[projIndex].tasks)) {
      const taskIndex = allProjects[projIndex].tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== undefined && taskIndex !== -1) {
        allProjects[projIndex].tasks[taskIndex].completed = completed;
        localStorage.setItem('projects', JSON.stringify(allProjects));
        resolve(allProjects[projIndex]);
      } else {
        reject(new Error("Task not found"));
      }
    } else {
      reject(new Error("Project not found or no tasks array"));
    }
  });
};

export const removeTask = (projectId: string, taskId: string): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const allProjects = syncProjectsWithLocalStorage();
    const projIndex = allProjects.findIndex(p => p.id === projectId);
    if (projIndex !== -1 && Array.isArray(allProjects[projIndex].tasks)) {
      const taskIndex = allProjects[projIndex].tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== undefined && taskIndex !== -1) {
        allProjects[projIndex].tasks.splice(taskIndex, 1);
        localStorage.setItem('projects', JSON.stringify(allProjects));
        resolve(allProjects[projIndex]);
      } else {
        reject(new Error("Task not found"));
      }
    } else {
      reject(new Error("Project not found or no tasks array"));
    }
  });
};

// Add a bid to a project
export const addBid = (projectId: string, bid: Bid): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const allProjects = syncProjectsWithLocalStorage();
    const index = allProjects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      if (!Array.isArray(allProjects[index].bids)) {
        allProjects[index].bids = [];
      }
      allProjects[index].bids.push(bid);
      localStorage.setItem('projects', JSON.stringify(allProjects));
      resolve(allProjects[index]);
    } else {
      reject(new Error("Project not found"));
    }
  });
};

// Update project notes
export const updateNotes = (projectId: string, notes: string): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const allProjects = syncProjectsWithLocalStorage();
    const index = allProjects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      allProjects[index].notes = notes;
      localStorage.setItem('projects', JSON.stringify(allProjects));
      resolve(allProjects[index]);
    } else {
      reject(new Error("Project not found"));
    }
  });
};

// Delete a project
export const deleteProject = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const allProjects = syncProjectsWithLocalStorage();
    const updatedProjects = allProjects.filter(p => p.id !== id);
    
    if (updatedProjects.length === allProjects.length) {
      // No project was deleted
      resolve(false);
    } else {
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      // Trigger storage event to update other components
      window.dispatchEvent(new Event('storage'));
      resolve(true);
    }
  });
};

// Add a team member to a project
export const addTeamMember = (projectId: string, member: TeamMember): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const allProjects = syncProjectsWithLocalStorage();
    const index = allProjects.findIndex(p => p.id === projectId);
    
    if (index !== -1) {
      if (!Array.isArray(allProjects[index].team)) {
        allProjects[index].team = [];
      }
      
      // Check if member with the same ID already exists
      const existingMemberIndex = allProjects[index].team.findIndex(m => m.id === member.id);
      
      if (existingMemberIndex !== -1) {
        // Update existing member
        allProjects[index].team[existingMemberIndex] = member;
      } else {
        // Add new member
        allProjects[index].team.push(member);
      }
      
      localStorage.setItem('projects', JSON.stringify(allProjects));
      resolve(allProjects[index]);
    } else {
      reject(new Error("Project not found"));
    }
  });
};

// Remove a team member from a project
export const removeTeamMember = (projectId: string, memberId: string): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const allProjects = syncProjectsWithLocalStorage();
    const index = allProjects.findIndex(p => p.id === projectId);
    
    if (index !== -1 && Array.isArray(allProjects[index].team)) {
      const memberIndex = allProjects[index].team.findIndex(m => m.id === memberId);
      
      if (memberIndex !== -1) {
        allProjects[index].team.splice(memberIndex, 1);
        localStorage.setItem('projects', JSON.stringify(allProjects));
        resolve(allProjects[index]);
      } else {
        reject(new Error("Team member not found"));
      }
    } else {
      reject(new Error("Project not found or team array does not exist"));
    }
  });
};
