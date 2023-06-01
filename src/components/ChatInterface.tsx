import React, { useState } from 'react';
import { Box, List, ListItem, TextField, Button } from '@mui/material';
import axios from 'axios';


interface Message {
    text: string;
    isUser: boolean;
}

function ChatInterface() {
    const [chatHistory, setChatHistory] = useState(new Array<Message>());
    const [userInput, setUserInput] = useState('');

    const handleUserInput = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const input = userInput.trim();
        const prevInput = userInput;
        if (input) {
            setChatHistory([...chatHistory, { text: userInput, isUser: true }]);
            setUserInput('');
            const answer: string | undefined = await sendPromptAndReceiveResponse(input);
            if (answer) {
                setChatHistory([...chatHistory, { text: prevInput, isUser: true }, { text: answer, isUser: false }]);
            }
        }
    };

    const sendPromptAndReceiveResponse = async (prompt: string) => {
        try {
            const res = await axios.post("http://localhost:8080/submitPrompt",
                { prompt },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            const answer: string = res.data;
            return answer;
        } catch (err: any) {
            console.error(err.message, err.stack);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                {chatHistory.map((message: Message, index) => (
                    <ListItem key={index} sx={{ justifyContent: message.isUser ? 'flex-end' : 'flex-start', whiteSpace: 'pre-wrap' }}>
                        <Box
                            sx={{
                                p: 1,
                                borderRadius: 1,
                                backgroundColor: message.isUser ? '#e0e0e0' : '#f5f5f5',
                            }}
                        >
                            {message.text}
                        </Box>
                    </ListItem>
                ))}
            </List>
            <form onSubmit={handleUserInput}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        value={userInput}
                        onChange={(event) => setUserInput(event.target.value)}
                        placeholder="Type your message here..."
                    />
                    <Button type="submit" variant="contained" disabled={!userInput.trim()} sx={{ ml: 1 }}>
                        Send
                    </Button>
                </Box>
            </form>
        </Box>
    );
}

export default React.memo(ChatInterface);