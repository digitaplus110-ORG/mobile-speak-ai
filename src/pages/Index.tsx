import { CallMonitor } from "@/components/call-monitor";
import { DashboardStats } from "@/components/dashboard-stats";
import { RecentCalls } from "@/components/recent-calls";
import { TenantSelector } from "@/components/tenant-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Bot, Zap, Shield, Smartphone, HeadphonesIcon } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg gradient-primary p-2 shadow-glow">
                <HeadphonesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
                  CallReception
                </h1>
                <p className="text-xs text-muted-foreground">
                  AI Voice Assistant Platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile App
              </Button>
              <Button variant="gradient" className="shadow-glow">
                <Phone className="w-4 h-4 mr-2" />
                Go Live
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Tenant Selector */}
        <TenantSelector />

        {/* Hero Stats */}
        <DashboardStats />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Call Monitor - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <CallMonitor />
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                
                <Button variant="gradient" className="w-full shadow-glow">
                  <Bot className="w-4 h-4 mr-2" />
                  Test AI Assistant
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Configure Prompts
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Settings
                </Button>
                
                <div className="pt-4 border-t border-border">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Phone Number</span>
                      <span className="font-medium">+1 (555) 123-WELL</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="text-success font-medium">● Active</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Usage</span>
                      <span className="font-medium">246 / 1000 calls</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Features Overview */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">AI Capabilities</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-success/10 p-1">
                      <div className="w-2 h-2 rounded-full bg-success" />
                    </div>
                    <span className="text-sm">Hugging Face STT Integration</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-success/10 p-1">
                      <div className="w-2 h-2 rounded-full bg-success" />
                    </div>
                    <span className="text-sm">Advanced LLM Processing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-success/10 p-1">
                      <div className="w-2 h-2 rounded-full bg-success" />
                    </div>
                    <span className="text-sm">Real-time Intent Detection</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-success/10 p-1">
                      <div className="w-2 h-2 rounded-full bg-success" />
                    </div>
                    <span className="text-sm">Multi-tenant Support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

          {/* Recent Calls */}
          <RecentCalls calls={recentCalls} />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
