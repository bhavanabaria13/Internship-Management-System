import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ExamManagement from "./ExamManagement";

import {
  Users, FileText, Clock, TrendingUp,
  LogOut, LayoutDashboard, List, Download,
  Menu, Loader2, Calendar, ClipboardList, UserCheck,
  CheckCircle, XCircle, AlertCircle, BarChart3, Mail, FolderKanban
} from "lucide-react";
import InternList from "./InternList";
import WeeklyUpdates from "./WeeklyUpdates";
import TaskManagement from "./TaskManagement";
import ProjectManagement from "./ProjectManagement";
import InternApproval from "./InternApproval";
import TimeTracker from "./TimeTracker";
import InternProgressChart from "./InternProgressChart";
import ExcelImport from "./ExcelImport";
import ContactMessages from "./ContactMessages";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Intern } from "@shared/schema";

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Check admin session on mount
  const { data: adminCheck, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["/api/admin/check"],
    queryFn: async () => {
      const response = await fetch("/api/admin/check", {
        credentials: "include", // Important: include credentials for session cookies
      });
      if (!response.ok) throw new Error("Not authenticated");
      return response.json();
    },
    refetchInterval: 30000, // Check every 30 seconds
    retry: false,
  });

  // Redirect to login if not admin
  useEffect(() => {
    if (!isCheckingAdmin && !adminCheck?.isAdmin) {
      setLocation("/admin/login");
    }
  }, [adminCheck, isCheckingAdmin, setLocation]);

  const { data: interns = [] } = useQuery<Intern[]>({
    queryKey: ["/api/interns"],
    enabled: !!adminCheck?.isAdmin,
  });

  const { data: internsWithStatus = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/interns-with-status"],
    enabled: !!adminCheck?.isAdmin,
  });

  // Analytics calculations
  const activeInterns = internsWithStatus.filter(i => i.approvalStatus === 1);
  const pendingInterns = internsWithStatus.filter(i => i.approvalStatus === 0 || i.approvalStatus === null);
  const rejectedInterns = internsWithStatus.filter(i => i.approvalStatus === 2);

  const approvalRate = internsWithStatus.length > 0
    ? Math.round((activeInterns.length / internsWithStatus.length) * 100)
    : 0;

  const cityDistribution = activeInterns.reduce((acc: any, intern) => {
    acc[intern.city] = (acc[intern.city] || 0) + 1;
    return acc;
  }, {});

  const topCities = Object.entries(cityDistribution)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  const skillsDistribution = activeInterns.reduce((acc: any, intern) => {
    const skills = intern.skills?.split(',').map((s: string) => s.trim()) || [];
    skills.forEach((skill: string) => {
      if (skill) acc[skill] = (acc[skill] || 0) + 1;
    });
    return acc;
  }, {});

  const topSkills = Object.entries(skillsDistribution)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      setLocation('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  
const { data: adminStats, isLoading: isStatsLoading } = useQuery({
  queryKey: ["/api/admin/stats"],
  enabled: !!adminCheck?.isAdmin,
  queryFn: async () => {
    const res = await fetch("/api/admin/stats", {
      credentials: "include", // VERY IMPORTANT for admin session
    });
    if (!res.ok) throw new Error("Failed to fetch admin stats");
    return res.json();
  },
});



const statsData = {
  totalInterns: isStatsLoading ? "…" : adminStats?.totalInterns ?? 0,
  totalProjects: isStatsLoading ? "…" : adminStats?.totalProjects ?? 0,
  totalTasks: isStatsLoading ? "…" : adminStats?.totalTasks ?? 0,
  totalWeeklyUpdates: isStatsLoading ? "…" : adminStats?.totalWeeklyUpdates ?? 0,
};


const stats = [
  {
    label: "Total Interns",
    value: statsData.totalInterns,
    icon: Users,
    change: "All registered interns",
  },
  {
    label: "Projects",
    value: statsData.totalProjects,
    icon: FolderKanban,
    change: "Total projects",
  },
  {
    label: "Tasks",
    value: statsData.totalTasks,
    icon: ClipboardList,
    change: "Assigned tasks",
  },
  {
    label: "Weekly Records",
    value: statsData.totalWeeklyUpdates,
    icon: Calendar,
    change: "Submitted updates",
  },
];



  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/interns/export");
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `interns-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "Success", description: "Excel file downloaded successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to export data", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSetupTestIntern = async () => {
    try {
      const response = await fetch("/api/setup-test-intern", { method: "POST" });
      if (!response.ok) throw new Error("Setup failed");

      const data = await response.json();
      toast({
        title: "Test Account Created",
        description: `Email: ${data.email}, Password: ${data.password}`,
        duration: 10000
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to setup test account", variant: "destructive" });
    }
  };

  const handleImportSpreadsheet = async () => {
    try {
      // Sample data structure - replace with actual spreadsheet data
      const spreadsheetData = [
        {
          fullName: "John Doe",
          email: "john.doe@example.com",
          phone: "1234567890",
          program: "Computer Science",
          learningTopics: "React, TypeScript, Node.js",
          tasksCompleted: "Built user authentication system",
          workOutput: "Auth API with JWT tokens",
          githubLink: "https://github.com/johndoe/auth-system",
          city: "New York"
        }
        // Add more rows from your spreadsheet
      ];

      const response = await fetch("/api/admin/import-spreadsheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: spreadsheetData })
      });

      if (!response.ok) throw new Error("Import failed");

      const result = await response.json();
      toast({
        title: "Import Completed",
        description: `Imported: ${result.imported}, Skipped: ${result.skipped}`,
        duration: 5000
      });

      // Refresh the intern list
      queryClient.invalidateQueries({ queryKey: ["/api/interns"] });
    } catch (error) {
      toast({ title: "Error", description: "Failed to import data", variant: "destructive" });
    }
  };

  const thisMonth = interns.filter(i => {
    const applied = new Date(i.appliedDate);
    const now = new Date();
    return applied.getMonth() === now.getMonth() && applied.getFullYear() === now.getFullYear();
  }).length;

  

  return (
    <div className="min-h-screen bg-background">
      <aside className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-0 -translate-x-full md:translate-x-0 md:w-16'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">EA</span>
              </div>
              {sidebarOpen && <span className="font-bold text-lg text-sidebar-foreground">Admin Panel</span>}
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Button
              variant={location.startsWith("/admin/dashboard") ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center px-2'}`}
              onClick={() => setLocation("/admin/dashboard")}
              data-testid="nav-dashboard"
            >
              <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && "Dashboard"}
            </Button>
            <Button
              variant={location.startsWith("/admin/approval") ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center px-2'}`}
              onClick={() => setLocation("/admin/approval")}
              data-testid="nav-approval"
            >
              <UserCheck className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && "Intern Approval"}
            </Button>
            <Button
              variant={location.startsWith("/admin/interns") ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center px-2'}`}
              onClick={() => setLocation("/admin/interns")}
              data-testid="nav-interns"
            >
              <List className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && "Intern List"}
            </Button>
            <Button
              variant={location.startsWith("/admin/tasks") ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center px-2'}`}
              onClick={() => setLocation("/admin/tasks")}
              data-testid="nav-tasks"
            >
              <ClipboardList className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && "Task Management"}
            </Button>
            <Button
              variant={location.startsWith("/admin/projects") ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center px-2'}`}
              onClick={() => setLocation("/admin/projects")}
              data-testid="nav-projects"
            >
              <FolderKanban className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && "Project Management"}
            </Button>
            <Button 
              variant={location.startsWith("/admin/weekly") ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center px-2'}`}
              onClick={() => setLocation("/admin/weekly")}
              data-testid="nav-weekly" 
            >
              <Calendar className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && "Weekly Updates"}
            </Button>
            <Button
              variant={location.startsWith("/admin/time-tracker") ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center px-2'}`}
              onClick={() => setLocation("/admin/time-tracker")}
              data-testid="nav-time-tracker"
            >
              <Clock className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && "Time Tracker"}
            </Button>
            <Button
              variant={location.startsWith("/admin/import") ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center px-2'}`}
              onClick={() => setLocation("/admin/import")}
              data-testid="nav-import"
            >
              <Download className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && "Import Excel"}
            </Button>
            <Button
              variant={location.startsWith("/admin/contact") ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${!sidebarOpen && 'justify-center px-2'}`}
              onClick={() => setLocation("/admin/contact")}
              data-testid="nav-contact"
            >
              <Mail className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && "Contact Messages"}
            </Button>
			
		

          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 text-muted-foreground hover:text-foreground ${!sidebarOpen && 'justify-center px-2'}`}
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
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                data-testid="button-toggle-sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
             <h1 className="text-xl font-semibold">
			  {location.startsWith("/admin/dashboard") ? "Dashboard" :
			   location.startsWith("/admin/interns") ? "Intern List" :
			   //location.startsWith("/admin/exams") ? "Exam Management" :
			   location.startsWith("/admin/tasks") ? "Task Management" :
			   location.startsWith("/admin/projects") ? "Project Management" :
			   location.startsWith("/admin/approval") ? "Approve Interns" :
			   location.startsWith("/admin/time-tracker") ? "Time Tracker" :
			   location.startsWith("/admin/import") ? "Import Excel" :
			   location.startsWith("/admin/contact") ? "Contact Messages" :
			   "Weekly Updates"}
			</h1>

            </div>
            <div className="flex items-center gap-3">
              
              <Badge variant="secondary" className="hidden sm:flex">Admin</Badge>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">A</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {location.startsWith("/admin/dashboard") ? (
            <>
              
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			  {stats.map((stat, index) => (
				<Card key={index} className="border-border/50">
				  <CardContent className="p-6">
					<div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-600/20 flex items-center justify-center mb-4">
					  <stat.icon className="h-6 w-6 text-purple-400" />
					</div>
					<p className="text-4xl font-bold mb-1">{stat.value}</p>
					<p className="text-sm uppercase text-muted-foreground">{stat.label}</p>
					<p className="text-xs text-muted-foreground">{stat.change}</p>
				  </CardContent>
				</Card>
			  ))}
			</div>


              {/* Approval Status Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{activeInterns.length}</p>
                        <p className="text-sm text-muted-foreground">Active Interns</p>
                      </div>
                    </div>
                    <Progress value={(activeInterns.length / Math.max(internsWithStatus.length, 1)) * 100} className="h-2" />
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-600/20 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{pendingInterns.length}</p>
                        <p className="text-sm text-muted-foreground">Pending Approval</p>
                      </div>
                    </div>
                    <Progress value={(pendingInterns.length / Math.max(internsWithStatus.length, 1)) * 100} className="h-2 [&>div]:bg-yellow-500" />
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
                        <XCircle className="h-6 w-6 text-red-400" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{rejectedInterns.length}</p>
                        <p className="text-sm text-muted-foreground">Rejected</p>
                      </div>
                    </div>
                    <Progress value={(rejectedInterns.length / Math.max(internsWithStatus.length, 1)) * 100} className="h-2 [&>div]:bg-red-500" />
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* City Distribution */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Top Cities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topCities.length > 0 ? topCities.map(([city, count]: any, index) => (
                        <div key={city}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{city}</span>
                            <span className="text-sm text-muted-foreground">{count} intern{count !== 1 ? 's' : ''}</span>
                          </div>
                          <Progress
                            value={(count / activeInterns.length) * 100}
                            className="h-2"
                          />
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No active interns yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Distribution */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Top Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topSkills.length > 0 ? topSkills.map(([skill, count]: any, index) => (
                        <div key={skill}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{skill}</span>
                            <span className="text-sm text-muted-foreground">{count} intern{count !== 1 ? 's' : ''}</span>
                          </div>
                          <Progress
                            value={(count / activeInterns.length) * 100}
                            className="h-2"
                          />
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No skills data yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Approval Rate Card */}
              <Card className="border-border/50 mb-8">
                <CardHeader>
                  <CardTitle>Overall Approval Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Approved vs Total Applications</span>
                      <span className="text-2xl font-bold">{approvalRate}%</span>
                    </div>
                    <Progress value={approvalRate} className="h-4" />
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-500">{activeInterns.length}</p>
                        <p className="text-xs text-muted-foreground">Approved</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-500">{pendingInterns.length}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-500">{rejectedInterns.length}</p>
                        <p className="text-xs text-muted-foreground">Rejected</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Intern Progress Card */}
              <InternProgressChart />

              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <CardTitle>Recent Applications</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation("/admin/interns")}
                    data-testid="button-view-all"
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <InternList compact />
                </CardContent>
              </Card>
            </>
          ) : location.startsWith("/admin/interns") ? (
            <Card className="border-border/50">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
                <CardTitle>All Interns</CardTitle>
                <Button
                  className="bg-gradient-to-r from-purple-500 to-blue-600"
                  onClick={handleExportExcel}
                  disabled={isExporting}
                  data-testid="button-export-excel"
                >
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Export to Excel
                </Button>
              </CardHeader>
              <CardContent>
                <InternList />
              </CardContent>
            </Card>
          ) : location.startsWith("/admin/tasks") ? (
            <TaskManagement />
			) : location.startsWith("/admin/exams") ? (
  <ExamManagement />
          ) : location.startsWith("/admin/projects") ? (
            <ProjectManagement />
          ) : location.startsWith("/admin/approval") ? (
            <InternApproval />
          ) : location.startsWith("/admin/time-tracker") ? (
            <TimeTracker />
          ) : location.startsWith("/admin/import") ? (
            <ExcelImport />
          ) : location.startsWith("/admin/contact") ? (
            <ContactMessages />
          ) : (
            <WeeklyUpdates />
          )}
        </div>
      </main>
    </div>
  );
}