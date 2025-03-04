"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const orgName = process.env.NEXT_PUBLIC_ORGANIZATION_NAME + " " || "";

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccessDeniedWithMessage />
    </Suspense>
  );
}

function AccessDeniedWithMessage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  let errorMessage = "You are not authorized to access this page.";

  if (message === "ORGANIZATION_EMAIL_REQUIRED") {
    errorMessage = `This application is only available to ${orgName}members with an approved email domain.`;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
      <p className="mb-6">{errorMessage}</p>
      <Link
        href="/login"
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Return to Login
      </Link>
    </div>
  );
}
