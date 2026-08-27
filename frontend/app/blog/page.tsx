import { getAllPosts } from "@/lib/posts";
import { PostRow } from "@/components/post/PostCard";

// The full index of posts, ordered newest first.
export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-20 md:px-10 md:py-28">
        <h1 className="font-serif text-[40px] font-medium leading-tight tracking-[-0.022em] text-ink md:text-[52px]">
          Blog
        </h1>
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted">
          Bài viết và ghi chú về xây dựng hệ thống AI, sắp theo thời gian.
        </p>

        <div className="mt-14">
          {posts.length === 0 ? (
            <p className="rounded-card border border-hairline bg-surface p-8 text-[15px] text-muted">
              Chưa có bài viết nào. Bài đầu tiên đang được viết.
            </p>
          ) : (
            posts.map((post) => <PostRow key={post.slug} post={post} />)
          )}
        </div>
    </main>
  );
}
