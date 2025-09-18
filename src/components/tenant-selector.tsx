import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Settings, Plus } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive";
  phoneNumber: string;
}

const tenants: Tenant[] = [
  {
    id: "1",
    name: "Wellness Clinic",
    type: "Healthcare",
    status: "active",
    phoneNumber: "+1 (555) 123-WELL"
  },
  {
    id: "2", 
    name: "Premier Realty",
    type: "Real Estate",
    status: "active",
    phoneNumber: "+1 (555) 456-HOME"
  },
  {
    id: "3",
    name: "Legal Associates",
    type: "Law Firm",
    status: "inactive",
    phoneNumber: "+1 (555) 789-LAW1"
  }
];

export function TenantSelector() {
  const [selectedTenant, setSelectedTenant] = useState(tenants[0].id);
  
  const currentTenant = tenants.find(t => t.id === selectedTenant);

  return (
    <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-card">
      <div className="flex items-center gap-3 flex-1">
        <div className="rounded-lg bg-primary/10 p-2">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <Select value={selectedTenant} onValueChange={setSelectedTenant}>
            <SelectTrigger className="border-0 shadow-none px-0 font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{tenant.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {tenant.type} • {tenant.phoneNumber}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {currentTenant && (
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={currentTenant.status === "active" ? "default" : "secondary"}
                className="text-xs"
              >
                {currentTenant.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {currentTenant.phoneNumber}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>
        
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Business
        </Button>
      </div>
    </div>
  );
}