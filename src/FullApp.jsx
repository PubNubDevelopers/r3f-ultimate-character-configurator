import { useSearchParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Leva } from "leva";
import { DEFAULT_CAMERA_POSITION } from "./components/CameraManager";
import { Experience } from "./components/Experience";
import { useConfiguratorStore } from "./store";
import React, { useEffect } from "react";
import { UI } from "./components/UI";

function FullApp() {
  const [searchParams] = useSearchParams();
  const userUUID = searchParams.get("uuid"); // Extract UUID from URL
  const generateAvatarURL = useConfiguratorStore((state) => state.generateAvatarURL);
  const chat = useConfiguratorStore((state) => state.chat);
  const initializeChat = useConfiguratorStore((state) => state.initializeChat); // Get function

  useEffect(() => {
    if (!chat) {
      console.log("🔄 Initializing PubNub Chat...");
      initializeChat(); // Ensure chat initializes if not ready
    }
  }, [chat]);

  // Function to create or update user in PubNub Chat
  const createOrUpdateUser = async (avatarURL) => {
    if (!userUUID || !chat) return; // Wait for chat to be ready

    console.log(avatarURL);

    try {
      const user = await chat.getUser(userUUID);

      if (user) {
        // Update existing user
        await user.update({ profileUrl: avatarURL });
        console.log(`✅ Avatar updated in PubNub Chat for ${userUUID}:`, avatarURL);
      } else {
        // User doesn't exist, create new user
        await chat.createUser(userUUID, {
          name: `Avatar-Player-${userUUID}`,
          profileUrl: avatarURL,
        });
        console.log(`🎉 User created in PubNub Chat with avatar:`, avatarURL);
      }
    } catch (error) {
      console.error("❌ Error in creating/updating user:", error);
    }
  };

  // Automatically update avatar when configuration changes
  useEffect(() => {
    if (!chat) return; // Wait until chat is available

    const unsubscribe = useConfiguratorStore.subscribe(() => {
      const avatarURL = generateAvatarURL();
      console.log(avatarURL);
      createOrUpdateUser(avatarURL);
    });

    return () => unsubscribe();
  }, [chat]); // Only run effect when `chat` is ready

  return (
    <>
      <Leva hidden />
      <UI />
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

export default FullApp;