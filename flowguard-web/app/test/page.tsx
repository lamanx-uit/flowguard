import { CodeBlock } from "@/components/code-block";
import React from "react";

export default function Home() {
  return (
    <>
      <CodeBlock lang="java">
        {`
public class BuggyProgram {
public static double bar(int x, int y) { 
    if (x != 0) // [!code ++]
        return (y * 1.0 / x);   
    else                        
        return (x * 1.0 / y);    
}

public static void main(String args[]) {  // [!code --]
// public static void main(String arg[]) { // [!code highlight]
    int a = 0;                    
    int b = Integer.parseInt("123");   // [!code ++]
    // int b = parseInt("123");   // [!code --]
    if (a != 0)  // [!code ++]
        System.out.println(bar(b, a)); 
    else
        System.out.println("Division by zero avoided"); // [!code ++]
    String arg = args[0];         
    int c = Integer.parseInt(arg);  // [!code ++]
    // int c = parseInt(arg);       // [!code --]
    if (c != 0) // [!code ++]
        System.out.println(bar(a, c));
    else
        System.out.println("Division by zero avoided"); // [!code ++]
    c = b;                       
    if (c != 0) // [!code ++]
        System.out.println(bar(a, c)); 
    else
        System.out.println("Division by zero avoided"); // [!code ++]
}

}
            `}
      </CodeBlock>
    </>
  );
}