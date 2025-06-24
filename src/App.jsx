import { useState } from "react";
import { generateFromGemini } from "./component/gemini";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [parsedResponse, setParsedResponse] = useState([]);

  const handleGenerate = async () => {
    try {
      const result = await generateFromGemini(prompt);
      setResponse(result);
      parseResponse(result);
    } catch (error) {
      setResponse("Error: " + error.message);
    }
  };

  const parseResponse = (text) => {
    const lines = text.split("\n");
    const elements = [];
    let isCodeBlock = false;
    let codeBuffer = [];
  
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
  
      // Toggle code block on ``` line
      if (trimmed.startsWith("```")) {
        if (!isCodeBlock) {
          isCodeBlock = true;
          codeBuffer = [];
        } else {
          isCodeBlock = false;
          elements.push(
            <pre key={`code-${idx}`} className="code-block">
              <code>{codeBuffer.join("\n")}</code>
            </pre>
          );
        }
        return;
      }
  
      if (isCodeBlock) {
        codeBuffer.push(line);
      } else if (/^#+\s/.test(trimmed)) {
        // Clean markdown-style heading
        const cleanText = trimmed.replace(/^#+\s*/, "");
        const level = Math.min(trimmed.match(/^#+/)[0].length, 6);
        const Heading = `h${level}`;
        elements.push(
          <Heading key={`heading-${idx}`} className="response-heading">
            {cleanText}
          </Heading>
        );
      } else if (trimmed) {
        // Remove backticks and asterisks
        const cleanLine = trimmed.replace(/[`*]/g, "");
        elements.push(
          <p key={`para-${idx}`} className="response-paragraph">
            {cleanLine}
          </p>
        );
      }
    });
  
    setParsedResponse(elements);
  };
  

  return (
    <div className="app-container">
      <h1 className="app-title">AI Code Generator</h1>

      <textarea
        className="prompt-input"
        placeholder="Describe what code you want (e.g., 'Create a login form in React')..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={6}
      />

      <button className="generate-button" onClick={handleGenerate}>
        Generate Code
      </button>

      <div className="response-body">
        {parsedResponse.length > 0 ? (
          parsedResponse
        ) : (
          <p className="placeholder-text">
            Enter a prompt above and click "Generate Code" to see the result here.
          </p>
        )}
      </div>
    </div>
  );
}

export default App;

