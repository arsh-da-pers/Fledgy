import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Essay, CV & Career Advice for International Students",
  description:
    "Practical guides on personal statements, CVs, and career direction for international students and applicants, from the team at Fledgy.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main className="flex flex-1 flex-col items-center bg-[#fdf3e7]">
      <div className="w-full max-w-2xl px-6 py-12">
        <span className="inline-block rounded-full bg-[#fbe3d8] px-2.5 py-1 text-xs font-bold tracking-widest text-[#b6431f]">
          FLEDGY BLOG
        </span>
        <h1 className="mt-3 text-3xl font-semibold text-[#2a2115]">
          Advice for applying abroad
        </h1>
        <p className="mt-2 text-[#6b5c45]">
          Practical guides on personal statements, CVs, and choosing your path —
          written for international students and applicants.
        </p>

        <div className="mt-10 space-y-8">
          {posts.map((post) => (
            <article key={post.slug} className="border-b border-[#f0dfc4] pb-8">
              <Link href={`/blog/${post.slug}`} className="group block">
                <h2 className="text-xl font-semibold text-[#2a2115] group-hover:text-[#c8532c]">
                  {post.title}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-[#6b5c45]">
                  {post.excerpt}
                </p>
                <span className="mt-3 inline-block text-sm font-medium text-[#c8532c]">
                  Read more →
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
