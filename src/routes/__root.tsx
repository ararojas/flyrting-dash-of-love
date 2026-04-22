import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Flyrting — Love at First Flight" },
      { name: "description", content: "The dating app that only works at airports. Meet people at your gate." },
      { name: "author", content: "Flyrting" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "theme-color", content: "#1a1632" },
      { property: "og:title", content: "Flyrting — Love at First Flight" },
      { name: "twitter:title", content: "Flyrting — Love at First Flight" },
      { property: "og:description", content: "The dating app that only works at airports. Meet people at your gate." },
      { name: "twitter:description", content: "The dating app that only works at airports. Meet people at your gate." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e0b90ecf-3f07-45f7-89c8-bc4dcc7f3b7e/id-preview-3b84d4da--9c26788f-6dc2-43c9-b81a-e7503a38f74b.lovable.app-1776849746680.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e0b90ecf-3f07-45f7-89c8-bc4dcc7f3b7e/id-preview-3b84d4da--9c26788f-6dc2-43c9-b81a-e7503a38f74b.lovable.app-1776849746680.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
