"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  clearTemporaryFailedList,
  hasTemporaryFailedList,
} from "@/features/lists/temp-list-storage";
import {
  clearTemporaryStudy,
  clearTemporaryStudyResults,
  hasTemporaryStudy,
  hasTemporaryStudyResults,
  isTemporaryStudySourceQueryValue,
} from "@/lib/study/temp-study-storage";

function isActiveTemporaryFailedListFlow(pathname: string, source: string | null) {
  if (pathname === "/lists/temp/failed") {
    return true;
  }

  if (pathname === "/study/setup" || pathname === "/study/session" || pathname === "/study/results") {
    return isTemporaryStudySourceQueryValue(source);
  }

  return false;
}

export function TemporaryFailedListCleanup() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const source = searchParams.get("source");

  useEffect(() => {
    if (isActiveTemporaryFailedListFlow(pathname, source)) {
      return;
    }

    const hasTempData =
      hasTemporaryFailedList() || hasTemporaryStudy() || hasTemporaryStudyResults();

    if (!hasTempData) {
      return;
    }

    clearTemporaryFailedList();
    clearTemporaryStudy();
    clearTemporaryStudyResults();
  }, [pathname, source]);

  return null;
}
