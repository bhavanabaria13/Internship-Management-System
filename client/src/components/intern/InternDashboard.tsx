import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ClipboardList,
  LogOut,
  User,
  FolderKanban,
  Calendar,
  Menu,
  Clock 
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import InternTasksModule from "./InternTasksModule";
import InternProjectsModule from "./InternProjectsModule";
import InternProfileModule from "./InternProfileModule";
import InternWeeklyUpdatesModule from "./InternWeeklyUpdatesModule";
import InternDashboardOverview from "./InternDashboardOverview";
import type { Task, Project } from "@shared/schema";
import InternTimeLogsModule from "./InternTimeLogsModule";
import TrainingModule from "../training/TrainingModule";
import { BookOpen } from "lucide-react";

export default function InternDashboard() {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();

  const { data: profile } = useQuery<any>({
    queryKey: ["/api/intern/profile"],
    queryFn: async () => {
      const res = await fetch("/api/intern/profile", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    },
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/intern/tasks"],
    queryFn: async () => {
      const res = await fetch("/api/intern/tasks", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const text = await res.text();
      return text ? JSON.parse(text) : [];
    },
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/intern/projects"],
    queryFn: async () => {
      const res = await fetch("/api/intern/projects", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch projects");
      const text = await res.text();
      return text ? JSON.parse(text) : [];
    },
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/intern/logout", {
        method: "POST",
        credentials: "include",
      });
      setLocation("/intern/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getCurrentView = () => {
    if (location.includes("/intern/dashboard")) return "dashboard";
    if (location.includes("/intern/tasks")) return "tasks";
    if (location.includes("/intern/projects")) return "projects";
    if (location.includes("/intern/profile")) return "profile";
    if (location.includes("/intern/training")) return "training";
    if (location.includes("/intern/weekly-updates")) return "weekly-updates";
	 if (location.includes("/intern/time-logs")) return "time-logs";
    return "dashboard";
  };

  const currentView = getCurrentView();

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <InternDashboardOverview tasks={tasks} projects={projects} />;
      case "tasks":
        return <InternTasksModule tasks={tasks} projects={projects} />;
      case "projects":
        return <InternProjectsModule projects={projects} />;
      case "profile":
        return <InternProfileModule profile={profile} />;
      case "training":
        return profile ? <TrainingModule internId={profile.id} internName={profile.name} /> : null;
      case "weekly-updates":
        return <InternWeeklyUpdatesModule profile={profile} />;
		case "time-logs": // ✅ NEW
      return <InternTimeLogsModule />;
      default:
        return <InternDashboardOverview tasks={tasks} projects={projects} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-0 -translate-x-full md:translate-x-0 md:w-16'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">EA</span>
              </div>
              {sidebarOpen && <span className="font-bold text-lg text-sidebar-foreground">Intern Portal</span>}
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Button
              variant={currentView === "dashboard" ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center px-2'}`}
              onClick={() => setLocation("/intern/dashboard")}
              data-testid="nav-dashboard"
            >
              <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && "Dashboard"}
            </Button>
            <Button
              variant={currentView === "tasks" ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center px-2'}`}
              onClick={() => setLocation("/intern/tasks")}
              data-testid="nav-tasks"
            >
              <ClipboardList className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && "Tasks"}
            </Button>
            <Button
              variant={currentView === "projects" ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center px-2'}`}
              onClick={() => setLocation("/intern/projects")}
              data-testid="nav-projects"
            >
              <FolderKanban className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && "Projects"}
            </Button>
            <Button
              variant={currentView === "profile" ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center px-2'}`}
              onClick={() => setLocation("/intern/profile")}
              data-testid="nav-profile"
            >
              <User className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && "Profile"}
            </Button>

            <Button
              variant={currentView === "training" ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center px-2'}`}
              onClick={() => setLocation("/intern/training")}
              data-testid="nav-training"
            >
              <BookOpen className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && "Training"}
            </Button>
			
<Button
  variant={currentView === "time-logs" ? "secondary" : "ghost"}
  className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center px-2'}`}
  onClick={() => setLocation("/intern/time-logs")}
  data-testid="nav-time-logs"
  title="Time Logs"
>
  <Clock className="h-5 w-5 flex-shrink-0" />
  {sidebarOpen && "Time Logs"}
</Button>

            <Button
              variant={currentView === "weekly-updates" ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center px-2'}`}
              onClick={() => setLocation("/intern/weekly-updates")}
              data-testid="nav-weekly-updates"
            >
              <Calendar className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && "Weekly Updates"}
            </Button>
          </nav>

          <div className="p-4 border-t border-sidebar-border space-y-2">
            {profile && sidebarOpen && (
              <div className="px-2 py-2 text-sm text-muted-foreground">
                {profile.name}
              </div>
            )}
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 ${!sidebarOpen && 'justify-center px-2'}`}
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && "Logout"}
            </Button>
          </div>
        </div>
      </aside>

      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0 md:ml-16'}`}>
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                data-testid="button-toggle-sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold capitalize">{currentView.replace("-", " ")}</h1>
            </div>
          </div>
        </header>

        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
