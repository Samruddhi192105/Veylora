
"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Stars } from "@react-three/drei";
import RoomObjects from "./RoomObjects";
import type { RoomObjectId } from "./RoomObjects";

type RoomSceneProps = {
  onSelectObject: (id: RoomObjectId) => void;
  discovered: string[];
  doorOpen: boolean;
};

const ROOM_CAMERA = {
  position: [7.8, 6.1, 9.5] as [number, number, number],
  fov: 43,
  near: 0.1,
  far: 100,
};
const ROOM_LOOK_AT: [number, number, number] = [0, 1.1, -0.2];

function RoomEnvironment() {
  return (
    <>
      <color attach="background" args={["#090d15"]} />
      <fog attach="fog" args={["#090d15", 9, 19]} />

      <ambientLight intensity={0.65} />

      <hemisphereLight
        args={["#b6c9e8", "#21150f", 1.0]}
      />

      <directionalLight
        position={[-4, 7, 5]}
        intensity={2.0}
        color="#ffe4bb"
        castShadow
      />

      <pointLight
        position={[-2, 3, -1]}
        intensity={22}
        distance={8}
        color="#e5a65e"
      />

      <pointLight
        position={[3, 2.5, -2]}
        intensity={12}
        distance={6}
        color="#8a9fc9"
      />

      <Stars
        radius={40}
        depth={20}
        count={350}
        factor={1.5}
        saturation={0}
        fade
        speed={0.2}
      />

      {/* Wooden floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.06, 0]}
        receiveShadow
      >
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial
          color="#302116"
          roughness={0.88}
        />
      </mesh>

      {/* Floorboards */}
      {Array.from({ length: 17 }, (_, index) => (
        <mesh
          key={`floor-${index}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-4 + index * 0.5, -0.045, 0]}
        >
          <planeGeometry args={[0.012, 9]} />
          <meshStandardMaterial color="#64452e" />
        </mesh>
      ))}

      {/* Back wall */}
      <mesh position={[0, 2.05, -4.05]} receiveShadow>
        <boxGeometry args={[9, 4.2, 0.18]} />
        <meshStandardMaterial
          color="#292329"
          roughness={0.96}
        />
      </mesh>

      {/* Left wall */}
      <mesh
        position={[-4.05, 2.05, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[8.1, 4.2, 0.18]} />
        <meshStandardMaterial
          color="#30251f"
          roughness={0.96}
        />
      </mesh>

      {/* Right wall */}
      <mesh
        position={[4.05, 2.05, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[8.1, 4.2, 0.18]} />
        <meshStandardMaterial
          color="#211f25"
          roughness={0.96}
        />
      </mesh>

      {/* Ceiling beams */}
      {[-3, 0, 3].map((x) => (
        <mesh key={x} position={[x, 4.05, -1]}>
          <boxGeometry args={[0.13, 0.16, 6]} />
          <meshStandardMaterial color="#4a3020" />
        </mesh>
      ))}

      {/* Baseboards */}
      <mesh position={[0, 0.12, -3.93]}>
        <boxGeometry args={[8, 0.18, 0.12]} />
        <meshStandardMaterial color="#4a3022" />
      </mesh>

      <ContactShadows
        position={[0, -0.035, 0]}
        opacity={0.45}
        scale={10}
        blur={2.5}
        far={5}
      />
    </>
  );
}

export default function RoomScene({
  onSelectObject,
  discovered,
  doorOpen,
}: RoomSceneProps) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl">
      <Canvas
        shadows
        dpr={[1, 1.6]}
        camera={ROOM_CAMERA}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        <RoomEnvironment />

        <RoomObjects
          onSelect={onSelectObject}
          discovered={discovered}
          doorOpen={doorOpen}
        />

        <OrbitControls
          makeDefault
          target={ROOM_LOOK_AT}
          enablePan={false}
          enableZoom
          minDistance={5.5}
          maxDistance={18}
          minPolarAngle={0.45}
          maxPolarAngle={1.5}
          rotateSpeed={0.45}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#090d15]/70 to-transparent" />

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] tracking-wide text-white/55 backdrop-blur-md sm:bottom-5 sm:left-5">
        Drag to look around · Scroll to zoom · Select an object to investigate
      </div>
    </div>
  );
}
