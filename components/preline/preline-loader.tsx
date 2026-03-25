"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Khởi tạo JS của Preline UI (dropdown, overlay, v.v.) sau khi điều hướng.
 * @see https://preline.co/docs/frameworks-nextjs.html
 */
export function PrelineLoader() {
  const pathname = usePathname();

  useEffect(() => {
    void import("preline").then(({ HSStaticMethods }) => {
      HSStaticMethods.autoInit();
    });
  }, [pathname]);

  return null;
}
