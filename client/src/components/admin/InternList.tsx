import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, Download, Trash2, Search, FileText, Loader2, Edit, CheckCircle, XCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Intern } from "@shared/schema";

interface InternListProps {
  compact?: boolean;
}

export default function InternList({ compact = false }: InternListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingCV, setViewingCV] = useState<Intern | null>(null);
  const [deletingIntern, setDeletingIntern] = useState<Intern | null>(null);
  const [editingIntern, setEditingIntern] = useState<Intern | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10; // change if you want

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    education: "",
    city: "",
    github: "",
    linkedin: "",
    skills: "",
    workExperience: "",
    projects: "",
    approvalStatus: 0,
  });
  const { toast } = useToast();

  const { data: interns = [], isLoading, error, refetch } = useQuery<any[]>({
    queryKey: ["/api/admin/interns-with-status"],
    queryFn: async () => {
      const response = await fetch("/api/admin/interns-with-status", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch interns");
      return response.json();
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  console.log("InternList - Loading:", isLoading);
  console.log("InternList - Error:", error);
  console.log("InternList - Interns count:", interns.length);


  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/interns/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete intern");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/interns-with-status"] });
      toast({ title: "Success", description: "Intern deleted successfully" });
      setDeletingIntern(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete intern", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/interns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update intern");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/interns-with-status"] });
      toast({ title: "Success", description: "Intern updated successfully" });
      setEditingIntern(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update intern", variant: "destructive" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (internId: string) => {
      const response = await fetch(`/api/admin/approve-intern/${internId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "123456" }),
      });
      if (!response.ok) throw new Error("Failed to approve");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/interns-with-status"] });
      toast({ title: "Success", description: "Intern approved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve intern", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (internId: string) => {
      const response = await fetch(`/api/admin/reject-intern/${internId}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to reject");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/interns-with-status"] });
      toast({ title: "Success", description: "Intern rejected" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject intern", variant: "destructive" });
    },
  });

  const getSkillsArray = (skills: string | string[]): string[] => {
    if (Array.isArray(skills)) return skills;
    return skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : [];
  };
  useEffect(() => {
  setCurrentPage(1);
}, [searchQuery]);

  const filteredInterns = interns.filter(intern => 
  intern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  intern.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
  intern.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
  (intern.skills || "").toLowerCase().includes(searchQuery.toLowerCase())
);

const totalPages = Math.ceil(filteredInterns.length / itemsPerPage);


const paginatedInterns = compact
  ? filteredInterns.slice(0, 5)
  : filteredInterns.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  const handleDelete = (intern: Intern) => {
    deleteMutation.mutate(intern.id);
  };

  const handleDownloadCV = (intern: Intern) => {
    window.open(`/api/interns/${intern.id}/cv`, "_blank");
  };

  const handleEdit = (intern: any) => {
    setEditingIntern(intern);
    setEditForm({
      name: intern.name,
      email: intern.email,
      phone: intern.phone,
      education: intern.education,
      city: intern.city,
      github: intern.github || "",
      linkedin: intern.linkedin || "",
      skills: intern.skills || "",
      workExperience: intern.workExperience || "",
      projects: intern.projects || "",
      approvalStatus: intern.approvalStatus ?? 0,
    });
  };

  const handleUpdate = async () => {
    if (editingIntern) {
      // Update intern data
      await updateMutation.mutateAsync({ id: editingIntern.id, data: editForm });

      // Update approval status if it changed
      const currentStatus = (editingIntern as any).approvalStatus ?? 0;
      if (editForm.approvalStatus !== currentStatus) {
        if (editForm.approvalStatus === 1) {
          await approveMutation.mutateAsync(editingIntern.id);
        } else if (editForm.approvalStatus === 2) {
          await rejectMutation.mutateAsync(editingIntern.id);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      {!compact && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, city, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-interns"
            />
          </div>
        </div>
      )}

      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className={compact ? "hidden md:table-cell" : ""}>Email</TableHead>
              {!compact && <TableHead className="hidden lg:table-cell">Phone</TableHead>}
              <TableHead className="hidden md:table-cell">Education</TableHead>
              <TableHead className="hidden lg:table-cell">Skills</TableHead>
              <TableHead className="hidden sm:table-cell">Applied</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInterns.map((intern) => (
              <TableRow key={intern.id} data-testid={`row-intern-${intern.id}`}>
                <TableCell className="font-medium">{intern.name}</TableCell>
                <TableCell className={compact ? "hidden md:table-cell" : ""}>{intern.email}</TableCell>
                {!compact && <TableCell className="hidden lg:table-cell">{intern.phone}</TableCell>}
                <TableCell className="hidden md:table-cell max-w-[200px] truncate">{intern.education}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {getSkillsArray(intern.skills).slice(0, 2).map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {getSkillsArray(intern.skills).length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{getSkillsArray(intern.skills).length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {new Date(intern.appliedDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    {intern.cvFilename && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingCV(intern)}
                          data-testid={`button-view-cv-${intern.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadCV(intern)}
                          data-testid={`button-download-cv-${intern.id}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(intern)}
                      data-testid={`button-edit-${intern.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {((intern as any).approvalStatus === 0 || (intern as any).approvalStatus === null) && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => approveMutation.mutate(intern.id)}
                          className="text-green-600 hover:text-green-700"
                          data-testid={`button-approve-${intern.id}`}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => rejectMutation.mutate(intern.id)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-reject-${intern.id}`}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingIntern(intern)}
                      className="text-destructive hover:text-destructive"
                      data-testid={`button-delete-${intern.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
	  {!compact && totalPages > 1 && (
  <div className="flex items-center justify-between mt-4">
    <p className="text-sm text-muted-foreground">
      Page {currentPage} of {totalPages}
    </p>

    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
      >
        Previous
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
      >
        Next
      </Button>
    </div>
  </div>
)}



      <Dialog open={!!viewingCV} onOpenChange={() => setViewingCV(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              CV - {viewingCV?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-muted rounded-lg p-8 min-h-[400px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">{viewingCV?.cvOriginalName}</p>
              <p className="text-sm mt-2">Click download to view the CV</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setViewingCV(null)}>
              Close
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-500 to-blue-600"
              onClick={() => viewingCV && handleDownloadCV(viewingCV)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download CV
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingIntern} onOpenChange={() => setEditingIntern(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Intern - {editingIntern?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Education</Label>
              <Input value={editForm.education} onChange={(e) => setEditForm({ ...editForm, education: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>GitHub</Label>
                <Input value={editForm.github} onChange={(e) => setEditForm({ ...editForm, github: e.target.value })} />
              </div>
              <div>
                <Label>LinkedIn</Label>
                <Input value={editForm.linkedin} onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Skills</Label>
              <Input value={editForm.skills} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })} />
            </div>
            <div>
              <Label>Work Experience</Label>
              <Textarea value={editForm.workExperience} onChange={(e) => setEditForm({ ...editForm, workExperience: e.target.value })} />
            </div>
            <div>
              <Label>Projects</Label>
              <Textarea value={editForm.projects} onChange={(e) => setEditForm({ ...editForm, projects: e.target.value })} />
            </div>
            <div>
              <Label>Approval Status</Label>
              <Select value={String(editForm.approvalStatus)} onValueChange={(v) => setEditForm({ ...editForm, approvalStatus: parseInt(v) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Pending</SelectItem>
                  <SelectItem value="1">Approved</SelectItem>
                  <SelectItem value="2">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingIntern(null)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingIntern} onOpenChange={() => setDeletingIntern(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Intern Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the record for <strong>{deletingIntern?.name}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingIntern && handleDelete(deletingIntern)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}