"use client";
import { useEffect } from "react";

/** Sets the tab title where a route can't (a segment-level not-found page can't export metadata). */
export function DocTitle({ title }: { title: string }) {
  useEffect(() => { document.title = title; }, [title]);
  return null;
}
