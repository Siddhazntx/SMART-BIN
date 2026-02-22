import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [newAdmin, setNewAdmin] = useState({ email: "", name: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setAdmins(data || []);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.email || !newAdmin.name) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("admins").insert(newAdmin);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Admin added successfully" });
      setNewAdmin({ email: "", name: "" });
      fetchAdmins();
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    const { error } = await supabase.from("admins").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Admin deleted" });
      fetchAdmins();
    }
  };

  return (
    <div className="min-h-screen bg-background/50">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Settings</h1>
          <p className="text-muted-foreground">Configure waste category thresholds and manage admins</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Admin Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Admin Email"
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              />
              <Input
                placeholder="Admin Name"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              />
              <Button onClick={handleAddAdmin} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Admin
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-semibold">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAdmin(admin.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Waste Category Thresholds</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Configure thresholds for triggering collection requests. Currently, requests are triggered automatically when dustbins reach 90% capacity.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}