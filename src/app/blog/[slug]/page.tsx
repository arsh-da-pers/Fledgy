import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import PostBody from "@/components/PostBody";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "Fledgy" },
    publisher: { "@type": "Organization", name: "Fledgy" },
    mainEntityOfPage: `https://fledgy.guide/blog/${post.slug}`,
  };

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="flex flex-1 flex-col items-center bg-page">
      <article className="w-full max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
        <Link
          href="/blog"
          className="text-sm font-medium text-brand-orange hover:text-brand-orange"
        >
          ← All articles
        </Link>
        <h1 className="mt-4 text-[26px] font-semibold leading-tight text-ink sm:text-3xl">
          {post.title}
        </h1>
        <p className="mt-3 text-sm text-ink-faint">{formattedDate}</p>

        <PostBody body={post.body} />

        <div className="mt-12 rounded-xl border border-line bg-white p-6">
          <p className="text-[15px] font-semibold text-ink">
            Ready to put this into practice?
          </p>
          <p className="mt-1 text-[15px] text-ink-muted">
            Get instant, honest AI feedback on your essay or CV — free to try.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/essay"
              className="rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-orange"
            >
              Score my essay
            </Link>
            <Link
              href="/cv"
              className="rounded-lg border border-brand-teal px-4 py-2.5 text-sm font-semibold text-brand-teal hover:bg-brand-teal-tint"
            >
              Score my CV
            </Link>
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
        />
      </article>
    </main>
  );
}
