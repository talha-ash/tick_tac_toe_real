import React from "react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes";

const Main = () => {
  return <RouterProvider router={router} />;
};

export default Main;
