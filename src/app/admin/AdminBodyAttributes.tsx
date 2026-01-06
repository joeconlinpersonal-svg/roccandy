"use client";

import { useEffect } from "react";

export function AdminBodyAttributes() {
  useEffect(() => {
    document.body.dataset.admin = "true";
    return () => {
      delete document.body.dataset.admin;
    };
  }, []);

  return null;
}
