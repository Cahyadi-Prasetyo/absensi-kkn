"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const userJson = localStorage.getItem("kkn_user");
    if (!userJson) {
      router.replace("/login");
      return;
    }
    try {
      const user = JSON.parse(userJson);
      if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/absen");
      }
    } catch {
      localStorage.removeItem("kkn_user");
      router.replace("/login");
    }
  }, [router]);

  return null;
}
