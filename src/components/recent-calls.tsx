import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Clock, User, FileText, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

interface CallRecord {
  id: string;
  caller: string;
  phoneNumber: string;
  duration: string;
  timestamp: string;
  intent: string;
  status: "completed" | "transferred" | "missed";
  confidence: number;
  leadCaptured: boolean;
}

const recentCalls: CallRecord[] = [
  {
    id: "1",
    caller: "Sarah Johnson",
    phoneNumber: "+1 (555) 123-4567",
    duration: "3:45",
    timestamp: "2 minutes ago",
    intent: "appointment_booking",
    status: "completed",
    confidence: 95,
    leadCaptured: true
  },
  {
    id: "2",
    caller: "Mike Chen",
    phoneNumber: "+1 (555) 987-6543",
    duration: "1:23",
    timestamp: "15 minutes ago",
    intent: "general_inquiry",
    status: "completed",
    confidence: 88,
    leadCaptured: false
  },
  {
    id: "3",
    caller: "Emily Davis",
    phoneNumber: "+1 (555) 456-7890",
    duration: "5:12",
    timestamp: "32 minutes ago",
    intent: "technical_support",
    status: "transferred",
    confidence: 72,
    leadCaptured: true
  },
  {
    id: "4",
    caller: "Unknown Caller",
    phoneNumber: "+1 (555) 321-0987",
    duration: "0:00",
    timestamp: "1 hour ago",
    intent: "unknown",
    status: "missed",
    confidence: 0,
    leadCaptured: false
  }
];

const getStatusColor = (status: CallRecord["status"]) => {
  switch (status) {
    case "completed":
      return "bg-success/10 text-success border-success/20";
    case "transferred":
      return "bg-warning/10 text-warning border-warning/20";
    case "missed":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function RecentCalls() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Calls</CardTitle>
          <Button variant="outline" size="sm">
            View All
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {recentCalls.map((call, index) => (
          <div
            key={call.id}
            className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-border transition-smooth animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Caller Icon */}
            <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            
            {/* Call Details */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm truncate">{call.caller}</h4>
                {call.leadCaptured && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    Lead
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {call.phoneNumber}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {call.duration}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(call.status)}>
                  {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                </Badge>
                
                <span className="text-xs text-muted-foreground">
                  {call.intent.replace('_', ' ')}
                </span>
                
                {call.confidence > 0 && (
                  <span className="text-xs text-success">
                    {call.confidence}% confidence
                  </span>
                )}
              </div>
            </div>
            
            {/* Timestamp & Actions */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground">
                {call.timestamp}
              </span>
              
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <FileText className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}