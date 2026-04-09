import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IOT App" },
    { name: "description", content: "Welcome to App!" },
  ];
}

export default function Home() {
  return <Welcome />;
}
