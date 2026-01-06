import { getFlavors } from "@/lib/data";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { deleteFlavor, removeFlavorIcon } from "./actions";
import { AddFlavorForm } from "./AddFlavorForm";
import { ReplaceFlavorIcon } from "./ReplaceFlavorIcon";
import { FlavorIconPreview } from "./FlavorIconPreview";

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const FLAVOR_IMAGE_BUCKET = "flavor-images";

function normalizeFlavorFileName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildFlavorImageUrl(name: string, cacheBust?: number) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !name) return "";
  const fileName = `${normalizeFlavorFileName(name)}.png`;
  const encoded = encodeURIComponent(fileName);
  const suffix = cacheBust ? `?v=${cacheBust}` : "";
  return `${base}/storage/v1/object/public/${FLAVOR_IMAGE_BUCKET}/${encoded}${suffix}`;
}

export default async function FlavorsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const flavors = await getFlavors();
  const cacheBust = Date.now();

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Admin / Flavors</p>
        <h2 className="text-3xl font-semibold">Candy flavors</h2>
        <p className="text-sm text-zinc-600">Manage the list of flavors customers can choose.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900">Current flavors</h3>
          <div className="mt-3 divide-y divide-zinc-100">
            {flavors.length === 0 && <p className="text-sm text-zinc-500">No flavors yet.</p>}
            {flavors.map((flavor) => {
              const imageUrl = buildFlavorImageUrl(flavor.name, cacheBust);
              return (
                <div key={flavor.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <FlavorIconPreview
                    src={imageUrl}
                    alt={`${flavor.name} icon`}
                    className="h-9 w-9 rounded border border-zinc-200 bg-white object-contain"
                    fallbackClassName="h-9 w-9 rounded border border-zinc-200 bg-zinc-50"
                  />
                  <span className="text-sm font-semibold text-zinc-900">{flavor.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <ReplaceFlavorIcon flavorName={flavor.name} />
                  <form action={removeFlavorIcon}>
                    <input type="hidden" name="name" value={flavor.name} />
                    <button
                      type="submit"
                      data-neutral-button
                      className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold text-zinc-600 hover:text-zinc-800"
                    >
                      Remove icon
                    </button>
                  </form>
                  <form action={deleteFlavor}>
                    <input type="hidden" name="id" value={flavor.id} />
                    <button
                      type="submit"
                      data-neutral-button
                      className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900">Add flavor</h3>
          <AddFlavorForm />
        </div>
      </div>
    </section>
  );
}
