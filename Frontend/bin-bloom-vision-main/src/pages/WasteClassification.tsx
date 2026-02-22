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
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const wasteTypes = ["Plastic", "Organic", "Paper", "Metal", "E-waste", "Biodegradable", "Hazardous", "Recyclable", "Biomedical"];

export default function WasteClassification() {
  const [classifications, setClassifications] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState({
    waste_type: "Plastic",
    location: "",
    camera_id: "",
    confidence: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchClassifications();
  }, []);

  const fetchClassifications = async () => {
    const { data, error } = await supabase
      .from("waste_classifications")
      .select("*")
      .order("detection_time", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setClassifications(data || []);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.location || !newEntry.camera_id || !newEntry.confidence) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("waste_classifications").insert([{
      waste_type: newEntry.waste_type as any,
      location: newEntry.location,
      camera_id: newEntry.camera_id,
      confidence: parseFloat(newEntry.confidence),
    }]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Entry added successfully" });
      setNewEntry({ waste_type: "Plastic", location: "", camera_id: "", confidence: "" });
      fetchClassifications();
    }
  };

  return (
    <div className="min-h-screen bg-background/50">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Waste Classification Log</h1>
          <p className="text-muted-foreground">AI-powered waste detection history</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Add New Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select value={newEntry.waste_type} onValueChange={(value) => setNewEntry({ ...newEntry, waste_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select waste type" />
                </SelectTrigger>
                <SelectContent>
                  {wasteTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Location"
                value={newEntry.location}
                onChange={(e) => setNewEntry({ ...newEntry, location: e.target.value })}
              />

              <Input
                placeholder="Camera ID"
                value={newEntry.camera_id}
                onChange={(e) => setNewEntry({ ...newEntry, camera_id: e.target.value })}
              />

              <Input
                type="number"
                placeholder="Confidence %"
                min="0"
                max="100"
                value={newEntry.confidence}
                onChange={(e) => setNewEntry({ ...newEntry, confidence: e.target.value })}
              />

              <Button onClick={handleAddEntry} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Detection Time</TableHead>
                  <TableHead>Waste Type</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Camera ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classifications.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.detection_time).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="font-medium">{item.waste_type}</span>
                    </TableCell>
                    <TableCell>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                        {item.confidence}%
                      </span>
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.camera_id}</TableCell>
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