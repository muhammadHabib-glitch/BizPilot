"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  MapPin,
  ArrowLeft,
  Archive,
  ArchiveRestore,
  FileText,
  DollarSign,
  TrendingUp,
  Calendar,
  Tag,
  X,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

type View = "list" | "new" | "detail" | "edit";

interface ClientRecord {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  notes: string | null;
  tags?: string[];
  isArchived: boolean;
  totalRevenue?: number | string;
  totalInvoices?: number;
  lastInvoiceDate?: string | Date | null;
  invoices?: InvoiceRecord[];
  appointments?: unknown[];
}

interface InvoiceRecord {
  id: string;
  number: string;
  status: string;
  total: number;
  createdAt: string | Date;
}

export default function ClientsPage() {
  const [view, setView] = useState<View>("list");
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [filterTag, setFilterTag] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {view === "list" && (
        <ClientList
          search={search}
          onSearchChange={setSearch}
          showArchived={showArchived}
          onToggleArchived={() => setShowArchived(!showArchived)}
          filterTag={filterTag}
          onFilterTagChange={setFilterTag}
          onNew={() => setView("new")}
          onSelect={(id) => {
            setSelectedId(id);
            setView("detail");
          }}
        />
      )}
      {view === "new" && (
        <ClientForm
          onBack={() => setView("list")}
          onSuccess={(id) => {
            setSelectedId(id);
            setView("detail");
          }}
        />
      )}
      {view === "detail" && selectedId && (
        <ClientDetail
          id={selectedId}
          onBack={() => setView("list")}
          onEdit={() => setView("edit")}
        />
      )}
      {view === "edit" && selectedId && (
        <ClientForm
          editId={selectedId}
          onBack={() => setView("detail")}
          onSuccess={() => setView("detail")}
        />
      )}
    </div>
  );
}

/* ────────── Client List ────────── */
function ClientList({
  search,
  onSearchChange,
  showArchived,
  onToggleArchived,
  filterTag,
  onFilterTagChange,
  onNew,
  onSelect,
}: {
  search: string;
  onSearchChange: (s: string) => void;
  showArchived: boolean;
  onToggleArchived: () => void;
  filterTag: string;
  onFilterTagChange: (t: string) => void;
  onNew: () => void;
  onSelect: (id: string) => void;
}) {
  const { data: clients, isLoading } = trpc.clients.list.useQuery({
    search: search || undefined,
    includeArchived: showArchived,
    tag: filterTag || undefined,
  });

  // Collect all unique tags across clients for the filter dropdown
  const allTags = Array.from(
    new Set((clients ?? []).flatMap((c: ClientRecord) => c.tags ?? []))
  ).sort();

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your clients and contacts
          </p>
        </div>
        <Button onClick={onNew}>
          <Plus className="h-4 w-4" /> Add Client
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showArchived ? "default" : "outline"}
          size="sm"
          onClick={onToggleArchived}
        >
          <Archive className="h-4 w-4" />
          {showArchived ? "Showing Archived" : "Show Archived"}
        </Button>
        {allTags.length > 0 && (
          <select
            value={filterTag}
            onChange={(e) => onFilterTagChange(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Client Grid */}
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
      ) : !clients?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16">
          <Building2 className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No clients yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            Add your first client to get started
          </p>
          <Button onClick={onNew} size="sm">
            <Plus className="h-4 w-4" /> Add Client
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client: ClientRecord) => (
            <Card
              key={client.id}
              className="cursor-pointer hover:border-blue-300 transition-colors"
              onClick={() => onSelect(client.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {client.name}
                    </h3>
                    {client.company && (
                      <p className="text-sm text-gray-500 truncate">
                        {client.company}
                      </p>
                    )}
                  </div>
                  {client.isArchived && (
                    <Badge variant="secondary">Archived</Badge>
                  )}
                </div>
                <div className="mt-3 space-y-1">
                  {client.email && (
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 truncate">
                      <Mail className="h-3.5 w-3.5 shrink-0" /> {client.email}
                    </p>
                  )}
                  {client.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 shrink-0" /> {client.phone}
                    </p>
                  )}
                  {client.city && (
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />{" "}
                      {client.city}
                      {client.state ? `, ${client.state}` : ""}
                    </p>
                  )}
                </div>
                {(client.tags?.length ?? 0) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {client.tags!.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                      >
                        <Tag className="h-2.5 w-2.5" /> {tag}
                      </span>
                    ))}
                  </div>
                )}
                {(Number(client.totalRevenue) > 0 || (client.totalInvoices ?? 0) > 0) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(Number(client.totalRevenue ?? 0))}
                    </span>
                    <span>{client.totalInvoices ?? 0} paid</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

/* ────────── Client Detail ────────── */
function ClientDetail({
  id,
  onBack,
  onEdit,
}: {
  id: string;
  onBack: () => void;
  onEdit: () => void;
}) {
  const utils = trpc.useUtils();
  const { data: client, isLoading } = trpc.clients.getById.useQuery({ id });
  const archiveMut = trpc.clients.archive.useMutation({
    onSuccess: () => utils.clients.invalidate(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-32 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Client not found</p>
        <Button variant="ghost" className="mt-4" onClick={onBack}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            {client.name}
          </h1>
          {client.company && (
            <p className="text-sm text-gray-500">{client.company}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => archiveMut.mutate({ id })}
            disabled={archiveMut.isPending}
          >
            {client.isArchived ? (
              <ArchiveRestore className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            {client.isArchived ? "Restore" : "Archive"}
          </Button>
          <Button size="sm" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <DollarSign className="h-4 w-4" /> Total Revenue
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(Number(client.totalRevenue ?? 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <TrendingUp className="h-4 w-4" /> Paid Invoices
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {client.totalInvoices ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Calendar className="h-4 w-4" /> Last Invoice
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {client.lastInvoiceDate
                ? formatDate(client.lastInvoiceDate)
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{client.phone}</span>
              </div>
            )}
            {(client.address || client.city) && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  {client.address && <p>{client.address}</p>}
                  <p>
                    {[client.city, client.state, client.zipCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            )}
            {(client.tags?.length ?? 0) > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-500 text-xs uppercase font-medium mb-1">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {client.tags!.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                    >
                      <Tag className="h-3 w-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {client.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-500 text-xs uppercase font-medium mb-1">
                  Notes
                </p>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {client.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!client.invoices?.length ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No invoices yet
              </p>
            ) : (
              <div className="divide-y">
                {client.invoices.map((inv: InvoiceRecord) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{inv.number}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(inv.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={inv.status} />
                      <span className="text-sm font-medium">
                        {formatCurrency(inv.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

/* ────────── Client Form (Create/Edit) ────────── */
function ClientForm({
  editId,
  onBack,
  onSuccess,
}: {
  editId?: string;
  onBack: () => void;
  onSuccess: (id: string) => void;
}) {
  const utils = trpc.useUtils();
  const { data: existing } = trpc.clients.getById.useQuery(
    { id: editId! },
    { enabled: !!editId }
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [initialized, setInitialized] = useState(!editId);

  // Populate form for editing
  if (existing && !initialized) {
    setForm({
      name: existing.name || "",
      email: existing.email || "",
      phone: existing.phone || "",
      company: existing.company || "",
      address: existing.address || "",
      city: existing.city || "",
      state: existing.state || "",
      zipCode: existing.zipCode || "",
      notes: existing.notes || "",
    });
    setTags((existing as unknown as ClientRecord).tags ?? []);
    setInitialized(true);
  }

  const createMut = trpc.clients.create.useMutation({
    onSuccess: (data) => {
      utils.clients.invalidate();
      onSuccess(data.id);
    },
  });
  const updateMut = trpc.clients.update.useMutation({
    onSuccess: () => {
      utils.clients.invalidate();
      onSuccess(editId!);
    },
  });

  const isPending = createMut.isPending || updateMut.isPending;
  const error = createMut.error || updateMut.error;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editId) {
      updateMut.mutate({ id: editId, ...form, tags });
    } else {
      createMut.mutate({ ...form, tags });
    }
  }

  const setField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {editId ? "Edit Client" : "New Client"}
        </h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error.message}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={form.company}
                  onChange={(e) => setField("company", e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  placeholder="New York"
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={form.state}
                  onChange={(e) => setField("state", e.target.value)}
                  placeholder="NY"
                />
              </div>
              <div className="space-y-2">
                <Label>ZIP Code</Label>
                <Input
                  value={form.zipCode}
                  onChange={(e) => setField("zipCode", e.target.value)}
                  placeholder="10001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = tagInput.trim();
                      if (val && !tags.includes(val)) setTags([...tags, val]);
                      setTagInput("");
                    }
                  }}
                  placeholder="Type a tag and press Enter"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const val = tagInput.trim();
                    if (val && !tags.includes(val)) setTags([...tags, val]);
                    setTagInput("");
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent min-h-[80px] resize-y"
                placeholder="Any notes about this client..."
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Saving..."
                  : editId
                    ? "Update Client"
                    : "Add Client"}
              </Button>
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

/* ────────── Status Badge Helper ────────── */
type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "outline";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    DRAFT: { label: "Draft", variant: "secondary" },
    SENT: { label: "Sent", variant: "default" },
    VIEWED: { label: "Viewed", variant: "default" },
    PAID: { label: "Paid", variant: "success" },
    OVERDUE: { label: "Overdue", variant: "destructive" },
    CANCELED: { label: "Canceled", variant: "outline" },
  };
  const s = map[status] || { label: status, variant: "secondary" };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
