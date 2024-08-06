"use client";

import { useContext } from "react";
import { NextransContext } from "../NextransProvider";

export default function EmbeddedSnap() {
  const client = useContext(NextransContext);

  if (!client)
    throw new Error("Context not found, EmbeddedSnap must be wrapped around a NextransProvider");

  return (
    <div>
      <script
        type="text/javascript"
        async
        src="https://app.stg.midtrans.com/snap/snap.js"
        data-client-key={client.accessKeys.clientKey}
        onLoad={() => {
          console.log("dees");
        }}
      ></script>
    </div>
  );
}
