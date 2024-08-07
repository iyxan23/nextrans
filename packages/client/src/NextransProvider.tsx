"use client";

import type NextransClient from "./client";
import React from "react";

export const NextransContext = React.createContext<NextransClient | null>(null);

export default function NextransProvider({
  children,
  client,
}: {
  children: React.ReactNode;
  client: NextransClient;
}) {
  return (
    <NextransContext.Provider value={client}>
      {children}
    </NextransContext.Provider>
  );
}
