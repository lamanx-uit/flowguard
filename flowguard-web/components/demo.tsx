"use client";

import { Suspense, useState } from "react";
import { TabEditor } from "./tab-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { TabSanitized } from "./tab-sanitize";
import { TabResult } from "./tab-result";

export default function Demo() {
  const [activeTab, setActiveTab] = useState("editor");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("java");
  const [type, setType] = useState("dbz");
  const [model, setModel] = useState("gpt-4.1-mini");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [results, setResults] = useState([]);
  const [sanitizedCode, setSanitizedCode] = useState("");

  return (
    <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="editor">Code Analyzer</TabsTrigger>
        <TabsTrigger value="results">Results</TabsTrigger>
        <TabsTrigger value="sanitized">Sanitized</TabsTrigger>
      </TabsList>
      <TabsContent value="editor" className="mt-4">
        <TabEditor
          file={file}
          language={language}
          isAnalyzing={isAnalyzing}
          type={type}
          code={code}
          model={model}
          handleChangeLanguage={setLanguage}
          handleChangeResults={setResults}
          handleChangeFileName={setFileName}
          handleChangeSanitizedCode={setSanitizedCode}
          handleChangeActiveTab={setActiveTab}
          handleChangeCode={setCode}
          handleChangeIsAnalyzing={setIsAnalyzing}
          handleChangeFile={setFile}
          handleChangeType={setType}
          handleChangeModel={setModel}
        />
      </TabsContent>
      <TabsContent value="results" className="mt-4">
        <TabResult
          results={results}
          isAnalyzing={isAnalyzing}
          type={type}
          code={code}
          language={language}
          fileName={fileName}
          model={model}
          handleChangeActiveTab={setActiveTab}
          handleChangeSanitizedCode={setSanitizedCode}
        />
      </TabsContent>
      <TabsContent value="sanitized" className="mt-4">
        <Suspense>
          <TabSanitized fixResult={sanitizedCode} language={language} />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
