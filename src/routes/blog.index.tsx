import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { POSTS } from "@/lib/blog";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Pdfica Blog — PDF Tips, Tutorials & Guides" },
      { name: "description", content: "Practical guides on editing, compressing, and converting PDFs — entirely from your browser." },
      { property: "og:title", content: "Pdfica Blog" },
      { property: "og:description", content: "Tutorials, guides, and tips for working with PDFs privately." },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const [featured, ...rest] = POSTS;
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Pdfica Blog</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">
          Better PDFs, better workflows.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Tutorials, guides, and opinionated takes on doing more with PDFs — privately.
        </p>
      </div>

      {/* Featured */}
      <Link to="/blog/$slug" params={{ slug: featured.slug }} className="group block">
        <motion.article
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 rounded-3xl border bg-surface p-4 md:grid-cols-2 md:p-6 shadow-card hover:shadow-card-hover transition-shadow"
        >
          <div className="overflow-hidden rounded-2xl">
            <img
              src={featured.hero}
              alt={featured.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col justify-center p-2 md:p-6">
            <div className="flex items-center gap-3 text-xs">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                {featured.category}
              </span>
              <span className="text-muted-foreground">{featured.readingTime}</span>
            </div>
            <h2 className="mt-4 font-display text-2xl md:text-4xl font-bold leading-tight">
              {featured.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
            <p className="mt-5 text-sm text-muted-foreground">
              {featured.author} · {featured.date}
            </p>
          </div>
        </motion.article>
      </Link>

      {/* Rest */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {rest.map((p, i) => (
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group block rounded-2xl border bg-surface shadow-card hover:shadow-card-hover transition-shadow overflow-hidden"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={p.hero}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                    {p.category}
                  </span>
                  <span className="text-muted-foreground">{p.readingTime}</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-bold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
