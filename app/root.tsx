import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import resetCSS from "~/styles/reset.css";
import rootCSS from "~/styles/root.css";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "715 Old Carrizo Road",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: resetCSS },
    { rel: "stylesheet", href: rootCSS },

    /**
     * <link rel="preconnect" href="https://fonts.googleapis.com">
     * <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     * <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap" rel="stylesheet"></link>
     */
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: true },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap",
    },
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
