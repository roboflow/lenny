import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const App = () => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_KAPA_KEY;

  const sendIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  )

  //---------- add example prompts here
  const prompts = [
    "What is object detection?",
    "What is instance segmentation?",
    "Does YOLOv8 object detection take polygon annotations?",
    "Does Roboflow iOS deployment support classification models?",
    "What is the difference between instance segmentation and semantic segmentation?",
    "What is the difference between polygon vs bounding box?",
    "How does YOLOv8 work?"
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
    setQuery('')
  };

  const handleQuerySubmit = () => {
    setAnswer('');
    setError(null);
    fetchData();
  };


  return (
        <body>
            <header>
                <div id="hero">
                    <img src="https://roboflow-chat.vercel.app/lenny.svg" height="50" width="50" />
                    <h1>Ask Lenny about your computer vision project.</h1>
                    <p>Lenny is the power of GPT-4, plus <span style="color: #986bed;">500+ blog posts</span>, <span style="color: rgba(0,255,206);">100+ docs pages</span>, and Roboflow developer documentation.</p>
                </div>
            </header>
            <main>
                <ul>
                    <li><a href="#">What is object detection?</a></li>
                    <li><a href="#">Lenny!</a></li>
                    <li><a href="#">Does YOLOv8 object detection take polygon annotations?</a></li>
                    <li><a href="#">Does Roboflow iOS deployment support classification models?</a></li>
                    <li><a href="#">Instance vs semantic segmentation</a></li>
                    <li><a href="#">Polygon vs bounding box</a></li>
                    <li><a href="#">How does YOLOv8 work?</a></li>
                    <li><a href="#">What is object detection?</a></li>
                    <li><a href="#">What is object detection?</a></li>
                    <li><a href="#">How does YOLOv8 work?</a></li>
                    <li><a href="#">What is object detection?</a></li>
                    <li><a href="#">What is object detection?</a></li>
                </ul>
                <section class="overlay">
                    <div class="overlay-content">
                        <h1>Lenny</h1>
                        <p style="margin-bottom: 20px;">Find answers to questions about Roboflow and computer vision.</p>
                        <div id="chat">
                            <dl>
                                <dt>
                                    <p>What is object detection?</p>
                                </dt>
                                <dd>
                                    <p>Object detection is the task of identifying objects in an image and drawing a bounding box around them.</p>
                                </dd>
                            </dl>
                            <dl>
                                <dt>
                                    <p>What is object detection?</p>
                                </dt>
                                <dd>
                                    <p>Object detection is the task of identifying objects in an image and drawing a bounding box around them.</p>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </section>
                <footer>
                    <div class="footer-wrapper">
                        <form action="https://roboflow-chat.vercel.app/">
                            <input type="text" placeholder="Ask a question..." />
                            <p style="color: f7f7f7; font-size: 0.7em; text-align: center;;">Note: Lenny, powered by ChatGPT, is a beta product. It may produce inaccurate information.</p>
                        </form>
                        <svg height="50" style="margin-bottom: 15px" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"></path></svg>
                    </div>
                </footer>
            </main>
        </body>
  );
};

export default App;
