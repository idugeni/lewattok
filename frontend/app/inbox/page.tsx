import type { Metadata } from "next";
import { InboxPage } from "@/components/InboxPage";

export const metadata: Metadata = {
  title: "Inbox — Your Temporary Email",
  description:
    "Your disposable inbox. Receive emails in real-time. Everything auto-deletes in 15 minutes.",
};

export default function Page() {
  return <InboxPage />;
}
