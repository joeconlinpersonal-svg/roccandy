"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { syncAllPremadeToWoo } from "./actions";

type Props = {
  totalCount: number;
};

export function PremadeSyncControls({ totalCount }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const handleSyncAll = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await syncAllPremadeToWoo();
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        const text =
          result.total === 0
            ? "No items to sync."
            : `Synced ${result.synced} of ${result.total} items.`;
        setMessage({ type: "success", text });
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
      <button
        type="button"
        onClick={handleSyncAll}
        disabled={isPending || totalCount === 0}
        className={`rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${
          isPending || totalCount === 0
            ? "bg-zinc-100 text-zinc-400"
            : "bg-zinc-900 text-white hover:bg-zinc-800"
        }`}
      >
        {isPending ? "Syncing..." : "Sync all to Woo"}
      </button>
      <span className="text-[11px] text-zinc-400">Auto-syncs on save/activate.</span>
      {message ? (
        <span className={message.type === "error" ? "text-red-600" : "text-emerald-600"}>
          {message.text}
        </span>
      ) : null}
    </div>
  );
}
