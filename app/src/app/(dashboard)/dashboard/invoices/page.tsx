"use client";

import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ArrowLeft,
  Trash2,
  Copy,
  Send,
  FileText,
  Printer,
  DollarSign,
  Clock,
  AlertTriangle,
  Sparkles,
  Loader2,
  Check,
  Download,
  Mail,
  X,
  Bell,
  Repeat,
  BookmarkPlus,
  LayoutTemplate,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

type View = "list" | "new" | "detail" | "edit";
type StatusFilter =
  | "ALL"
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "PAID"
  | "OVERDUE"
  | "CANCELED";

interface LineItem {
  description: string;
  quantity: string;
  unitPrice: string;
}

interface ClientRecord {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
}

interface InvoiceRecord {
  id: string;
  number: string;
  status: string;
  total: number;
  subtotal: number;
  taxRate: number | string | null;
  taxAmount: number;
  dueDate: string | Date;
  createdAt: string | Date;
  sentAt?: string | Date | null;
  paidAt?: string | Date | null;
  notes?: string | null;
  terms?: string | null;
  clientId?: string | null;
  client?: ClientRecord | null;
  items?: InvoiceItemRecord[];
  remindersSent?: number;
  lastReminderAt?: string | Date | null;
  isRecurring?: boolean;
  recurringInterval?: string | null;
}

interface InvoiceItemRecord {
  id: string;
  description: string;
  quantity: number | string;
  unitPrice: number;
  total: number;
}

export default function InvoicesPage() {
  const [view, setView] = useState<View>("list");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {view === "list" && (
        <InvoiceList
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
          onNew={() => setView("new")}
          onSelect={(id) => {
            setSelectedId(id);
            setView("detail");
          }}
        />
      )}
      {view === "new" && (
        <InvoiceForm
          onBack={() => setView("list")}
          onSuccess={(id) => {
            setSelectedId(id);
            setView("detail");
          }}
        />
      )}
      {view === "detail" && selectedId && (
        <InvoiceDetail
          id={selectedId}
          onBack={() => setView("list")}
          onEdit={() => setView("edit")}
        />
      )}
      {view === "edit" && selectedId && (
        <InvoiceForm
          editId={selectedId}
          onBack={() => setView("detail")}
          onSuccess={() => setView("detail")}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   Invoice List — stats, filters, table
   ══════════════════════════════════════════ */

function InvoiceList({
  statusFilter,
  onFilterChange,
  onNew,
  onSelect,
}: {
  statusFilter: StatusFilter;
  onFilterChange: (s: StatusFilter) => void;
  onNew: () => void;
  onSelect: (id: string) => void;
}) {
  const { data: stats } = trpc.invoice.stats.useQuery();
  const { data: invoices, isLoading } = trpc.invoice.list.useQuery(
    statusFilter === "ALL" ? undefined : { status: statusFilter }
  );

  const statCards = [
    {
      label: "Total Revenue",
      value: stats ? formatCurrency(stats.total.amount) : "$0.00",
      count: stats?.total.count ?? 0,
      icon: DollarSign,
      color: "text-gray-600 bg-gray-100",
    },
    {
      label: "Paid",
      value: stats ? formatCurrency(stats.paid.amount) : "$0.00",
      count: stats?.paid.count ?? 0,
      icon: Check,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Pending",
      value: stats ? formatCurrency(stats.pending.amount) : "$0.00",
      count: stats?.pending.count ?? 0,
      icon: Clock,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Overdue",
      value: stats ? formatCurrency(stats.overdue.amount) : "$0.00",
      count: stats?.overdue.count ?? 0,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-100",
    },
  ];

  const filters: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "ALL" },
    { label: "Draft", value: "DRAFT" },
    { label: "Sent", value: "SENT" },
    { label: "Paid", value: "PAID" },
    { label: "Overdue", value: "OVERDUE" },
    { label: "Canceled", value: "CANCELED" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, send, and track invoices
          </p>
        </div>
        <Button onClick={onNew}>
          <Plus className="h-4 w-4" /> New Invoice
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {s.count} invoice{s.count !== 1 ? "s" : ""}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === f.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Invoice Table */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-4 w-32 bg-gray-100 rounded" />
                  <div className="flex-1" />
                  <div className="h-4 w-16 bg-gray-100 rounded" />
                  <div className="h-6 w-16 bg-gray-200 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : !invoices?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16">
          <FileText className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No invoices yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            Create your first invoice to get started
          </p>
          <Button onClick={onNew} size="sm">
            <Plus className="h-4 w-4" /> New Invoice
          </Button>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left font-medium text-gray-500 px-6 py-3">
                    Invoice
                  </th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">
                    Client
                  </th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3 hidden sm:table-cell">
                    Date
                  </th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3 hidden md:table-cell">
                    Due Date
                  </th>
                  <th className="text-right font-medium text-gray-500 px-6 py-3">
                    Amount
                  </th>
                  <th className="text-center font-medium text-gray-500 px-6 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv: InvoiceRecord) => (
                  <tr
                    key={inv.id}
                    onClick={() => onSelect(inv.id)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <span className="flex items-center gap-1.5">
                        {inv.number}
                        {inv.isRecurring && (
                          <Repeat className="h-3.5 w-3.5 text-blue-500" aria-label="Recurring" />
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {inv.client?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">
                      {formatDate(inv.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}

/* ══════════════════════════════════════════
   Invoice Detail — full preview + actions
   ══════════════════════════════════════════ */

function InvoiceDetail({
  id,
  onBack,
  onEdit,
}: {
  id: string;
  onBack: () => void;
  onEdit: () => void;
}) {
  const utils = trpc.useUtils();
  const { data: invoice, isLoading } = trpc.invoice.getById.useQuery({ id });
  const { data: business } = trpc.business.getCurrent.useQuery();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [reminderSending, setReminderSending] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);

  const templateCreateMut = trpc.template.create.useMutation({
    onSuccess: () => {
      setTemplateSaved(true);
      setTimeout(() => setTemplateSaved(false), 3000);
    },
  });

  const handleSaveAsTemplate = useCallback(async () => {
    if (!invoice) return;
    const name = prompt("Template name:", `${invoice.number} Template`);
    if (!name) return;
    setSavingTemplate(true);
    try {
      templateCreateMut.mutate({
        name,
        notes: invoice.notes || undefined,
        terms: invoice.terms || undefined,
        taxRate: Number(invoice.taxRate) || 0,
        items: invoice.items?.map((item: InvoiceItemRecord) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: item.unitPrice,
        })) ?? [],
      });
    } finally {
      setSavingTemplate(false);
    }
  }, [invoice, templateCreateMut]);

  const handleSendReminder = useCallback(async () => {
    if (!invoice) return;
    setReminderSending(true);
    try {
      const res = await fetch("/api/invoice/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send reminder");
      }
      setReminderSent(true);
      setTimeout(() => setReminderSent(false), 3000);
      utils.invoice.invalidate();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to send reminder");
    } finally {
      setReminderSending(false);
    }
  }, [invoice, utils.invoice]);

  const handleDownloadPdf = useCallback(async () => {
    if (!invoiceRef.current || !invoice) return;
    setPdfLoading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfPageHeight;

      while (heightLeft > 0) {
        position -= pdfPageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfPageHeight;
      }

      pdf.save(`${invoice.number}.pdf`);
    } catch {
      alert("Failed to generate PDF. Please try printing instead.");
    } finally {
      setPdfLoading(false);
    }
  }, [invoice]);

  const handleSendEmail = useCallback(async () => {
    if (!emailTo || !invoice) return;
    setEmailSending(true);
    try {
      const res = await fetch("/api/invoice/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          to: emailTo,
          message: emailMessage,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }
      setEmailSent(true);
      setTimeout(() => {
        setEmailModal(false);
        setEmailSent(false);
        setEmailTo("");
        setEmailMessage("");
      }, 2000);
      utils.invoice.invalidate();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to send email");
    } finally {
      setEmailSending(false);
    }
  }, [emailTo, emailMessage, invoice, utils.invoice]);

  const updateStatus = trpc.invoice.updateStatus.useMutation({
    onSuccess: () => utils.invoice.invalidate(),
  });
  const duplicateMut = trpc.invoice.duplicate.useMutation({
    onSuccess: () => {
      utils.invoice.invalidate();
      onBack();
    },
  });
  const deleteMut = trpc.invoice.delete.useMutation({
    onSuccess: () => {
      utils.invoice.invalidate();
      onBack();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Invoice not found</p>
        <Button variant="ghost" className="mt-4" onClick={onBack}>
          Go back
        </Button>
      </div>
    );
  }

  const isDraft = invoice.status === "DRAFT";

  return (
    <>
      {/* Action Bar */}
      <div className="flex items-center gap-3" data-no-print>
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">
            {invoice.number}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <StatusBadge status={invoice.status} />
            {invoice.isRecurring && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                <Repeat className="h-3 w-3" />
                {invoice.recurringInterval ?? "monthly"}
              </span>
            )}
            {invoice.client && (
              <span className="text-sm text-gray-500">
                — {invoice.client.name}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDraft && (
            <>
              <Button size="sm" variant="outline" onClick={onEdit}>
                Edit
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  updateStatus.mutate({ id, status: "SENT" })
                }
                disabled={updateStatus.isPending}
              >
                <Send className="h-4 w-4" /> Send
              </Button>
            </>
          )}
          {(invoice.status === "SENT" || invoice.status === "VIEWED" || invoice.status === "OVERDUE") && (
            <>
              <Button
                size="sm"
                onClick={() =>
                  updateStatus.mutate({ id, status: "PAID" })
                }
                disabled={updateStatus.isPending}
              >
                <Check className="h-4 w-4" /> Mark Paid
              </Button>
              {invoice.client?.email && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSendReminder}
                  disabled={reminderSending || reminderSent}
                  className={reminderSent ? "text-green-600 border-green-300" : ""}
                >
                  {reminderSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : reminderSent ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  {reminderSent ? "Sent!" : "Remind"}
                </Button>
              )}
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
          >
            {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEmailTo(invoice?.client?.email || "");
              setEmailModal(true);
            }}
          >
            <Mail className="h-4 w-4" /> Email
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => duplicateMut.mutate({ id })}
            disabled={duplicateMut.isPending}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveAsTemplate}
            disabled={savingTemplate || templateSaved}
          >
            {templateSaved ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : savingTemplate ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BookmarkPlus className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
          </Button>
          {isDraft && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm("Delete this draft invoice?")) {
                  deleteMut.mutate({ id });
                }
              }}
              disabled={deleteMut.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEmailModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Email Invoice</h3>
              <Button variant="ghost" size="icon" onClick={() => setEmailModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {emailSent ? (
              <div className="text-center py-8">
                <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-medium text-gray-900">Invoice Sent!</p>
                <p className="text-sm text-gray-500 mt-1">Email delivered to {emailTo}</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email-to">Recipient Email</Label>
                  <Input
                    id="email-to"
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-msg">Message (optional)</Label>
                  <textarea
                    id="email-msg"
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Hi, please find the attached invoice..."
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setEmailModal(false)}>Cancel</Button>
                  <Button onClick={handleSendEmail} disabled={!emailTo || emailSending}>
                    {emailSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send Invoice
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Overdue / Reminder Banner */}
      {(invoice.status === "OVERDUE" || (invoice.status === "SENT" && new Date(invoice.dueDate) < new Date())) && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800">
              This invoice is overdue — was due {formatDate(invoice.dueDate)}
            </p>
            {invoice.remindersSent !== undefined && invoice.remindersSent > 0 && (
              <p className="text-xs text-red-600 mt-0.5">
                {invoice.remindersSent} reminder{invoice.remindersSent !== 1 ? "s" : ""} sent
                {invoice.lastReminderAt && ` · Last: ${formatDate(invoice.lastReminderAt)}`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Invoice Preview */}
      <Card ref={invoiceRef}>
        <CardContent className="p-8 sm:p-10">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {business?.name || "Your Business"}
              </h2>
              {business?.address && (
                <p className="text-sm text-gray-500 mt-1">
                  {business.address}
                </p>
              )}
              {(business?.city || business?.state) && (
                <p className="text-sm text-gray-500">
                  {[business?.city, business?.state, business?.zipCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
            <div className="text-left sm:text-right">
              <p className="text-3xl font-bold text-gray-300 uppercase">
                Invoice
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {invoice.number}
              </p>
            </div>
          </div>

          {/* Bill To + Dates */}
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Bill To
              </p>
              {invoice.client ? (
                <>
                  <p className="font-semibold text-gray-900">
                    {invoice.client.name}
                  </p>
                  {invoice.client.company && (
                    <p className="text-sm text-gray-600">
                      {invoice.client.company}
                    </p>
                  )}
                  {invoice.client.email && (
                    <p className="text-sm text-gray-500">
                      {invoice.client.email}
                    </p>
                  )}
                  {invoice.client.address && (
                    <p className="text-sm text-gray-500">
                      {invoice.client.address}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No client linked
                </p>
              )}
            </div>
            <div className="sm:text-right">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between sm:justify-end sm:gap-6">
                  <span className="text-gray-500">Issued</span>
                  <span className="font-medium">
                    {formatDate(invoice.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between sm:justify-end sm:gap-6">
                  <span className="text-gray-500">Due Date</span>
                  <span className="font-medium">
                    {formatDate(invoice.dueDate)}
                  </span>
                </div>
                {invoice.paidAt && (
                  <div className="flex justify-between sm:justify-end sm:gap-6">
                    <span className="text-gray-500">Paid</span>
                    <span className="font-medium text-green-600">
                      {formatDate(invoice.paidAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border rounded-lg overflow-hidden mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">
                    Description
                  </th>
                  <th className="text-center font-semibold text-gray-600 px-4 py-3 w-20">
                    Qty
                  </th>
                  <th className="text-right font-semibold text-gray-600 px-4 py-3 w-28">
                    Unit Price
                  </th>
                  <th className="text-right font-semibold text-gray-600 px-4 py-3 w-28">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item: InvoiceItemRecord) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>
              {Number(invoice.taxRate) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Tax ({Number(invoice.taxRate)}%)
                  </span>
                  <span className="font-medium">
                    {formatCurrency(invoice.taxAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="mt-10 pt-6 border-t space-y-4 text-sm">
              {invoice.notes && (
                <div>
                  <p className="font-semibold text-gray-600 mb-1">Notes</p>
                  <p className="text-gray-500 whitespace-pre-wrap">
                    {invoice.notes}
                  </p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <p className="font-semibold text-gray-600 mb-1">Terms</p>
                  <p className="text-gray-500 whitespace-pre-wrap">
                    {invoice.terms}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

/* ══════════════════════════════════════════
   Invoice Form — create / edit + AI Assist
   ══════════════════════════════════════════ */

function InvoiceForm({
  editId,
  onBack,
  onSuccess,
}: {
  editId?: string;
  onBack: () => void;
  onSuccess: (id: string) => void;
}) {
  const utils = trpc.useUtils();
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: existing } = trpc.invoice.getById.useQuery(
    { id: editId! },
    { enabled: !!editId }
  );
  const { data: rawTemplates } = trpc.template.list.useQuery();
  const templates = rawTemplates as unknown as { id: string; name: string; notes: string | null; terms: string | null; taxRate: number | string; items: unknown; isDefault: boolean }[] | undefined;

  const [clientId, setClientId] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: "1", unitPrice: "" },
  ]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [taxRate, setTaxRate] = useState("0");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState("monthly");
  const [initialized, setInitialized] = useState(!editId);

  // Populate form when editing
  if (existing && !initialized) {
    setClientId(existing.clientId || "");
    setItems(
      existing.items.map((item: InvoiceItemRecord) => ({
        description: item.description,
        quantity: String(item.quantity),
        unitPrice: String(Number(item.unitPrice) / 100),
      }))
    );
    setDueDate(new Date(existing.dueDate).toISOString().split("T")[0]);
    setTaxRate(String(existing.taxRate ?? 0));
    setNotes(existing.notes || "");
    setTerms(existing.terms || "");
    setIsRecurring(existing.isRecurring ?? false);
    setRecurringInterval(existing.recurringInterval || "monthly");
    setInitialized(true);
  }

  const createMut = trpc.invoice.create.useMutation({
    onSuccess: (data) => {
      utils.invoice.invalidate();
      onSuccess((data as unknown as { id: string }).id);
    },
  });
  const updateMut = trpc.invoice.update.useMutation({
    onSuccess: () => {
      utils.invoice.invalidate();
      onSuccess(editId!);
    },
  });

  const isPending = createMut.isPending || updateMut.isPending;
  const error = createMut.error || updateMut.error;

  // Computed totals
  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
  const tax = subtotal * ((parseFloat(taxRate) || 0) / 100);
  const total = subtotal + tax;

  function addItem() {
    setItems([...items, { description: "", quantity: "1", unitPrice: "" }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof LineItem, value: string) {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function handleAIGenerated(data: { clientId?: string; items?: { description: string; quantity: number; unitPrice: number }[]; dueDate?: string; notes?: string }) {
    if (data.clientId) setClientId(data.clientId);
    if (data.items?.length) {
      setItems(
        data.items.map((item) => ({
          description: item.description || "",
          quantity: String(item.quantity || 1),
          unitPrice: String((item.unitPrice || 0) / 100),
        }))
      );
    }
    if (data.dueDate) setDueDate(data.dueDate);
    if (data.notes) setNotes(data.notes);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      clientId: clientId || undefined,
      items: items
        .filter((item) => item.description.trim())
        .map((item) => ({
          description: item.description,
          quantity: parseFloat(item.quantity) || 1,
          unitPrice: Math.round((parseFloat(item.unitPrice) || 0) * 100),
        })),
      dueDate,
      taxRate: parseFloat(taxRate) || 0,
      notes: notes || undefined,
      terms: terms || undefined,
      isRecurring,
      recurringInterval: isRecurring ? recurringInterval as "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly" : undefined,
    };

    if (editId) {
      updateMut.mutate({ id: editId, ...payload });
    } else {
      createMut.mutate(payload);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {editId ? "Edit Invoice" : "New Invoice"}
        </h1>
      </div>

      {/* AI Assist */}
      {!editId && <AIAssistBar onGenerated={handleAIGenerated} />}

      {/* Template Picker */}
      {!editId && templates && templates.length > 0 && (
        <div className="flex items-center gap-3">
          <LayoutTemplate className="h-4 w-4 text-gray-400" />
          <select
            defaultValue=""
            onChange={(e) => {
              const tpl = templates.find((t) => t.id === e.target.value);
              if (!tpl) return;
              const tplItems = tpl.items as unknown as { description: string; quantity: number; unitPrice: number }[];
              setItems(
                tplItems.map((item) => ({
                  description: item.description,
                  quantity: String(item.quantity),
                  unitPrice: String(item.unitPrice / 100),
                }))
              );
              setTaxRate(String(Number(tpl.taxRate) || 0));
              if (tpl.notes) setNotes(tpl.notes);
              if (tpl.terms) setTerms(tpl.terms);
              e.target.value = "";
            }}
            className="flex h-9 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <option value="" disabled>Load from template…</option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}{tpl.isDefault ? " ★" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error.message}
              </div>
            )}

            {/* Client + Due Date */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Client</Label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent"
                >
                  <option value="">No client (optional)</option>
                  {clients?.map((c: ClientRecord) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.company ? ` (${c.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <Label>Line Items</Label>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left font-medium text-gray-500 px-3 py-2">
                        Description
                      </th>
                      <th className="text-center font-medium text-gray-500 px-3 py-2 w-20">
                        Qty
                      </th>
                      <th className="text-right font-medium text-gray-500 px-3 py-2 w-28">
                        Price ($)
                      </th>
                      <th className="text-right font-medium text-gray-500 px-3 py-2 w-28">
                        Total
                      </th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const lineTotal =
                        (parseFloat(item.quantity) || 0) *
                        (parseFloat(item.unitPrice) || 0);
                      return (
                        <tr key={index} className="border-b last:border-0">
                          <td className="px-2 py-2">
                            <input
                              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Service description"
                              value={item.description}
                              onChange={(e) =>
                                updateItem(index, "description", e.target.value)
                              }
                              required
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="any"
                              min="0"
                              className="w-full px-2 py-1.5 text-sm text-center border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(index, "quantity", e.target.value)
                              }
                              required
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-full px-2 py-1.5 text-sm text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="0.00"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(index, "unitPrice", e.target.value)
                              }
                              required
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-gray-700">
                            ${lineTotal.toFixed(2)}
                          </td>
                          <td className="px-1 py-2">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              disabled={items.length <= 1}
                              className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="h-4 w-4" /> Add Line Item
              </Button>
            </div>

            {/* Tax + Totals */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-gray-500">Tax Rate (%)</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-20 px-2 py-1 text-sm text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  />
                </div>
                {tax > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t pt-3 text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-gray-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Notes</Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent min-h-[80px] resize-y"
                  placeholder="Payment instructions, thank you note..."
                />
              </div>
              <div className="space-y-2">
                <Label>Terms</Label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent min-h-[80px] resize-y"
                  placeholder="Net 30, late fees..."
                />
              </div>
            </div>

            {/* Recurring Invoice */}
            <div className="rounded-lg border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-gray-500" />
                  <Label className="cursor-pointer" htmlFor="recurring-toggle">Recurring Invoice</Label>
                </div>
                <button
                  id="recurring-toggle"
                  type="button"
                  role="switch"
                  aria-checked={isRecurring}
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    isRecurring ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isRecurring ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              {isRecurring && (
                <div className="space-y-2">
                  <Label>Repeat Every</Label>
                  <select
                    value={recurringInterval}
                    onChange={(e) => setRecurringInterval(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <option value="weekly">Week</option>
                    <option value="biweekly">2 Weeks</option>
                    <option value="monthly">Month</option>
                    <option value="quarterly">Quarter (3 Months)</option>
                    <option value="yearly">Year</option>
                  </select>
                  <p className="text-xs text-gray-400">
                    A new invoice will be auto-created when this one is paid.
                  </p>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Saving..."
                  : editId
                    ? "Update Invoice"
                    : "Create Invoice"}
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

/* ══════════════════════════════════════════
   AI Assist Bar — natural language → invoice
   ══════════════════════════════════════════ */

interface AIInvoiceData {
  clientId?: string;
  items?: { description: string; quantity: number; unitPrice: number }[];
  dueDate?: string;
  notes?: string;
}

function AIAssistBar({
  onGenerated,
}: {
  onGenerated: (data: AIInvoiceData) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      onGenerated(data.invoice);
      if (data.aiActionsRemaining != null) setRemaining(data.aiActionsRemaining);
      setPrompt("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-blue-900">
            AI Invoice Assistant
          </span>
          {remaining !== null && (
            <span className="text-xs text-blue-500 ml-auto">
              {remaining} AI actions remaining
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder='Try: "Invoice Sarah $500 for logo design and $200 for brand guidelines, due in 2 weeks"'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading && prompt.trim()) generate();
            }}
            className="bg-white"
          />
          <Button
            type="button"
            onClick={generate}
            disabled={loading || !prompt.trim()}
            size="default"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? "Generating..." : "Generate"}
          </Button>
        </div>
        {error && (
          <p className="text-xs text-red-600 mt-2">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}

/* ══════════════════════════════════════════
   Status Badge
   ══════════════════════════════════════════ */

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
