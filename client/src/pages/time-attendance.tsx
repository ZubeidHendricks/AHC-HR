import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantQueryKey } from "@/hooks/useTenant";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Clock, Users, Calendar, LogIn, LogOut, Timer, AlertCircle,
  Plus, Search, Edit2, Trash2, CheckCircle, XCircle, Loader2,
  BarChart3, TrendingUp, MapPin, Coffee, Sun, Moon, Sunrise,
  FileText, Download, DollarSign, Play, Square
} from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import type { Employee } from "@shared/schema";

interface TimeEntry {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  breakMinutes: number;
  totalHours: number | null;
  overtimeHours: number;
  status: string;
  notes: string | null;
  location: string | null;
  approvalStatus: string;
}

interface ShiftDef {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  color: string;
  isOvernight: number;
  isActive: number;
}

interface TimesheetEntry {
  id: string;
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalDaysWorked: number;
  totalAbsentDays: number;
  totalLateDays: number;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
}

export default function TimeAttendance() {
  const [activeTab, setActiveTab] = useState("clockinout");
  const [searchQuery, setSearchQuery] = useState("");
  const [showClockInDialog, setShowClockInDialog] = useState(false);
  const [showShiftDialog, setShowShiftDialog] = useState(false);
  const [showTimesheetDialog, setShowTimesheetDialog] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftDef | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const queryClient = useQueryClient();

  const employeesKey = useTenantQueryKey(["workforce-employees"]);
  const timeEntriesKey = useTenantQueryKey(["time-entries", selectedDate]);
  const allTimeEntriesKey = useTenantQueryKey(["time-entries-all"]);
  const shiftsKey = useTenantQueryKey(["shifts"]);
  const timesheetsKey = useTenantQueryKey(["timesheets"]);
  const policiesKey = useTenantQueryKey(["attendance-policies"]);

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: employeesKey,
    queryFn: async () => (await api.get("/workforce/employees")).data,
  });

  const { data: timeEntries = [], isLoading: loadingEntries } = useQuery<TimeEntry[]>({
    queryKey: timeEntriesKey,
    queryFn: async () => (await api.get(`/time-entries?date=${selectedDate}`)).data,
  });

  const { data: allTimeEntries = [] } = useQuery<TimeEntry[]>({
    queryKey: allTimeEntriesKey,
    queryFn: async () => (await api.get("/time-entries")).data,
  });

  const { data: shiftsList = [] } = useQuery<ShiftDef[]>({
    queryKey: shiftsKey,
    queryFn: async () => (await api.get("/shifts")).data,
  });

  const { data: timesheetsList = [] } = useQuery<TimesheetEntry[]>({
    queryKey: timesheetsKey,
    queryFn: async () => (await api.get("/timesheets")).data,
  });

  // Clock In mutation
  const clockInMutation = useMutation({
    mutationFn: async (data: { employeeId: string; location?: string }) =>
      api.post("/time-entries/clock-in", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeEntriesKey });
      queryClient.invalidateQueries({ queryKey: allTimeEntriesKey });
      setShowClockInDialog(false);
    },
  });

  // Clock Out mutation
  const clockOutMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/time-entries/clock-out/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeEntriesKey });
      queryClient.invalidateQueries({ queryKey: allTimeEntriesKey });
    },
  });

  // Create shift mutation
  const createShiftMutation = useMutation({
    mutationFn: async (data: Partial<ShiftDef>) => api.post("/shifts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftsKey });
      setShowShiftDialog(false);
      setEditingShift(null);
    },
  });

  // Update shift mutation
  const updateShiftMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ShiftDef> & { id: string }) =>
      api.patch(`/shifts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftsKey });
      setShowShiftDialog(false);
      setEditingShift(null);
    },
  });

  // Delete shift mutation
  const deleteShiftMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/shifts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shiftsKey }),
  });

  // Create timesheet mutation
  const createTimesheetMutation = useMutation({
    mutationFn: async (data: Partial<TimesheetEntry>) => api.post("/timesheets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timesheetsKey });
      setShowTimesheetDialog(false);
    },
  });

  // Approve timesheet mutation
  const approveTimesheetMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      api.patch(`/timesheets/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: timesheetsKey }),
  });

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : "Unknown";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      clocked_in: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      clocked_out: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
      absent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      late: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      half_day: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.clocked_out}`}>
        {status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
      </span>
    );
  };

  const getApprovalBadge = (status: string) => {
    if (status === "approved") return <Badge className="bg-green-600">Approved</Badge>;
    if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  const getTimesheetStatusBadge = (status: string) => {
    const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "secondary", label: "Draft" },
      submitted: { variant: "outline", label: "Submitted" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
    };
    const s = map[status] || map.draft;
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  // Stats calculations
  const todayEntries = timeEntries;
  const clockedInCount = todayEntries.filter((e) => e.status === "clocked_in").length;
  const clockedOutCount = todayEntries.filter((e) => e.status === "clocked_out").length;
  const lateCount = todayEntries.filter((e) => e.status === "late").length;
  const absentCount = employees.length - todayEntries.length;

  // Overtime calculations from all entries
  const totalOvertimeThisMonth = allTimeEntries
    .filter((e) => {
      const entryDate = new Date(e.date);
      const now = new Date();
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + (e.overtimeHours || 0), 0);

  const employeesWithOvertime = new Set(
    allTimeEntries.filter((e) => (e.overtimeHours || 0) > 0).map((e) => e.employeeId)
  ).size;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Clock className="h-7 w-7 text-cyan-500" />
              Time & Attendance
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track working hours, manage shifts, and monitor attendance across your organization
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="bg-card border-border">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <LogIn className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{clockedInCount}</p>
                  <p className="text-xs text-muted-foreground">Clocked In</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{clockedOutCount}</p>
                  <p className="text-xs text-muted-foreground">Clocked Out</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{lateCount}</p>
                  <p className="text-xs text-muted-foreground">Late Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{absentCount > 0 ? absentCount : 0}</p>
                  <p className="text-xs text-muted-foreground">Absent Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                  <Timer className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalOvertimeThisMonth.toFixed(1)}h</p>
                  <p className="text-xs text-muted-foreground">Overtime (Month)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="clockinout" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <LogIn className="h-4 w-4 mr-2" />
              Clock In/Out
            </TabsTrigger>
            <TabsTrigger value="timesheets" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Timesheets
            </TabsTrigger>
            <TabsTrigger value="attendance" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="overtime" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <Timer className="h-4 w-4 mr-2" />
              Overtime
            </TabsTrigger>
            <TabsTrigger value="shifts" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <Sun className="h-4 w-4 mr-2" />
              Shifts
            </TabsTrigger>
          </TabsList>

          {/* ======= CLOCK IN/OUT TAB ======= */}
          <TabsContent value="clockinout" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-44"
                />
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Button onClick={() => setShowClockInDialog(true)} className="gap-2 bg-cyan-600 hover:bg-cyan-700">
                <Play className="h-4 w-4" />
                Clock In Employee
              </Button>
            </div>

            {loadingEntries ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
              </div>
            ) : (
              <Card className="bg-card border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Break</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No time entries for {selectedDate}. Click "Clock In Employee" to start tracking.
                        </TableCell>
                      </TableRow>
                    ) : (
                      timeEntries
                        .filter((e) =>
                          !searchQuery || getEmployeeName(e.employeeId).toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">{getEmployeeName(entry.employeeId)}</TableCell>
                            <TableCell>
                              {entry.clockIn ? (
                                <span className="flex items-center gap-1 text-green-600">
                                  <LogIn className="h-3.5 w-3.5" />
                                  {format(new Date(entry.clockIn), "HH:mm")}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">--:--</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {entry.clockOut ? (
                                <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                  <LogOut className="h-3.5 w-3.5" />
                                  {format(new Date(entry.clockOut), "HH:mm")}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">--:--</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1">
                                <Coffee className="h-3.5 w-3.5 text-muted-foreground" />
                                {entry.breakMinutes || 0}m
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">
                              {entry.totalHours != null ? `${entry.totalHours.toFixed(1)}h` : "-"}
                              {(entry.overtimeHours || 0) > 0 && (
                                <span className="text-xs text-orange-500 ml-1">(+{entry.overtimeHours.toFixed(1)} OT)</span>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(entry.status)}</TableCell>
                            <TableCell>
                              {entry.location ? (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {entry.location}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {entry.status === "clocked_in" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => clockOutMutation.mutate(entry.id)}
                                  disabled={clockOutMutation.isPending}
                                  className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Square className="h-3 w-3" />
                                  Clock Out
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          {/* ======= TIMESHEETS TAB ======= */}
          <TabsContent value="timesheets" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search timesheets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-72"
                />
              </div>
              <Button onClick={() => setShowTimesheetDialog(true)} className="gap-2 bg-cyan-600 hover:bg-cyan-700">
                <Plus className="h-4 w-4" />
                Generate Timesheet
              </Button>
            </div>

            <Card className="bg-card border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Regular Hours</TableHead>
                    <TableHead>Overtime Hours</TableHead>
                    <TableHead>Days Worked</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timesheetsList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No timesheets generated yet. Click "Generate Timesheet" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    timesheetsList.map((sheet) => (
                      <TableRow key={sheet.id}>
                        <TableCell className="font-medium">{getEmployeeName(sheet.employeeId)}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {format(new Date(sheet.periodStart), "dd MMM")} - {format(new Date(sheet.periodEnd), "dd MMM yyyy")}
                          </span>
                        </TableCell>
                        <TableCell>{sheet.totalRegularHours.toFixed(1)}h</TableCell>
                        <TableCell>
                          <span className={sheet.totalOvertimeHours > 0 ? "text-orange-500 font-medium" : ""}>
                            {sheet.totalOvertimeHours.toFixed(1)}h
                          </span>
                        </TableCell>
                        <TableCell>{sheet.totalDaysWorked}</TableCell>
                        <TableCell>
                          <span className={sheet.totalAbsentDays > 0 ? "text-red-500" : ""}>
                            {sheet.totalAbsentDays}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={sheet.totalLateDays > 0 ? "text-yellow-500" : ""}>
                            {sheet.totalLateDays}
                          </span>
                        </TableCell>
                        <TableCell>{getTimesheetStatusBadge(sheet.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {sheet.status === "submitted" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => approveTimesheetMutation.mutate({ id: sheet.id, status: "approved" })}
                                  className="text-green-600 h-8"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => approveTimesheetMutation.mutate({ id: sheet.id, status: "rejected" })}
                                  className="text-red-600 h-8"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {sheet.status === "draft" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveTimesheetMutation.mutate({ id: sheet.id, status: "submitted" })}
                                className="h-8"
                              >
                                Submit
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>

            {/* Payroll Integration Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Payroll Integration
                </CardTitle>
                <CardDescription>Approved timesheets are automatically synced with payroll</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Approved Timesheets</p>
                    <p className="text-2xl font-bold text-green-600">
                      {timesheetsList.filter((s) => s.status === "approved").length}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {timesheetsList.filter((s) => s.status === "submitted").length}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Total Overtime (Approved)</p>
                    <p className="text-2xl font-bold text-orange-500">
                      {timesheetsList
                        .filter((s) => s.status === "approved")
                        .reduce((sum, s) => sum + s.totalOvertimeHours, 0)
                        .toFixed(1)}h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ======= ATTENDANCE TAB ======= */}
          <TabsContent value="attendance" className="space-y-4">
            <div className="flex items-center gap-3">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-44"
              />
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Attendance Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-card border-border">
                <CardContent className="pt-4 pb-3 text-center">
                  <div className="inline-flex p-3 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-3xl font-bold">{todayEntries.filter((e) => ["clocked_in", "clocked_out"].includes(e.status)).length}</p>
                  <p className="text-sm text-muted-foreground">Present</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-4 pb-3 text-center">
                  <div className="inline-flex p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-2">
                    <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <p className="text-3xl font-bold">{lateCount}</p>
                  <p className="text-sm text-muted-foreground">Late Arrivals</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-4 pb-3 text-center">
                  <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-2">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold">{todayEntries.filter((e) => e.status === "half_day").length}</p>
                  <p className="text-sm text-muted-foreground">Half Day</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-4 pb-3 text-center">
                  <div className="inline-flex p-3 rounded-full bg-red-100 dark:bg-red-900/30 mb-2">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-3xl font-bold">{todayEntries.filter((e) => e.status === "absent").length}</p>
                  <p className="text-sm text-muted-foreground">Absent</p>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Rate */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Attendance Rate</CardTitle>
                <CardDescription>Overall attendance compliance for {selectedDate}</CardDescription>
              </CardHeader>
              <CardContent>
                {employees.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {todayEntries.filter((e) => !["absent"].includes(e.status)).length} of {employees.length} employees present
                      </span>
                      <span className="text-lg font-bold">
                        {employees.length > 0
                          ? Math.round((todayEntries.filter((e) => !["absent"].includes(e.status)).length / employees.length) * 100)
                          : 0}%
                      </span>
                    </div>
                    <Progress
                      value={
                        employees.length > 0
                          ? (todayEntries.filter((e) => !["absent"].includes(e.status)).length / employees.length) * 100
                          : 0
                      }
                      className="h-3"
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No employees found to calculate attendance rate.</p>
                )}
              </CardContent>
            </Card>

            {/* Attendance Log */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Attendance Log</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Hours Worked</TableHead>
                      <TableHead>Approval</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No attendance records for this date.
                        </TableCell>
                      </TableRow>
                    ) : (
                      timeEntries
                        .filter((e) => !searchQuery || getEmployeeName(e.employeeId).toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">{getEmployeeName(entry.employeeId)}</TableCell>
                            <TableCell>{getStatusBadge(entry.status)}</TableCell>
                            <TableCell>{entry.clockIn ? format(new Date(entry.clockIn), "HH:mm") : "-"}</TableCell>
                            <TableCell>{entry.clockOut ? format(new Date(entry.clockOut), "HH:mm") : "-"}</TableCell>
                            <TableCell>{entry.totalHours != null ? `${entry.totalHours.toFixed(1)}h` : "-"}</TableCell>
                            <TableCell>{getApprovalBadge(entry.approvalStatus)}</TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ======= OVERTIME TAB ======= */}
          <TabsContent value="overtime" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-card border-border">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Timer className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{totalOvertimeThisMonth.toFixed(1)}h</p>
                      <p className="text-xs text-muted-foreground">Total Overtime This Month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{employeesWithOvertime}</p>
                      <p className="text-xs text-muted-foreground">Employees with Overtime</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {employeesWithOvertime > 0 ? (totalOvertimeThisMonth / employeesWithOvertime).toFixed(1) : "0.0"}h
                      </p>
                      <p className="text-xs text-muted-foreground">Avg Overtime per Employee</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overtime by Employee */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  Overtime by Employee
                </CardTitle>
                <CardDescription>Monthly overtime breakdown per employee (threshold: 8h/day)</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Total OT Hours</TableHead>
                      <TableHead>OT Days</TableHead>
                      <TableHead>Avg OT/Day</TableHead>
                      <TableHead>Compliance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const otByEmployee: Record<string, { hours: number; days: number }> = {};
                      allTimeEntries
                        .filter((e) => {
                          const d = new Date(e.date);
                          const now = new Date();
                          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                        })
                        .forEach((e) => {
                          if ((e.overtimeHours || 0) > 0) {
                            if (!otByEmployee[e.employeeId]) otByEmployee[e.employeeId] = { hours: 0, days: 0 };
                            otByEmployee[e.employeeId].hours += e.overtimeHours || 0;
                            otByEmployee[e.employeeId].days += 1;
                          }
                        });

                      const entries = Object.entries(otByEmployee).sort((a, b) => b[1].hours - a[1].hours);

                      if (entries.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No overtime recorded this month.
                            </TableCell>
                          </TableRow>
                        );
                      }

                      return entries.map(([empId, data]) => (
                        <TableRow key={empId}>
                          <TableCell className="font-medium">{getEmployeeName(empId)}</TableCell>
                          <TableCell className="font-medium text-orange-500">{data.hours.toFixed(1)}h</TableCell>
                          <TableCell>{data.days}</TableCell>
                          <TableCell>{(data.hours / data.days).toFixed(1)}h</TableCell>
                          <TableCell>
                            {data.hours > 40 ? (
                              <Badge variant="destructive">Exceeds Limit</Badge>
                            ) : data.hours > 20 ? (
                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Warning</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Within Limit</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* BCEA Compliance Note */}
            <Card className="bg-card border-border border-l-4 border-l-yellow-500">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">BCEA Overtime Compliance</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per the Basic Conditions of Employment Act (BCEA), overtime may not exceed 10 hours per week or 3 hours per day.
                      Overtime must be paid at 1.5x the normal wage rate. Sunday and public holiday work must be paid at 2x the normal rate.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ======= SHIFTS TAB ======= */}
          <TabsContent value="shifts" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Define shift schedules and assign employees to shifts
              </p>
              <Button
                onClick={() => {
                  setEditingShift(null);
                  setShowShiftDialog(true);
                }}
                className="gap-2 bg-cyan-600 hover:bg-cyan-700"
              >
                <Plus className="h-4 w-4" />
                Create Shift
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {shiftsList.length === 0 ? (
                <Card className="col-span-full bg-card border-border">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Sun className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                    <p>No shifts defined yet. Create your first shift to start scheduling.</p>
                  </CardContent>
                </Card>
              ) : (
                shiftsList.map((shift) => (
                  <Card key={shift.id} className="bg-card border-border hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: shift.color || "#3B82F6" }}
                          />
                          <CardTitle className="text-base">{shift.name}</CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingShift(shift);
                              setShowShiftDialog(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteShiftMutation.mutate(shift.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Sunrise className="h-3.5 w-3.5" /> Start:
                        </span>
                        <span className="font-medium">{shift.startTime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Moon className="h-3.5 w-3.5" /> End:
                        </span>
                        <span className="font-medium">{shift.endTime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Coffee className="h-3.5 w-3.5" /> Break:
                        </span>
                        <span className="font-medium">{shift.breakDuration}min</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Overnight:</span>
                        <Badge variant={shift.isOvernight ? "default" : "secondary"}>
                          {shift.isOvernight ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={shift.isActive ? "default" : "secondary"}>
                          {shift.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* ======= CLOCK IN DIALOG ======= */}
        <Dialog open={showClockInDialog} onOpenChange={setShowClockInDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clock In Employee</DialogTitle>
              <DialogDescription>Record an employee's clock-in time</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                clockInMutation.mutate({
                  employeeId: formData.get("employeeId") as string,
                  location: formData.get("location") as string || undefined,
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label>Employee</Label>
                <Select name="employeeId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location (optional)</Label>
                <Input name="location" placeholder="e.g., Main Office, Remote" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowClockInDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={clockInMutation.isPending} className="bg-cyan-600 hover:bg-cyan-700">
                  {clockInMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Clock In
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ======= SHIFT DIALOG ======= */}
        <Dialog open={showShiftDialog} onOpenChange={setShowShiftDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingShift ? "Edit Shift" : "Create Shift"}</DialogTitle>
              <DialogDescription>Define shift schedules for your organization</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  name: formData.get("name") as string,
                  startTime: formData.get("startTime") as string,
                  endTime: formData.get("endTime") as string,
                  breakDuration: parseInt(formData.get("breakDuration") as string) || 60,
                  color: formData.get("color") as string || "#3B82F6",
                  isOvernight: formData.get("isOvernight") === "on" ? 1 : 0,
                };
                if (editingShift) {
                  updateShiftMutation.mutate({ ...data, id: editingShift.id });
                } else {
                  createShiftMutation.mutate(data);
                }
              }}
              className="space-y-4"
            >
              <div>
                <Label>Shift Name</Label>
                <Input name="name" required defaultValue={editingShift?.name || ""} placeholder="e.g., Morning Shift" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input name="startTime" type="time" required defaultValue={editingShift?.startTime || "08:00"} />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input name="endTime" type="time" required defaultValue={editingShift?.endTime || "17:00"} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Break Duration (min)</Label>
                  <Input name="breakDuration" type="number" defaultValue={editingShift?.breakDuration || 60} />
                </div>
                <div>
                  <Label>Color</Label>
                  <Input name="color" type="color" defaultValue={editingShift?.color || "#3B82F6"} className="h-10" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="isOvernight" id="isOvernight" defaultChecked={editingShift?.isOvernight === 1} />
                <Label htmlFor="isOvernight">Overnight shift (crosses midnight)</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowShiftDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                  {editingShift ? "Update Shift" : "Create Shift"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ======= TIMESHEET DIALOG ======= */}
        <Dialog open={showTimesheetDialog} onOpenChange={setShowTimesheetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Timesheet</DialogTitle>
              <DialogDescription>Create a timesheet for an employee for a specific period</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createTimesheetMutation.mutate({
                  employeeId: formData.get("employeeId") as string,
                  periodStart: formData.get("periodStart") as string,
                  periodEnd: formData.get("periodEnd") as string,
                  totalRegularHours: 0,
                  totalOvertimeHours: 0,
                  totalDaysWorked: 0,
                  totalAbsentDays: 0,
                  totalLateDays: 0,
                  status: "draft",
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label>Employee</Label>
                <Select name="employeeId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Period Start</Label>
                  <Input name="periodStart" type="date" required />
                </div>
                <div>
                  <Label>Period End</Label>
                  <Input name="periodEnd" type="date" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowTimesheetDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTimesheetMutation.isPending} className="bg-cyan-600 hover:bg-cyan-700">
                  {createTimesheetMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Generate
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
