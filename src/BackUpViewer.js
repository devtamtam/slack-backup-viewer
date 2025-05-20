/*
 * ChatViewer.js
 * Make sure to copy your entire "Backup" folder (with its subdirectories) into the project's public/ directory:
 *
 *  my-react-app/
 *  ├─ public/
 *  │   └─ Backup/
 *  │       └─ 2025/
 *  │           └─ 05/
 *  │               └─ 19/
 *  │                   └─ GAN_2025may.png
 *  └─ src/
 *      └─ ChatViewer.js
 *
 * This ensures that URLs like "/Backup/2025/05/19/GAN_2025may.png" are served by CRA's dev server.
 */
import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import './index.css';

// Normalize a Windows local_path into a URL-relative path
const getFilePath = (local_path) => {
  if (!local_path) return null;
  // Replace backslashes with forward slashes and strip any leading drive letter
  return local_path.replace(/\\/g, '/').replace(/^[A-Za-z]:/, '');
};

// Generate a consistent avatar color based on user ID or name
const getAvatarColor = (userId) => {
  // Simple hash function to get a number from a string
  const hash = userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  // List of pleasant bubble colors
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFBE0B', 
    '#FB5607', '#8338EC', '#3A86FF', '#38B000',
    '#9381FF', '#F72585', '#7209B7', '#4361EE'
  ];
  
  return colors[hash % colors.length];
};

// Get initials from a username or ID
const getInitials = (name) => {
  if (!name) return '?';
  
  // If it's likely a user ID (contains numbers), just take the last 2 chars
  if (/\d/.test(name)) {
    return name.slice(-2);
  }
  
  // Otherwise try to get initials from a name
  const parts = name.split(/[\s._-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export default function ChatViewer() {
  const [messages, setMessages] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle JSON file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Sort messages by timestamp
      const sortedData = [...data].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      // Set the current user as the user who sent the most messages
      const userCounts = sortedData.reduce((acc, msg) => {
        acc[msg.user] = (acc[msg.user] || 0) + 1;
        return acc;
      }, {});
      
      const mostFrequentUser = Object.entries(userCounts)
        .sort((a, b) => b[1] - a[1])[0][0];
      
      setCurrentUser(mostFrequentUser);
      setMessages(sortedData);
      
      // Extract unique dates for the date headers
      processMessageDates(sortedData);
    } catch (err) {
      console.error('Invalid JSON:', err);
      alert('Error processing the file. Please make sure it\'s a valid JSON chat export.');
    }
  };

  // Group messages by date for showing date separators
  const processMessageDates = (msgs) => {
    if (!msgs.length) return msgs;
    
    // Add a display date property to each message
    msgs.forEach(msg => {
      msg.displayDate = format(new Date(msg.timestamp), 'MMMM d, yyyy');
    });
  };

  // Render attachments based on mimetype
  const renderAttachment = (file) => {
    const { local_path, name, mimetype, id } = file;
    const filePath = getFilePath(local_path);
    if (!filePath) return null;
    
    // All files are served from public/ at the web root
    const url = `/${filePath}`;
    
    if (mimetype.startsWith('image/')) {
      return (
        <div key={id} className="message-attachment image-attachment">
          <img src={url} alt={name} onClick={() => window.open(url, '_blank')} />
          <span className="attachment-name">{name}</span>
        </div>
      );
    }
    
    if (mimetype.startsWith('video/')) {
      return (
        <div key={id} className="message-attachment video-attachment">
          <video controls>
            <source src={url} type={mimetype} />
            Your browser does not support video playback.
          </video>
          <span className="attachment-name">{name}</span>
        </div>
      );
    }
    
    return (
      <div key={id} className="message-attachment file-attachment">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <div className="file-icon">📄</div>
          <span className="attachment-name">{name}</span>
        </a>
      </div>
    );
  };

  const renderMessages = () => {
    if (!messages.length) return null;
    
    let currentDate = null;
    let prevSender = null;
    
    return messages.map((msg, idx) => {
      const isCurrentUser = msg.user === currentUser;
      const showDateHeader = msg.displayDate !== currentDate;
      const isSameSender = msg.user === prevSender;
      
      // Update tracking variables
      currentDate = msg.displayDate;
      prevSender = msg.user;
      
      return (
        <React.Fragment key={idx}>
          {showDateHeader && (
            <div className="date-separator">
              <span>{msg.displayDate}</span>
            </div>
          )}
          
          <div className={`message-container ${isCurrentUser ? 'sent' : 'received'} ${isSameSender ? 'same-sender' : ''}`}>
            {!isCurrentUser && !isSameSender && (
              <div 
                className="avatar"
                style={{ backgroundColor: getAvatarColor(msg.user) }}
              >
                {getInitials(userMap[msg.user] || msg.user)}
              </div>
            )}
            
            <div className="message-content-wrapper">
              {!isCurrentUser && !isSameSender && (
                <div className="sender-name">
                  {userMap[msg.user] || `User ${getInitials(msg.user)}`}
                </div>
              )}
              
              <div className="message-bubble">
                <div className="message-text">{msg.text}</div>
                {msg.files && msg.files.length > 0 && (
                  <div className="attachments-container">
                    {msg.files.map(renderAttachment)}
                  </div>
                )}
                <div className="message-time">
                  {format(new Date(msg.timestamp), 'h:mm a')}
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  return (
    <div className="chat-app">
      <div className="chat-header">
        <h1>Chat History</h1>
        <div className="file-upload-wrapper">
          <label htmlFor="upload" className="upload-button">
            Load Chat Backup
          </label>
          <input
            id="upload"
            type="file"
            accept="application/json"
            onChange={handleFileUpload}
            className="file-input"
          />
        </div>
      </div>
      
      <div className="chat-container">
        {messages.length > 0 ? (
          <div className="messages-list">
            {renderMessages()}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>Upload a chat backup JSON file to view messages</p>
            <p className="note">
              Attachments must be in <code>public/Backup/...</code> directory
            </p>
          </div>
        )}
      </div>
    </div>
  );
}