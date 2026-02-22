import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Package, Droplet, AlertTriangle, FileText, Recycle, Biohazard, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [wasteStats, setWasteStats] = useState({
    total: 0,
    plastic: 0,
    organic: 0,
    hazardous: 0,
    paper: 0,
    recyclable: 0,
    biomedical: 0,
  });
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [recentClassifications, setRecentClassifications] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch waste classifications
      const { data: classifications, error: classError } = await supabase
        .from("waste_classifications")
        .select("*")
        .order("detection_time", { ascending: false });

      if (classError) throw classError;

      // Calculate waste statistics
      const stats = {
        total: 0,
        plastic: 0,
        organic: 0,
        hazardous: 0,
        paper: 0,
        recyclable: 0,
        biomedical: 0,
      };

      classifications?.forEach((item: any) => {
        stats.total += 1;
        const type = item.waste_type.toLowerCase();
        if (type === "plastic") stats.plastic += 245.5;
        else if (type === "organic") stats.organic += 380.2;
        else if (type === "hazardous") stats.hazardous += 45.3;
        else if (type === "paper") stats.paper += 156.8;
        else if (type === "recyclable") stats.recyclable += 198.7;
        else if (type === "biomedical") stats.biomedical += 67.4;
      });

      stats.total = stats.plastic + stats.organic + stats.hazardous + stats.paper + stats.recyclable + stats.biomedical;
      setWasteStats(stats);
      setRecentClassifications(classifications?.slice(0, 3) || []);

      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("*")
        .limit(3);

      if (vehiclesError) throw vehiclesError;
      setVehicles(vehiclesData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-primary/20 text-primary";
      case "idle":
        return "bg-muted text-muted-foreground";
      case "maintenance":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background/50">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">Real-time waste management insights</p>
        </div>

        {/* Waste Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Waste (kg)</CardTitle>
              <Trash2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{wasteStats.total.toFixed(1)}</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Plastic</CardTitle>
              <Package className="h-5 w-5 text-[hsl(var(--chart-2))]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{wasteStats.plastic.toFixed(1)} kg</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Organic</CardTitle>
              <Droplet className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{wasteStats.organic.toFixed(1)} kg</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Hazardous</CardTitle>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{wasteStats.hazardous.toFixed(1)} kg</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paper</CardTitle>
              <FileText className="h-5 w-5 text-[hsl(var(--chart-3))]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{wasteStats.paper.toFixed(1)} kg</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recyclable</CardTitle>
              <Recycle className="h-5 w-5 text-[hsl(var(--chart-4))]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{wasteStats.recyclable.toFixed(1)} kg</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Biomedical</CardTitle>
              <Biohazard className="h-5 w-5 text-[hsl(var(--chart-6))]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{wasteStats.biomedical.toFixed(1)} kg</div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Status and Recent Classifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Vehicle Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-semibold">{vehicle.vehicle_number}</p>
                    <p className="text-sm text-muted-foreground">{vehicle.driver_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent AI Classifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentClassifications.map((classification) => (
                <div key={classification.id} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{classification.waste_type}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                      {classification.confidence}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{classification.location}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(classification.detection_time).toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}