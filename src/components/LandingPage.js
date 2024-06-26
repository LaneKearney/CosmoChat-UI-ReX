import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate('/chat');
  };

  return (
    <div>
      <h1>Welcome to Our Chat App</h1>
      <p>Get started by clicking the button below:</p>
      <button onClick={handleStartChat}>Start Chat</button>
    </div>
  );
};

export default LandingPage;