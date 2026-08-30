import type { Metadata } from "next";
import Image from "next/image";
import { SocialLinks } from "@/components/site/Social";

export const metadata: Metadata = {
  title: "About",
};

// Round portrait. Photo lives in /public and is cropped to a circle.
function Portrait() {
  return (
    <div className="h-[112px] w-[112px] shrink-0 overflow-hidden rounded-full border border-hairline">
      <Image
        src="/nguyen.png"
        alt="Ảnh chân dung của Nguyên"
        width={112}
        height={112}
        priority
        className="h-full w-full object-cover"
      />
    </div>
  );
}

const topics = [
  { name: "Hệ thống", note: "Hạ tầng, Docker, CI/CD, triển khai và vận hành." },
  { name: "Toán", note: "Nền toán đủ dùng cho machine learning và deep learning." },
  { name: "Machine Learning", note: "Mô hình, đặc trưng, đánh giá và những cái bẫy quen thuộc." },
  { name: "Deep Learning", note: "Mạng nơ-ron, huấn luyện, và trực giác đằng sau nó." },
  { name: "LLM & ứng dụng", note: "Mô hình ngôn ngữ, RAG, agent và cách đưa ra sản phẩm thật." },
];

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 md:py-24">
      {/* greeting */}
      <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:gap-9">
        <Portrait />
        <div>
          <h1 className="font-serif text-[32px] font-medium leading-[1.1] tracking-[-0.022em] text-ink md:text-[40px]">
            Xin chào, mình là Nguyên.
          </h1>
          <p className="mt-3 text-[16px] leading-relaxed text-muted">
            Sinh viên Khoa học Dữ liệu, đang tập làm AI engineer và thích viết.
          </p>
        </div>
      </div>

      {/* intro */}
      <div className="mt-12 space-y-6 text-[18px] leading-[1.78] text-ink-body">
        <p>
          Mình đang học Khoa học Dữ liệu và đi dần về phía AI engineer. Thứ mình
          thích nhất là biến một mô hình trong đầu thành một hệ thống chạy được
          thật. Trang này là nơi mình ghi lại cách mình nghĩ về chuyện đó: từ mô
          hình ngôn ngữ, agent, tới hạ tầng và quy trình đưa một tính năng ra sản
          phẩm.
        </p>
        <p>
          Mình tin vào việc học công khai. Nhiều thứ ở đây là ghi chú vừa làm vừa
          hiểu ra, nên bạn sẽ thấy cả những chỗ mình từng nhầm và cách mình gỡ.
          Nếu một bài giúp bạn đỡ mất thời gian hơn mình, vậy là nó đã làm xong
          việc của nó.
        </p>
      </div>

      {/* a few things about me */}
      <section className="mt-14">
        <h2 className="font-serif text-[22px] font-medium tracking-[-0.01em] text-ink">
          Một vài điều về mình
        </h2>
        <ul className="mt-4 space-y-2.5 text-[17px] leading-relaxed text-ink-body">
          {[
            "Mình là sinh viên ngành Khoa học Dữ liệu, và đang từng ngày tập trở thành một AI engineer.",
            "Mình dành nhiều thời gian cho mô hình ngôn ngữ lớn, AI agent, và chuyện đưa một hệ thống chạy được ra thật.",
            "Mình thích những giải thích gọn, đúng bản chất, và phép loại suy dễ hình dung.",
            "Ngoài viết code, mình thích viết chữ, và trang này là nơi hai thứ đó gặp nhau.",
          ].map((item) => (
            <li key={item} className="flex gap-3.5">
              <span
                aria-hidden
                className="mt-[13px] h-px w-4 shrink-0"
                style={{ background: "var(--hairline)" }}
              />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* what you'll find here */}
      <section className="mt-14">
        <h2 className="font-serif text-[22px] font-medium tracking-[-0.01em] text-ink">
          Bạn có thể đọc gì ở đây
        </h2>
        <dl className="mt-5 space-y-4">
          {topics.map((t) => (
            <div key={t.name} className="grid grid-cols-1 gap-1 sm:grid-cols-[168px_1fr] sm:gap-6">
              <dt className="font-serif text-[17px] text-ink">{t.name}</dt>
              <dd className="text-[15.5px] leading-relaxed text-muted">{t.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* connect */}
      <section className="mt-14 border-t border-hairline pt-8">
        <h2 className="font-serif text-[22px] font-medium tracking-[-0.01em] text-ink">
          Kết nối
        </h2>
        <p className="mt-3 text-[16px] leading-relaxed text-muted">
          Muốn trao đổi hay góp ý, cứ nhắn mình qua các kênh này.
        </p>
        <SocialLinks className="mt-5" />
      </section>

      {/* sign-off */}
      <p className="mt-14 font-serif text-[19px] italic leading-relaxed text-ink-body">
        Cảm ơn bạn đã ghé qua.
        <br />
        Thân mến, Nguyên.
      </p>
    </main>
  );
}
