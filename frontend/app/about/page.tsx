import type { Metadata } from "next";
import Image from "next/image";
import { SocialLinks } from "@/components/site/Social";
import { Button } from "@/components/ui/Button";
import { TOPICS } from "@/lib/topics";
import { SITE_AUTHOR } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Nguyên, sinh viên Khoa học Dữ liệu, đang tập làm AI engineer và thích viết.",
  alternates: { canonical: "/about" },
};

const FACTS = [
  "Mình là sinh viên ngành Khoa học Dữ liệu, và đang từng ngày tập trở thành một AI engineer.",
  "Mình dành nhiều thời gian cho mô hình ngôn ngữ lớn, AI agent, và chuyện đưa một hệ thống chạy được ra thật.",
  "Mình thích những giải thích gọn, đúng bản chất, và phép loại suy dễ hình dung.",
  "Ngoài viết code, mình thích viết chữ, và trang này là nơi hai thứ đó gặp nhau.",
];

export default function AboutPage() {
  return (
    <main>
      {/* Portrait and greeting. The portrait is a SQUARE plate, full-bleed in
          its column, and the image keeps its own colors: no grayscale filter.
          Note: /nguyen.png is currently a circle-cropped PNG with transparent
          corners, so it reads as a floating circle in a square plate. Replace
          it with an uncropped square photo (ideally on R2, alongside the post
          covers) and this block is finished. The ink ground below is there so
          the current file still looks deliberate in the meantime. */}
      <section className="grid border-b-2 border-rule md:grid-cols-[360px_1fr]">
        <div className="relative min-h-[420px] border-r-2 border-rule bg-ink">
          <Image
            src="/nguyen.png"
            alt="Ảnh chân dung của Nguyên"
            fill
            priority
            sizes="360px"
            className="object-cover"
          />
          <span className="absolute bottom-0 left-0 bg-accent px-3 py-2 text-[9.5px] font-bold uppercase leading-none tracking-[0.2em] text-white">
            {SITE_AUTHOR}, 2026
          </span>
        </div>

        <div className="px-14 pb-10 pt-[52px] md:pl-12">
          <span aria-hidden className="mb-5 block h-0.5 w-[26px] bg-accent" />
          <h1 className="text-[54px] font-extrabold leading-[0.96] tracking-[-0.04em] text-ink">
            Xin chào,
            <br />
            mình là {SITE_AUTHOR}.
          </h1>
          <p className="mt-4.5 max-w-[520px] font-serif text-[21px] font-light italic leading-[1.5] text-muted">
            Sinh viên Khoa học Dữ liệu, đang tập làm AI engineer và thích viết.
          </p>
          <SocialLinks className="mt-7" />
        </div>
      </section>

      {/* Two-column bio. */}
      <section className="grid gap-11 border-b border-hairline px-14 py-11 md:grid-cols-2">
        <p className="font-serif text-[18px] leading-[1.7] text-ink-body">
          Mình đang học Khoa học Dữ liệu và đi dần về phía AI engineer. Thứ mình
          thích nhất là biến một mô hình trong đầu thành một hệ thống chạy được
          thật. Trang này là nơi mình ghi lại cách mình nghĩ về chuyện đó: từ mô
          hình ngôn ngữ, agent, tới hạ tầng và quy trình đưa một tính năng ra sản
          phẩm.
        </p>
        <p className="font-serif text-[18px] leading-[1.7] text-ink-body">
          Mình tin vào việc học công khai. Nhiều thứ ở đây là ghi chú vừa làm vừa
          hiểu ra, nên bạn sẽ thấy cả những chỗ mình từng nhầm và cách mình gỡ.
          Nếu một bài giúp bạn đỡ mất thời gian hơn mình, vậy là nó đã làm xong
          việc của nó.
        </p>
      </section>

      <section className="px-14 pb-[34px] pt-9">
        <h2 className="text-[15px] font-extrabold uppercase leading-none tracking-[0.16em] text-ink">
          Một vài điều về mình
        </h2>
        <ul className="m-0 mt-4 list-none p-0">
          {FACTS.map((fact, i) => (
            <li
              key={fact}
              className={`flex gap-4 py-3.5 ${i < FACTS.length - 1 ? "border-b border-[rgba(32,30,29,0.2)]" : ""}`}
            >
              <span aria-hidden className="mt-[9px] block h-[9px] w-[9px] shrink-0 bg-accent" />
              <span className="font-serif text-[17px] leading-relaxed text-ink-body">{fact}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-14 pb-11">
        <h2 className="border-t-2 border-rule pt-5 text-[15px] font-extrabold uppercase leading-none tracking-[0.16em] text-ink">
          Bạn có thể đọc gì ở đây
        </h2>
        <dl className="m-0 mt-[18px] grid md:grid-cols-[220px_1fr]">
          {TOPICS.filter((t) => t.slug !== "other").map((topic) => (
            <div key={topic.slug} className="contents">
              <dt className="border-t border-[rgba(32,30,29,0.2)] py-3.5 text-[16px] font-bold leading-snug tracking-[-0.01em] text-ink">
                {topic.name}
              </dt>
              <dd className="m-0 border-t border-[rgba(32,30,29,0.2)] py-3.5 font-serif text-[16px] leading-relaxed text-muted">
                {topic.blurb}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Sign-off band: ink, not accent. */}
      <section className="flex flex-col items-start justify-between gap-10 bg-ink px-14 py-11 text-ink-invert md:flex-row md:items-end">
        <p className="m-0 max-w-[640px] font-serif text-[30px] italic leading-snug">
          Cảm ơn bạn đã ghé qua. Muốn trao đổi hay góp ý, cứ nhắn mình qua các kênh
          này.
          <span className="mt-[18px] block text-[12px] font-bold uppercase not-italic leading-none tracking-[0.2em]">
            Thân mến, {SITE_AUTHOR}
          </span>
        </p>
        <Button href="/blog" variant="primary">
          Đọc blog →
        </Button>
      </section>
    </main>
  );
}
