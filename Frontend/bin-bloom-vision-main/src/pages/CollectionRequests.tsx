import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function CollectionRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("collection_requests")
      .select(`
        *,
        dustbins (dustbin_number, location),
        vehicles (vehicle_number, driver_name)
      `)
      .order("requested_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRequests(data || []);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === "Completed") {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("collection_requests")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Request marked as ${newStatus}` });
      fetchRequests();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background/50">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Collection Requests</h1>
          <p className="text-muted-foreground">View and manage collection requests</p>
        </div>

        <Card className="border-2">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request Time</TableHead>
                  <TableHead>Dustbin</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Assigned Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{new Date(request.requested_at).toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">
                      {request.dustbins?.dustbin_number || "N/A"}
                    </TableCell>
                    <TableCell>{request.dustbins?.location || "N/A"}</TableCell>
                    <TableCell>
                      {request.vehicles ? (
                        <div>
                          <div className="font-medium">{request.vehicles.vehicle_number}</div>
                          <div className="text-sm text-muted-foreground">{request.vehicles.driver_name}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {request.status === "Pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(request.id, "In Progress")}
                          >
                            Start
                          </Button>
                        )}
                        {request.status === "In Progress" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUpdateStatus(request.id, "Completed")}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}