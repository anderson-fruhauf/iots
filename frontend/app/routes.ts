import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/_layout.tsx", [
    index("routes/home.tsx"),
    route("sensor/:deviceId", "routes/sensor.$deviceId.tsx"),
  ]),
] satisfies RouteConfig;
