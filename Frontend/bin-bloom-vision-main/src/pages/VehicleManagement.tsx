import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const wasteTypes = ["Plastic", "Organic", "Paper", "Hazardous", "Recyclable"];
const statuses = ["Active", "Idle", "Maintenance"];

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [newVehicle, setNewVehicle] = useState({
    vehicle_number: "",
    driver_name: "",
    vehicle_type: "Plastic",
    status: "Idle",
    location: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setVehicles(data || []);
    }
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.vehicle_number || !newVehicle.driver_name || !newVehicle.location) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("vehicles").insert([{
      vehicle_number: newVehicle.vehicle_number,
      driver_name: newVehicle.driver_name,
      vehicle_type: newVehicle.vehicle_type as any,
      status: newVehicle.status as any,
      location: newVehicle.location,
    }]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Vehicle added successfully" });
      setNewVehicle({ vehicle_number: "", driver_name: "", vehicle_type: "Plastic", status: "Idle", location: "" });
      fetchVehicles();
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("vehicles")
      .update({ status: newStatus as any })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Status updated" });
      fetchVehicles();
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Vehicle deleted" });
      fetchVehicles();
    }
  };

  return (
    <div className="min-h-screen bg-background/50">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Vehicle Management</h1>
          <p className="text-muted-foreground">Manage collection fleet and assignments</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Add New Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <Input
                placeholder="Vehicle Number"
                value={newVehicle.vehicle_number}
                onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_number: e.target.value })}
              />

              <Input
                placeholder="Driver Name"
                value={newVehicle.driver_name}
                onChange={(e) => setNewVehicle({ ...newVehicle, driver_name: e.target.value })}
              />

              <Select value={newVehicle.vehicle_type} onValueChange={(value) => setNewVehicle({ ...newVehicle, vehicle_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {wasteTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={newVehicle.status} onValueChange={(value) => setNewVehicle({ ...newVehicle, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Location"
                value={newVehicle.location}
                onChange={(e) => setNewVehicle({ ...newVehicle, location: e.target.value })}
              />

              <Button onClick={handleAddVehicle} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle Number</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-semibold">{vehicle.vehicle_number}</TableCell>
                    <TableCell>{vehicle.driver_name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-muted rounded text-sm">{vehicle.vehicle_type}</span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={vehicle.status}
                        onValueChange={(value) => handleUpdateStatus(vehicle.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{vehicle.location}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteVehicle(vehicle.id)}
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
      </div>
    </div>
  );
}