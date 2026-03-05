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

interface LeaveTypeData {
  id: string;
  name: string;
  daysPerYear: number;
  carryOver: number;
  paid: number;
  requiresApproval: number;
  requiresDocumentation: number;
  isActive: number;
}

interface LeavePolicyData {
  id: string;
  requireManagerApproval: number;
  autoApproveAfterDeadline: number;
  allowNegativeBalance: number;
  syncWithPayroll: number;
  approvalDeadlineDays: number;
}

export default function LeaveSetup() {
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<LeaveTypeData | null>(null);
  const queryClient = useQueryClient();

  const typesKey = useTenantQueryKey(["leave-types"]);
  const policyKey = useTenantQueryKey(["leave-policy"]);

  const { data: leaveTypes = [], isLoading } = useQuery<LeaveTypeData[]>({
    queryKey: typesKey,
    queryFn: async () => {
      const res = await api.get("/leave-types");
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: policy } = useQuery<LeavePolicyData | null>({
    queryKey: policyKey,
    queryFn: async () => {
      const res = await api.get("/leave-policy");
      return res.data || null;
    },
  });

  // Local policy state for switches
  const [policyState, setPolicyState] = useState({
    requireManagerApproval: 1,
    autoApproveAfterDeadline: 0,
    allowNegativeBalance: 0,
    syncWithPayroll: 1,
  });

  useEffect(() => {
    if (policy) {
      setPolicyState({
        requireManagerApproval: policy.requireManagerApproval ?? 1,
        autoApproveAfterDeadline: policy.autoApproveAfterDeadline ?? 0,
        allowNegativeBalance: policy.allowNegativeBalance ?? 0,
        syncWithPayroll: policy.syncWithPayroll ?? 1,
      });
    }
  }, [policy]);

  const createMutation = useMutation({
    mutationFn: async (data: Partial<LeaveTypeData>) => {
      if (editing) {
        return api.patch(`/leave-types/${editing.id}`, data);
      }
      return api.post("/leave-types", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: typesKey });
      setShowDialog(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/leave-types/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: typesKey }),
  });

  const policyMutation = useMutation({
    mutationFn: async (data: Partial<LeavePolicyData>) => api.put("/leave-policy", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: policyKey }),
  });

  const handlePolicyChange = (key: keyof typeof policyState, value: boolean) => {
    const newState = { ...policyState, [key]: value ? 1 : 0 };
    setPolicyState(newState);
    policyMutation.mutate(newState);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings className="h-7 w-7 text-teal-500" />
              Leave Setup
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure leave types, entitlements, and policies
            </p>
          </div>
          <Button className="gap-2" onClick={() => { setEditing(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4" />
            Add Leave Type
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          </div>
        ) : leaveTypes.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
              <p>No leave types configured yet. Add your first leave type to get started.</p>
              <Button className="mt-4 gap-2" onClick={() => { setEditing(null); setShowDialog(true); }}>
                <Plus className="h-4 w-4" />
                Add Leave Type
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leaveTypes.map((type) => (
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
                    <span className="text-muted-foreground">Days per year:</span>
                    <span className="font-medium">{type.daysPerYear || "Unlimited"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Carry over:</span>
                    <Badge variant={type.carryOver ? "default" : "secondary"}>{type.carryOver ? "Yes" : "No"}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paid:</span>
                    <Badge variant={type.paid ? "default" : "destructive"}>{type.paid ? "Paid" : "Unpaid"}</Badge>
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
            <CardTitle>Leave Policy Settings</CardTitle>
            <CardDescription>Configure general leave policies for your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Require manager approval</Label>
                <p className="text-xs text-muted-foreground">All leave applications must be approved by a manager</p>
              </div>
              <Switch
                checked={policyState.requireManagerApproval === 1}
                onCheckedChange={(v) => handlePolicyChange("requireManagerApproval", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-approve after deadline</Label>
                <p className="text-xs text-muted-foreground">Automatically approve if manager doesn't respond within deadline</p>
              </div>
              <Switch
                checked={policyState.autoApproveAfterDeadline === 1}
                onCheckedChange={(v) => handlePolicyChange("autoApproveAfterDeadline", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow negative leave balance</Label>
                <p className="text-xs text-muted-foreground">Allow employees to take leave even if balance is insufficient</p>
              </div>
              <Switch
                checked={policyState.allowNegativeBalance === 1}
                onCheckedChange={(v) => handlePolicyChange("allowNegativeBalance", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Sync with payroll</Label>
                <p className="text-xs text-muted-foreground">Automatically sync approved leave with payroll system</p>
              </div>
              <Switch
                checked={policyState.syncWithPayroll === 1}
                onCheckedChange={(v) => handlePolicyChange("syncWithPayroll", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Leave Type Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Leave Type" : "Add Leave Type"}</DialogTitle>
              <DialogDescription>Configure a leave type for your organization.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                createMutation.mutate({
                  name: fd.get("name") as string,
                  daysPerYear: parseInt(fd.get("daysPerYear") as string) || 0,
                  carryOver: fd.get("carryOver") === "on" ? 1 : 0,
                  paid: fd.get("paid") === "on" ? 1 : 0,
                  requiresApproval: fd.get("requiresApproval") === "on" ? 1 : 0,
                  requiresDocumentation: fd.get("requiresDocumentation") === "on" ? 1 : 0,
                  isActive: 1,
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label>Leave Type Name</Label>
                <Input name="name" required defaultValue={editing?.name || ""} placeholder="e.g., Annual Leave" />
              </div>
              <div>
                <Label>Days Per Year</Label>
                <Input name="daysPerYear" type="number" defaultValue={editing?.daysPerYear || 0} placeholder="0 = Unlimited" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="carryOver" id="carryOver" defaultChecked={editing?.carryOver === 1} />
                  <Label htmlFor="carryOver">Allow carry over to next year</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="paid" id="paid" defaultChecked={editing ? editing.paid === 1 : true} />
                  <Label htmlFor="paid">Paid leave</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="requiresApproval" id="requiresApproval" defaultChecked={editing ? editing.requiresApproval === 1 : true} />
                  <Label htmlFor="requiresApproval">Requires manager approval</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="requiresDocumentation" id="requiresDocumentation" defaultChecked={editing?.requiresDocumentation === 1} />
                  <Label htmlFor="requiresDocumentation">Requires supporting documentation</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editing ? "Update" : "Add Leave Type"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
