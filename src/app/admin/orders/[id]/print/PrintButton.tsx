"use client";

type Props = {
  className?: string;
};

export function PrintButton({ className }: Props) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      Print
    </button>
  );
}
