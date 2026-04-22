"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewInvoiceRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/invoices");
  }, [router]);
  return null;
}
