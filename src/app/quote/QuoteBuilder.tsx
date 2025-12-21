"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, Flavor, PackagingOption, SettingsRow } from "@/lib/data";
import { CandyPreview } from "./CandyPreview";

type Props = {
  categories: Category[];
  packagingOptions: PackagingOption[];
  settings: SettingsRow;
  flavors: Flavor[];
};

type Selection = { optionId: string; quantity: number };
type QuoteItem = { label: string; amount: number };
type QuoteResult = {
  basePrice: number;
  packagingPrice: number;
  labelsPrice: number;
  extrasPrice: number;
  urgencyFee: number;
  transactionFee: number;
  total: number;
  totalWeightKg: number;
  items: QuoteItem[];
};

const ORDER_TYPES = [
  { id: "weddings", label: "Weddings" },
  { id: "text", label: "Custom text" },
  { id: "branded", label: "Branded" },
];

const ORDER_SUBTYPES: Record<string, { id: string; label: string }[]> = {
  weddings: [
    { id: "weddings-initials", label: "Initials" },
    { id: "weddings-both-names", label: "Both names" },
  ],
  text: [
    { id: "custom-1-6", label: "1–6 letters" },
    { id: "custom-7-14", label: "7–14 letters" },
  ],
  branded: [{ id: "branded", label: "Branded" }],
};

export function QuoteBuilder({ categories, packagingOptions, settings, flavors }: Props) {
  const [orderType, setOrderType] = useState<string>(ORDER_TYPES[0]?.id ?? "");
  const initialSubtype = ORDER_SUBTYPES[orderType]?.[0]?.id ?? categories[0]?.id ?? "";
  const [categoryId, setCategoryId] = useState(initialSubtype);

  const [selectionType, setSelectionType] = useState<string>("");
  const [selectionSize, setSelectionSize] = useState<string>("");
  const [selectionQty, setSelectionQty] = useState(0);

  const [labelsOptIn, setLabelsOptIn] = useState(false);
  const [labelCountOverride, setLabelCountOverride] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [rainbowJacket, setRainbowJacket] = useState(false);
  const [pinstripeJacket, setPinstripeJacket] = useState(false);
  const [twoColourJacket, setTwoColourJacket] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [placeSuccess, setPlaceSuccess] = useState<string | null>(null);
  const [pickup, setPickup] = useState(false);
  const [stateValue, setStateValue] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [suburb, setSuburb] = useState("");
  const [postcode, setPostcode] = useState("");
  const [initialOne, setInitialOne] = useState("");
  const [initialTwo, setInitialTwo] = useState("");
  const [nameOne, setNameOne] = useState("");
  const [nameTwo, setNameTwo] = useState("");
  const [customText, setCustomText] = useState("");
  const [orgName, setOrgName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [lastName, setLastName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [flavor, setFlavor] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [jacketColorOne, setJacketColorOne] = useState("#000000");
  const [jacketColorTwo, setJacketColorTwo] = useState("#000000");
  const [logoUrl, setLogoUrl] = useState("");
  const [heartColor, setHeartColor] = useState("#b7b7b7");
  const [textColor, setTextColor] = useState("#b7b7b7");
  const toggleRainbow = () =>
    setRainbowJacket((prev) => {
      const next = !prev;
      if (next) {
        setPinstripeJacket(false);
        setTwoColourJacket(false);
      }
      return next;
    });
  const togglePinstripe = () =>
    setPinstripeJacket((prev) => {
      const next = !prev;
      if (next) setRainbowJacket(false);
      return next;
    });
  const toggleTwoColour = () =>
    setTwoColourJacket((prev) => {
      const next = !prev;
      if (next) setRainbowJacket(false);
      return next;
    });
  const rainbowDisabled = pinstripeJacket || twoColourJacket;
  const pinstripeDisabled = rainbowJacket;
  const twoColourDisabled = rainbowJacket;
  const previewJacketMode = rainbowJacket ? "rainbow" : twoColourJacket ? "two_colour" : pinstripeJacket ? "pinstripe" : "";
  const previewShowPinstripe = pinstripeJacket;
  const showColourTwo = twoColourJacket && !rainbowJacket;
  const formatMoney = (value: number) => `$${value.toFixed(2)}`;

  const totalPackages = useMemo(() => selectionQty, [selectionQty]);

  const filteredPackaging = useMemo(
    () => packagingOptions.filter((p) => p.allowed_categories.includes(categoryId)),
    [packagingOptions, categoryId]
  );

  const packagingTypes = useMemo(
    () => Array.from(new Set(filteredPackaging.map((p) => p.type))),
    [filteredPackaging]
  );

  // If the selected type is no longer valid for this category, reset it.
  useEffect(() => {
    if (selectionType && !packagingTypes.includes(selectionType)) {
      setSelectionType("");
      setSelectionSize("");
    }
  }, [packagingTypes, selectionType]);

  const sizesForType = useMemo(
    () => filteredPackaging.filter((p) => (selectionType ? p.type === selectionType : true)),
    [filteredPackaging, selectionType]
  );

  const selectedOptionId = useMemo(() => {
    const found = sizesForType.find((p) => p.size === selectionSize);
    return found?.id ?? "";
  }, [sizesForType, selectionSize]);

  const selectedOption = useMemo(
    () => packagingOptions.find((p) => p.id === selectedOptionId),
    [packagingOptions, selectedOptionId]
  );

  const hasBulkSelection = useMemo(() => {
    const opt = packagingOptions.find((p) => p.id === selectedOptionId);
    return !!opt && opt.type.toLowerCase() === "bulk" && selectionQty > 0;
  }, [packagingOptions, selectedOptionId, selectionQty]);

  const totalWeightKg = useMemo(() => {
    const lookup = new Map(packagingOptions.map((p) => [p.id, p]));
    const opt = selectedOptionId ? lookup.get(selectedOptionId) : null;
    const totalG = opt ? Number(opt.candy_weight_g) * selectionQty : 0;
    return totalG / 1000;
  }, [selectionQty, selectedOptionId, packagingOptions]);

  const isWedding = orderType === "weddings";
  const isWeddingInitials = isWedding && categoryId.includes("weddings-initials");
  const isText = orderType === "text";
  const isBranded = orderType === "branded";
  const isShortCustom = isText && categoryId === "custom-1-6";
  const maxCustomLength = isShortCustom ? 6 : 14;
  const designTitle = isWedding
    ? isWeddingInitials
      ? `${(initialOne || "").trim().toUpperCase()} ❤️ ${(initialTwo || "").trim().toUpperCase()}`
      : `${(nameOne || "").trim()} ❤️ ${(nameTwo || "").trim()}`
    : isBranded
      ? (orgName || "").trim()
      : (customText || "").trim();
  const designValid = Boolean(
    (isWedding && (isWeddingInitials ? initialOne && initialTwo : nameOne && nameTwo)) ||
      (isText && customText) ||
      (isBranded && orgName && logoUrl) ||
      (!isWedding && !isText && !isBranded) // fallback
  );
  const addressValid = pickup || Boolean(addressLine1 && suburb && postcode && stateValue);
  const contactValid = Boolean(customerName && lastName && customerEmail && phone);
  const flavorValid = Boolean(flavor);
  const paymentValid = Boolean(paymentMethod);
  const canPlace =
    !!result &&
    !!dueDate &&
    designValid &&
    flavorValid &&
    paymentValid &&
    contactValid &&
    addressValid;

  useEffect(() => {
    if (!hasBulkSelection) {
      setLabelCountOverride(0);
    }
  }, [hasBulkSelection]);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      if (!categoryId || !selectedOptionId || selectionQty <= 0) {
        setResult(null);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const body: {
          categoryId: string;
          packaging: Selection[];
          labelsCount?: number;
          dueDate?: string;
          extras?: { jacket: "rainbow" | "two_colour" | "pinstripe" }[];
        } = {
          categoryId,
          packaging: [{ optionId: selectedOptionId, quantity: selectionQty }],
        };

        if (labelsOptIn) {
          if (hasBulkSelection) {
            const capped =
              labelCountOverride > 0
                ? Math.min(labelCountOverride, settings.labels_max_bulk)
                : 0;
            body.labelsCount = capped;
          } else {
            body.labelsCount = totalPackages;
          }
        }
        if (dueDate) body.dueDate = dueDate;
        const jacketExtras: { jacket: "rainbow" | "two_colour" | "pinstripe" }[] = [];
        if (rainbowJacket) jacketExtras.push({ jacket: "rainbow" });
        if (twoColourJacket) jacketExtras.push({ jacket: "two_colour" });
        if (pinstripeJacket) jacketExtras.push({ jacket: "pinstripe" });
        if (jacketExtras.length) body.extras = jacketExtras;

        const res = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        const data = (await res.json()) as QuoteResult & { error?: string };
        if (!res.ok) {
          setError(data.error || "Unable to calculate");
          setResult(null);
        } else {
          setResult(data);
          setError(null);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Unable to calculate";
        setError(message);
        setResult(null);
      } finally {
        setLoading(false);
      }
    };
    const timeout = setTimeout(run, 200);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [
    categoryId,
    selectedOptionId,
    selectionQty,
    totalPackages,
    dueDate,
    rainbowJacket,
    pinstripeJacket,
    twoColourJacket,
    labelsOptIn,
    hasBulkSelection,
    labelCountOverride,
    settings.labels_max_bulk,
  ]);

  return (
    <div className="relative flex items-start justify-center gap-6 pr-[360px]">
      <div className="flex-1 min-w-0 max-w-3xl space-y-6">
        {/* Step 1: Order type */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Step 1</p>
          <h3 className="text-lg font-semibold text-zinc-900">Choose your order type</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {ORDER_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  const nextSubtype = ORDER_SUBTYPES[type.id]?.[0]?.id ?? "";
                  setOrderType(type.id);
                  setCategoryId(nextSubtype);
                }}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  orderType === type.id
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Subtype */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Step 2</p>
          <h3 className="text-lg font-semibold text-zinc-900">Choose subtype</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {ORDER_SUBTYPES[orderType]?.map((sub) => {
              const cat = categories.find((c) => c.id === sub.id);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(sub.id);
                  }}
                  className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                    categoryId === sub.id
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <span className="block">{cat?.name ?? sub.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Packaging (single selection) */}
        {categoryId && (
          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Step 3</p>
                <h3 className="text-lg font-semibold text-zinc-900">Select packaging</h3>
              </div>
              <p className="text-xs text-zinc-500">
                Filtered to {categories.find((c) => c.id === categoryId)?.name ?? "selected"}.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <label className="text-sm text-zinc-700">
                Packaging type
                <select
                  value={selectionType}
                  onChange={(e) => {
                    setSelectionType(e.target.value);
                    setSelectionSize("");
                  }}
                  className="mt-1 w-full rounded border border-zinc-200 px-3 py-2"
                >
                  <option value="">Select type</option>
                  {packagingTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-zinc-700">
                Packaging size
                <select
                  value={selectionSize}
                  onChange={(e) => setSelectionSize(e.target.value)}
                  className="mt-1 w-full rounded border border-zinc-200 px-3 py-2"
                  disabled={!selectionType}
                >
                  <option value="">Select size</option>
                  {sizesForType.map((opt) => (
                    <option key={opt.id} value={opt.size}>
                      {opt.size} ({opt.candy_weight_g}g, ${opt.unit_price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-zinc-700">
                Quantity{selectedOption ? ` (max ${selectedOption.max_packages})` : ""}
                <input
                  type="number"
                  min={0}
                  value={selectionQty}
                  onChange={(e) => setSelectionQty(Number(e.target.value))}
                  className="mt-1 w-full rounded border border-zinc-200 px-3 py-2"
                />
              </label>
            </div>

            {selectedOption && selectionQty > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
                <div className="flex justify-between">
                  <span>{selectedOption.type}</span>
                  <span>{selectedOption.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity</span>
                  <span>{selectionQty}</span>
                </div>
                <div className="flex justify-between">
                  <span>Weight</span>
                  <span>{(selectedOption.candy_weight_g * selectionQty).toFixed(0)} g</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${(selectedOption.unit_price * selectionQty).toFixed(2)}</span>
                </div>
              </div>
            )}
            <p className="text-xs text-zinc-600">
              Estimated total weight: {totalWeightKg.toFixed(2)} kg · Labels match total packages (
              {totalPackages})
            </p>
          </div>
        )}

        {/* Step 4: Extras */}
        {selectionQty > 0 && selectedOptionId && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Step 4</p>
            <h3 className="text-lg font-semibold text-zinc-900">Labels & extras</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              <div className="text-sm text-zinc-700 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={labelsOptIn}
                    onChange={(e) => setLabelsOptIn(e.target.checked)}
                    className="rounded border-zinc-300"
                  />
                  <span className="text-xs text-zinc-600">
                    Add labels ({hasBulkSelection ? "manual count for bulk" : "matches packages"})
                  </span>
                </div>
                {labelsOptIn && hasBulkSelection && (
                  <label className="block text-xs text-zinc-600">
                    Labels count (max {settings.labels_max_bulk})
                    <input
                      type="number"
                      min={0}
                      max={settings.labels_max_bulk}
                      value={labelCountOverride}
                      onChange={(e) => setLabelCountOverride(Number(e.target.value))}
                      className="mt-1 w-full rounded border border-zinc-200 px-2 py-1"
                    />
                  </label>
                )}
                {labelsOptIn && !hasBulkSelection && (
                  <p className="text-xs text-zinc-500">
                    Labels will match total packages automatically for non-bulk packaging.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Candy design & flavor */}
        {selectionQty > 0 && selectedOptionId && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Step 5</p>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">Candy design & flavor</h3>
                <p className="text-xs text-zinc-500">Preview updates live as you type.</p>
              </div>
              <CandyPreview
                designText={
                  isWeddingInitials
                    ? undefined
                    : isText && !isBranded
                      ? (customText || "").trim()
                      : !isWedding && !isText && !isBranded
                        ? designTitle || "Candy"
                        : undefined
                }
                lineOne={
                  isWedding
                    ? isWeddingInitials
                      ? (initialOne || "").trim().toUpperCase()
                      : (nameOne || "").trim()
                    : undefined
                }
                lineTwo={
                  isWedding
                    ? isWeddingInitials
                      ? (initialTwo || "").trim().toUpperCase()
                      : (nameTwo || "").trim()
                    : undefined
                }
                mode={previewJacketMode}
                showPinstripe={previewShowPinstripe}
                colorOne={jacketColorOne}
                colorTwo={jacketColorTwo}
                showHeart={isWedding}
                logoUrl={isBranded ? logoUrl : undefined}
                heartColor={heartColor}
                textColor={textColor}
                isInitials={isWeddingInitials}
              />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {isWedding && (
                <>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    First {isWeddingInitials ? "initial" : "name"}
                    <input
                      type="text"
                      value={isWeddingInitials ? initialOne : nameOne}
                      maxLength={isWeddingInitials ? 1 : 8}
                      onChange={(e) =>
                        isWeddingInitials
                          ? setInitialOne((e.target.value || "").slice(0, 1))
                          : setNameOne((e.target.value || "").slice(0, 8))
                      }
                      required
                      className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
                      placeholder={isWeddingInitials ? "A" : "Alex"}
                    />
                    {!isWeddingInitials && (
                      <div className="mt-1 text-right text-[11px] text-zinc-500">{`${(nameOne || "").length}/8`}</div>
                    )}
                  </label>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Second {isWeddingInitials ? "initial" : "name"}
                    <input
                      type="text"
                      value={isWeddingInitials ? initialTwo : nameTwo}
                      maxLength={isWeddingInitials ? 1 : 8}
                      onChange={(e) =>
                        isWeddingInitials
                          ? setInitialTwo((e.target.value || "").slice(0, 1))
                          : setNameTwo((e.target.value || "").slice(0, 8))
                      }
                      required
                      className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
                      placeholder={isWeddingInitials ? "B" : "Sam"}
                    />
                    {!isWeddingInitials && (
                      <div className="mt-1 text-right text-[11px] text-zinc-500">{`${(nameTwo || "").length}/8`}</div>
                    )}
                  </label>
                </>
              )}
              {isWedding && (
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                  Heart colour
                  <input
                    type="color"
                    value={heartColor}
                    onChange={(e) => setHeartColor(e.target.value)}
                    className="h-8 w-12 cursor-pointer rounded border border-zinc-200 bg-white p-0"
                  />
                </label>
              )}
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                Text colour
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-8 w-12 cursor-pointer rounded border border-zinc-200 bg-white p-0"
                />
              </label>
              {(isText || isBranded) && (
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 md:col-span-2">
                  {isBranded ? "Organisation name" : "Custom text"}
                  <input
                    type="text"
                    value={isBranded ? orgName : customText}
                    maxLength={isBranded ? undefined : maxCustomLength}
                    onChange={(e) =>
                      isBranded
                        ? setOrgName(e.target.value)
                        : setCustomText((e.target.value || "").slice(0, maxCustomLength))
                    }
                    required
                    className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
                    placeholder={isBranded ? "Acme Corp" : "Your text"}
                  />
                </label>
              )}
              <div className="md:col-span-2">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Jacket type & colors</p>
                <div className="mt-2 flex flex-col gap-2 text-sm">
                  <label
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 ${
                      rainbowDisabled && !rainbowJacket
                        ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
                        : "bg-white text-zinc-700 border-zinc-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={rainbowJacket}
                      onChange={toggleRainbow}
                      disabled={rainbowDisabled && !rainbowJacket}
                    />
                    <span>
                      Rainbow Jacket <span className="text-zinc-500">+{formatMoney(settings.jacket_rainbow)}</span>
                    </span>
                  </label>
                  <label
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 ${
                      pinstripeDisabled && !pinstripeJacket
                        ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
                        : "bg-white text-zinc-700 border-zinc-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={pinstripeJacket}
                      onChange={togglePinstripe}
                      disabled={pinstripeDisabled && !pinstripeJacket}
                    />
                    <span>
                      Pin Stripe Jacket <span className="text-zinc-500">+{formatMoney(settings.jacket_pinstripe)}</span>
                    </span>
                  </label>
                  <label
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 ${
                      twoColourDisabled && !twoColourJacket
                        ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
                        : "bg-white text-zinc-700 border-zinc-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={twoColourJacket}
                      onChange={toggleTwoColour}
                      disabled={twoColourDisabled && !twoColourJacket}
                    />
                    <span>
                      2 Colour Jacket <span className="text-zinc-500">+{formatMoney(settings.jacket_two_colour)}</span>
                    </span>
                  </label>
                  {!rainbowJacket && (
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
                      <div className="flex items-center gap-2">
                        <span>Colour 1</span>
                        <input type="color" value={jacketColorOne} onChange={(e) => setJacketColorOne(e.target.value)} />
                      </div>
                      {showColourTwo && (
                        <div className="flex items-center gap-2">
                          <span>Colour 2</span>
                          <input type="color" value={jacketColorTwo} onChange={(e) => setJacketColorTwo(e.target.value)} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Candy flavor*
                <select
                  value={flavor}
                  onChange={(e) => setFlavor(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
                >
                  <option value="">Select flavor</option>
                  {flavors.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </label>
              {isBranded && (
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Logo file URL
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    required
                    className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
                    placeholder="Link to logo file"
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {/* Step 6: Date & delivery */}
        {selectionQty > 0 && selectedOptionId && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Step 6</p>
            <h3 className="text-lg font-semibold text-zinc-900">Date & delivery</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Date required
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
                />
              </label>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Pickup or delivery</p>
                <div className="flex gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => setPickup(false)}
                    className={`flex-1 rounded border px-2 py-1 font-semibold ${
                      pickup ? "border-zinc-200 bg-white text-zinc-700" : "border-zinc-900 bg-zinc-900 text-white"
                    }`}
                  >
                    Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickup(true)}
                    className={`flex-1 rounded border px-2 py-1 font-semibold ${
                      pickup ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-700"
                    }`}
                  >
                    Pickup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Payment method */}
        {selectionQty > 0 && selectedOptionId && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Step 7</p>
            <h3 className="text-lg font-semibold text-zinc-900">Payment method</h3>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {["paypal", "apple_pay", "credit_card"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded border px-3 py-2 font-semibold ${
                    paymentMethod === method
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  {method === "paypal" ? "PayPal" : method === "apple_pay" ? "Apple Pay" : "Credit card"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 8: Contact & submission */}
        {selectionQty > 0 && selectedOptionId && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Step 8</p>
            <h3 className="text-lg font-semibold text-zinc-900">Your details</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                First name*
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
                  placeholder="First name"
                />
              </label>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Surname*
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
                  placeholder="Surname"
                />
              </label>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Email address*
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
                  placeholder="you@example.com"
                />
              </label>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Phone number*
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
                  placeholder="Mobile or phone"
                />
              </label>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 md:col-span-2">
                Organisation name
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
                  placeholder="Optional"
                />
              </label>
              {!pickup && (
                <>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 md:col-span-2">
                    Address line 1*
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      required={!pickup}
                      className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
                      placeholder="Street address"
                    />
                  </label>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 md:col-span-2">
                    Address line 2
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </label>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Suburb or town*
                    <input
                      type="text"
                      value={suburb}
                      onChange={(e) => setSuburb(e.target.value)}
                      required={!pickup}
                      className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
                      placeholder="Suburb or town"
                    />
                  </label>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Postcode*
                    <input
                      type="text"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      required={!pickup}
                      className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
                      placeholder="Postcode"
                    />
                  </label>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    State*
                    <input
                      type="text"
                      value={stateValue}
                      onChange={(e) => setStateValue(e.target.value)}
                      required={!pickup}
                      className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
                      placeholder="e.g., Western Australia"
                    />
                  </label>
                </>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-zinc-500">
                Order weight will be saved as {(totalWeightKg * 1000).toFixed(0)} g.
              </div>
              <button
                type="button"
                disabled={placing || !canPlace}
                onClick={async () => {
                  setPlaceError(null);
                  setPlaceSuccess(null);
                  setPlacing(true);
                  try {
                    const title = designTitle;
                    const description = selectedOption ? `${selectedOption.type} - ${selectedOption.size}` : "";
                    const labelsCount = labelsOptIn
                      ? hasBulkSelection
                        ? labelCountOverride > 0
                          ? Math.min(labelCountOverride, settings.labels_max_bulk)
                          : 0
                        : totalPackages
                      : null;
                    const res = await fetch("/api/orders", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title,
                        description,
                        dateRequired: dueDate,
                        pickup,
                        state: stateValue || null,
                        location: addressLine1 || null,
                        customerName,
                        customerEmail,
                        firstName: customerName,
                        lastName,
                        phone,
                        organizationName: orgName || null,
                        addressLine1: addressLine1 || null,
                        addressLine2: addressLine2 || null,
                        suburb: suburb || null,
                        postcode: postcode || null,
                        categoryId,
                        packagingOptionId: selectedOptionId,
                        quantity: selectionQty,
                        labelsCount,
                        jacket: rainbowJacket ? "rainbow" : twoColourJacket ? "two_colour" : pinstripeJacket ? "pinstripe" : null,
                        designType: categoryId || orderType,
                        designText: title,
                        jacketType: previewJacketMode,
                        jacketColorOne,
                        jacketColorTwo,
                        jacketExtras: [
                          ...(rainbowJacket ? [{ jacket: "rainbow" as const }] : []),
                          ...(twoColourJacket ? [{ jacket: "two_colour" as const }] : []),
                          ...(pinstripeJacket ? [{ jacket: "pinstripe" as const }] : []),
                        ],
                        flavor,
                        paymentMethod,
                        logoUrl: logoUrl || null,
                        totalWeightKg,
                        totalPrice: result?.total ?? null,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      throw new Error(data.error || "Unable to place order");
                    }
                    setPlaceSuccess("Order placed and sent to production schedule.");
                  } catch (err) {
                    const message = err instanceof Error ? err.message : "Unable to place order";
                    setPlaceError(message);
                  } finally {
                    setPlacing(false);
                  }
                }}
                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm ${
                  placing ||
                  !result ||
                  !dueDate ||
                  !flavor ||
                  !paymentMethod ||
                  !customerName ||
                  !lastName ||
                  !customerEmail ||
                  !phone ||
                  (orderType === "weddings" &&
                    (selectionType.includes("initials") ? (!initialOne || !initialTwo) : (!nameOne || !nameTwo))) ||
                  (orderType === "text" && !customText) ||
                  (orderType === "branded" && (!orgName || !logoUrl)) ||
                  (!pickup && (!addressLine1 || !suburb || !postcode || !stateValue))
                    ? "cursor-not-allowed border border-zinc-200 bg-zinc-100 text-zinc-500"
                    : "border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800"
                }`}
              >
                {placing ? "Placing..." : "Place order"}
              </button>
            </div>
            {placeError && <p className="mt-2 text-xs text-red-600">{placeError}</p>}
            {placeSuccess && <p className="mt-2 text-xs text-emerald-600">{placeSuccess}</p>}
          </div>
        )}
      </div>

      {/* Price sidebar */}
      <div className="fixed right-6 top-24 w-80 shrink-0">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-lg">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Price</p>
          {result ? (
            <div className="mt-2 space-y-2">
              {(() => {
                const subtotal = Math.max(0, result.total - result.transactionFee);
                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-semibold">${subtotal.toFixed(2)}</p>
                      <p className="text-xs text-zinc-500">Excludes transaction fee</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBreakdown((prev) => !prev)}
                      className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold text-zinc-700 hover:border-zinc-400"
                    >
                      {showBreakdown ? "Hide breakdown" : "Show breakdown"}
                    </button>
                  </div>
                );
              })()}
              {showBreakdown && (
                <div className="space-y-1 text-sm text-zinc-700">
                  {result.items.map((item: QuoteItem) => (
                    <div key={item.label} className="flex justify-between border-b border-zinc-100 pb-1">
                      <span>{item.label}</span>
                      <span>${item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="mt-1 border-t border-zinc-200 pt-1 text-zinc-700">
                    <div className="flex justify-between text-xs">
                      <span>Total with fee</span>
                      <span>${result.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="text-xs text-zinc-500">
                <p>Total weight: {result.totalWeightKg.toFixed(2)} kg</p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">
              {loading ? "Calculating..." : "Select packaging to see price"}
            </p>
          )}
          {loading && <p className="mt-2 text-xs text-zinc-500">Updating…</p>}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
