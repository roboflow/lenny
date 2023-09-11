import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { processStream } from '../utils/stream';
const PROMPT_COUNT = 4;

const App = () => {
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
    "How do I use Segment Anything to label images?",
];
  const apiKey = process.env.NEXT_PUBLIC_KAPA_KEY;
  const initialPromptsState = Array(prompts.length).fill(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasChosenPrompt, setHasChosenPrompt] = useState(false);
  const [displayedQuery, setDisplayedQuery] = useState('');
  const [activePrompts, setActivePrompts] = useState(initialPromptsState);


  useEffect(() => {
      setRandomPrompts();

      const interval = setInterval(setRandomPrompts, 5000);

      return () => clearInterval(interval);
  }, []);

  const setRandomPrompts = () => {
      const tempActive = [...initialPromptsState];
      let count = 0;
      
      while (count < PROMPT_COUNT) {
          const randomIndex = Math.floor(Math.random() * prompts.length);
          if (!tempActive[randomIndex]) {
              tempActive[randomIndex] = true;
              count++;
          }
      }
      
      setActivePrompts(tempActive);
  };

  const fetchData = async () => {
      setLoading(true);
      setHasChosenPrompt(true);

      try {
          const response = await fetch(`https://api.kapa.ai/query/v1/stream?query=${encodeURIComponent(query)}`, {
              method: 'GET',
              headers: { "X-API-TOKEN": apiKey }
          });

          if (response.ok) {
              processStream(response, setAnswer, setError);
          } else {
              setError(`Request failed with status code ${response.status}. Message: ${await response.text()}`);
          }
      } catch (error) {
          setError(`Request failed: ${error.message}`);
      }

      setLoading(false);
      setQuery('');
  };

  const handleQuerySubmit = () => {
      setAnswer('');
      setError(null);
      setDisplayedQuery(query);
      fetchData();
  };

 const icon = (
  <svg height="50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"></path>
  </svg>
 )
 const InlineLinkRenderer = ({ children, href }) => {
  return (
    <a href={href} style={{ textDecoration: 'underline' }}>
      {children}
    </a>
  );
};

  return (
    <div>
        <header>
            <div id="hero">
                <img src="https://roboflow-chat.vercel.app/lenny.svg" height="50" width="50" />
                <h1>Ask Lenny about your <br className="show_on_mobile" /> computer vision project.</h1>
                <p>Lenny is the power of GPT-4, plus <span className="callout-color-purple">500+ blog posts</span>, <span className="callout-color-blue">100+ docs pages</span>, and Roboflow developer documentation.</p>
            </div>
        </header>
        <main>
        <ul id="prompts">
          {prompts.map((prompt, index) => (
            <li key={index}>
              <a 
                href="#" 
                data-prompt={prompt} 
                className={activePrompts[index] ? 'active' : 'dormant'}
                onClick={(e) => { 
                  e.preventDefault(); 
                  setQuery(prompt);
                }}
              >
                {prompt}
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
                      <ReactMarkdown allowDangerousHtml renderers={{ link: InlineLinkRenderer }}>
                        {answer}
                      </ReactMarkdown>
                    </div>
                  )}
                  </div>
                </section>
              )}
            <footer>
                <div className="footer-wrapper text-center cursor-pointer">
                    <form action="https://roboflow-chat.vercel.app/" onSubmit={(e) => { e.preventDefault(); handleQuerySubmit(); }}>
                    <input type="text" placeholder="Ask a question..." value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
                        <p class="disclaimer">Note: Lenny, powered by ChatGPT, is a beta product. It may produce inaccurate information.</p>
                    </form>
                    <div className="flex flex-row gap-4" onClick={handleQuerySubmit}>Submit {icon}</div>
                </div>
            </footer>
        </main>
      </div>
  );
};

export default App;