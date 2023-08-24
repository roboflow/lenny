import React, { useState, useEffect } from 'react';

const App = () => {
  const [relevantSources, setRelevantSources] = useState([]);
  const [answer, setAnswer] = useState('');
  const [identifiers, setIdentifiers] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_KAPA_KEY;

  const sendIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  )

  const personIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )

  //---------- add example prompts here
  const prompts = [
    "What is object detection?",
    "What is instance segmentation?"
  ]

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

        if (chunk.chunk.type === "relevant_sources") {
          setRelevantSources(chunk.chunk.content.relevant_sources);
        } else if (chunk.chunk.type === "partial_answer") {
          setAnswer((prevAnswer) => prevAnswer + chunk.chunk.content.text);
        } else if (chunk.chunk.type === "identifiers") {
          setIdentifiers(chunk.chunk.content);
        } else if (chunk.chunk.type === "error") {
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
    setRelevantSources('');
    setError(null);
    fetchData();
  };


  return (
    <div className='w-screen h-screen flex flex-col bg-[#18181a]'>
      {loading ? (
        <div className='flex-1 flex flex-col justify-center items-center'>
          <p className='text-[#fafafa]'>Gathering sources (~15 seconds)...</p>
        </div>
      ) : error ? (
        <div className='flex-1 flex flex-col justify-start items-center p-4'>
          <p className='text-[#fafafa]'>{error}</p>
        </div>
      ) : (
        <div className='flex-1 flex flex-col justify-start p-4 mx-[20%] my-[6%]'>
          {answer ?
            <><div className="flex flex-row gap-4 opacity-90">
              <h2 className='text-5xl text-[#fafafa]'>{personIcon}</h2>
              <p className='text-md text-[#fafafa]'>{answer}</p>
            </div>
              <div className='text-[#fafafa] mx-10 my-4'>
                <h2 className='opacity-50'>Relevant Sources:</h2>
                <ul>
                  {relevantSources.map((source, index) => (
                    <li className='text-[#717fe6] hover:opacity-60' key={index}>
                      <a href={source.source_url} target="_blank" rel="noopener noreferrer">
                        {source.source_url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div></> :
            <>
              <div className='bg-[#09090b] text-[#fafafa] p-10'>
                <p>Welcome to Roboflow Chatbot!</p>
                <p className='opacity-70'>This is an open source chatbot built with Next.js, Vercel and Kapa AI inspired by Vercel&apos;s AI Template.</p>
                <p className="my-4">You can start a conversation here or try the following examples:</p>
                {prompts.map((source, index) => (
                  <div className='hover:opacity-60' key={index}>
                    <div>- {source}</div>
                  </div>
                ))}
              </div>
            </>}
        </div>
      )}

      <div className="p-4 bg-[#09090b] w-[50%] mx-auto flex items-center justify-center">
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
