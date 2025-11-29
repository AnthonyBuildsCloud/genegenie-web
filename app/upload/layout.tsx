// app/upload/layout.tsx
import { Suspense } from "react";

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Wrap the /upload page in a Suspense boundary so hooks like useSearchParams
  // are allowed in the client part of the tree.
  return <Suspense fallback={null}>{children}</Suspense>;
}
