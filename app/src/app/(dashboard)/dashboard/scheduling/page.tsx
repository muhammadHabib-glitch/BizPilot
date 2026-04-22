"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Link2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Video,
  Phone,
  Users,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

type View = "pages" | "newPage" | "editPage" | "appointments" | "newAppt";

/* ────────── Types ────────── */
interface BookingPageRecord {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration: number;
  bufferBefore: number;
  bufferAfter: number;
  minNotice: number;
  maxAdvance: number;
  locationType: string;
  locationDetails: string | null;
  color: string;
  requirePhone: boolean;
  isActive: boolean;
  createdAt: string | Date;
  _count?: { appointments: number };
}

interface AppointmentRecord {
  id: string;
  startTime: string | Date;
  endTime: string | Date;
  status: string;
  title: string | null;
  notes: string | null;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  bookingPage?: { title: string; color: string } | null;
  client?: { name: string; email: string | null } | null;
}

interface ClientOption {
  id: string;
  name: string;
  company?: string | null;
}

/* ────────── Main Page ────────── */
export default function SchedulingPage() {
  const [view, setView] = useState<View>("pages");
  const [editPageId, setEditPageId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {view === "pages" && (
        <BookingPages
          onNew={() => setView("newPage")}
          onEdit={(id) => {
            setEditPageId(id);
            setView("editPage");
          }}
          onViewAppointments={() => setView("appointments")}
        />
      )}
      {view === "newPage" && (
        <BookingPageForm onBack={() => setView("pages")} onSuccess={() => setView("pages")} />
      )}
      {view === "editPage" && editPageId && (
        <BookingPageForm
          editId={editPageId}
          onBack={() => setView("pages")}
          onSuccess={() => setView("pages")}
        />
      )}
      {view === "appointments" && (
        <AppointmentsList
          onBack={() => setView("pages")}
          onNewAppt={() => setView("newAppt")}
        />
      )}
      {view === "newAppt" && (
        <AppointmentForm
          onBack={() => setView("appointments")}
          onSuccess={() => setView("appointments")}
        />
      )}
    </div>
  );
}

/* ────────── Booking Pages List ────────── */
function BookingPages({
  onNew,
  onEdit,
  onViewAppointments,
}: {
  onNew: () => void;
  onEdit: (id: string) => void;
  onViewAppointments: () => void;
}) {
  const { data: pages, isLoading } = trpc.scheduling.listPages.useQuery();
  const utils = trpc.useUtils();
  const toggleMut = trpc.scheduling.updatePage.useMutation({
    onSuccess: () => utils.scheduling.invalidate(),
  });
  const deleteMut = trpc.scheduling.deletePage.useMutation({
    onSuccess: () => utils.scheduling.invalidate(),
  });

  const locationIcon = (type: string) => {
    if (type === "video") return <Video className="h-4 w-4" />;
    if (type === "phone") return <Phone className="h-4 w-4" />;
    return <MapPin className="h-4 w-4" />;
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scheduling</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your booking pages and appointments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onViewAppointments}>
            <Calendar className="h-4 w-4" /> Appointments
          </Button>
          <Button onClick={onNew}>
            <Plus className="h-4 w-4" /> New Booking Page
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-48 bg-gray-100 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !pages?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16">
          <Calendar className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No booking pages yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            Create a booking page to let clients schedule with you
          </p>
          <Button onClick={onNew} size="sm">
            <Plus className="h-4 w-4" /> Create Booking Page
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page: BookingPageRecord) => (
            <Card
              key={page.id}
              className="cursor-pointer hover:border-blue-300 transition-colors relative"
              onClick={() => onEdit(page.id)}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
                style={{ backgroundColor: page.color }}
              />
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 truncate flex-1">
                    {page.title}
                  </h3>
                  <Badge variant={page.isActive ? "default" : "secondary"}>
                    {page.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {page.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {page.description}
                  </p>
                )}
                <div className="space-y-1.5 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {page.duration} min
                  </div>
                  <div className="flex items-center gap-1.5">
                    {locationIcon(page.locationType)}{" "}
                    {page.locationType === "video"
                      ? "Video call"
                      : page.locationType === "phone"
                      ? "Phone call"
                      : "In-person"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5" />
                    <span className="truncate">/{page.slug}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {page._count?.appointments ?? 0} bookings
                  </span>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      onClick={() =>
                        toggleMut.mutate({
                          id: page.id,
                          isActive: !page.isActive,
                        })
                      }
                      title={page.isActive ? "Deactivate" : "Activate"}
                    >
                      {page.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                      onClick={() => {
                        if (confirm("Delete this booking page?")) {
                          deleteMut.mutate({ id: page.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

/* ────────── Booking Page Form ────────── */
function BookingPageForm({
  editId,
  onBack,
  onSuccess,
}: {
  editId?: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const utils = trpc.useUtils();
  const { data: existing } = trpc.scheduling.getPage.useQuery(
    { id: editId! },
    { enabled: !!editId }
  );

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("30");
  const [bufferBefore, setBufferBefore] = useState("0");
  const [bufferAfter, setBufferAfter] = useState("15");
  const [minNotice, setMinNotice] = useState("60");
  const [maxAdvance, setMaxAdvance] = useState("30");
  const [locationType, setLocationType] = useState("video");
  const [locationDetails, setLocationDetails] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [requirePhone, setRequirePhone] = useState(false);
  const [initialized, setInitialized] = useState(!editId);

  if (existing && !initialized) {
    setTitle(existing.title);
    setSlug(existing.slug);
    setDescription(existing.description || "");
    setDuration(String(existing.duration));
    setBufferBefore(String(existing.bufferBefore));
    setBufferAfter(String(existing.bufferAfter));
    setMinNotice(String(existing.minNotice));
    setMaxAdvance(String(existing.maxAdvance));
    setLocationType(existing.locationType);
    setLocationDetails(existing.locationDetails || "");
    setColor(existing.color);
    setRequirePhone(existing.requirePhone);
    setInitialized(true);
  }

  const createMut = trpc.scheduling.createPage.useMutation({
    onSuccess: () => {
      utils.scheduling.invalidate();
      onSuccess();
    },
  });
  const updateMut = trpc.scheduling.updatePage.useMutation({
    onSuccess: () => {
      utils.scheduling.invalidate();
      onSuccess();
    },
  });

  const isPending = createMut.isPending || updateMut.isPending;
  const error = createMut.error || updateMut.error;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      title,
      description: description || undefined,
      duration: parseInt(duration) || 30,
      bufferBefore: parseInt(bufferBefore) || 0,
      bufferAfter: parseInt(bufferAfter) || 15,
      minNotice: parseInt(minNotice) || 60,
      maxAdvance: parseInt(maxAdvance) || 30,
      locationType: locationType as "video" | "phone" | "in-person",
      locationDetails: locationDetails || undefined,
      color,
      requirePhone,
    };
    if (editId) {
      updateMut.mutate({ id: editId, ...data });
    } else {
      createMut.mutate({ ...data, slug });
    }
  }

  function autoSlug(t: string) {
    return t
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 100);
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {editId ? "Edit Booking Page" : "New Booking Page"}
        </h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error.message}
              </div>
            )}

            {/* Title & Slug */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!editId) setSlug(autoSlug(e.target.value));
                  }}
                  placeholder="30 Minute Consultation"
                />
              </div>
              <div className="space-y-2">
                <Label>URL Slug *</Label>
                <Input
                  required
                  value={slug}
                  onChange={(e) => setSlug(autoSlug(e.target.value))}
                  placeholder="30-min-consultation"
                  disabled={!!editId}
                />
                {!editId && (
                  <p className="text-xs text-gray-400">
                    yoursite.com/book/{slug || "..."}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent min-h-[80px] resize-y"
                placeholder="A quick call to discuss your project..."
              />
            </div>

            {/* Duration & Buffers */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Duration (min) *</Label>
                <Input
                  type="number"
                  min={5}
                  max={480}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Buffer Before (min)</Label>
                <Input
                  type="number"
                  min={0}
                  max={120}
                  value={bufferBefore}
                  onChange={(e) => setBufferBefore(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Buffer After (min)</Label>
                <Input
                  type="number"
                  min={0}
                  max={120}
                  value={bufferAfter}
                  onChange={(e) => setBufferAfter(e.target.value)}
                />
              </div>
            </div>

            {/* Scheduling Window */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Min Notice (min)</Label>
                <Input
                  type="number"
                  min={0}
                  value={minNotice}
                  onChange={(e) => setMinNotice(e.target.value)}
                />
                <p className="text-xs text-gray-400">
                  How far in advance booking is required
                </p>
              </div>
              <div className="space-y-2">
                <Label>Max Advance (days)</Label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={maxAdvance}
                  onChange={(e) => setMaxAdvance(e.target.value)}
                />
                <p className="text-xs text-gray-400">
                  How far out clients can book
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Location Type</Label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Location Details</Label>
                <Input
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  placeholder={
                    locationType === "video"
                      ? "Zoom/Meet link"
                      : locationType === "phone"
                      ? "Phone number"
                      : "Address"
                  }
                />
              </div>
            </div>

            {/* Color & Options */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2 flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requirePhone}
                    onChange={(e) => setRequirePhone(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Require phone number</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {editId ? "Save Changes" : "Create Booking Page"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

/* ────────── Appointments List ────────── */
function AppointmentsList({
  onBack,
  onNewAppt,
}: {
  onBack: () => void;
  onNewAppt: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + weekOffset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [weekOffset]);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    return d;
  }, [weekStart]);

  const { data: appointments, isLoading } = trpc.scheduling.listAppointments.useQuery({
    from: weekStart,
    to: weekEnd,
    ...(statusFilter !== "ALL"
      ? { status: statusFilter as "CONFIRMED" | "PENDING" | "CANCELED" | "COMPLETED" | "NO_SHOW" }
      : {}),
  });
  const utils = trpc.useUtils();
  const statusMut = trpc.scheduling.updateAppointmentStatus.useMutation({
    onSuccess: () => utils.scheduling.invalidate(),
  });
  const deleteMut = trpc.scheduling.deleteAppointment.useMutation({
    onSuccess: () => utils.scheduling.invalidate(),
  });

  const weekLabel = useMemo(() => {
    const end = new Date(weekEnd);
    end.setDate(end.getDate() - 1);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${weekStart.toLocaleDateString(undefined, opts)} — ${end.toLocaleDateString(undefined, opts)}`;
  }, [weekStart, weekEnd]);

  // Group by day
  const grouped = useMemo(() => {
    if (!appointments) return {};
    const groups: Record<string, AppointmentRecord[]> = {};
    for (const appt of appointments as AppointmentRecord[]) {
      const day = new Date(appt.startTime).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      if (!groups[day]) groups[day] = [];
      groups[day].push(appt);
    }
    return groups;
  }, [appointments]);

  function formatTime(d: string | Date) {
    return new Date(d).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        </div>
        <Button onClick={onNewAppt}>
          <Plus className="h-4 w-4" /> New Appointment
        </Button>
      </div>

      {/* Week Nav + Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((w) => w - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700 min-w-[160px] text-center">
            {weekLabel}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((w) => w + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {weekOffset !== 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekOffset(0)}
              className="text-xs"
            >
              Today
            </Button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm"
        >
          <option value="ALL">All statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELED">Canceled</option>
          <option value="NO_SHOW">No Show</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !appointments?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16">
          <Calendar className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No appointments this week</p>
          <p className="text-sm text-gray-400 mt-1">
            Try a different week or create a new appointment
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, appts]) => (
            <div key={day}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {day}
              </h3>
              <div className="space-y-2">
                {appts.map((appt) => (
                  <Card key={appt.id}>
                    <CardContent className="py-4 px-5 flex items-center gap-4">
                      {/* Color dot */}
                      <div
                        className="h-10 w-1 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            appt.bookingPage?.color ?? "#6b7280",
                        }}
                      />
                      {/* Time */}
                      <div className="min-w-[100px]">
                        <p className="font-medium text-sm">
                          {formatTime(appt.startTime)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTime(appt.endTime)}
                        </p>
                      </div>
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {appt.title ||
                            appt.bookingPage?.title ||
                            "Appointment"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {appt.client?.name ||
                            appt.clientName ||
                            appt.clientEmail ||
                            "No client"}
                        </p>
                      </div>
                      {/* Status */}
                      <AppointmentBadge status={appt.status} />
                      {/* Actions */}
                      <div className="flex gap-1 shrink-0">
                        {appt.status === "PENDING" && (
                          <button
                            className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600"
                            onClick={() =>
                              statusMut.mutate({
                                id: appt.id,
                                status: "CONFIRMED",
                              })
                            }
                            title="Confirm"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {(appt.status === "CONFIRMED" ||
                          appt.status === "PENDING") && (
                          <>
                            <button
                              className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600"
                              onClick={() =>
                                statusMut.mutate({
                                  id: appt.id,
                                  status: "COMPLETED",
                                })
                              }
                              title="Mark complete"
                            >
                              <Users className="h-4 w-4" />
                            </button>
                            <button
                              className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                              onClick={() =>
                                statusMut.mutate({
                                  id: appt.id,
                                  status: "CANCELED",
                                })
                              }
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                          onClick={() => {
                            if (confirm("Delete this appointment?")) {
                              deleteMut.mutate({ id: appt.id });
                            }
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ────────── New Appointment Form ────────── */
function AppointmentForm({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const utils = trpc.useUtils();
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: bookingPages } = trpc.scheduling.listPages.useQuery();

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [bookingPageId, setBookingPageId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [startTimeStr, setStartTimeStr] = useState("09:00");
  const [duration, setDuration] = useState("30");
  const [notes, setNotes] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const createMut = trpc.scheduling.createAppointment.useMutation({
    onSuccess: () => {
      utils.scheduling.invalidate();
      onSuccess();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const start = new Date(`${date}T${startTimeStr}`);
    const end = new Date(start.getTime() + (parseInt(duration) || 30) * 60000);

    createMut.mutate({
      title: title || undefined,
      clientId: clientId || undefined,
      bookingPageId: bookingPageId || undefined,
      startTime: start,
      endTime: end,
      notes: notes || undefined,
      clientName: clientName || undefined,
      clientEmail: clientEmail || undefined,
      status: "CONFIRMED",
    });
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">New Appointment</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {createMut.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {createMut.error.message}
              </div>
            )}

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Meeting, consultation..."
              />
            </div>

            {/* Client / Booking Page */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Client</Label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="">Select client (optional)</option>
                  {clients?.map((c: ClientOption) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.company ? ` (${c.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Booking Page</Label>
                <select
                  value={bookingPageId}
                  onChange={(e) => {
                    setBookingPageId(e.target.value);
                    const bp = (bookingPages as BookingPageRecord[] | undefined)?.find(
                      (p) => p.id === e.target.value
                    );
                    if (bp) setDuration(String(bp.duration));
                  }}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="">None (manual)</option>
                  {(bookingPages as BookingPageRecord[] | undefined)?.map((bp) => (
                    <option key={bp.id} value={bp.id}>
                      {bp.title} ({bp.duration}min)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date / Time / Duration */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  required
                  value={startTimeStr}
                  onChange={(e) => setStartTimeStr(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  min={5}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>

            {/* Walk-in Client Info */}
            {!clientId && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Walk-in client name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Email</Label>
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@email.com"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent min-h-[80px] resize-y"
                placeholder="Any details about this appointment..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMut.isPending}>
                {createMut.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Create Appointment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

/* ────────── Status Badge ────────── */
function AppointmentBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    CONFIRMED: {
      label: "Confirmed",
      cls: "bg-green-50 text-green-700 border-green-200",
    },
    PENDING: {
      label: "Pending",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    COMPLETED: {
      label: "Completed",
      cls: "bg-blue-50 text-blue-700 border-blue-200",
    },
    CANCELED: {
      label: "Canceled",
      cls: "bg-gray-50 text-gray-500 border-gray-200",
    },
    NO_SHOW: {
      label: "No Show",
      cls: "bg-red-50 text-red-700 border-red-200",
    },
  };
  const s = map[status] ?? { label: status, cls: "bg-gray-50 text-gray-500" };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
