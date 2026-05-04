"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

export function TabEditor({
  file,
  code,
  isAnalyzing,
  language,
  model,
  type,
  handleChangeResults,
  handleChangeCode,
  handleChangeLanguage,
  handleChangeModel,
  handleChangeFile,
  handleChangeActiveTab,
  handleChangeType,
  handleChangeIsAnalyzing,
  handleChangeFileName,
  handleChangeSanitizedCode,
}: any) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleChangeFile(selectedFile);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleChangeCode(event.target.result as string);
        }
      };
      reader.readAsText(selectedFile);
    }
    
    handleChangeResults([]);
    handleChangeSanitizedCode("");
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (isAnalyzing || !code.trim()) return;

    handleChangeIsAnalyzing(true);
    handleChangeResults([]);
    handleChangeActiveTab("results");

    try {
      const form = new FormData();

      if (file) {
        form.append("file", file);
        handleChangeFileName(file.name.split(".")[0]);
      } else {
        const blob = new Blob([code], { type: "text/plain" });
        form.append("file", blob, `snippet.${language}`);
        handleChangeFileName("snippet");
      }

      const res = await fetch(
        `/api/analysis?model_name=${model}&bug_type=${type}`,
        {
          method: "POST",
          body: form,
        }
      );

      if (!res.ok || !res.body) {
        throw new Error("Failed to start analysis");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            const json = JSON.parse(line);
            handleChangeResults((prev: any) => [
              ...prev,
              { ...json, timestamp: Date.now() },
            ]);
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      handleChangeIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Code Analyzer</CardTitle>
        <CardDescription>
          Paste your code or use an example to analyze for potential bugs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex md:items-center gap-4 flex-col items-start md:flex-row">
            <Select value={language} onValueChange={handleChangeLanguage}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="java">Java</SelectItem>
              </SelectContent>
            </Select>
            <Select value={model} onValueChange={handleChangeModel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4.1-mini">GPT-4.1 mini</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o mini</SelectItem>
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={handleChangeType}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dbz">Divide_by_Zero</SelectItem>
                <SelectItem value="npd">NULL_Pointer_Dereference</SelectItem>
                <SelectItem value="xss">XSS</SelectItem>
                <SelectItem value="ci">OS_Command_Injection</SelectItem>
                <SelectItem value="apt">Absolute_Path_Traversal</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleFileUploadClick}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload File
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".java,.py,.js,.ts,.cs,.txt"
              onChange={handleFileChange}
            />
          </div>
          <Textarea
            value={code}
            onChange={(e) => handleChangeCode(e.target.value)}
            placeholder="Paste your code here..."
            className="font-mono min-h-[300px]"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            handleChangeCode("");
            handleChangeResults([]);
            handleChangeFile(null);
            handleChangeFileName("snippet");
            handleChangeSanitizedCode("");
            handleChangeActiveTab("editor");
            handleChangeIsAnalyzing(false);
          }}
        >
          Clear
        </Button>
        <Button disabled={isAnalyzing || !code.trim()} onClick={handleAnalyze}>
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Code"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}