export type PaletteItem = {
  name: string;
  label: string;
  defaultValue: string;
  categoryKey: string;
  shadeKey: string;
};

export type PaletteSection = {
  title: string;
  categoryKey: string;
  items: PaletteItem[];
};

export const paletteSections: PaletteSection[] = [
  {
    title: "Burgundys",
    categoryKey: "burgundy",
    items: [
      {
        name: "palette_burgundy_dark",
        label: "Dark burgundy",
        defaultValue: "#660000",
        categoryKey: "burgundy",
        shadeKey: "dark",
      },
      {
        name: "palette_burgundy_main",
        label: "Burgundy",
        defaultValue: "#990000",
        categoryKey: "burgundy",
        shadeKey: "main",
      },
      {
        name: "palette_burgundy_light",
        label: "Light burgundy",
        defaultValue: "#965969",
        categoryKey: "burgundy",
        shadeKey: "light",
      },
    ],
  },
  {
    title: "Corals",
    categoryKey: "coral",
    items: [
      {
        name: "palette_coral_dark",
        label: "Dark coral",
        defaultValue: "#f85012",
        categoryKey: "coral",
        shadeKey: "dark",
      },
      {
        name: "palette_coral_main",
        label: "Coral",
        defaultValue: "#ff7f50",
        categoryKey: "coral",
        shadeKey: "main",
      },
      {
        name: "palette_coral_light",
        label: "Light coral",
        defaultValue: "#f8a688",
        categoryKey: "coral",
        shadeKey: "light",
      },
    ],
  },
  {
    title: "Oranges",
    categoryKey: "orange",
    items: [
      {
        name: "palette_orange_dark",
        label: "Dark orange",
        defaultValue: "#ff4500",
        categoryKey: "orange",
        shadeKey: "dark",
      },
      {
        name: "palette_orange_main",
        label: "Orange",
        defaultValue: "#ff8c00",
        categoryKey: "orange",
        shadeKey: "main",
      },
      {
        name: "palette_orange_light",
        label: "Light orange",
        defaultValue: "#ffba66",
        categoryKey: "orange",
        shadeKey: "light",
      },
    ],
  },
  {
    title: "Yellows",
    categoryKey: "yellow",
    items: [
      {
        name: "palette_yellow_dark",
        label: "Dark yellow",
        defaultValue: "#f4e508",
        categoryKey: "yellow",
        shadeKey: "dark",
      },
      {
        name: "palette_yellow_main",
        label: "Yellow",
        defaultValue: "#faee46",
        categoryKey: "yellow",
        shadeKey: "main",
      },
      {
        name: "palette_yellow_light",
        label: "Light yellow",
        defaultValue: "#fbf6b3",
        categoryKey: "yellow",
        shadeKey: "light",
      },
    ],
  },
  {
    title: "Greens",
    categoryKey: "green",
    items: [
      {
        name: "palette_green_dark",
        label: "Dark green",
        defaultValue: "#005c00",
        categoryKey: "green",
        shadeKey: "dark",
      },
      {
        name: "palette_green_main",
        label: "Green",
        defaultValue: "#008000",
        categoryKey: "green",
        shadeKey: "main",
      },
      {
        name: "palette_green_light",
        label: "Light green",
        defaultValue: "#84c284",
        categoryKey: "green",
        shadeKey: "light",
      },
    ],
  },
  {
    title: "Blues",
    categoryKey: "blue",
    items: [
      {
        name: "palette_blue_dark",
        label: "Dark blue",
        defaultValue: "#0912eb",
        categoryKey: "blue",
        shadeKey: "dark",
      },
      {
        name: "palette_blue_main",
        label: "Blue",
        defaultValue: "#266ded",
        categoryKey: "blue",
        shadeKey: "main",
      },
      {
        name: "palette_blue_light",
        label: "Light blue",
        defaultValue: "#73f9fc",
        categoryKey: "blue",
        shadeKey: "light",
      },
    ],
  },
  {
    title: "Purples",
    categoryKey: "purple",
    items: [
      {
        name: "palette_purple_dark",
        label: "Dark purple",
        defaultValue: "#8429d8",
        categoryKey: "purple",
        shadeKey: "dark",
      },
      {
        name: "palette_purple_main",
        label: "Purple",
        defaultValue: "#b87fed",
        categoryKey: "purple",
        shadeKey: "main",
      },
      {
        name: "palette_purple_light",
        label: "Light purple",
        defaultValue: "#dfc5f6",
        categoryKey: "purple",
        shadeKey: "light",
      },
    ],
  },
  {
    title: "Pinks",
    categoryKey: "pink",
    items: [
      {
        name: "palette_pink_dark",
        label: "Dark pink",
        defaultValue: "#ff1493",
        categoryKey: "pink",
        shadeKey: "dark",
      },
      {
        name: "palette_pink_main",
        label: "Pink",
        defaultValue: "#ff55b1",
        categoryKey: "pink",
        shadeKey: "main",
      },
      {
        name: "palette_pink_light",
        label: "Light pink",
        defaultValue: "#ff8ecb",
        categoryKey: "pink",
        shadeKey: "light",
      },
    ],
  },
  {
    title: "Browns",
    categoryKey: "brown",
    items: [
      {
        name: "palette_brown_dark",
        label: "Dark brown",
        defaultValue: "#615439",
        categoryKey: "brown",
        shadeKey: "dark",
      },
      {
        name: "palette_brown_main",
        label: "Brown",
        defaultValue: "#8d7b58",
        categoryKey: "brown",
        shadeKey: "main",
      },
      {
        name: "palette_brown_light",
        label: "Light brown",
        defaultValue: "#d4bf95",
        categoryKey: "brown",
        shadeKey: "light",
      },
    ],
  },
  {
    title: "Greys",
    categoryKey: "grey",
    items: [
      {
        name: "palette_grey_dark",
        label: "Dark grey",
        defaultValue: "#4b4b4b",
        categoryKey: "grey",
        shadeKey: "dark",
      },
      {
        name: "palette_grey_main",
        label: "Grey",
        defaultValue: "#696969",
        categoryKey: "grey",
        shadeKey: "main",
      },
      {
        name: "palette_grey_light",
        label: "Light grey",
        defaultValue: "#b7b7b7",
        categoryKey: "grey",
        shadeKey: "light",
      },
    ],
  },
  {
    title: "Neutrals",
    categoryKey: "neutral",
    items: [
      {
        name: "palette_neutral_1",
        label: "White",
        defaultValue: "#fffffe",
        categoryKey: "neutral",
        shadeKey: "white",
      },
      {
        name: "palette_neutral_2",
        label: "Red",
        defaultValue: "#ff1414",
        categoryKey: "neutral",
        shadeKey: "red",
      },
      {
        name: "palette_neutral_3",
        label: "Black",
        defaultValue: "#000001",
        categoryKey: "neutral",
        shadeKey: "black",
      },
    ],
  },
];

export const paletteDefaults = Object.fromEntries(
  paletteSections.flatMap((section) =>
    section.items.map((item) => [item.name, item.defaultValue]),
  ),
) as Record<string, string>;

export const paletteFieldNames = paletteSections.flatMap((section) =>
  section.items.map((item) => item.name),
);
