import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import { transformerNotationDiff } from "@shikijs/transformers";

interface CodeBlockProps {
  children: string;
  lang: BundledLanguage;
}

export async function CodeBlock({ children, lang }: CodeBlockProps) {
  const out = await codeToHtml(children, {
    lang: lang,
    theme: "one-light",
    transformers: [transformerNotationDiff()],
  });

  return (
    <div
      className="[&>pre]:overflow-x-auto [&>pre]:!bg-background [&>pre]:py-3 [&>pre]:pl-4 [&>pre]:pr-5 [&>pre]:leading-snug [&_code]:block [&_code]:w-fit [&_code]:min-w-full"
      dangerouslySetInnerHTML={{ __html: out }}
    />
  );
}