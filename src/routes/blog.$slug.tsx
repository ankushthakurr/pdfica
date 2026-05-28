import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { POSTS, getPost } from "@/lib/blog";
import { TOOLS } from "@/lib/tools";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const p = getPost(params.slug);
    if (!p) return { meta: [{ title: "Not found — Pdfica Blog" }] };
    return {
      meta: [
        { title: `${p.title} — Pdfica Blog` },
        { name: "description", content: p.excerpt },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.excerpt },
        { property: "og:image", content: p.hero },
        { property: "og:type", content: "article" },
      ],
    };
  },
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  component: PostPage,
});

// Tiny markdown renderer — supports paragraphs, ## headings, and [text](href) links.
function renderBody(body: string) {
  const blocks = body.split(/\n\n+/);
  return blocks.map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-10 mb-3 font-display text-2xl font-bold">
          {block.slice(3)}
        </h2>
      );
    }
    const parts: Array<string | { text: string; href: string }> = [];
    let rest = block;
    const linkRe = /\[([^\]]+)\]\(([^)]+)\)/;
    while (true) {
      const m = rest.match(linkRe);
      if (!m) {
        parts.push(rest);
        break;
      }
      const before = rest.slice(0, m.index);
      if (before) parts.push(before);
      parts.push({ text: m[1], href: m[2] });
      rest = rest.slice((m.index ?? 0) + m[0].length);
    }
    return (
      <p key={i} className="mb-4 leading-relaxed text-foreground/85">
        {parts.map((p, j) =>
          typeof p === "string" ? (
            <span key={j}>{p}</span>
          ) : (
            <Link
              key={j}
              to={p.href as "/"}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              {p.text}
            </Link>
          ),
        )}
      </p>
    );
  });
}

function PostPage() {
  const { post } = Route.useLoaderData();
  const related = TOOLS.filter((t) => post.relatedTools.includes(t.slug));
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12 md:py-16">
      <Link
        to="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All articles
      </Link>
      <header className="mt-6">
        <div className="flex items-center gap-3 text-xs">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
            {post.category}
          </span>
          <span className="text-muted-foreground">{post.readingTime}</span>
        </div>
        <h1 className="mt-4 font-display text-4xl md:text-5xl font-bold leading-tight">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
        <p className="mt-5 text-sm text-muted-foreground">
          {post.author} · {post.date}
        </p>
      </header>
      <img
        src={post.hero}
        alt={post.title}
        className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover shadow-card"
      />
      <div className="mt-10 text-base">{renderBody(post.body)}</div>

      {related.length > 0 && (
        <div className="mt-14 rounded-2xl border bg-surface p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Try these tools</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {related.map((t) => (
              <Link
                key={t.slug}
                to={t.to}
                className="rounded-xl border bg-background p-4 hover:bg-muted transition-colors"
              >
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-14 border-t pt-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">More reading</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {POSTS.filter((p) => p.slug !== post.slug).map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="rounded-xl border bg-surface p-4 hover:bg-muted transition-colors"
            >
              <p className="font-semibold">{p.title}</p>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
