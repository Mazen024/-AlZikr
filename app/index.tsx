import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import Welcome from "./components/welcome";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("./(tabs)/homePage");
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return <Welcome />;
};

export default Index;
