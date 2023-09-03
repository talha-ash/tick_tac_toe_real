import React from "react";
import {
  Outlet,
  Router,
  Route,
  RootRoute,
  redirect,
} from "@tanstack/react-router";
import { Home, Lobby, Match } from "./pages";
import { GameMatchChannel, GameLobbyChannel } from "./channels";
// Create a root route
const rootRoute = new RootRoute({
  component: Root,
});

function Root() {
  return <Outlet />;
}

// Create an index route
const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const lobbyRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/lobby",
  component: Lobby,
  beforeLoad: () => {
    if (
      !GameLobbyChannel.channel ||
      GameLobbyChannel.channel.state !== "joined"
    ) {
      throw redirect({ to: "/" });
    }
  },
});

const matchRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/match",
  component: Match,
  beforeLoad: () => {
    if (
      (!GameLobbyChannel.channel ||
        GameLobbyChannel.channel.state !== "joined") &&
      (!GameMatchChannel.channel || GameMatchChannel.channel.state !== "joined")
    ) {
      throw redirect({ to: "/" });
    }
  },
});

// Create the route tree using your routes
const routeTree = rootRoute.addChildren([indexRoute, lobbyRoute, matchRoute]);

// Create the router using your route tree
export const router = new Router({ routeTree });
