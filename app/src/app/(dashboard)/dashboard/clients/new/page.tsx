"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewClientRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/clients");
  }, [router]);
  return null;
}
