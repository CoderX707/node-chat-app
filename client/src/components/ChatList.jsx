import React from 'react'

export const ChatList = ({chat, username}) => {
  return (
    <div className="p-5 bg-white col-start-2 col-end-4">
    {chat.map((msg, index) => (
      <div
        key={index}
        className={`p-4 mb-4 text-sm rounded-lg ${
          msg.includes(username)
            ? "bg-pink-200 text-pink-800"
            : "bg-blue-200 text-blue-800"
        }`}
      >
        {msg}
      </div>
    ))}
  </div>
  )
}
