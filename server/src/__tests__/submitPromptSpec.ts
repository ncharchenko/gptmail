import { getChatbotResponse } from '../routes/submitPrompt';

describe('getChatbotResponse', () => {
  it('should return a string', async () => {
    const prompt = 'Hello, world!';
    const response = await getChatbotResponse(prompt);
    expect(typeof response).toBe('string');
  });

  it('should throw an error if no prompt is provided', async () => {
    await expect(getChatbotResponse('')).rejects.toThrow('No prompt provided');
  });

  it('should return a response for a given prompt', async () => {
    const prompt = 'What is the meaning of life?';
    const response = await getChatbotResponse(prompt);
    expect(response).toBeTruthy();
  });
});