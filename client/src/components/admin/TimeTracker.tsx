import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Calendar, TrendingUp, Eye } from "lucide-react";
import type { TimeLog } from "@shared/schema";

/* ================= COMPONENT ================= */

export default function TimeTracker() {
  const [selectedLog, setSelectedLog] = useState<TimeLog | null>(null);
  const [search, setSearch] = useState("");

  /* ---------- PAGINATION ---------- */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /* ================= FETCH ================= */

  const { data: timeLogs = [], isLoading } = useQuery<TimeLog[]>({
    queryKey: ["admin-time-logs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/time-logs", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch time logs");
      return res.json();
    },
  });

  const { data: interns = [] } = useQuery<any[]>({
    queryKey: ["interns"],
    queryFn: async () => {
      const res = await fetch("/api/interns", { credentials: "include" });
      return res.json();
    },
  });

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks", { credentials: "include" });
      return res.json();
    },
  });

  /* ================= HELPERS ================= */

  const getInternName = (internId: string) =>
    interns.find((i) => i.id === internId)?.name || "Unknown";

  const getTaskName = (taskId: string | null) =>
    tasks.find((t) => t.id === taskId)?.title || "-";

  const calculateDuration = (start: string, end: string | null) => {
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const diff = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const isZeroDuration = (log: TimeLog) => {
    if (log.duration !== null && log.duration !== undefined) {
      return log.duration <= 0;
    }
    if (log.endTime) {
      return (
        new Date(log.endTime).getTime() -
          new Date(log.startTime).getTime() <=
        0
      );
    }
    return false;
  };

  /* ================= FILTER ================= */

  const filteredLogs = timeLogs
    .filter((log) => !isZeroDuration(log))
    .filter((log) => {
      const q = search.toLowerCase();
      return (
        getInternName(log.internId).toLowerCase().includes(q) ||
        getTaskName(log.taskId).toLowerCase().includes(q) ||
        log.logType.toLowerCase().includes(q) ||
        (log.notes ?? "").toLowerCase().includes(q) ||
        (log.endTime ? "completed" : "active").includes(q)
      );
    });

  /* ================= PAGINATION LOGIC ================= */

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ================= STATS ================= */

  const totalHours = timeLogs.reduce((sum, log) => {
    if (log.duration) return sum + log.duration / 60;
    if (!log.endTime) {
      const diff =
        new Date().getTime() - new Date(log.startTime).getTime();
      return sum + diff / (1000 * 60 * 60);
    }
    return sum;
  }, 0);

  const todayLogs = timeLogs.filter(
    (log) =>
      new Date(log.startTime).toDateString() === new Date().toDateString()
  );

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading time logs...
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Clock} label="Total Hours" value={`${totalHours.toFixed(1)}h`} />
        <StatCard icon={Calendar} label="Today’s Logs" value={todayLogs.length} />
        <StatCard icon={TrendingUp} label="Total Logs" value={timeLogs.length} />
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Time Logs</CardTitle>
        </CardHeader>
        <CardContent>

          <Input
            placeholder="Search by intern, task, type, status, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Intern</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No matching time logs
                    </TableCell>
                  </TableRow>
                )}

                {paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{getInternName(log.internId)}</TableCell>
                    <TableCell>{getTaskName(log.taskId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.logType}</Badge>
                    </TableCell>
                    <TableCell>{new Date(log.startTime).toLocaleString()}</TableCell>
                    <TableCell>
                      {log.endTime ? new Date(log.endTime).toLocaleString() : "In Progress"}
                    </TableCell>
                    <TableCell>
                      {log.duration
                        ? `${Math.floor(log.duration / 60)}h ${log.duration % 60}m`
                        : calculateDuration(log.startTime, log.endTime)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.endTime ? "default" : "secondary"}>
                        {log.endTime ? "Completed" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => setSelectedLog(log)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* PAGINATION UI */}
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

      {/* VIEW DIALOG */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Time Log Details</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-2 text-sm">
              <p><b>Intern:</b> {getInternName(selectedLog.internId)}</p>
              <p><b>Task:</b> {getTaskName(selectedLog.taskId)}</p>
              <p><b>Type:</b> {selectedLog.logType}</p>
              <p><b>Start:</b> {new Date(selectedLog.startTime).toLocaleString()}</p>
              <p><b>End:</b> {selectedLog.endTime ? new Date(selectedLog.endTime).toLocaleString() : "In Progress"}</p>
              <p><b>Duration:</b> {selectedLog.duration
                ? `${Math.floor(selectedLog.duration / 60)}h ${selectedLog.duration % 60}m`
                : calculateDuration(selectedLog.startTime, selectedLog.endTime)}
              </p>
              <p><b>Status:</b> {selectedLog.endTime ? "Completed" : "Active"}</p>
              <p><b>Commit:</b> {selectedLog.notes}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({ icon: Icon, label, value }: any) {
  return (
    <Card>
      <CardContent className="pt-6 flex gap-4 items-center">
        <Icon className="h-6 w-6 text-primary" />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
