import React from 'react';
import Kapa from '../components/kapa';
import Head from 'next/head';

const HomePage = () => {
  return (
    <div>
      <Head>
        <meta charset="utf-8" />

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        <title>Lenny: Computer vision help, powered by GPT-4</title>

        <meta name="description" content="Lenny is the power of GPT-4, plus 500+ blog posts, 100+ docs pages, and Roboflow developer documentation." />

        <meta content="https://assets-global.website-files.com/5f6bc60e665f54545a1e52a5/642746dba53a59a614a64b35_roboflow-open-graph.png" property="og:image" />

        <meta name="twitter:card" content="summary_large_image" />
        
        <link rel="icon" href="/lenny.svg" />
        <link rel="manifest" href="/manifest.json" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />

        <link rel="apple-touch-startup-image" href="/lenny.svg" />
      </Head>
      <Kapa />
    </div>
  );
}

export default HomePage;
