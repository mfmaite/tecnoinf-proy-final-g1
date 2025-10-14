"use client";

import { useEffect } from "react";
import { useAuthToken, useAuthUser } from "@/context/AuthContext";

export default function Home() {
  const user = useAuthUser();
  const token = useAuthToken();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("Auth user:", user);
    // eslint-disable-next-line no-console
    console.log("Auth token:", token);
  }, [user, token]);

  return (
    <div />
  );
}
