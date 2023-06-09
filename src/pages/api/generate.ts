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
  const prURL = req.body.prURL;
  console.log(prURL);
  //console.log('### input2 =', input2);

  // fetch the PR using provided URL
  // Do request
  try {
    const response = await fetch(prURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(response);
    const data = await response.text();
    console.log(`API Response: ${data}`);
  } catch (error) {
    console.log(error);
    return;
  }

  // !STARTERCONF - change the following prompt based on your own use case
  const prompt = `Below are two React code examples. Summarize the changes in example 2 in 2 sentences. Example 1:${input} Example 2:${input2}`;

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
