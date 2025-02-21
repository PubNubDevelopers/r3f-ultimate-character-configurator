import { NodeIO } from "@gltf-transform/core";
import { dedup, draco, prune, quantize } from "@gltf-transform/functions";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { GLTFExporter } from "three-stdlib";
import { useConfiguratorStore } from "../store";
import { Asset } from "./Asset";

export const Avatar = (props) => {
  const group = useRef();
  const { nodes, scene } = useGLTF("/models/Armature.glb");
  const { animations } = useGLTF("/models/Poses.glb");
  const customization = useConfiguratorStore((state) => state.customization);
  const { actions } = useAnimations(animations, group);
  const setDownload = useConfiguratorStore((state) => state.setDownload);
  const pose = useConfiguratorStore((state) => state.pose);

  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // Ensure the model is fully loaded before applying animations
  useEffect(() => {
    if (scene && group.current) {
      setIsModelLoaded(true);
    }
  }, [scene]);

  // Filter out missing bones from animations
  const filteredAnimations = animations.map((clip) => ({
    ...clip,
    tracks: clip.tracks.filter((track) => nodes[track.name.split(".")[0]]),
  }));

  useEffect(() => {
    if (isModelLoaded && actions[pose]) {
      actions[pose].reset().fadeIn(0.2).play();
    }
    return () => actions[pose]?.fadeOut(0.2).stop();
  }, [isModelLoaded, actions, pose]);

  useEffect(() => {
    function download() {
      const exporter = new GLTFExporter();
      exporter.parse(
        group.current,
        async function (result) {
          const io = new NodeIO();

          // Read & Optimize the model
          const document = await io.readBinary(new Uint8Array(result));
          await document.transform(
            prune(), // Remove unused nodes, textures, or data
            dedup(), // Remove duplicate vertex/texture data
            draco(), // Compress mesh geometry
            quantize() // Quantize mesh geometry
          );

          // Write & Download the optimized GLB file
          const glb = await io.writeBinary(document);
          saveFile(glb, `avatar_${Date.now()}.glb`);
        },
        function (error) {
          console.error("GLTF Export Error:", error);
        },
        { binary: true }
      );
    }

    function saveFile(blobData, filename) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([blobData], { type: "application/octet-stream" }));
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setDownload(download);
  }, []);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <primitive object={nodes.mixamorigHips} />
          {Object.keys(customization).map(
            (key) =>
              customization[key]?.asset?.file && (
                <Suspense key={customization[key].asset.id}>
                  <Asset
                    categoryName={key}
                    url={`${customization[key].asset.file}`} // Updated to use local path
                    skeleton={nodes.Plane.skeleton}
                  />
                </Suspense>
              )
          )}
        </group>
      </group>
    </group>
  );
};
