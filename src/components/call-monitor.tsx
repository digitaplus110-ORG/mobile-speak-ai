import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Phone, PhoneCall, Mic, MicOff, User, Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface CallData {
  id: string;
  caller: string;
  phoneNumber: string;
  duration: string;
  status: "active" | "idle" | "processing" | "error";
  transcript: string[];
  intent: string;
  confidence: number;
}

export function CallMonitor() {
  const [activeCall, setActiveCall] = useState<CallData | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Simulate call data
  useEffect(() => {
    const simulateCall = () => {
      setActiveCall({
        id: "call-001",
        caller: "Sarah Johnson",
        phoneNumber: "+1 (555) 123-4567",
        duration: "0:45",
        status: "active",
        transcript: [
          "AI: Hello! Thank you for calling Wellness Clinic. How can I help you today?",
          "Caller: Hi, I'd like to schedule an appointment with Dr. Smith please.",
          "AI: I'd be happy to help you schedule an appointment. May I have your name and phone number?",
          "Caller: Sure, it's Sarah Johnson and my number is 555-123-4567."
        ],
        intent: "appointment_booking",
        confidence: 95
      });
      setIsListening(true);
    };

    const timer = setTimeout(simulateCall, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleEndCall = () => {
    setActiveCall(null);
    setIsListening(false);
  };

  if (!activeCall) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Phone className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Waiting for calls...</h3>
          <p className="text-muted-foreground text-sm">
            Your AI receptionist is ready to handle incoming calls 24/7
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Active Call</CardTitle>
          <StatusBadge status={activeCall.status}>
            {activeCall.status === "active" ? "Live" : "Processing"}
          </StatusBadge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Caller Info */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
          <div className="rounded-full bg-primary/10 p-3">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{activeCall.caller}</h4>
            <p className="text-sm text-muted-foreground">{activeCall.phoneNumber}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {activeCall.duration}
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "transition-smooth",
              isListening && "border-success text-success hover:bg-success/10"
            )}
            onClick={() => setIsListening(!isListening)}
          >
            {isListening ? (
              <Mic className="w-4 h-4 mr-2" />
            ) : (
              <MicOff className="w-4 h-4 mr-2" />
            )}
            {isListening ? "Listening" : "Muted"}
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEndCall}
          >
            <PhoneCall className="w-4 h-4 mr-2" />
            End Call
          </Button>
        </div>

        {/* Intent & Confidence */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">Intent</div>
            <div className="text-sm font-medium capitalize">
              {activeCall.intent.replace('_', ' ')}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">Confidence</div>
            <div className="text-sm font-medium text-success">
              {activeCall.confidence}%
            </div>
          </div>
        </div>

        {/* Live Transcript */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <h5 className="text-sm font-medium">Live Transcript</h5>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {activeCall.transcript.map((message, index) => {
              const isAI = message.startsWith("AI:");
              return (
                <div
                  key={index}
                  className={cn(
                    "p-2 rounded-lg text-xs leading-relaxed transition-smooth animate-fade-in",
                    isAI 
                      ? "bg-primary/10 text-primary-foreground border-l-2 border-primary" 
                      : "bg-muted/50"
                  )}
                >
                  <span className="font-medium">
                    {isAI ? "AI Assistant" : "Caller"}:
                  </span>
                  <span className="ml-2">
                    {message.replace(/^(AI:|Caller:)\s*/, "")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}