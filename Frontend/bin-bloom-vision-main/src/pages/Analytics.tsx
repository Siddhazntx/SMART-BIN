import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useToast } from "@/hooks/use-toast";

const COLORS = {
  Plastic: "hsl(var(--chart-2))",
  Organic: "hsl(var(--chart-1))",
  Paper: "hsl(var(--chart-3))",
  Biodegradable: "hsl(var(--chart-4))",
  Hazardous: "hsl(var(--chart-5))",
  Recyclable: "hsl(var(--chart-4))",
  Biomedical: "hsl(var(--chart-6))",
};

export default function Analytics() {
  const [wasteData, setWasteData] = useState<any[]>([]);
  const [recyclableData, setRecyclableData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from("waste_classifications")
        .select("waste_type");

      if (error) throw error;

      // Calculate waste distribution
      const distribution: Record<string, number> = {};
      data?.forEach((item: any) => {
        distribution[item.waste_type] = (distribution[item.waste_type] || 0) + 1;
      });

      const chartData = Object.entries(distribution).map(([name, value]) => ({
        name,
        value,
        percentage: ((value / (data?.length || 1)) * 100).toFixed(1),
      }));

      setWasteData(chartData);

      // Calculate recyclable vs non-recyclable
      const recyclableTypes = ["Recyclable", "Paper", "Plastic"];
      const recyclable = chartData
        .filter((item) => recyclableTypes.includes(item.name))
        .reduce((sum, item) => sum + item.value, 0);
      const nonRecyclable = chartData
        .filter((item) => !recyclableTypes.includes(item.name))
        .reduce((sum, item) => sum + item.value, 0);

      setRecyclableData([
        { name: "Recyclable", value: recyclable },
        { name: "Non-Recyclable", value: nonRecyclable },
      ]);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background/50">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Waste management insights and trends</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Waste Distribution by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={wasteData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {wasteData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#888"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Recyclable vs Non-Recyclable</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={recyclableData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="hsl(var(--chart-1))" />
                    <Cell fill="hsl(var(--chart-5))" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}