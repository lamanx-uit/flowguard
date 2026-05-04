import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";
import { Wand2 } from "lucide-react";
import { codeToHtml } from "shiki";
import { FixResponse } from "@/lib/types";

function HighlightedCode({ code, language }: { code: string; language: string }) {
  const [html, setHTML] = useState("");

  useEffect(() => {
    codeToHtml(code, {
      lang: language || "java",
      theme: "one-light",
    }).then(setHTML);
  }, [code, language]);

  return (
    <div
      className="[&>pre]:overflow-x-auto [&>pre]:!bg-background [&>pre]:py-3 [&>pre]:pl-4 [&>pre]:pr-5 [&>pre]:leading-snug [&_code]:block [&_code]:w-fit [&_code]:min-w-full"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function TabFixed({ fixResult, language }: { fixResult: FixResponse | null; language: string }) {
  if (!fixResult || !fixResult.fixed_code) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Fixed Code</CardTitle>
          <CardDescription>Generate fixed code from results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Wand2 className="h-12 w-12 mb-4" />
            <p>No fixed code generated yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const changes = fixResult.changes ?? [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Fixed Code</CardTitle>
        <CardDescription>
          {changes.length} change{changes.length !== 1 ? "s" : ""} applied
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <HighlightedCode code={fixResult.fixed_code} language={language} />

        {changes.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Changes Applied</h3>
            <div className="space-y-2">
              {changes.map((change, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-muted text-sm">
                  <Badge variant="outline" className="shrink-0 mt-0.5">
                    Line {change.line}
                  </Badge>
                  <span className="text-muted-foreground">{change.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
