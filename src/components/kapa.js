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
    "How does YOLOv8 work?",
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
    <div className='w-screen h-screen flex flex-col bg-neutral-900'>
      {loading ? (
        <div className='flex-1 flex flex-col justify-center items-center'>
          <p className='text-[#fafafa]'>Gathering sources (~15 seconds)...</p>
        </div>
      ) : error ? (
        <div className='flex-1 flex flex-col justify-start items-center p-4'>
          <p className='text-[#fafafa]'>{error}</p>
        </div>
      ) : (
        <div className='flex-1 flex flex-col justify-start p-4 mx-[20%] mt-[4%]'>
          {answer ?
            <><div className="flex flex-row gap-4 opacity-90">
            <img className='w-12 h-12' src="/lenny.svg"></img>
            <ReactMarkdown className='text-md text-[#fafafa]' allowDangerousHtml>{answer}</ReactMarkdown>
          </div>
              </> :
            <>
              <div className='bg-[#09090b] p-10 text-violet-400'>
                <div className="flex flex-row gap-4 my-4 items-center">
                <img className='w-14 h-14' src="/lenny.svg"></img><p>Welcome to Roboflow Chatbot!</p></div>
                <p className='opacity-70'>This is an open source chatbot built with Next.js, Vercel and Kapa AI inspired by Vercel&apos;s AI Template.</p>
                <p className="my-4">You can ask questions or try the following examples:</p>
              </div>
              <div className='ticker-container absolute'>
              {prompts.map((source, index) => (
                <div key={index} className={`ticker ${index % 2 === 0 ? 'ticker-speed1 left-to-right' : 'ticker-speed2 right-to-left'}`}>
                  <div className={`ticker-content cursor-pointer text-neutral-400`} onClick={() => setQuery(source)}>
                    {source}
                  </div>
                </div>
              ))}
            </div>
            </>}
        </div>
      )}
      <div className="p-4 bg-[#09090b] w-[50%] mx-auto flex items-center justify-center absolute bottom-0 left-1/2 transform -translate-x-1/2">
      <form className="flex w-full" onSubmit={(e) => { e.preventDefault(); handleQuerySubmit(); }}>
          <input
              className='w-full p-2 rounded p-6 h-[60px] text-md text-[#fafafa] opacity-80 focus:outline-none bg-transparent border border-white/10'
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Lenny"
              autoFocus
          />
          <button className='mt-2 text-[#fafafa] p-2 rounded hover:opacity-50 opacity-80' type="submit">{sendIcon}</button>
      </form>
    </div>
    </div>
  );
};

export default App;
