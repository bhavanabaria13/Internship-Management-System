import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, FolderOpen, ListTodo, Calendar, User } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  repositoryUrl: string | null;
  deployedUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  assignedTo: string | null;
  projectId: string | null;
  status: string;
  priority: string | null;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string | null;
};

type Intern = {
  id: string;
  name: string;
  approvalStatus?: number;
};

export default function ProjectManagement() {
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    status: "in-progress" as "in-progress" | "completed" | "on-hold",
    startDate: "",
    endDate: "",
    repositoryUrl: "",
    deployedUrl: "",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    status: "pending" as "pending" | "running" | "completed" | "cancelled",
    priority: "medium" as "low" | "medium" | "high",
    startDate: "",
    dueDate: "",
  });

  const { toast } = useToast();

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/admin/projects"],
    queryFn: async () => {
      const res = await fetch("/api/admin/projects", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  const { data: interns = [] } = useQuery<Intern[]>({
    queryKey: ["/api/admin/interns-with-status"],
    queryFn: async () => {
      const res = await fetch("/api/admin/interns-with-status", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch interns");
      return res.json();
    },
  });

  const { data: projectTasks = [], refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ["/api/admin/projects", selectedProject?.id, "tasks"],
    enabled: !!selectedProject?.id,
    queryFn: async () => {
      if (!selectedProject?.id) return [];
      const res = await fetch(`/api/admin/projects/${selectedProject.id}/tasks`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });

  const approvedInterns = interns.filter(i => i.approvalStatus === 1);

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create project");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      toast({ title: "Project created successfully" });
      resetProjectForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
      setIsSubmitting(false);
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update project");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      toast({ title: "Project updated successfully" });
      resetProjectForm();
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/projects/${id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Failed to delete project");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      toast({ title: "Project deleted successfully" });
      if (selectedProject) setSelectedProject(null);
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/admin/projects/${selectedProject?.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create task");
      return response.json();
    },
    onSuccess: () => {
      refetchTasks();
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task created successfully" });
      resetTaskForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
      setIsSubmitting(false);
    },
  });

  const resetProjectForm = () => {
    setProjectForm({
      name: "",
      description: "",
      status: "in-progress",
      startDate: "",
      endDate: "",
      repositoryUrl: "",
      deployedUrl: "",
    });
    setIsProjectDialogOpen(false);
    setEditingProject(null);
    setIsSubmitting(false);
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      description: "",
      assignedTo: "",
      status: "pending",
      priority: "medium",
      startDate: "",
      dueDate: "",
    });
    setIsTaskDialogOpen(false);
    setIsSubmitting(false);
  };

  const handleProjectSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const submitData = {
      ...projectForm,
      startDate: projectForm.startDate || null,
      endDate: projectForm.endDate || null,
    };

    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data: submitData });
    } else {
      createProjectMutation.mutate(submitData);
    }
  };

  const handleTaskSubmit = () => {
    if (isSubmitting || !selectedProject) return;
    setIsSubmitting(true);

    const submitData = {
      ...taskForm,
      assignedTo: taskForm.assignedTo || null,
      startDate: taskForm.startDate || null,
      dueDate: taskForm.dueDate || null,
    };

    createTaskMutation.mutate(submitData);
  };

  const openEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      description: project.description || "",
      status: project.status as "in-progress" | "completed" | "on-hold",
      startDate: project.startDate ? project.startDate.split("T")[0] : "",
      endDate: project.endDate ? project.endDate.split("T")[0] : "",
      repositoryUrl: project.repositoryUrl || "",
      deployedUrl: project.deployedUrl || "",
    });
    setIsProjectDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "in-progress": "default",
      "completed": "secondary",
      "on-hold": "outline",
      "pending": "outline",
      "running": "default",
      "cancelled": "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "MMM dd, yyyy");
    } catch {
      return "-";
    }
  };

  const getInternName = (internId: string | null) => {
    if (!internId) return "-";
    const intern = interns.find(i => i.id === internId);
    return intern?.name || "-";
  };

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold" data-testid="text-project-management-title">Project Management</h2>
        <Button onClick={() => setIsProjectDialogOpen(true)} data-testid="button-add-project">
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list" data-testid="tab-project-list">
            <FolderOpen className="w-4 h-4 mr-2" />
            Project List
          </TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedProject} data-testid="tab-project-details">
            <ListTodo className="w-4 h-4 mr-2" />
            Project Details & Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                All Projects ({projects.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No projects yet. Create your first project!</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id} data-testid={`row-project-${project.id}`}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{project.description || "-"}</TableCell>
                        <TableCell>{getStatusBadge(project.status)}</TableCell>
                        <TableCell>{formatDate(project.startDate)}</TableCell>
                        <TableCell>{formatDate(project.endDate)}</TableCell>
                        <TableCell>{formatDate(project.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditProject(project)}
                              data-testid={`button-edit-project-${project.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this project?")) {
                                  deleteProjectMutation.mutate(project.id);
                                }
                              }}
                              data-testid={`button-delete-project-${project.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          {selectedProject && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5" />
                      {selectedProject.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedProject.status)}
                      <Button variant="outline" size="sm" onClick={() => setSelectedProject(null)}>
                        Back to List
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Description:</span>
                      <p>{selectedProject.description || "No description"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(selectedProject.startDate)} - {formatDate(selectedProject.endDate)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <CardTitle className="flex items-center gap-2">
                      <ListTodo className="w-5 h-5" />
                      Project Tasks ({projectTasks.length})
                    </CardTitle>
                    <Button onClick={() => setIsTaskDialogOpen(true)} data-testid="button-add-task">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {projectTasks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No tasks in this project yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Assigned To</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>Due Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projectTasks.map((task) => (
                          <TableRow key={task.id} data-testid={`row-task-${task.id}`}>
                            <TableCell className="font-medium">{task.title}</TableCell>
                            <TableCell className="max-w-xs truncate">{task.description || "-"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4 text-muted-foreground" />
                                {getInternName(task.assignedTo)}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(task.status)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{task.priority || "medium"}</Badge>
                            </TableCell>
                            <TableCell>{formatDate(task.startDate)}</TableCell>
                            <TableCell>{formatDate(task.dueDate)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                placeholder="Enter project name"
                data-testid="input-project-name"
              />
            </div>
            <div>
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Project description"
                data-testid="input-project-description"
              />
            </div>
            <div>
              <Label htmlFor="project-status">Status</Label>
              <Select
                value={projectForm.status}
                onValueChange={(v) => setProjectForm({ ...projectForm, status: v as any })}
              >
                <SelectTrigger data-testid="select-project-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project-start-date">Start Date</Label>
                <Input
                  id="project-start-date"
                  type="date"
                  value={projectForm.startDate}
                  onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                  data-testid="input-project-start-date"
                />
              </div>
              <div>
                <Label htmlFor="project-end-date">End Date</Label>
                <Input
                  id="project-end-date"
                  type="date"
                  value={projectForm.endDate}
                  onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                  data-testid="input-project-end-date"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="project-repo">Repository URL</Label>
              <Input
                id="project-repo"
                value={projectForm.repositoryUrl}
                onChange={(e) => setProjectForm({ ...projectForm, repositoryUrl: e.target.value })}
                placeholder="https://github.com/..."
                data-testid="input-project-repo"
              />
            </div>
            <div>
              <Label htmlFor="project-deploy">Deployed URL</Label>
              <Input
                id="project-deploy"
                value={projectForm.deployedUrl}
                onChange={(e) => setProjectForm({ ...projectForm, deployedUrl: e.target.value })}
                placeholder="https://..."
                data-testid="input-project-deploy"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetProjectForm}>Cancel</Button>
            <Button onClick={handleProjectSubmit} disabled={!projectForm.name || isSubmitting} data-testid="button-save-project">
              {isSubmitting ? "Saving..." : editingProject ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Task for {selectedProject?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Name *</Label>
              <Input
                id="task-title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Enter task name"
                data-testid="input-task-title"
              />
            </div>
            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Task details"
                data-testid="input-task-description"
              />
            </div>
            <div>
              <Label htmlFor="task-assigned">Assign to Intern</Label>
              <Select
                value={taskForm.assignedTo}
                onValueChange={(v) => setTaskForm({ ...taskForm, assignedTo: v })}
              >
                <SelectTrigger data-testid="select-task-assigned">
                  <SelectValue placeholder="Select intern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {approvedInterns.map((intern) => (
                    <SelectItem key={intern.id} value={intern.id}>
                      {intern.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-status">Status</Label>
                <Select
                  value={taskForm.status}
                  onValueChange={(v) => setTaskForm({ ...taskForm, status: v as any })}
                >
                  <SelectTrigger data-testid="select-task-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(v) => setTaskForm({ ...taskForm, priority: v as any })}
                >
                  <SelectTrigger data-testid="select-task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-start-date">Start Date</Label>
                <Input
                  id="task-start-date"
                  type="date"
                  value={taskForm.startDate}
                  onChange={(e) => setTaskForm({ ...taskForm, startDate: e.target.value })}
                  data-testid="input-task-start-date"
                />
              </div>
              <div>
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  data-testid="input-task-due-date"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetTaskForm}>Cancel</Button>
            <Button onClick={handleTaskSubmit} disabled={!taskForm.title || isSubmitting} data-testid="button-save-task">
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
