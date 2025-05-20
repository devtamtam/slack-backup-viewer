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

import React, { useState } from 'react';
import { format } from 'date-fns';

// Normalize a Windows local_path into a URL-relative path
const getFilePath = (local_path) => {
  if (!local_path) return null;
  // Replace backslashes with forward slashes and strip any leading drive letter
  return local_path.replace(/\\/g, '/').replace(/^[A-Za-z]:/, '');
};

export default function ChatViewer() {
  const [messages, setMessages] = useState([]);
  const [userMap, setUserMap] = useState({});

  // Handle JSON file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      setMessages(data);
    } catch (err) {
      console.error('Invalid JSON:', err);
    }
  };

  // Render attachments based on mimetype
  const renderAttachment = (file) => {
    const { local_path, name, mimetype, id } = file;
    const filePath = getFilePath(local_path);
    if (!filePath) return null;

    // All files are served from public/ at the web root
    const url = `/${filePath}`;

    if (mimetype.startsWith('image/')) {
      return <img key={id} src={url} alt={name} className="max-w-xs rounded-lg mb-2" />;
    }
    if (mimetype.startsWith('video/')) {
      return (
        <video key={id} controls className="max-w-md rounded-lg mb-2">
          <source src={url} type={mimetype} />
          Your browser does not support the video tag.
        </video>
      );
    }
    return (
      <a key={id} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mb-2 block">
        {name}
      </a>
    );
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <p className="mb-2 text-sm text-gray-600">
        Upload your Slack JSON backup, then browse messages and attachments.<br />
        Attachments must live under <code>public/Backup/...</code>
      </p>
      <input type="file" accept="application/json" onChange={handleFileUpload} className="mb-4" />
      <div className="space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex items-start">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 mr-3">
              <span className="block text-center leading-10 text-gray-700 font-bold">
                {msg.user.slice(-2)}
              </span>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">
                {userMap[msg.user] || msg.user} • {format(new Date(msg.timestamp), 'yyyy-MM-dd HH:mm')}
              </div>
              <div className="bg-gray-100 p-3 rounded-lg whitespace-pre-wrap">
                {msg.text}
                {msg.files && msg.files.length > 0 && (
                  <div className="mt-2">
                    {msg.files.map(renderAttachment)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
