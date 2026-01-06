"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => {
        const callbackUrl =
          typeof window !== "undefined" ? `${window.location.origin}/admin/login` : "/admin/login";
        signOut({ callbackUrl });
      }}
      className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900"
    >
      Sign out
    </button>
  );
}
