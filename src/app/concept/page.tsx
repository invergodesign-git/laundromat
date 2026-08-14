import { redirect } from "next/navigation";

/** Concept draft promoted to `/` — keep this path as a friendly redirect. */
export default function ConceptRedirect() {
  redirect("/");
}
