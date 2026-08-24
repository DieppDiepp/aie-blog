import { getPosts } from "@/lib/api";
import { NodeConnector } from "@/components/motifs/NodeConnector";

// Brain: lists posts fetched from the API. This closes the walking skeleton
// loop, DB to API to screen.
export default async function BrainPage() {
  const posts = await getPosts();

  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Brain</h1>

      {posts.length === 0 ? (
        <p className="mt-6" style={{ color: "var(--muted)" }}>
          Chưa có bài viết nào. Tạo bài đầu tiên qua API POST /posts.
        </p>
      ) : (
        <ul className="mt-8 space-y-6">
          {posts.map((post) => (
            <li key={post.id} className="flex items-start gap-3">
              <NodeConnector className="mt-2 shrink-0" />
              <div>
                <h2 className="text-xl font-medium">{post.title}</h2>
                <p style={{ color: "var(--muted)" }}>{post.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
