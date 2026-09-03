import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { Button } from "@/components/ui/Button";

// 404. Two columns: the number and the way out on the left, real suggestions
// on the right, so a dead link still leads somewhere.
export default async function NotFound() {
  const posts = await getAllPosts();
  const suggestions = posts.slice(0, 2);

  return (
    <main>
      <section className="grid border-t-2 border-rule md:grid-cols-2">
        <div className="border-r-2 border-rule px-14 py-11">
          <span className="block text-[92px] font-extrabold leading-[0.86] tracking-[-0.05em] text-ink">
            404
          </span>
          <h1 className="mt-5 text-[30px] font-bold leading-tight tracking-[-0.03em] text-ink">
            Không tìm thấy trang này
          </h1>
          <p className="mt-3.5 max-w-[400px] font-serif text-[17px] leading-relaxed text-muted">
            Có thể đường dẫn đã đổi, hoặc bài viết vẫn đang là bản nháp. Thử bản
            đồ tri thức hoặc danh sách bài viết.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/blog">Danh sách bài viết</Button>
            <Button href="/graph" variant="outline">
              Bản đồ tri thức
            </Button>
          </div>
        </div>

        <div className="px-14 py-11">
          <span className="block border-b-2 border-rule pb-3.5 text-[9.5px] font-bold uppercase leading-none tracking-[0.2em] text-muted">
            Có lẽ bạn đang tìm
          </span>
          {suggestions.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block border-b border-[rgba(32,30,29,0.2)] py-3.5 text-[17px] font-semibold leading-snug text-ink transition-colors hover:text-accent"
            >
              {post.title}
            </Link>
          ))}
          <Link
            href="/about"
            className="block py-3.5 text-[17px] font-semibold leading-snug text-ink transition-colors hover:text-accent"
          >
            Về mình
          </Link>
        </div>
      </section>
    </main>
  );
}
