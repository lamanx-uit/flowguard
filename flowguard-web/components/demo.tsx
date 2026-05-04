"use client";

import { Suspense, useReducer } from "react";
import { TabEditor } from "./tab-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { TabFixed } from "./tab-sanitize";
import { TabResult } from "./tab-result";
import { FixResponse, StreamEvent } from "@/lib/types";

type DemoState = {
  activeTab: string;
  code: string;
  language: string;
  bugType: string;
  model: string;
  isAnalyzing: boolean;
  file: File | null;
  fileName: string;
  results: StreamEvent[];
  fixResult: FixResponse | null;
};

type DemoAction =
  | { type: "SET_TAB"; payload: string }
  | { type: "SET_CODE"; payload: string }
  | { type: "SET_LANGUAGE"; payload: string }
  | { type: "SET_BUG_TYPE"; payload: string }
  | { type: "SET_MODEL"; payload: string }
  | { type: "SET_ANALYZING"; payload: boolean }
  | { type: "SET_FILE"; payload: File | null }
  | { type: "SET_FILE_NAME"; payload: string }
  | { type: "RESET_RESULTS" }
  | { type: "APPEND_RESULT"; payload: StreamEvent }
  | { type: "SET_FIX_RESULT"; payload: FixResponse | null }
  | { type: "RESET" };

const initialState: DemoState = {
  activeTab: "editor",
  code: "",
  language: "java",
  bugType: "dbz",
  model: "gpt-4.1-mini",
  isAnalyzing: false,
  file: null,
  fileName: "",
  results: [],
  fixResult: null,
};

function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "SET_TAB":       return { ...state, activeTab: action.payload };
    case "SET_CODE":      return { ...state, code: action.payload };
    case "SET_LANGUAGE":  return { ...state, language: action.payload };
    case "SET_BUG_TYPE":  return { ...state, bugType: action.payload };
    case "SET_MODEL":     return { ...state, model: action.payload };
    case "SET_ANALYZING": return { ...state, isAnalyzing: action.payload };
    case "SET_FILE":      return { ...state, file: action.payload };
    case "SET_FILE_NAME": return { ...state, fileName: action.payload };
    case "RESET_RESULTS": return { ...state, results: [] };
    case "APPEND_RESULT": return { ...state, results: [...state.results, action.payload] };
    case "SET_FIX_RESULT":return { ...state, fixResult: action.payload };
    case "RESET":         return { ...initialState };
    default:              return state;
  }
}

export default function Demo() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <Tabs value={state.activeTab} className="w-full" onValueChange={(tab) => dispatch({ type: "SET_TAB", payload: tab })}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="editor">Code Analyzer</TabsTrigger>
        <TabsTrigger value="results">Results</TabsTrigger>
        <TabsTrigger value="fixed">Fixed Code</TabsTrigger>
      </TabsList>
      <TabsContent value="editor" className="mt-4">
        <TabEditor
          file={state.file}
          language={state.language}
          isAnalyzing={state.isAnalyzing}
          type={state.bugType}
          code={state.code}
          model={state.model}
          handleChangeLanguage={(v) => dispatch({ type: "SET_LANGUAGE", payload: v })}
          handleResetResults={() => dispatch({ type: "RESET_RESULTS" })}
          handleAppendResult={(r) => dispatch({ type: "APPEND_RESULT", payload: r })}
          handleChangeFileName={(v) => dispatch({ type: "SET_FILE_NAME", payload: v })}
          handleChangeFixResult={(v) => dispatch({ type: "SET_FIX_RESULT", payload: v })}
          handleChangeActiveTab={(v) => dispatch({ type: "SET_TAB", payload: v })}
          handleChangeCode={(v) => dispatch({ type: "SET_CODE", payload: v })}
          handleChangeIsAnalyzing={(v) => dispatch({ type: "SET_ANALYZING", payload: v })}
          handleChangeFile={(v) => dispatch({ type: "SET_FILE", payload: v })}
          handleChangeType={(v) => dispatch({ type: "SET_BUG_TYPE", payload: v })}
          handleChangeModel={(v) => dispatch({ type: "SET_MODEL", payload: v })}
          handleReset={() => dispatch({ type: "RESET" })}
        />
      </TabsContent>
      <TabsContent value="results" className="mt-4">
        <TabResult
          results={state.results}
          isAnalyzing={state.isAnalyzing}
          type={state.bugType}
          code={state.code}
          language={state.language}
          model={state.model}
          handleChangeActiveTab={(v) => dispatch({ type: "SET_TAB", payload: v })}
          handleChangeFixResult={(v) => dispatch({ type: "SET_FIX_RESULT", payload: v })}
        />
      </TabsContent>
      <TabsContent value="fixed" className="mt-4">
        <Suspense>
          <TabFixed fixResult={state.fixResult} language={state.language} />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
