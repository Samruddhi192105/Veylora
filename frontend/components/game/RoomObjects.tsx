
"use client";

import { useRef } from "react";
import { Float } from "@react-three/drei";
import type { Group } from "three";

export type RoomObjectId =
  | "grandfather_clock"
  | "old_painting"
  | "diary"
  | "bookshelf"
  | "locked_drawer"
  | "safe"
  | "telephone"
  | "exit_door";

type RoomObjectsProps = {
  onSelect: (id: RoomObjectId) => void;
  discovered: string[];
  doorOpen: boolean;
};

type ClickableProps = {
  id: RoomObjectId;
  position: [number, number, number];
  onSelect: (id: RoomObjectId) => void;
  discovered: boolean;
};

function Clickable({
  id,
  position,
  onSelect,
  discovered,
  children,
}: ClickableProps & { children: React.ReactNode }) {
  return (
    <group
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {children}

      {discovered && (
        <mesh position={[0.48, 0.55, 0.1]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial
            color="#e7c778"
            emissive="#8c6826"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}

function ClockObject() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.72, 1.65, 0.32]} />
        <meshStandardMaterial color="#4b2b19" roughness={0.6} />
      </mesh>

      <mesh position={[0, 0.43, 0.19]}>
        <circleGeometry args={[0.22, 32]} />
        <meshStandardMaterial
          color="#d9c79a"
          metalness={0.15}
          roughness={0.4}
        />
      </mesh>

      <mesh position={[0, 0.43, 0.215]}>
        <boxGeometry args={[0.018, 0.15, 0.018]} />
        <meshStandardMaterial color="#292016" />
      </mesh>

      <mesh position={[0.04, 0.46, 0.225]}>
        <boxGeometry args={[0.12, 0.018, 0.018]} />
        <meshStandardMaterial color="#292016" />
      </mesh>

      <mesh position={[0, -0.43, 0.19]}>
        <boxGeometry args={[0.35, 0.42, 0.035]} />
        <meshStandardMaterial color="#25170f" />
      </mesh>
    </group>
  );
}

function PaintingObject() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.92, 1.05, 0.12]} />
        <meshStandardMaterial color="#5a3b20" />
      </mesh>

      <mesh position={[0, 0, 0.075]}>
        <boxGeometry args={[0.76, 0.88, 0.025]} />
        <meshStandardMaterial color="#171411" />
      </mesh>

      <mesh position={[0, 0.05, 0.1]}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial color="#92765c" roughness={1} />
      </mesh>

      <mesh position={[0, -0.24, 0.1]}>
        <coneGeometry args={[0.3, 0.46, 4]} />
        <meshStandardMaterial color="#292126" roughness={1} />
      </mesh>
    </group>
  );
}

function BookshelfObject() {
  const books = [
    "#573a2a",
    "#8b603b",
    "#302b26",
    "#6b4b32",
    "#9a7950",
    "#44302a",
  ];

  return (
    <group>
      <mesh>
        <boxGeometry args={[1.35, 1.75, 0.38]} />
        <meshStandardMaterial color="#422819" />
      </mesh>

      {[0.48, 0, -0.48].map((y, shelfIndex) => (
        <group key={shelfIndex} position={[0, y, 0.22]}>
          <mesh>
            <boxGeometry args={[1.27, 0.055, 0.36]} />
            <meshStandardMaterial color="#75482a" />
          </mesh>

          {books.map((color, index) => (
            <mesh
              key={`${shelfIndex}-${index}`}
              position={[
                -0.48 + index * 0.19,
                0.13,
                0.015,
              ]}
            >
              <boxGeometry
                args={[
                  0.13,
                  0.2 + ((index + shelfIndex) % 3) * 0.06,
                  0.2,
                ]}
              />
              <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function DrawerObject() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.0, 0.62, 0.58]} />
        <meshStandardMaterial color="#53331e" />
      </mesh>

      <mesh position={[0, 0, 0.3]}>
        <boxGeometry args={[0.85, 0.38, 0.045]} />
        <meshStandardMaterial color="#6b452b" />
      </mesh>

      <mesh position={[0, 0, 0.34]}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial
          color="#d5b36c"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
}

function SafeObject() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.95, 0.95, 0.7]} />
        <meshStandardMaterial
          color="#41464b"
          metalness={0.75}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, 0, 0.36]}>
        <circleGeometry args={[0.22, 32]} />
        <meshStandardMaterial
          color="#b8a16b"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[0, 0, 0.39]}>
        <circleGeometry args={[0.12, 24]} />
        <meshStandardMaterial color="#25292b" metalness={0.6} />
      </mesh>

      <mesh position={[0, 0, 0.415]}>
        <boxGeometry args={[0.025, 0.17, 0.025]} />
        <meshStandardMaterial color="#dfc58a" metalness={0.8} />
      </mesh>
    </group>
  );
}

function TelephoneObject() {
  return (
    <group>
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[0.58, 0.18, 0.38]} />
        <meshStandardMaterial color="#30251d" />
      </mesh>

      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.36, 0.12, 0.2]} />
        <meshStandardMaterial color="#151312" />
      </mesh>

      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.62, 0.11, 0.16]} />
        <meshStandardMaterial color="#5a3926" />
      </mesh>

      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[0.12, 0.13, 0.13]} />
        <meshStandardMaterial color="#302019" />
      </mesh>
    </group>
  );
}

function DoorObject({ doorOpen }: { doorOpen: boolean }) {
  const doorRef = useRef<Group>(null);

  return (
    <group>
      <mesh position={[0, 0.95, -0.05]}>
        <boxGeometry args={[1.45, 2.05, 0.16]} />
        <meshStandardMaterial color="#25170f" />
      </mesh>

      <group
        ref={doorRef}
        position={[-0.58, 0, 0.08]}
        rotation={[0, doorOpen ? -1.1 : 0, 0]}
      >
        <mesh position={[0.58, 0.95, 0]}>
          <boxGeometry args={[1.12, 1.9, 0.1]} />
          <meshStandardMaterial
            color="#59351f"
            roughness={0.75}
          />
        </mesh>

        {[0.35, 0.85, 1.35].map((y) => (
          <mesh key={y} position={[0.58, y, 0.06]}>
            <boxGeometry args={[0.88, 0.035, 0.025]} />
            <meshStandardMaterial color="#352015" />
          </mesh>
        ))}

        <mesh position={[0.95, 0.92, 0.09]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial
            color="#d6b66e"
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}

export default function RoomObjects({
  onSelect,
  discovered,
  doorOpen,
}: RoomObjectsProps) {
  const wasDiscovered = (id: RoomObjectId) =>
    discovered.includes(id);

  return (
    <group>
      <Float speed={0.6} rotationIntensity={0.015} floatIntensity={0.025}>
        <Clickable
          id="grandfather_clock"
          position={[-3.0, 1.25, -1.8]}
          onSelect={onSelect}
          discovered={wasDiscovered("grandfather_clock")}
        >
          <ClockObject />
        </Clickable>
      </Float>

      <Clickable
        id="old_painting"
        position={[-1.05, 2.0, -2.8]}
        onSelect={onSelect}
        discovered={wasDiscovered("old_painting")}
      >
        <PaintingObject />
      </Clickable>

      <Clickable
        id="bookshelf"
        position={[2.85, 1.25, -1.8]}
        onSelect={onSelect}
        discovered={wasDiscovered("bookshelf")}
      >
        <BookshelfObject />
      </Clickable>

      <Clickable
        id="diary"
        position={[-1.3, 0.58, 0.15]}
        onSelect={onSelect}
        discovered={wasDiscovered("diary")}
      >
        <mesh>
          <boxGeometry args={[0.55, 0.12, 0.42]} />
          <meshStandardMaterial color="#573b29" />
        </mesh>
        <mesh position={[0, 0.07, 0.02]}>
          <boxGeometry args={[0.46, 0.018, 0.35]} />
          <meshStandardMaterial color="#d0bd93" />
        </mesh>
      </Clickable>

      <Clickable
        id="locked_drawer"
        position={[0.15, 0.62, 0.15]}
        onSelect={onSelect}
        discovered={wasDiscovered("locked_drawer")}
      >
        <DrawerObject />
      </Clickable>

      <Clickable
        id="safe"
        position={[2.05, 0.72, 0.15]}
        onSelect={onSelect}
        discovered={wasDiscovered("safe")}
      >
        <SafeObject />
      </Clickable>

      <Clickable
        id="telephone"
        position={[3.35, 0.62, 0.15]}
        onSelect={onSelect}
        discovered={wasDiscovered("telephone")}
      >
        <TelephoneObject />
      </Clickable>

      <Clickable
        id="exit_door"
        position={[0.0, 0.0, -3.8]}
        onSelect={onSelect}
        discovered={wasDiscovered("exit_door")}
      >
        <DoorObject doorOpen={doorOpen} />
      </Clickable>
    </group>
  );
}
