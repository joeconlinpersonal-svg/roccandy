# Roc Candy Pricing Fact Sheet

Authoritative summary of current pricing, packaging, labels, and fees. All values should be editable via the admin UI (no code changes).

## Categories and Base Pricing
- Categories (5): `weddings-initials`, `weddings-both-names`, `custom-1-6`, `custom-7-14`, `branded`.
- Base price logic:
  - Weddings (initials): $295 for 1–3 kg; +$50 per kg for 4–6 kg; 7–8 kg = weddings (both names) price.
  - Weddings (both names): $465 flat (covers up to 8 kg cap).
  - Custom text (1–6 letters): $295 for 1–3 kg; +$50 per kg for 4–6 kg; 7–8 kg = custom text (7–14) price.
  - Custom text (7–14 letters): $465 flat.
  - Branded: $615 flat.

## Packaging Options
Each row defines: type | size | candy weight per package | allowed categories | unit price | max packages per order.

### Bags
- Clear Bag | 3–5pc | 10g | Custom Text, Branded | $0.37 | 800
- Clear Bag | 5–7pc | 15g | Custom Text, Branded | $0.55 | 500
- Clear Bag | 8–10pc | 23g | Weddings, Custom Text, Branded | $0.60 | 320
- Clear Bag | 12–15pc | 34g | Weddings, Custom Text, Branded | $0.60 | 230
- Clear Bag | 25–30pc | 66g | Weddings, Custom Text, Branded | $0.65 | 120
- Bulk | 1kg | 1000g | Weddings, Custom Text, Branded | $0.00 | 8
- Zip Bag | 8–10pc | 23g | Weddings, Custom Text, Branded | $0.70 | 320
- Zip Bag | 12–15pc | 34g | Weddings, Custom Text, Branded | $0.70 | 230
- Zip Bag | 25–30pc | 66g | Weddings, Custom Text, Branded | $0.70 | 120

### Jars
- Jar | Mini | 23g | Weddings, Custom Text, Branded | $1.70 | 350
- Jar | Small | 75g | Weddings, Custom Text, Branded | $1.70 | 110
- Jar | Medium | 125g | Weddings, Custom Text, Branded | $2.75 | 65

### Cones
- Cone | 12–15pc | 34g | Weddings | $0.70 | 230
- Cone | 25–30pc | 60g | Weddings | $0.70 | 120

## Label Pricing
- Pricing rule: `price = ((label_count * range_cost) + supplier_shipping_cost) * markup_percent`.
- Ranges (label_count upper bound | range cost):
  - 25 | $0.70
  - 50 | $0.44
  - 75 | $0.44
  - 100 | $0.44
  - 125 | $0.43
  - 150 | $0.41
  - 175 | $0.39
  - 200 | $0.36
  - 225 | $0.35
  - 250 | $0.35
  - 275 | $0.34
  - 300 | $0.34
  - 325 | $0.33
  - 350 | $0.33
  - 375 | $0.32
  - 400 | $0.32
  - 425 | $0.31
  - 450 | $0.31
  - 475 | $0.30
  - 500 | $0.30
  - 525 | $0.29
  - 550 | $0.29
  - 575 | $0.28
  - 600 | $0.28
  - 625 | $0.27
  - 650 | $0.27
  - 675 | $0.26
  - 700 | $0.26
  - 725 | $0.26
  - 750 | $0.25
  - 775 | $0.25
  - 800 | $0.25
- Additional fields needed in settings: `supplier_shipping_cost`, `markup_percent`.

## Extras and Fees
- Jackets: Rainbow $30, 2 Colour $30, Pinstripe $30.
- Urgency fee: $10 if due date is within lead time.
- Lead time: 14 days.
- Transaction fee: 2.2% applied at checkout.

## Operational Guards
- Max order weight: 8 kg total candy. Calculate from sum(package_count * candy_weight) silently; block or adjust before checkout without showing weight to the customer.

## Admin Editing Guidance (for handover)
- Provide an admin UI with tables for:
  - Base pricing/tiers per category.
  - Packaging options (type, size, candy weight, allowed categories, unit price, max packages).
  - Label ranges (upper bound, range cost) plus global `supplier_shipping_cost` and `markup_percent`.
  - Settings: lead time (days), urgency fee, transaction fee, jacket fees, max kg limit.
- Include: inline edit, validation, save with toasts, and “reset to last saved.” Optional CSV import/export for bulk changes.
