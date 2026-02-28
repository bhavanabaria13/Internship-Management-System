import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";

/* ================= TYPES ================= */

type Intern = {
  id: string;
  name: string;
};

type Project = {
  id: string;
  name: string;
};

/* ================= COMPONENT ================= */

export default function TaskManagement() {
  const { toast } = useToast();

  /* ---------- STATE ---------- */

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  /* ---------- RESET PAGE ON SEARCH ---------- */

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /* ---------- QUERIES ---------- */

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks", { credentials: "include" });
      return res.json();
    },
  });

  const { data: interns = [] } = useQuery<Intern[]>({
    queryKey: ["/api/admin/interns-with-status"],
    queryFn: async () => {
      const res = await fetch("/api/admin/interns-with-status", {
        credentials: "include",
      });
      return res.json();
    },
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/admin/projects"],
    queryFn: async () => {
      const res = await fetch("/api/admin/projects", {
        credentials: "include",
      });
      return res.json();
    },
  });

  /* ---------- HELPERS ---------- */

  const getInternName = (id: string | null) =>
    interns.find((i) => i.id === id)?.name || "Unassigned";

  const getProjectName = (id: string | null) =>
    projects.find((p) => p.id === id)?.name || "No Project";

  /* ---------- FILTER ---------- */

  const filteredTasks = tasks.filter((task) => {
    const q = search.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      task.status.toLowerCase().includes(q) ||
      task.priority.toLowerCase().includes(q) ||
      getInternName(task.assignedTo).toLowerCase().includes(q) ||
      getProjectName(task.projectId).toLowerCase().includes(q)
    );
  });

  /* ---------- PAGINATION ---------- */

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ---------- MUTATIONS ---------- */

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task deleted successfully" });
    },
  });

  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      {/* ===== TOP STATS ===== */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-sm">
          <span className="text-muted-foreground">Total</span>
          <Badge variant="secondary">{tasks.length}</Badge>
        </div>

        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-sm">
          <span className="text-muted-foreground">Pending</span>
          <Badge className="bg-yellow-500/10 text-yellow-500">
            {tasks.filter(t => t.status === "pending").length}
          </Badge>
        </div>

        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-sm">
          <span className="text-muted-foreground">Completed</span>
          <Badge className="bg-green-500/10 text-green-500">
            {tasks.filter(t => t.status === "completed").length}
          </Badge>
        </div>
      </div>

      {/* ===== MAIN CARD ===== */}
      <Card>
        <CardHeader className="flex flex-col gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-semibold">
            Task Management
          </CardTitle>

          <div className="flex w-full sm:w-auto gap-2">
            <Input
              placeholder="Search by task, intern, project, status, or priority..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-[320px]"
            />

            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{getProjectName(task.projectId)}</TableCell>
                  <TableCell>{getInternName(task.assignedTo)}</TableCell>

                  <TableCell>
                    <Badge
                      className={
                        task.status === "completed"
                          ? "bg-green-500/10 text-green-500"
                          : task.status === "running"
                          ? "bg-blue-500/10 text-blue-500"
                          : task.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-red-500/10 text-red-500"
                      }
                    >
                      {task.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={
                        task.priority === "high"
                          ? "bg-red-500/10 text-red-500"
                          : task.priority === "medium"
                          ? "bg-orange-500/10 text-orange-500"
                          : "bg-green-500/10 text-green-500"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "-"}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingTask(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deleteMutation.mutate(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* ===== PAGINATION ===== */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
