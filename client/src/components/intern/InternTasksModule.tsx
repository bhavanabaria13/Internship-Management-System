import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Play, Square, CheckCircle, Clock, Filter, Send, Eye
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Task, TimeLog, Project } from "@shared/schema";

interface InternTasksModuleProps {
  tasks: Task[];
  projects: Project[];
}

export default function InternTasksModule({ tasks, projects }: InternTasksModuleProps) {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submitNotes, setSubmitNotes] = useState("");
  const [taskFilter, setTaskFilter] = useState<"all" | "pending" | "running" | "completed">("all");
  const [search, setSearch] = useState("");
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", dueDate: "", projectId: "" });
  const [submitStatus, setSubmitStatus] = useState<"pending" | "running" | "completed">("completed");

  const { toast } = useToast();

  const { data: timeLogs = [] } = useQuery<TimeLog[]>({
    queryKey: ["/api/intern/time-logs"],
    queryFn: async () => {
      const res = await fetch("/api/intern/time-logs", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch time logs");
      const text = await res.text();
      return text ? JSON.parse(text) : [];
    },
  });

const toggleTaskMutation = useMutation({
  mutationFn: (taskId: string) =>
    apiRequest("POST", `/api/intern/tasks/${taskId}/toggle`),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/intern/tasks"] });
  },
});

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/intern/create-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create task");
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intern/tasks"] });
      toast({ title: "Task created successfully" });
      setShowCreateTask(false);
      setNewTask({ title: "", description: "", priority: "medium", dueDate: "", projectId: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    },
  });

  const startTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/intern/tasks/${taskId}/start`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to start task");
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/intern/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/intern/time-logs"] });
      setActiveTask(taskId);
      setTaskStartTime(new Date());
      toast({ title: "Task started" });
    },
  });

  const stopTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/intern/tasks/${taskId}/stop`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to stop task");
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intern/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/intern/time-logs"] });
      setActiveTask(null);
      setTaskStartTime(null);
      toast({ title: "Task stopped" });
    },
  });

 const submitTaskMutation = useMutation({
  mutationFn: async ({
    taskId,
    notes,
    status,
  }: {
    taskId: string;
    notes: string;
    status: string;
  }) => {
    const response = await fetch(`/api/intern/tasks/${taskId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes, status }),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to submit task");
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/intern/tasks"] });
    setShowSubmitDialog(false);
    setSelectedTask(null);
    setSubmitNotes("");
    setSubmitStatus("completed");
    toast({ title: "Task submitted for review" });
  },
});

//  const filteredTasks = tasks.filter(task => taskFilter === "all" ? true : task.status === taskFilter);

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return "No Project";
    const project = projects.find(p => p.id === projectId);
    return project?.name || "Unknown Project";
  };
  
  /** 🔍 FILTER + SEARCH LOGIC */
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      taskFilter === "all" ? true : task.status === taskFilter;

    const q = search.toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(q) ||
      task.status.toLowerCase().includes(q) ||
      (task.priority || "").toLowerCase().includes(q) ||
      getProjectName(task.projectId).toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });


  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      pending: "secondary",
      running: "default",
      completed: "outline",
      cancelled: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return <Badge className={colors[priority] || ""}>{priority}</Badge>;
  };
   const pendingCount = tasks.filter(t => t.status === "pending").length;
  const runningCount = tasks.filter(t => t.status === "running").length;
  const completedCount = tasks.filter(t => t.status === "completed").length;


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-sm text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{runningCount}</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <CardTitle>My Tasks</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={taskFilter} onValueChange={(v: any) => setTaskFilter(v)}>
              <SelectTrigger className="w-[150px]" data-testid="select-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Task Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowCreateTask(true)} data-testid="button-create-task">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
		 {/* 🔍 SEARCH BAR */}
          <Input
            placeholder="Search by task, project, status or priority..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No tasks found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{getProjectName(task.projectId)}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority || "medium")}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                        <Button
								  size="icon"
								  variant="outline"
								  className="h-9 w-9 rounded-xl"
								  onClick={() => {
									setSelectedTask(task);
									setShowViewDialog(true);
								  }}
								>
								  <Eye className="h-4 w-4" />
								</Button>
													

								{task.status === "pending" && (
								  <Button
									size="icon"
									  title="Start Task"
									aria-label="Start Task"
									className="h-9 w-9 rounded-xl bg-green-600 hover:bg-green-700 text-white"
									onClick={() => startTaskMutation.mutate(task.id)}
								  >
									<Play className="h-4 w-4" />
								  </Button>
								)}

								{/* Stop */}
								{task.status === "running" && (
								  <Button
									size="icon"
									 title="Stop Task"
									aria-label="Stop Task"
									className="h-9 w-9 rounded-xl bg-red-600 hover:bg-red-700 text-white"
									onClick={() => stopTaskMutation.mutate(task.id)}
								  >
									<Square className="h-4 w-4" />
								  </Button>
								)}

								{/* Submit */}
								{task.status === "running" || task.status === "pending" && (
								  <Button
									size="icon"
									 title="Submit Task"
									aria-label="Submit Task"
									className="h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
									onClick={() => {
									  setSelectedTask(task);
									  setShowSubmitDialog(true);
									}}
								  >
									<Send className="h-4 w-4" />
								  </Button>
								)}

								{/* Completed */}
								{task.status === "completed" && (
								  <CheckCircle className="h-6 w-6 text-green-600" />
								)}                      
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title"
                data-testid="input-task-title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task description"
                data-testid="input-task-description"
              />
            </div>
            <div>
              <Label>Project</Label>
              <Select value={newTask.projectId} onValueChange={(v) => setNewTask({ ...newTask, projectId: v })}>
                <SelectTrigger data-testid="select-project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                <SelectTrigger data-testid="select-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                data-testid="input-due-date"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTask(false)}>Cancel</Button>
            <Button
              onClick={() => createTaskMutation.mutate({
                title: newTask.title,
                description: newTask.description,
                priority: newTask.priority,
                dueDate: newTask.dueDate || null,
                projectId: newTask.projectId === "none" ? null : newTask.projectId || null,
              })}
              disabled={!newTask.title}
              data-testid="button-submit-task"
            >
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Title</Label>
                <p className="font-medium">{selectedTask.title}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p>{selectedTask.description || "No description"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(selectedTask.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <div>{getPriorityBadge(selectedTask.priority || "medium")}</div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Project</Label>
                <p>{getProjectName(selectedTask.projectId)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p>{selectedTask.createdAt ? formatDistanceToNow(new Date(selectedTask.createdAt), { addSuffix: true }) : "-"}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Task for Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>You are about to submit "{selectedTask?.title}" for admin review.</p>
			 {/* STATUS SELECT */}
      <div>
        <Label>Status</Label>
        <Select
          value={submitStatus}
          onValueChange={(v) => setSubmitStatus(v as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Select Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                value={submitNotes}
                onChange={(e) => setSubmitNotes(e.target.value)}
                placeholder="Add any notes about your work..."
                data-testid="input-submit-notes"
              />
            </div>
          </div>
		  
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
            <Button
              onClick={() => selectedTask && submitTaskMutation.mutate({ taskId: selectedTask.id, notes: submitNotes,status: submitStatus })}
              data-testid="button-confirm-submit"
            >
              Submit Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
