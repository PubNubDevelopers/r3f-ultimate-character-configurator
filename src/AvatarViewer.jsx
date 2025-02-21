import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { DEFAULT_CAMERA_POSITION } from "./components/CameraManager";
import { Experience } from "./components/Experience";
import { useConfiguratorStore } from "./store";
import { Leva } from "leva"; // Hide debug UI

function AvatarViewer() {
  const [searchParams] = useSearchParams();
  const { changeAsset, categories } = useConfiguratorStore();

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    const colorMap = {};

    Object.keys(params).forEach((categoryName) => {
      const value = params[categoryName];

      if (value.startsWith("#")) {
        // Extract and clean the category name
        const formattedCategory = categoryName.replace("Color", "").trim();
        colorMap[formattedCategory] = value;
      } else {
        // Handle asset selection
        const category = categories.find(
          (c) => c.name.toLowerCase().replace(/\s+/g, "") === categoryName.toLowerCase().replace(/\s+/g, "")
        );

        if (category) {
          const asset = category.assets.find((a) => a.id === value);
          if (asset) {
            changeAsset(category.name, asset);
          }
        }
      }
    });

    // Apply colors after assets are set
    useConfiguratorStore.getState().applyInitialColors(colorMap);
  }, [searchParams]);

  return (
    <>
      <Leva hidden /> {/* Hide debug UI */}
      <Canvas
        camera={{
          position: DEFAULT_CAMERA_POSITION,
          fov: 45,
        }}
        gl={{
          preserveDrawingBuffer: true,
        }}
        shadows
      >
        <color attach="background" args={["#130f30"]} />
        <fog attach="fog" args={["#130f30", 10, 40]} />
        <group position-y={-1}>
          <Experience />
        </group>
        <EffectComposer>
          <Bloom mipmapBlur luminanceThreshold={1.2} intensity={1.2} />
        </EffectComposer>
      </Canvas>
    </>
  );
}

export default AvatarViewer;