import Image from "next/image";
import { APP_DISPLAY } from "./knowledge.util";

export const getSourceIcon = (source: string, size: number = 16) => {
  const app = APP_DISPLAY[source?.toLowerCase()];
  if (app) {
    return (
      <Image
        src={app.icon}
        alt={app.name}
        width={size}
        height={size}
        style={{ objectFit: "contain" }}
      />
    );
  }
  // fallback for unknown sources
  return (
    <Image
      src="https://www.svgrepo.com/show/341242/unknown.svg"
      alt="Unknown"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  );
};
