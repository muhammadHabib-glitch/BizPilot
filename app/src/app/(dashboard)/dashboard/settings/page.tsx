"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc/client";
import { Building2, User, CreditCard } from "lucide-react";

const TABS = [
  { id: "business", label: "Business", icon: Building2 },
  { id: "account", label: "Account", icon: User },
  { id: "billing", label: "Billing", icon: CreditCard },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("business");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your business and account settings
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "business" && <BusinessSettings />}
      {activeTab === "account" && <AccountSettings />}
      {activeTab === "billing" && <BillingSettings />}
    </div>
  );
}

function BusinessSettings() {
  const { data: business, isLoading } = trpc.business.getCurrent.useQuery();
  const updateBusiness = trpc.business.update.useMutation();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Populate form when data loads
  if (business && !initialized) {
    setName(business.name || "");
    setEmail(business.email || "");
    setPhone(business.phone || "");
    setWebsite(business.website || "");
    setAddress(business.address || "");
    setCity(business.city || "");
    setState(business.state || "");
    setZipCode(business.zipCode || "");
    setTaxRate(business.taxRate?.toString() || "0");
    setInvoicePrefix(business.invoicePrefix || "INV");
    setInitialized(true);
  }

  async function handleSave() {
    await updateBusiness.mutateAsync({
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      website: website || undefined,
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      zipCode: zipCode || undefined,
      taxRate: taxRate ? parseFloat(taxRate) : undefined,
      invoicePrefix: invoicePrefix || undefined,
    });
    utils.business.getCurrent.invalidate();
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          Loading...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            This information appears on your invoices and public booking pages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bizName">Business name</Label>
              <Input
                id="bizName"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bizEmail">Business email</Label>
              <Input
                id="bizEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bizPhone">Phone</Label>
              <Input
                id="bizPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bizWebsite">Website</Label>
              <Input
                id="bizWebsite"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="bizAddress">Street address</Label>
            <Input
              id="bizAddress"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bizCity">City</Label>
              <Input
                id="bizCity"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bizState">State</Label>
              <Input
                id="bizState"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bizZip">ZIP code</Label>
              <Input
                id="bizZip"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bizTaxRate">Default tax rate (%)</Label>
              <Input
                id="bizTaxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bizPrefix">Invoice prefix</Label>
              <Input
                id="bizPrefix"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                maxLength={10}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={updateBusiness.isPending}
            >
              {updateBusiness.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AccountSettings() {
  const { data: user, isLoading } = trpc.user.me.useQuery();
  const updateUser = trpc.user.update.useMutation();
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (user && !initialized) {
    setName(user.name || "");
    setInitialized(true);
  }

  async function handleSave() {
    await updateUser.mutateAsync({ name: name || undefined });
    utils.user.me.invalidate();
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          Loading...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
          <CardDescription>Manage your personal account info</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userName">Full name</Label>
            <Input
              id="userName"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
            <p className="text-xs text-gray-400">
              Email changes are managed through your login provider
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={updateUser.isPending}
            >
              {updateUser.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Sign out</p>
              <p className="text-sm text-gray-500">
                Sign out of your current session
              </p>
            </div>
            <form action="/auth/signout" method="POST">
              <Button type="submit" variant="destructive" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BillingSettings() {
  const { data: business } = trpc.business.getCurrent.useQuery();
  const plan = business?.subscription?.plan || "FREE";
  const status = business?.subscription?.status || "TRIALING";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-lg font-semibold">{plan}</p>
                <Badge
                  variant={status === "ACTIVE" || status === "TRIALING" ? "success" : "warning"}
                >
                  {status}
                </Badge>
              </div>
            </div>
            <Button variant="outline" disabled>
              Upgrade (Coming Soon)
            </Button>
          </div>

          {business?.subscription?.trialEndsAt && (
            <p className="text-sm text-gray-500 mt-4">
              Trial ends:{" "}
              {new Date(
                business.subscription.trialEndsAt
              ).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>
            Your AI actions and team member usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">AI Actions</span>
                <span className="font-medium">
                  {business?.subscription?.aiActionsUsed || 0} /{" "}
                  {business?.subscription?.aiActionsLimit || 100}
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${Math.min(
                      ((business?.subscription?.aiActionsUsed || 0) /
                        (business?.subscription?.aiActionsLimit || 100)) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
