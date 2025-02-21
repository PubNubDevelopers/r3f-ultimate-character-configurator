import { create } from "zustand";
import { MeshStandardMaterial } from "three";
import { randInt } from "three/src/math/MathUtils.js";
import { Chat } from "@pubnub/chat";

// Load PubNub Keys from Environment Variables
const PUBLISH_KEY = import.meta.env.VITE_PUBNUB_PUBLISH_KEY;
const SUBSCRIBE_KEY = import.meta.env.VITE_PUBNUB_SUBSCRIBE_KEY;

// Extract UUID from URL
const urlParams = new URLSearchParams(window.location.search);
const userUUID = urlParams.get("uuid") || crypto.randomUUID();

export const PHOTO_POSES = {
  Idle: "Idle",
  Chill: "Chill",
  Cool: "Cool",
  Punch: "Punch",
  Ninja: "Ninja",
  King: "King",
  Busy: "Busy",
};

export const UI_MODES = {
  PHOTO: "photo",
  CUSTOMIZE: "customize",
};

export const useConfiguratorStore = create((set, get) => ({
  loading: true,
  chat: null, // Store PubNub Chat instance
  mode: UI_MODES.CUSTOMIZE,
  setMode: (mode) => {
    set({ mode });
    if (mode === UI_MODES.CUSTOMIZE) {
      set({ pose: PHOTO_POSES.Idle });
    }
  },
  pose: PHOTO_POSES.Idle,
  setPose: (pose) => set({ pose }),
  categories: [],
  currentCategory: null,
  assets: [],
  lockedGroups: {},
  skin: new MeshStandardMaterial({ color: 0xf5c6a5, roughness: 1 }),
  customization: {},
  download: () => {},
  setDownload: (download) => set({ download }),
  screenshot: () => {},
  setScreenshot: (screenshot) => set({ screenshot }),

  // Initialize PubNub Chat SDK
  initializeChat: async () => {
    try {
      const chat = await Chat.init({
        publishKey: PUBLISH_KEY,
        subscribeKey: SUBSCRIBE_KEY,
        userId: userUUID, // Set UUID from URL
      });

      set({ chat });
      console.log("✅ PubNub Chat Initialized:", chat);

      // Ensure user exists in PubNub Chat
      const existingUser = await chat.getUser(userUUID).catch(() => null);
      if (!existingUser) {
        await chat.createUser(userUUID, { name: `Avatar-Player-${userUUID}` });
        console.log("🎉 New user created in PubNub Chat:", userUUID);
      }
    } catch (error) {
      console.error("❌ Failed to initialize PubNub Chat:", error);
    }
  },

  updateColor: (color, categoryName = null) => {
    set((state) => {
      const targetCategory = categoryName || state.currentCategory?.name;

      if (!targetCategory) {
        console.warn("No category available to apply color!");
        return {};
      }

      return {
        customization: {
          ...state.customization,
          [targetCategory]: {
            ...state.customization[targetCategory],
            color,
          },
        },
      };
    });

    // Only update `Head` skin material
    if ((categoryName || get().currentCategory?.name) === "Head") {
      get().updateSkin(color);
    }
  },
  applyInitialColors: (colorMap) => {
    console.log("Applying colors:", colorMap);

    Object.entries(colorMap).forEach(([categoryName, color]) => {
      console.log(`Applying color ${color} to category ${categoryName}`);
      get().updateColor(color, categoryName);
    });
  },
  updateSkin: (color) => {
    get().skin.color.set(color);
  },
  generateAvatarURL: () => {
    const { customization } = get();

    const params = new URLSearchParams();

    Object.entries(customization).forEach(([category, data]) => {
      if (data.asset) {
        params.append(category, data.asset.id); // Store the asset ID
      }
      if (data.color) {
        params.append(`${category}Color`, data.color); // Store color
      }
    });

    const baseURL = window.location.origin + "/?avatar=true"; // Adjust this to your routing
    return `${baseURL}?${params.toString()}`;
  },
  fetchCategories: async () => {
    const assetsPath = "/assets"; // Adjust if the path differs
    try {
      // Simulated fetching from Assets folder
      const categories = [
        {
          id: "1",
          name: "Head",
          assets: [
            { id: "1", name: "Head001", file: `${assetsPath}/Head.001.glb`, thumbnail: "head001.png" },
            { id: "2", name: "Head002", file: `${assetsPath}/Head.002.glb`, thumbnail: "head002.png" },
            { id: "3", name: "Head003", file: `${assetsPath}/Head.003.glb`, thumbnail: "head003.png" },
            { id: "4", name: "Head004", file: `${assetsPath}/Head.004.glb`, thumbnail: "head004.png" },
          ],
          expand: {
            colorPalette: {
              colors: ["#f5c6a5", "#e3ac86", "#c68642", "#8d5524", "#ffdbac"],
            },
          },
          removable: true,
        },
        {
          id: "2",
          name: "Hair",
          assets: [
            { id: "01", name: "Hair001", file: `${assetsPath}/Hair.001.glb`, thumbnail: "Hair001.png" },
            { id: "02", name: "Hair002", file: `${assetsPath}/Hair.002.glb`, thumbnail: "Hair002.png" },
            { id: "03", name: "Hair003", file: `${assetsPath}/Hair.003.glb`, thumbnail: "Hair003.png" },
            { id: "04", name: "Hair004", file: `${assetsPath}/Hair.004.glb`, thumbnail: "Hair004.png" },
            { id: "05", name: "Hair005", file: `${assetsPath}/Hair.005.glb`, thumbnail: "Hair005.png" },
            { id: "06", name: "Hair006", file: `${assetsPath}/Hair.006.glb`, thumbnail: "Hair006.png" },
            { id: "07", name: "Hair007", file: `${assetsPath}/Hair.007.glb`, thumbnail: "Hair007.png" },
            { id: "08", name: "Hair008", file: `${assetsPath}/Hair.008.glb`, thumbnail: "Hair008.png" },
            { id: "09", name: "Hair009", file: `${assetsPath}/Hair.009.glb`, thumbnail: "Hair009.png" },
            { id: "10", name: "Hair010", file: `${assetsPath}/Hair.010.glb`, thumbnail: "Hair010.png" },
            { id: "11", name: "Hair011", file: `${assetsPath}/Hair.011.glb`, thumbnail: "Hair011.png" }
          ],
          expand: {
            colorPalette: {
              colors: ["#000000", "#4A312C", "#A67B5B", "#E6BEA5", "#ffffff"],
            },
          },
          startingAsset: "1",
          removable: true,
        },
        {
          id: "3",
          name: "Face",
          assets: [
            { id: "001", name: "Face001", file: `${assetsPath}/Face.001.glb`, thumbnail: "Face001.png" },
            { id: "002", name: "Face002", file: `${assetsPath}/Face.002.glb`, thumbnail: "Face002.png" },
            { id: "003", name: "Face003", file: `${assetsPath}/Face.003.glb`, thumbnail: "Face003.png" },
            { id: "004", name: "Face004", file: `${assetsPath}/Face.004.glb`, thumbnail: "Face004.png" },
            { id: "005", name: "Face005", file: `${assetsPath}/Face.005.glb`, thumbnail: "Face005.png" },
            { id: "006", name: "Face006", file: `${assetsPath}/Face.006.glb`, thumbnail: "Face006.png" },
            { id: "007", name: "Face007", file: `${assetsPath}/Face.007.glb`, thumbnail: "Face007.png" },
          ],
          expand: {
            colorPalette: {
              colors: [],
            },
          },
          removable: true,
        },
        {
          id: "4",
          name: "Eyes",
          assets: [
            { id: "0001", name: "Eyes001", file: `${assetsPath}/Eyes.001.glb`, thumbnail: "Eyes001.png" },
            { id: "0002", name: "Eyes002", file: `${assetsPath}/Eyes.002.glb`, thumbnail: "Eyes002.png" },
            { id: "0003", name: "Eyes003", file: `${assetsPath}/Eyes.003.glb`, thumbnail: "Eyes003.png" },
            { id: "0004", name: "Eyes004", file: `${assetsPath}/Eyes.004.glb`, thumbnail: "Eyes004.png" },
            { id: "0005", name: "Eyes005", file: `${assetsPath}/Eyes.005.glb`, thumbnail: "Eyes005.png" },
            { id: "0006", name: "Eyes006", file: `${assetsPath}/Eyes.006.glb`, thumbnail: "Eyes006.png" },
            { id: "0007", name: "Eyes007", file: `${assetsPath}/Eyes.007.glb`, thumbnail: "Eyes007.png" },
            { id: "0008", name: "Eyes008", file: `${assetsPath}/Eyes.008.glb`, thumbnail: "Eyes008.png" },
            { id: "0009", name: "Eyes009", file: `${assetsPath}/Eyes.009.glb`, thumbnail: "Eyes009.png" },
            { id: "0010", name: "Eyes010", file: `${assetsPath}/Eyes.010.glb`, thumbnail: "Eyes010.png" },
            { id: "0011", name: "Eyes011", file: `${assetsPath}/Eyes.011.glb`, thumbnail: "Eyes011.png" },
          ],
          expand: {
            colorPalette: {
              colors: [],
            },
          },
          removable: true,
        },
        {
          id: "5",
          name: "Eyebrows",
          assets: [
            { id: "00001", name: "EyeBrow001", file: `${assetsPath}/EyeBrow.001.glb`, thumbnail: "EyeBrow001.png" },
            { id: "00002", name: "EyeBrow002", file: `${assetsPath}/EyeBrow.002.glb`, thumbnail: "EyeBrow002.png" },
            { id: "00003", name: "EyeBrow003", file: `${assetsPath}/EyeBrow.003.glb`, thumbnail: "EyeBrow003.png" },
            { id: "00004", name: "EyeBrow004", file: `${assetsPath}/EyeBrow.004.glb`, thumbnail: "EyeBrow004.png" },
            { id: "00005", name: "EyeBrow005", file: `${assetsPath}/EyeBrow.005.glb`, thumbnail: "EyeBrow005.png" },
            { id: "00006", name: "EyeBrow006", file: `${assetsPath}/EyeBrow.006.glb`, thumbnail: "EyeBrow006.png" },
            { id: "00007", name: "EyeBrow007", file: `${assetsPath}/EyeBrow.007.glb`, thumbnail: "EyeBrow007.png" },
            { id: "00008", name: "EyeBrow008", file: `${assetsPath}/EyeBrow.008.glb`, thumbnail: "EyeBrow008.png" },
            { id: "00009", name: "EyeBrow009", file: `${assetsPath}/EyeBrow.009.glb`, thumbnail: "EyeBrow009.png" },
            { id: "00010", name: "EyeBrow010", file: `${assetsPath}/EyeBrow.010.glb`, thumbnail: "EyeBrow010.png" },
          ],
          expand: {
            colorPalette: {
              colors: ["#000000", "#4A312C", "#A67B5B", "#E6BEA5"],
            },
          },
          removable: true,
        },
        {
          id: "6",
          name: "Nose",
          assets: [
            { id: "000001", name: "Nose001", file: `${assetsPath}/Nose.001.glb`, thumbnail: "Nose001.png" },
            { id: "000002", name: "Nose002", file: `${assetsPath}/Nose.002.glb`, thumbnail: "Nose002.png" },
            { id: "000003", name: "Nose003", file: `${assetsPath}/Nose.003.glb`, thumbnail: "Nose003.png" },
            { id: "000004", name: "Nose004", file: `${assetsPath}/Nose.004.glb`, thumbnail: "Nose004.png" },
          ],
          expand: {
            colorPalette: {
              colors: [],
            },
          },
          removable: true,
        },
        {
          id: "7",
          name: "Facial Hair",
          assets: [
            { id: "0000001", name: "FacialHair001", file: `${assetsPath}/FacialHair.001.glb`, thumbnail: "FacialHair001.png" },
            { id: "0000002", name: "FacialHair002", file: `${assetsPath}/FacialHair.002.glb`, thumbnail: "FacialHair002.png" },
            { id: "0000003", name: "FacialHair003", file: `${assetsPath}/FacialHair.003.glb`, thumbnail: "FacialHair003.png" },
            { id: "0000004", name: "FacialHair004", file: `${assetsPath}/FacialHair.004.glb`, thumbnail: "FacialHair004.png" },
            { id: "0000005", name: "FacialHair005", file: `${assetsPath}/FacialHair.005.glb`, thumbnail: "FacialHair005.png" },
            { id: "0000006", name: "FacialHair006", file: `${assetsPath}/FacialHair.006.glb`, thumbnail: "FacialHair006.png" },
            { id: "0000007", name: "FacialHair007", file: `${assetsPath}/FacialHair.007.glb`, thumbnail: "FacialHair007.png" },
          ],
          expand: {
            colorPalette: {
              colors: ["#000000", "#4A312C", "#A67B5B", "#E6BEA5", "#C0C0C0"],
            },
          },
          removable: true,
        },
        {
          id: "8",
          name: "Glasses",
          assets: [
            { id: "00000001", name: "Glasses001", file: `${assetsPath}/Glasses.001.glb`, thumbnail: "Glasses001.png" },
            { id: "00000002", name: "Glasses002", file: `${assetsPath}/Glasses.002.glb`, thumbnail: "Glasses002.png" },
            { id: "00000003", name: "Glasses003", file: `${assetsPath}/Glasses.003.glb`, thumbnail: "Glasses003.png" },
            { id: "00000004", name: "Glasses004", file: `${assetsPath}/Glasses.004.glb`, thumbnail: "Glasses004.png" },
          ],
          expand: {
            colorPalette: {
              colors: ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"],
            },
          },
          removable: true,
        },
        {
          id: "9",
          name: "Hat",
          assets: [
            { id: "000000001", name: "Hat001", file: `${assetsPath}/Hat.001.glb`, thumbnail: "Hat001.png" },
            { id: "000000002", name: "Hat002", file: `${assetsPath}/Hat.002.glb`, thumbnail: "Hat002.png" },
            { id: "000000003", name: "Hat003", file: `${assetsPath}/Hat.003.glb`, thumbnail: "Hat003.png" },
            { id: "000000004", name: "Hat004", file: `${assetsPath}/Hat.004.glb`, thumbnail: "Hat004.png" },
            { id: "000000005", name: "Hat005", file: `${assetsPath}/Hat.005.glb`, thumbnail: "Hat005.png" },
            { id: "000000006", name: "Hat006", file: `${assetsPath}/Hat.006.glb`, thumbnail: "Hat006.png" },
            { id: "000000007", name: "Hat007", file: `${assetsPath}/Hat.007.glb`, thumbnail: "Hat007.png" },
          ],
          expand: {
            colorPalette: {
              colors: ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#f4a460", "#800080"],
            },
          },
          removable: true,
        },
        {
          id: "10",
          name: "Top",
          assets: [
            { id: "0000000001", name: "Top001", file: `${assetsPath}/Top.001.glb`, thumbnail: "Top001.png" },
            { id: "0000000002", name: "Top002", file: `${assetsPath}/Top.002.glb`, thumbnail: "Top002.png" },
            { id: "0000000003", name: "Top003", file: `${assetsPath}/Top.003.glb`, thumbnail: "Top003.png" },
          ],
          expand: {
            colorPalette: {
              colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff69b4", "#8a2be2"],
            },
          },
          removable: true,
        },
        {
          id: "11",
          name: "Bottom",
          assets: [
            { id: "00000000001", name: "Bottom001", file: `${assetsPath}/Bottom.001.glb`, thumbnail: "Bottom001.png" },
            { id: "00000000002", name: "Bottom002", file: `${assetsPath}/Bottom.002.glb`, thumbnail: "Bottom002.png" },
            { id: "00000000003", name: "Bottom003", file: `${assetsPath}/Bottom.003.glb`, thumbnail: "Bottom003.png" },
          ],
          expand: {
            colorPalette: {
              colors: ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#808080"],
            },
          },
          removable: true,
        },
        {
          id: "12",
          name: "Shoes",
          assets: [
            { id: "000000000001", name: "Shoes001", file: `${assetsPath}/Shoes.001.glb`, thumbnail: "Shoes001.png" },
            { id: "000000000002", name: "Shoes002", file: `${assetsPath}/Shoes.002.glb`, thumbnail: "Shoes002.png" },
            { id: "000000000003", name: "Shoes003", file: `${assetsPath}/Shoes.003.glb`, thumbnail: "Shoes003.png" },
          ],
          expand: {
            colorPalette: {
              colors: ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#8b4513", "#808080"],
            },
          },
          removable: true,
        },
      ];

      const customization = {};
      categories.forEach((category) => {
        customization[category.name] = {
          color: category.expand?.colorPalette?.colors?.[0] || "",
        };
        if (category.startingAsset) {
          customization[category.name].asset = category.assets.find(
            (asset) => asset.id === category.startingAsset
          );
        }
      });

      set({
        categories,
        currentCategory: categories[0],
        assets: categories.flatMap((category) => category.assets),
        customization,
        loading: false,
      });


      get().randomize(); // Call randomize() to generate an initial selection

      get().applyLockedAssets();
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  },
  setCurrentCategory: (category) => set({ currentCategory: category }),
  changeAsset: (category, asset) => {
    set((state) => ({
      customization: {
        ...state.customization,
        [category]: {
          ...state.customization[category],
          asset,
        },
      },
    }));
    get().applyLockedAssets();
  },
  randomize: () => {
    const customization = {};
    let hasHead = false;
    let hasBottom = false;
    let hasTop = false;
    let hasEyes = false;

    get().categories.forEach((category) => {
      let randomAsset = category.assets[randInt(0, category.assets.length - 1)];

      // Track essential categories
      if (category.name === "Head") hasHead = true;
      if (category.name === "Bottom") hasBottom = true;
      if (category.name === "Top") hasTop = true;
      if (category.name === "Eyes") hasEyes = true;

      if (category.removable) {
        const shouldRemove = randInt(0, 1) === 0; // 50% chance to remove
        if (shouldRemove && !["Bottom", "Top", "Head", "Eyes"].includes(category.name)) {
          randomAsset = null;
        }
      }

      // Ensure essential categories always have an asset
      if (!randomAsset && ["Bottom", "Top", "Head", "Eyes"].includes(category.name)) {
        randomAsset = category.assets[randInt(0, category.assets.length - 1)];
      }

      const randomColor =
        category.expand?.colorPalette?.colors?.[
          randInt(0, category.expand.colorPalette.colors.length - 1)
        ];

      customization[category.name] = {
        asset: randomAsset,
        color: randomColor,
      };

      if (category.name === "Head") {
        get().updateSkin(randomColor);
      }
    });

    // Fallback: Ensure that essential categories always have an asset
    const ensureCategory = (categoryName) => {
      if (!customization[categoryName]?.asset) {
        const category = get().categories.find((c) => c.name === categoryName);
        if (category) {
          customization[categoryName] = {
            asset: category.assets[randInt(0, category.assets.length - 1)],
            color: category.expand?.colorPalette?.colors[0] || "#ffffff",
          };
        }
      }
    };

    ensureCategory("Head");
    ensureCategory("Bottom");
    ensureCategory("Top");
    ensureCategory("Eyes");

    set({ customization });
    get().applyLockedAssets();
  },
  applyLockedAssets: () => {
    const customization = get().customization;
    const categories = get().categories;
    const lockedGroups = {};

    Object.values(customization).forEach((category) => {
      if (category.asset?.lockedGroups) {
        category.asset.lockedGroups.forEach((group) => {
          const categoryName = categories.find(
            (category) => category.id === group
          ).name;
          if (!lockedGroups[categoryName]) {
            lockedGroups[categoryName] = [];
          }
          const lockingAssetCategoryName = categories.find(
            (cat) => cat.id === category.asset.group
          ).name;
          lockedGroups[categoryName].push({
            name: category.asset.name,
            categoryName: lockingAssetCategoryName,
          });
        });
      }
    });

    set({ lockedGroups });
  },
}));


useConfiguratorStore.getState().initializeChat();
useConfiguratorStore.getState().fetchCategories();