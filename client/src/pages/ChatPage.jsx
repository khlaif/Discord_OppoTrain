import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Chat/Sidebar';
import ChatArea from '../components/Chat/ChatArea';

export default function ChatPage() {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);

  useEffect(() => {
    axios.get('/channels').then(({ data }) => {
      setChannels(data);
      if (data.length > 0) setActiveChannel(data[0]);
    });
  }, []);

  const handleChannelCreated = (channel) => {
    setChannels((prev) => [...prev, channel]);
    setActiveChannel(channel);
  };

  return (
    <div className="app-layout">
      <Sidebar
        channels={channels}
        activeChannel={activeChannel}
        onSelectChannel={setActiveChannel}
        onChannelCreated={handleChannelCreated}
      />
      <main className="main-content">
        <ChatArea channel={activeChannel} />
      </main>
    </div>
  );
}
