import { getAllPosts } from "@/lib/posts";
import { Header } from "@/components/site/Header";
import { PostRow } from "@/components/post/PostCard";

// Brain: the full index of posts, the reader's entry into the second brain.
export default async function BrainPage() {
  const posts = await getAllPosts();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-20 md:px-10 md:py-28">
        <h1 className="font-serif text-[40px] font-medium leading-tight tracking-[-0.022em] text-ink md:text-[52px]">
          Brain
        </h1>
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted">
          Mọi ghi chú và bài viết, sắp theo thời gian. Đồ thị tri thức sẽ nối
          chúng lại với nhau.
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
    </div>
  );
}
