// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const generateAction = async (req: NextApiRequest, res: NextApiResponse) => {
  // const input = req.body.exampleOne;
  // const input2 = req.body.exampleTwo;
  console.log('Here');
  const prURL = req.body.prURL;
  console.log(prURL);
  //console.log('### input2 =', input2);

  // fetch the PR using provided URL
  // Do request
  let diffContent = '';

  try {
    const response = await fetch(prURL, {
      method: 'GET',
      headers: {},
    });

    const data = await response.text();
    console.log(`API Response: ${data}`);
    diffContent = data;
  } catch (error) {
    console.log(error);
    return;
  }

  // !STARTERCONF - change the following prompt based on your own use case
  const prompt = `Here is a github diff. Can you summerize the changes.

  Do not include references to the numer of insertions and deletions.
  Do not include any reference to the number of lines that have been added or removed in the summary.

  Make sure to identify any renamed or moved components/files.

  Each changed file in the diff should output a seperate paragraph/summary.
  
  Diff: ${diffContent}
  `;

  console.log(`Prompt being sent to OpenAI: ${prompt}`);

  try {
    const baseCompletion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${prompt}`,
      temperature: process.env.MODEL_TEMPERATURE
        ? parseFloat(process.env.MODEL_TEMPERATURE)
        : 0.7,
      max_tokens: process.env.NUM_MAX_TOKENS
        ? parseInt(process.env.NUM_MAX_TOKENS)
        : 250,
    });

    const basePromptOutput = baseCompletion.data.choices.pop();
    console.log('\nSending response back to client 🚀');
    res.status(200).json({ output: basePromptOutput });
  } catch (err) {
    console.log(`Error occurred on the API side: ${err}`);
    res.status(500).json({ error: err });
  }
};

export default generateAction;
