"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { trpc } from "@/lib/trpc/client";
import { Building2, MapPin, Clock, CheckCircle2 } from "lucide-react";

const INDUSTRIES = [
  "Consulting",
  "Creative / Design",
  "Construction / Trades",
  "Education / Tutoring",
  "Event Planning",
  "Fitness / Wellness",
  "Food & Beverage",
  "Healthcare",
  "Home Services",
  "IT / Technology",
  "Legal",
  "Marketing / Advertising",
  "Photography / Video",
  "Real Estate",
  "Retail / E-commerce",
  "Other",
];

const US_TIMEZONES = [
  { value: "America/New_York", label: "Eastern (ET)" },
  { value: "America/Chicago", label: "Central (CT)" },
  { value: "America/Denver", label: "Mountain (MT)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "America/Anchorage", label: "Alaska (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii (HST)" },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // Form state
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");

  const upsertUser = trpc.user.upsertFromAuth.useMutation();
  const createBusiness = trpc.business.create.useMutation();

  const totalSteps = 3;

  async function handleComplete() {
    setError("");

    try {
      // Sync user to DB
      await upsertUser.mutateAsync();

      // Create business
      await createBusiness.mutateAsync({
        name: businessName,
        industry: industry || undefined,
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        zipCode: zipCode || undefined,
        timezone,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
              B
            </div>
            <span className="text-lg font-bold text-gray-900">BizPilot</span>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i + 1 <= step ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Step 1: Business Info */}
        {step === 1 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-2">
                <Building2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Tell us about your business</CardTitle>
              <CardDescription>
                We&apos;ll use this to set up your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business name *</Label>
                <Input
                  id="businessName"
                  placeholder="Acme Services LLC"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="">Select an industry</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Business phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button
                className="w-full mt-2"
                disabled={!businessName.trim()}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-2">
                <MapPin className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Business address</CardTitle>
              <CardDescription>
                This will appear on your invoices (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street address</Label>
                <Input
                  id="address"
                  placeholder="123 Main St, Suite 100"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <select
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <option value="">State</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP code</Label>
                <Input
                  id="zipCode"
                  placeholder="10001"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  maxLength={10}
                />
              </div>
              <div className="flex gap-3 mt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Timezone + Confirm */}
        {step === 3 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-2">
                <Clock className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Almost there!</CardTitle>
              <CardDescription>
                Set your timezone and you&apos;re ready to go
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {US_TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Summary */}
              <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                <h4 className="font-medium text-sm text-gray-900">Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Business:</span>{" "}
                    {businessName}
                  </p>
                  {industry && (
                    <p>
                      <span className="font-medium">Industry:</span> {industry}
                    </p>
                  )}
                  {city && state && (
                    <p>
                      <span className="font-medium">Location:</span> {city},{" "}
                      {state}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Plan:</span> Free (14-day
                    trial of Pro features)
                  </p>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleComplete}
                  disabled={
                    createBusiness.isPending || upsertUser.isPending
                  }
                >
                  {createBusiness.isPending ? (
                    "Setting up..."
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Launch BizPilot
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
