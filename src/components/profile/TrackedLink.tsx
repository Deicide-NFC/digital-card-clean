"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useEffect } from "react";
import type { TrackEvent } from "@/lib/types";

export function sendTrack(profileId: string, event: TrackEvent) {
  try {
    const body = JSON.stringify({ p: profileId, e: event });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
    }
  } catch {
    /* never block the visitor */
  }
}

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  profileId: string;
  event?: TrackEvent;
  /** In the admin live preview, links do nothing. */
  preview?: boolean;
  children: ReactNode;
}

export function TrackedLink({ href, profileId, event, preview, children, onClick, ...rest }: Props) {
  const external = /^https?:\/\//i.test(href);
  return (
    <a
      href={preview ? "#" : href}
      target={external && !preview ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={(e) => {
        if (preview) {
          e.preventDefault();
          return;
        }
        if (event) sendTrack(profileId, event);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

/** Counts one view per browser tab session. Runs after load, so link previews and bots that don't run JS are not counted. */
export function ViewTracker({ profileId }: { profileId: string }) {
  useEffect(() => {
    const key = `viewed:${profileId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* private mode: just count it */
    }
    sendTrack(profileId, "view");
  }, [profileId]);
  return null;
}
