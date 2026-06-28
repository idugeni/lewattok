import type { Metadata } from "next";
import { InboxPage } from "@/components/InboxPage";

export const metadata: Metadata = {
  title: "Inbox — Your Temporary Email",
  description:
    "Your disposable inbox. Everything auto-deletes after the countdown ends.",
};

export default function Page() {
  return <InboxPage />;
}
