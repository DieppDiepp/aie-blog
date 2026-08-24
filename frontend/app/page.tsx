import Link from "next/link";
import { NodeConnector } from "@/components/motifs/NodeConnector";

// Home: editorial hero. Kept intentionally minimal for the walking skeleton.
export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <NodeConnector className="mb-8" />
      <h1 className="text-4xl font-semibold tracking-tight">AIE_Blog</h1>
      <p className="mt-4 text-lg" style={{ color: "var(--muted)" }}>
        A second brain and portfolio for an AI engineer.
      </p>
      <Link
        href="/brain"
        className="mt-8 inline-block underline"
        style={{ color: "var(--accent)" }}
      >
        Explore the brain
      </Link>
    </main>
  );
}
