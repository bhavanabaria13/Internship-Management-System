
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, CheckCircle, XCircle, PlayCircle, FolderKanban } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Task, Project, TimeLog } from "@shared/schema";

interface InternDashboardOverviewProps {
  tasks: Task[];
  projects: Project[];
}

export default function InternDashboardOverview({ tasks, projects }: InternDashboardOverviewProps) {
  const { data: timeLogs = [] } = useQuery<TimeLog[]>({
    queryKey: ["/api/intern/time-logs"],
    queryFn: async () => {
      const res = await fetch("/api/intern/time-logs", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch time logs");
      return res.json();
    },
  });

  const runningTasks = tasks.filter(t => t.status === "running");
  const completedTasks = tasks.filter(t => t.status === "completed");
  const cancelledTasks = tasks.filter(t => t.status === "cancelled");
  const projectCount = projects.length;

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return "No Project";
    const project = projects.find(p => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  const getTaskTimeSpent = (taskId: string) => {
    const taskTimeLogs = timeLogs.filter(log => log.taskId === taskId);
    let totalMinutes = 0;

    taskTimeLogs.forEach(log => {
      if (log.duration) {
        totalMinutes += log.duration;
      } else if (!log.endTime) {
        // Active log - calculate current elapsed time
        const elapsed = Math.floor((new Date().getTime() - new Date(log.startTime).getTime()) / 60000);
        totalMinutes += elapsed;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return totalMinutes > 0 ? `${hours}h ${mins}m` : "0m";
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return <Badge className={colors[priority] || ""}>{priority}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                <PlayCircle className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{runningTasks.length}</p>
                <p className="text-sm text-muted-foreground">Running</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTasks.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{cancelledTasks.length}</p>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                <FolderKanban className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{projectCount}</p>
                <p className="text-sm text-muted-foreground">Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tasks.length}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Running Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-blue-500" />
            Latest Running Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {runningTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No running tasks</p>
                <p className="text-sm">Start a task to see it here</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Title</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Time Spent</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runningTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getProjectName(task.projectId)}</Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(task.priority || "medium")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{getTaskTimeSpent(task.id)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.createdAt 
                          ? formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? (
                          <div className="flex items-center gap-1">
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            {new Date(task.dueDate) < new Date() && (
                              <Badge variant="destructive" className="text-xs">Overdue</Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No due date</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
