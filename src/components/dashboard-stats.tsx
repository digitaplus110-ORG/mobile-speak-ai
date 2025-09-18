import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, PhoneCall, Users, TrendingUp, Clock, CheckCircle } from "lucide-react";

const stats = [
  {
    title: "Total Calls Today",
    value: "24",
    change: "+12%",
    icon: Phone,
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    title: "Calls Handled by AI",
    value: "18",
    change: "75%",
    icon: CheckCircle,
    color: "text-success",
    bgColor: "bg-success/10"
  },
  {
    title: "Leads Captured",
    value: "12",
    change: "+8%",
    icon: Users,
    color: "text-warning",
    bgColor: "bg-warning/10"
  },
  {
    title: "Avg Response Time",
    value: "2.3s",
    change: "-0.5s",
    icon: Clock,
    color: "text-muted-foreground",
    bgColor: "bg-muted"
  },
  {
    title: "Customer Satisfaction",
    value: "94%",
    change: "+2%",
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-success/10"
  },
  {
    title: "Active Now",
    value: "1",
    change: "Live",
    icon: PhoneCall,
    color: "text-primary",
    bgColor: "bg-primary/10"
  }
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="transition-smooth hover:shadow-md animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {stat.title}
                </p>
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-medium ${
                    stat.change.startsWith('+') ? 'text-success' : 
                    stat.change.startsWith('-') ? 'text-destructive' : 
                    'text-muted-foreground'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}