import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Script from 'next/script';

const App = () => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasChosenPrompt, setHasChosenPrompt] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_KAPA_KEY;

  const sendIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  )

  //---------- add example prompts here
  const prompts = [
    "What are the best practices for labeling data?",
    "How do I filter detection results with supervision?",
    "When should I use object detection vs instance segmentation?",
    "How do I use autodistill to autolabel images?",
    "How do I deploy to an NVIDIA Jetson?",
    "What is CLIP?",
    "Write code to count the number of objects my model sees from its predictions.",
    "Where is my Roboflow API key?",
    "When should I use the cloud API vs deploy to the edge?",
    "What augmentations are best for aerial images?",
    "How do I detect small objects?",
    "How do I use Segment Anything to label images?"
];
  

  const process_stream = async (response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    const delimiter = "\u241E";
    const delimiterBytes = new TextEncoder().encode(delimiter);
    let buffer = new Uint8Array();

    const findDelimiterIndex = (arr) => {
      for (let i = 0; i < arr.length - delimiterBytes.length + 1; i++) {
        let found = true;
        for (let j = 0; j < delimiterBytes.length; j++) {
          if (arr[i + j] !== delimiterBytes[j]) {
            found = false;
            break;
          }
        }
        if (found) {
          return i;
        }
      }
      return -1;
    };

    let result;
    while (true) {
      result = await reader.read();
      if (result.done) break;
      buffer = new Uint8Array([...buffer, ...result.value]);
      let delimiterIndex;
      while ((delimiterIndex = findDelimiterIndex(buffer)) !== -1) {
        const chunkBytes = buffer.slice(0, delimiterIndex);
        const chunkText = decoder.decode(chunkBytes);
        buffer = buffer.slice(delimiterIndex + delimiterBytes.length);
        let chunk = JSON.parse(chunkText);

        if (chunk.chunk.type === "partial_answer") {
          setAnswer((prevAnswer) => prevAnswer + chunk.chunk.content.text);
        }  else if (chunk.chunk.type === "error") {
          setError(chunk.chunk.content.reason);
          break;;
        }
      }
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setHasChosenPrompt(true);

    try {
      const response = await fetch(`https://api.kapa.ai/query/v1/stream?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          "X-API-TOKEN": apiKey,
        }
      });

      if (response.status === 200) {
        process_stream(response);
      } else {
        const message = await response.text();
        setError(`Request failed with status code ${response.status}. Message: ${message}`);
      }
    } catch (error) {
      setError(`Request failed: ${error.message}`);
    }
    setLoading(false);
    // setQuery('')
  };

  const handleQuerySubmit = () => {
    setAnswer('');
    setError(null);
    fetchData();
  };

  return (
    <div>
      <Script src="/script.js" />
        <header>
            <div id="hero">
                <img src="https://roboflow-chat.vercel.app/lenny.svg" height="50" width="50" />
                <h1>Ask Lenny about your computer vision project.</h1>
                <p>Lenny is the power of GPT-4, plus <span className="callout-color-purple">500+ blog posts</span>, <span className="callout-color-blue">100+ docs pages</span>, and Roboflow developer documentation.</p>
            </div>
        </header>
        <main>
            <ul id="prompts">
                {prompts.map((prompt, index) => (
                    <li key={index} className={ index > 4 ? 'hide-on-mobile' : '' }><a href="#" onClick={() => { setQuery(prompt); }}>{prompt}</a></li>
                ))}
            </ul>
            {(hasChosenPrompt || answer) && (
              <section className="overlay">
                  <div className="overlay-content">
                  {loading && (
                      <div id="hero">
                          <img src="https://roboflow-chat.vercel.app/lenny.svg" height="50" width="50" />
                          <h1>Gathering sources to answer your question<span id="ellipsis">.</span></h1>
                      </div>
                  )}
                  {answer && (
                    <div>
                      <h2>{query}</h2>
                      <ReactMarkdown allowDangerousHtml>{answer}</ReactMarkdown>
                    </div>
                  )}
                  </div>
                </section>
            )}
            <footer>
                <div className="footer-wrapper">
                    <form action="https://roboflow-chat.vercel.app/" onSubmit={(e) => { e.preventDefault(); handleQuerySubmit(); }}>
                        <input type="text" placeholder="Ask a question..." value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
                        <p class="disclaimer">Note: Lenny, powered by ChatGPT, is a beta product. It may produce inaccurate information.</p>
                    </form>
                    <svg height="50"  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"></path></svg>
                </div>
            </footer>
        </main>
      </div>
  );
};

export default App;
