import React, { useState, useEffect, useRef } from 'react';
import './CSS/chat.css';
import send from './icons/send.svg';
import Cookies from 'js-cookie';


const Chat = () => {
  const [message, setMessage] = useState('');
  const [remainingChars, setRemainingChars] = useState(200);
  const [messages, setMessages] = useState([]);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const chatFeedRef = useRef(null);
  const settings = require("./PROJECT_CONFIG.json");

  useEffect(() => {
    fetch("http://localhost:3001/api/getMessages")
      .then((res) => res.json())
      // .then((res) => console.log(res))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch('http://localhost:3001/api/getMessages');
      if (response.ok) {
        const messages = await response.json();
        setMessages(messages);
      } else {
        console.error('Error fetching messages from server.');
      }
    };

    fetchMessages();
    const intervalId = setInterval(fetchMessages, settings.chat_refresh_interval);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const chatFeed = chatFeedRef.current;
    const handleScroll = () => {
      const isAtBottom = chatFeed.scrollHeight - chatFeed.scrollTop === chatFeed.clientHeight;
      setUserScrolledUp(!isAtBottom);
    };
    chatFeed.addEventListener('scroll', handleScroll);
    return () => chatFeed.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const chatFeed = chatFeedRef.current;
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const user = sessionStorage.getItem('user_nm');
    const user = Cookies.get('user_nm');

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = new Date().toLocaleDateString();
    const response = await fetch('http://localhost:3001/api/postMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, message, time, date }),
    });
    if (response.ok) {
      setMessage('');
      setRemainingChars(200);
      const newMessage = { user, message, time, date };
      setMessages([...messages, newMessage]);
    } else {
      console.error('Error sending message to server.');
    }      
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    setRemainingChars(200 - e.target.value.length);
  };

  return (
    <div className='chat'>
      <h4>Chat</h4>
      <div className={`chat-feed ${userScrolledUp ? 'chat-feed--scrolled-up' : ''}`} ref={chatFeedRef}>
        {messages.map((msg, index) => {
          const showDate = index === 0 || msg.date !== messages[index - 1].date;
          return (
            <div key={index}>
              {showDate && <div className='chat-date'>{msg.date}</div>}
              <div className='chat-message'>
                <span className='chat-user'>{msg.user}</span>
                <span className='chat-text'>{msg.message}</span>
                <span className='chat-time'>{msg.time}</span>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit}>
        <span>{remainingChars}</span>
        <div className='chat_input'>
          <input type='text' value={message} onChange={handleChange} maxLength={200} />
          <button type='submit'><img src={send} alt=""></img></button>
        </div>
      </form>
    </div>
  );
};

export default Chat;