import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantQueryKey } from "@/hooks/useTenant";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Settings, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface ClaimTypeData {
  id: string;
  name: string;
  maxAmount: number;
  requiresReceipt: number;
  autoApproveUnder: number;
  isActive: number;
}

interface ClaimsPolicyData {
  id: string;
  requireManagerApproval: number;
  requireReceiptUpload: number;
  monthlyClaimLimit: number;
  syncWithPayroll: number;
}

export default function ClaimsSetup() {
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<ClaimTypeData | null>(null);
  const queryClient = useQueryClient();

  const typesKey = useTenantQueryKey(["claim-types"]);
  const policyKey = useTenantQueryKey(["claims-policy"]);

  const { data: claimTypes = [], isLoading } = useQuery<ClaimTypeData[]>({
    queryKey: typesKey,
    queryFn: async () => {
      const res = await api.get("/claim-types");
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: policy } = useQuery<ClaimsPolicyData | null>({
    queryKey: policyKey,
    queryFn: async () => {
      const res = await api.get("/claims-policy");
      return res.data || null;
    },
  });

  const [policyState, setPolicyState] = useState({
    requireManagerApproval: 1,
    requireReceiptUpload: 1,
    monthlyClaimLimit: 10000,
    syncWithPayroll: 1,
  });

  useEffect(() => {
    if (policy) {
      setPolicyState({
        requireManagerApproval: policy.requireManagerApproval ?? 1,
        requireReceiptUpload: policy.requireReceiptUpload ?? 1,
        monthlyClaimLimit: policy.monthlyClaimLimit ?? 10000,
        syncWithPayroll: policy.syncWithPayroll ?? 1,
      });
    }
  }, [policy]);

  const createMutation = useMutation({
    mutationFn: async (data: Partial<ClaimTypeData>) => {
      if (editing) {
        return api.patch(`/claim-types/${editing.id}`, data);
      }
      return api.post("/claim-types", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: typesKey });
      setShowDialog(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/claim-types/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: typesKey }),
  });

  const policyMutation = useMutation({
    mutationFn: async (data: Partial<ClaimsPolicyData>) => api.put("/claims-policy", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: policyKey }),
  });

  const handlePolicyToggle = (key: keyof typeof policyState, value: boolean) => {
    const newState = { ...policyState, [key]: value ? 1 : 0 };
    setPolicyState(newState);
    policyMutation.mutate(newState);
  };

  const handleMonthlyLimitChange = (value: string) => {
    const limit = parseFloat(value) || 0;
    const newState = { ...policyState, monthlyClaimLimit: limit };
    setPolicyState(newState);
  };

  const handleMonthlyLimitBlur = () => {
    policyMutation.mutate(policyState);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings className="h-7 w-7 text-orange-500" />
              Claims Setup
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure claim types, limits, and approval policies
            </p>
          </div>
          <Button className="gap-2" onClick={() => { setEditing(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4" />
            Add Claim Type
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : claimTypes.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
              <p>No claim types configured yet. Add your first claim type to get started.</p>
              <Button className="mt-4 gap-2" onClick={() => { setEditing(null); setShowDialog(true); }}>
                <Plus className="h-4 w-4" />
                Add Claim Type
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {claimTypes.map((type) => (
              <Card key={type.id} className="bg-card border-border hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{type.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(type); setShowDialog(true); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(type.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max amount:</span>
                    <span className="font-medium">R {(type.maxAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Receipt required:</span>
                    <Badge variant={type.requiresReceipt ? "default" : "secondary"}>{type.requiresReceipt ? "Yes" : "No"}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Auto-approve under:</span>
                    <span className="font-medium">{(type.autoApproveUnder || 0) > 0 ? `R ${type.autoApproveUnder.toLocaleString()}` : "Manual"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={type.isActive ? "default" : "secondary"}>{type.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Claims Policy Settings</CardTitle>
            <CardDescription>Configure general claims policies for your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Require manager approval</Label>
                <p className="text-xs text-muted-foreground">All claims must be approved by a manager</p>
              </div>
              <Switch
                checked={policyState.requireManagerApproval === 1}
                onCheckedChange={(v) => handlePolicyToggle("requireManagerApproval", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Require receipt upload</Label>
                <p className="text-xs text-muted-foreground">Employees must upload receipts for all claims</p>
              </div>
              <Switch
                checked={policyState.requireReceiptUpload === 1}
                onCheckedChange={(v) => handlePolicyToggle("requireReceiptUpload", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Monthly claim limit</Label>
                <p className="text-xs text-muted-foreground">Set maximum total claims per employee per month</p>
              </div>
              <Input
                type="number"
                className="w-32"
                value={policyState.monthlyClaimLimit}
                onChange={(e) => handleMonthlyLimitChange(e.target.value)}
                onBlur={handleMonthlyLimitBlur}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Sync with payroll</Label>
                <p className="text-xs text-muted-foreground">Automatically sync approved claims with payroll</p>
              </div>
              <Switch
                checked={policyState.syncWithPayroll === 1}
                onCheckedChange={(v) => handlePolicyToggle("syncWithPayroll", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Claim Type Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Claim Type" : "Add Claim Type"}</DialogTitle>
              <DialogDescription>Configure a claim type for your organization.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                createMutation.mutate({
                  name: fd.get("name") as string,
                  maxAmount: parseFloat(fd.get("maxAmount") as string) || 0,
                  requiresReceipt: fd.get("requiresReceipt") === "on" ? 1 : 0,
                  autoApproveUnder: parseFloat(fd.get("autoApproveUnder") as string) || 0,
                  isActive: 1,
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label>Claim Type Name</Label>
                <Input name="name" required defaultValue={editing?.name || ""} placeholder="e.g., Travel" />
              </div>
              <div>
                <Label>Maximum Amount (R)</Label>
                <Input name="maxAmount" type="number" step="0.01" defaultValue={editing?.maxAmount || 0} placeholder="e.g., 5000" />
              </div>
              <div>
                <Label>Auto-approve under (R)</Label>
                <Input name="autoApproveUnder" type="number" step="0.01" defaultValue={editing?.autoApproveUnder || 0} placeholder="0 = Manual approval" />
                <p className="text-xs text-muted-foreground mt-1">Claims under this amount will be auto-approved. Set to 0 for manual approval.</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="requiresReceipt" id="requiresReceipt" defaultChecked={editing ? editing.requiresReceipt === 1 : true} />
                <Label htmlFor="requiresReceipt">Requires receipt upload</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editing ? "Update" : "Add Claim Type"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
