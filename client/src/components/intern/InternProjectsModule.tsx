import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReadMore } from "@/components/ui/readmore";
import { ExternalLink, Github, Globe } from "lucide-react";
import type { Project } from "@shared/schema";

interface InternProjectsModuleProps {
  projects: Project[];
}

export default function InternProjectsModule({ projects }: InternProjectsModuleProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      "in-progress": "default",
      completed: "secondary",
      "on-hold": "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-sm text-muted-foreground">Total Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {projects.filter(p => p.status === "in-progress").length}
            </div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {projects.filter(p => p.status === "completed").length}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6 text-center text-muted-foreground">
              No projects available
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => (
            <Card key={project.id} data-testid={`card-project-${project.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                 
                </div>
				 <p>{getStatusBadge(project.status)}</p>
                <CardDescription>
  <ReadMore text={project.description || ""} wordLimit={30} />
</CardDescription>

              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Start Date: </span>
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : "-"}
                  </div>
                  {project.endDate && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">End Date: </span>
                      {new Date(project.endDate).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    {project.repositoryUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(project.repositoryUrl!, "_blank")}
                        data-testid={`button-github-${project.id}`}
                      >
                        <Github className="h-4 w-4 mr-1" />
                        GitHub
                      </Button>
                    )}
                    {project.deployedUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(project.deployedUrl!, "_blank")}
                        data-testid={`button-demo-${project.id}`}
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Demo
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
