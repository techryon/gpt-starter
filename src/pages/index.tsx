import { useEffect, useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';

import useLocalStorage from '@/hooks/useLocalStorage';

import Button from '@/components/buttons/Button';
import Layout from '@/components/layout/Layout';
import Seo from '@/components/Seo';

// !STARTERCONF -> Select !STARTERCONF and CMD + SHIFT + F
// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.

type URLPath = {
  owner: string;
  repo: string;
  pullNumber: string;
};

export default function HomePage() {
  //commenting the below which stores values from the two text boxes
  // const [exampleOne, setExampleOne] = useLocalStorage<string>('exampleOne', '');
  // const [exampleTwo, setExampleTwo] = useLocalStorage<string>('exampleTwo', '');

  //new state value for the new text field to take the URL
  const [prURL, setPRURL] = useLocalStorage<string>('prURL', '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiOutput, setApiOutput] = useLocalStorage<string>('apiOutput', '');
  const [mounted, setMounted] = useState(false);
  const [prData, setPRData] = useState({});

  const [isFetchingPR, setIsFetchingPR] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Example URL https://github.com/techryon/gpt-starter/pull/1
  // TODO: Handle broken links
  function parseGithubURL(url: string): URLPath | undefined {
    if (!url) {
      return;
    }
    console.log('## parseGithubURL: ', url);
    const parsedURL = new URL(url);
    const path = parsedURL.pathname;

    const paths = path.split('/').filter(Boolean);
    const [owner, repo, _, pullNumber] = paths;

    return { owner, repo, pullNumber };
  }

  async function fetchGithubPR(path: URLPath) {
    setIsFetchingPR(true);
    const url = `https://api.github.com/repos/${path.owner}/${path.repo}/pulls/${path.pullNumber}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      const { title, state, patch_url } = data;
      setPRData({ title, state, patch_url });
      console.log(`fetchGithubPR Response: ${JSON.stringify(data)}`);
    } catch {
      console.log('fetchGithubPR ERROR');
    } finally {
      setIsFetchingPR(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const githubPath = parseGithubURL(prURL);

      if (githubPath) {
        fetchGithubPR(githubPath);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [prURL]);

  const patchUrl = prData.patch_url;

  const callGenerateEndpoint = async () => {
    // Set loading flag
    setIsGenerating(true);

    console.log('Calling API with input:', prURL);

    // Do request
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prURL: patchUrl,
        }),
      });

      const data = await response.json();
      console.log(`API Response: ${JSON.stringify(data)}`);
      if (data.output) {
        const { output } = data;
        console.log(`API: ${output.text}`);

        setApiOutput(`${output.text}`);
      } else if (data.error) {
        console.error(`API Error: ${data.error}`);
        alert(
          'Uh oh... something has gone wrong behind the scenes so please try again later.'
        );
      }
    } catch (err) {
      console.error(`An error occurred: ${err}`);
      alert(
        'Uh oh... something has gone wrong behind the scenes so please try again later.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const formatOutput = (output: string) => {
    return output
      .trim()
      .split('\n')
      .map((item, key) => {
        return (
          <p key={key} className='py-2'>
            {item}
          </p>
        );
      });
  };

  const displayAlert = () => {
    alert('This is an alert... Ahhh!!!');
  };

  return (
    <Layout>
      {/* <Seo templateTitle='Home' /> */}
      <Seo />

      <main>
        <section className='bg-dark'>
          <div className='layout relative flex min-h-screen flex-col items-center py-12 text-center text-white'>
            <h1 className='mt-4'>Code difference summarizer</h1>
            <p className='mt-2 text-sm text-gray-300'>
              Paste a Github pull request url and see what's changed{' '}
            </p>
            {/* <p className='mt-2 text-sm text-gray-300'>
              Paste in two code blocks and see whats changed{' '}
            </p> */}
            {/*commented the existing text boxes*/}
            {/* <div className='w-full'>
              <textarea
                rows={4}
                placeholder='Enter code block here...'
                className='mt-6 w-4/5 rounded-md border-orange-500 bg-dark text-gray-300 focus:border-orange-500 focus:ring-orange-500'
                value={exampleOne}
                onChange={(event) => setExampleOne(event.target.value)}
              />
              <textarea
                rows={4}
                placeholder='Enter your changed code block here...'
                className='mt-6 w-4/5 rounded-md border-orange-500 bg-dark text-gray-300 focus:border-orange-500 focus:ring-orange-500'
                value={exampleTwo}
                onChange={(event) => setExampleTwo(event.target.value)}
              />
            </div> */}
            <div className='flex w-full flex-row items-center justify-center'>
              <input
                className='mt-6 w-4/5 rounded-md border-orange-500 bg-dark text-gray-300 focus:border-orange-500 focus:ring-orange-500'
                type='url'
                placeholder='e.g. https://github.com/techryon/gpt-starter/pull/1'
                value={prURL}
                onChange={(event) => setPRURL(event.target.value)}
              />
              {isFetchingPR && (
                <div
                  className='mt-6 -ml-8'
                  // className={clsxm(
                  //   'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                  // )}
                >
                  <ImSpinner2 className='animate-spin' />
                </div>
              )}
              {/* <textarea
                rows={1}
                placeholder='Paste your PR URL here... e.g. https://github.com/techryon/gpt-starter/pull/1'
                className='mt-6 w-4/5 rounded-md border-orange-500 bg-dark text-gray-300 focus:border-orange-500 focus:ring-orange-500'
                value={prURL}
                onChange={(event) => setPRURL(event.target.value)}
              /> */}
            </div>
            <Button
              className='mt-4'
              isLoading={isGenerating}
              onClick={() => callGenerateEndpoint()}
              variant='outline'
              isDarkBg={true}
            >
              Genterate summary ✨
            </Button>
            <Button
              className='mt-4'
              onClick={() => displayAlert()}
              variant='outline'
              isDarkBg={true}
            >
              Alert 🚨
            </Button>

            {mounted && apiOutput && (
              <div className='mt-8'>
                <h2>Output</h2>
                <div className='mt-2 text-gray-300'>
                  {formatOutput(apiOutput)}
                </div>
              </div>
            )}

            <footer className='absolute bottom-2 text-gray-200'>
              © {new Date().getFullYear()}
            </footer>
          </div>
        </section>
      </main>
    </Layout>
  );
}
