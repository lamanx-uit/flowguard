import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "./ui/card";
import Link from "next/link";
import { CodeBlock } from "./code-block";

export function MarketingSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Flowguard: Sanitizing LLMs in Bug Detection
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Improve your code quality with our advanced bug detection tool
                that uses data-flow techniques to sanitize large language model
                outputs.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[640px]:flex-row">
              <Button size="lg" className="gap-1" asChild>
                <Link href="#demo">
                  Try Demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link
                  href="https://chengpeng-wang.github.io/publications/LLMSAN_EMNLP2024.pdf"
                  target="_blank"
                >
                  Read Paper
                </Link>
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Multiple Language Support</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Open Source</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">EMNLP 2024</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Card className="relative overflow-hidden rounded-lg border-2 border-primary/20 transition-all duration-300 hover:border-primary/50 hover:shadow-lg group hidden sm:block">
              <div className="overflow-hidden font-mono text-xs xl:text-sm">
                <div className="text-xs xl:text-base">
                  <CodeBlock lang="java">
                    {`public void processData(String input) {
  if (input == null) {
    return;
  }
  
  String[] parts = input.split(",");
  
  // Potential bug: array index out of bounds
  String firstPart = parts[0];
  String lastPart = parts[parts.length - 1];
  
  int value = Integer.parseInt(lastPart);
  
  // Potential bug: divide by zero
  int result = 100 / value;
  
  System.out.println("Result: " + result);
}`}
                  </CodeBlock>
                </div>
                <div className="absolute inset-0 bg-background/85 flex flex-col items-center justify-center p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="text-center space-y-4">
                    <p className="font-semibold text-xl">Flowguard Detected:</p>
                    <ul className="text-left font-semibold space-y-2">
                      <li className="text-red-500">
                        • Line 9: Potential ArrayIndexOutOfBoundsException
                      </li>
                      <li className="text-red-500">
                        • Line 13: Potential DivideByZeroException
                      </li>
                      <li className="text-amber-500">
                        • Line 11: Potential NumberFormatException
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}