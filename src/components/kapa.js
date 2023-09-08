import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
// import Script from 'next/script';
import { processStream } from '../utils/stream';

const App = () => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasChosenPrompt, setHasChosenPrompt] = useState(false);
  const [displayedQuery, setDisplayedQuery] = useState(''); 
  const apiKey = process.env.NEXT_PUBLIC_KAPA_KEY;
  const [promptIndexes, setPromptIndexes] = useState([0, 1, 2, 3]);  // Initial indexes
  // const [activePrompts, setActivePrompts] = useState([0, 1, 2, 3]);

 
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
const [fadeClasses, setFadeClasses] = useState(new Array(prompts.length).fill('hidden'));
const [visiblePrompts, setVisiblePrompts] = useState(new Array(prompts.length).fill(null));


const candidates = [
  "What is object detection?",
  "What is instance segmentation?",
  "Does YOLOv8 object detection take polygon annotations?",
  "Does Roboflow iOS deployment support classification models?",
  "Instance vs semantic segmentation",
  "Polygon vs bounding box",
  "How does YOLOv8 work?",
  "What is object detection?"
];


const randomizePrompts = () => {
  const tempVisible = new Array(prompts.length).fill(null);
  const tempFadeClasses = new Array(prompts.length).fill('hidden');

  let count = 0;
  while (count < 4) {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    if (tempVisible[randomIndex] === null) {
      tempVisible[randomIndex] = prompts[randomIndex];
      tempFadeClasses[randomIndex] = 'fade-in';
      count++;
    }
  }
  setVisiblePrompts(tempVisible);
  setFadeClasses(tempFadeClasses);
};

const handlePromptFade = () => {
  const tempVisible = [...visiblePrompts];
  const tempFadeClasses = [...fadeClasses];

  // Find all currently visible prompts to hide
  const visibleIndexes = visiblePrompts.map((p, idx) => p !== null ? idx : -1).filter(idx => idx !== -1);
  for (const index of visibleIndexes) {
    tempVisible[index] = null;
    tempFadeClasses[index] = 'fade-out';
  }

  // Add 4 new random prompts
  let count = 0;
  while (count < 4) {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    let newPrompt;
    do {
      newPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    } while (tempVisible.includes(newPrompt) || visiblePrompts.includes(newPrompt));

    if (tempVisible[randomIndex] === null) {
      tempVisible[randomIndex] = newPrompt;
      tempFadeClasses[randomIndex] = 'fade-in';
      count++;
    }
  }

  setVisiblePrompts(tempVisible);
  setFadeClasses(tempFadeClasses);
};


useEffect(() => {
  randomizePrompts();

  const interval = setInterval(() => {
    handlePromptFade();
  }, 5000);

  return () => clearInterval(interval);
}, []);

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
        processStream(response, setAnswer, setError); 
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
    setDisplayedQuery(query); 
    fetchData();
  };

  return (
    <div>
      {/* <Script src="/script.js" /> */}
        <header>
            <div id="hero">
                <img src="https://roboflow-chat.vercel.app/lenny.svg" height="50" width="50" />
                <h1>Ask Lenny about your computer vision project.</h1>
                <p>Lenny is the power of GPT-4, plus <span className="callout-color-purple">500+ blog posts</span>, <span className="callout-color-blue">100+ docs pages</span>, and Roboflow developer documentation.</p>
            </div>
        </header>
        <main>
        <ul id="prompts">
        {visiblePrompts.map((prompt, index) => (
  <li key={index}>
    <a 
      href="#" 
      data-prompt={prompt || ''} 
      className={fadeClasses[index]}
      onClick={(e) => { 
        e.preventDefault(); 
        if (prompt) setQuery(prompt);
      }}
    >
      {prompt || ''}
    </a>
  </li>
))}
          </ul>

            {(hasChosenPrompt || answer) && (
                <section className="overlay overflow-y-scroll pb-[200px] mt-4">
                  <div className="overlay-content">
                  {loading && (
                    <div id="hero">
                      <img src="https://roboflow-chat.vercel.app/lenny.svg" height="50" width="50" />
                      <h1>Gathering sources to answer your question<span id="ellipsis">.</span></h1>
                    </div>
                  )}
                  {answer && (
                    <div>
                      <h2>{displayedQuery}</h2>
                      <ReactMarkdown allowDangerousHtml>{answer}</ReactMarkdown>
                    </div>
                  )}
                  </div>
                </section>
              )}
            <footer>
                <div className="footer-wrapper text-center">
                    <form action="https://roboflow-chat.vercel.app/" onSubmit={(e) => { e.preventDefault(); handleQuerySubmit(); }}>
                    <input type="text" placeholder="Ask a question..." value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />

                        <p class="disclaimer">Note: Lenny, powered by ChatGPT, is a beta product. It may produce inaccurate information.</p>
                    </form>
                    <svg height="50"  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6" onClick={handleQuerySubmit} style={{ cursor: 'pointer' }}><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"></path></svg>
                </div>
            </footer>
        </main>
      </div>
  );
};

export default App;