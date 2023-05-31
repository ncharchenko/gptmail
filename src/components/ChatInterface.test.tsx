// ChatInterface.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ChatInterface from './ChatInterface';

jest.mock('axios'); // mock axios module

describe('ChatInterface component', () => {
  // test rendering of the component
  test('renders the chat interface', () => {
    render(<ChatInterface />);
    expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  // test user input and submit
  test('handles user input and submit', async () => {
    render(<ChatInterface />);
    const input = screen.getByPlaceholderText('Type your message here...');
    const button = screen.getByText('Send');
    fireEvent.change(input, { target: { value: 'Hello' } }); // simulate user typing
    expect(input).toHaveValue('Hello');
    fireEvent.click(button); // simulate user clicking send button
    expect(input).toHaveValue(''); // input should be cleared
    await waitFor(() => screen.getByText('Hello')); // wait for user message to appear
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

    // test axios post request and response
  test('sends prompt and receives response', async () => {
    // mock axios post request and response
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: { text: 'Hi there' },
    });

    render(<ChatInterface />);
    const input = screen.getByPlaceholderText('Type your message here...');
    const button = screen.getByText('Send');
    
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(button);

    // Make sure the message sent by the user is displayed
    await waitFor(() => screen.getByText('Hello'));
    
    // Wait for axios to resolve and the component to re-render with the new message
    await waitFor(() => screen.findByText(/Hi there/));
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

});
