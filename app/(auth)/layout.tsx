"use client";

import { BackgroundBeams } from "@/src/components/ui/background-beams";
import React from "react";
import {useAuthStore} from "../../src/store/Auth";
import {useRouter} from "next/navigation";
const layout = ({ children }: { children: React.ReactNode }) => {
      const {session} = useAuthStore();
  const router = useRouter()

  React.useEffect(() => {
    if (session) {
      router.push("/")
    }
  }, [session, router])

  if (session) {
    return null
  }
  return (
       <div className="relative flex min-h-screen flex-col items-center justify-center py-12">
      <BackgroundBeams />
      <div className="relative">{children}</div>
    </div>
  );
};

export default layout;