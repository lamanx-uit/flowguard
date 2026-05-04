import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  CircleDot,
  CircleEllipsis,
  Code2,
  Loader2,
  Wand2,
} from "lucide-react";

import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { BugReport, FixResponse, StreamEvent } from "@/lib/types";

interface TabResultProps {
  type: string;
  results: StreamEvent[];
  isAnalyzing: boolean;
  model: string;
  code: string;
  language: string;
  handleChangeFixResult: (fixResult: FixResponse | null) => void;
  handleChangeActiveTab: (tab: string) => void;
}

export function TabResult({
  type,
  results,
  isAnalyzing,
  model,
  code,
  language,
  handleChangeFixResult,
  handleChangeActiveTab,
}: TabResultProps) {
  const [isGeneratingFixes, setIsGeneratingFixes] = useState(false);

  const handleGenerateFixes = async () => {
    if (isGeneratingFixes || results.length === 0) {
      if (results.length === 0) {
        toast.error("Please analyze code first");
      }
      return;
    }

    setIsGeneratingFixes(true);

    try {
      const trueBugReports: BugReport[] = results
        .filter((r) => r.stage === "trace_result" && r.report?.is_true_bug)
        .map((r) => r.report as BugReport);

      const response = await fetch("/api/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          bug: trueBugReports,
          language: language || "java",
          model,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate fixes");
      }

      const fixResult: FixResponse = await response.json();
      handleChangeFixResult(fixResult);
      handleChangeActiveTab("fixed");
      toast.success("Generated fixes for detected bugs");
      setIsGeneratingFixes(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to generate fixes");
      setIsGeneratingFixes(false);
    }
  };

  const getBugTypeLabel = (type: string) => {
    switch (type) {
      case "dbz": return "Divide by Zero";
      case "npd": return "NULL Pointer Dereference";
      case "xss": return "Cross-Site Scripting (XSS)";
      case "ci":  return "OS Command Injection";
      case "apt": return "Absolute Path Traversal";
      default:    return type;
    }
  };

  const getStageIcon = (result: StreamEvent) => {
    if (result.stage === "completed") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (result.stage === "started")   return <CircleDot className="h-5 w-5 text-green-500" />;
    if (result.stage === "detection") return <Circle className="h-5 w-5 text-amber-500" />;
    if (result.stage === "trace_result") return <CircleEllipsis className="h-5 w-5" />;
    if (result.result === true)  return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (result.result === false) return <AlertCircle className="h-5 w-5 text-red-500" />;
    return <Circle className="h-5 w-5 text-blue-500" />;
  };

  const getStageLabel = (stage: string) =>
    stage.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const renderTraceDetails = (trace: StreamEvent["trace"]) => {
    if (!trace || !Array.isArray(trace)) return null;
    return (
      <div className="ml-7 mt-2 p-3 bg-primary/5 rounded-md text-sm">
        <h4 className="font-medium mb-2">Trace Details:</h4>
        <ul className="list-disc pl-5 space-y-1">
          {trace.map((item, idx) => (
            <li key={idx}>
              Line {item.line}: Variable{" "}
              <code className="bg-background px-1 rounded">{item.variable}</code>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderResultSummary = () => {
    const completed = results.find((r) => r.stage === "completed");
    if (!completed) return null;

    return (
      <div className="mt-6 p-4 border rounded-lg bg-background">
        <h3 className="text-lg font-medium mb-3">Analysis Summary</h3>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Bugs Detected:</span>
              <Badge variant="outline">{completed.bug_count}</Badge>
            </div>
            <div className="flex justify-between">
              <span>True Bugs:</span>
              <Badge variant={completed.true_bug_count && completed.true_bug_count > 0 ? "destructive" : "default"}>
                {completed.true_bug_count}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>False Positives:</span>
              <Badge variant="outline">
                {(completed.bug_count ?? 0) - (completed.true_bug_count ?? 0)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Button onClick={handleGenerateFixes} className="w-full" disabled={isGeneratingFixes}>
            {isGeneratingFixes ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Fixes...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Fixes
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  const renderTraceResult = (report: BugReport, functionalityPassed?: boolean) => {
    if (!report?.sanitizer_results) return null;
    const s = report.sanitizer_results;
    const funcPassed = functionalityPassed ?? !!s.functionality_sanitize?.source_reasoning;
    const reachabilityPassed = !s.reachability_sanitize?.reasoning;
    const reachabilityReason = s.reachability_sanitize?.reasoning;

    const passIcon = (passed: boolean) => passed
      ? <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
      : <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />;

    return (
      <div className="ml-7 mt-2 p-3 bg-muted rounded-md text-sm space-y-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">{passIcon(s.type_sanitize)}<span className="font-medium">Type Sanitize</span></div>
          <p className="text-muted-foreground text-xs ml-5">Verifies the data flow path is syntactically valid</p>
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">{passIcon(funcPassed)}<span className="font-medium">Functionality Sanitize</span></div>
          <p className="text-muted-foreground text-xs ml-5">Confirms the source can produce a tainted value</p>
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">{passIcon(s.order_sanitize)}<span className="font-medium">Order Sanitize</span></div>
          <p className="text-muted-foreground text-xs ml-5">Checks the control flow order is consistent</p>
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">{passIcon(reachabilityPassed)}<span className="font-medium">Reachability Sanitize</span></div>
          <p className="text-muted-foreground text-xs ml-5">Validates the data flow path is reachable</p>
          {!reachabilityPassed && reachabilityReason && (
            <p className="text-muted-foreground text-xs ml-5 line-clamp-3 italic">{reachabilityReason}</p>
          )}
        </div>
      </div>
    );
  };

  const summarizeExplanation = (explanation: string) => {
    const matches = explanation.match(/line (\d+)/gi);
    const lastLine = matches?.[matches.length - 1];
    return lastLine ? `Potential ${getBugTypeLabel(type)} at ${lastLine}` : explanation;
  };

  const renderDetectionOutput = (event: StreamEvent) => {
    if (!event?.explanations?.length) return null;
    return (
      <div className="ml-7 mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md text-sm">
        <h4 className="font-medium mb-2">Detection Results:</h4>
        <p className="mb-2">Found {event.bug_count} potential bug(s)</p>
        <div className="space-y-2">
          {event.explanations.map((explanation, idx) => (
            <div key={idx} className="p-2 bg-background rounded border">
              {summarizeExplanation(explanation)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bug Detection Results</CardTitle>
        <CardDescription>Log of detected bugs and sanitization results</CardDescription>
      </CardHeader>
      <CardContent>
        {results.length > 0 ? (
          <div className="space-y-6">
            {results.map((result, index) => {
              const sanitizerStages = ["type_sanitize", "functionality_sanitize", "reachability_sanitize"];
              if (sanitizerStages.includes(result.stage)) {
                const hasTraceResult = results.slice(index + 1).some((e) => e.stage === "trace_result");
                if (hasTraceResult) return null;
              }

              const bugNumber = result.stage === "analyzing_trace"
                ? results.slice(0, index + 1).filter((e) => e.stage === "analyzing_trace").length
                : null;
              const label = bugNumber ? `Analyze Bug #${bugNumber}` : getStageLabel(result.stage);

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStageIcon(result)}
                      <span className="font-medium">{label}</span>
                      {result.stage === "detection" && (
                        <Badge variant="outline" className="ml-2">
                          {getBugTypeLabel(type)}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : ""}
                    </span>
                  </div>

                  {result.message && (
                    <p className="text-sm text-muted-foreground ml-7">{result.message}</p>
                  )}

                  {result.trace && renderTraceDetails(result.trace)}

                  {result.stage === "detection" && renderDetectionOutput(result)}

                  {result.stage === "trace_result" && (() => {
                    const funcEvent = results.slice(0, index).reverse().find((e) => e.stage === "functionality_sanitize");
                    return result.report && renderTraceResult(result.report, funcEvent?.result);
                  })()}

                  {result.reason?.wrong_flow_response && (
                    <div className="ml-7 mt-2 p-3 bg-destructive/5 rounded-md text-sm">
                      <h4 className="font-medium mb-2">Analysis Details:</h4>
                      <p className="whitespace-pre-line">{result.reason.wrong_flow_response}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {renderResultSummary()}
            {isAnalyzing && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-medium">Analyzing...</span>
                </div>
              </div>
            )}
          </div>
        ) : isAnalyzing ? (
          <Skeleton className="flex flex-col h-[300px]" />
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Code2 className="h-12 w-12 mb-4" />
            <p>No analysis results yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
