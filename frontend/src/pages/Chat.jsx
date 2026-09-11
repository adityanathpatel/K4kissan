import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../lib/firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { Send, MessageCircle, ArrowLeft } from 'lucide-react';

const demoConversations = [
    {
        id: 'conv-1',
        buyer_id: 'demo-buyer',
        farmer_id: 'demo-farmer',
        buyer: { full_name: 'Amit Patel', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
        farmer: { full_name: 'Sardar Gurpreet Singh', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
        product: { name: '1121 Extra Long Raw Basmati Rice' },
        last_message: 'Is the rice properly dried and ready for dispatch?'
    }
];

const Chat = () => {
    const { conversationId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState(demoConversations);
    const [selectedConversation, setSelectedConversation] = useState(demoConversations[0]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (conversationId) {
            const found = conversations.find(c => c.id === conversationId);
            if (found) setSelectedConversation(found);
        }
    }, [conversationId]);

    useEffect(() => {
        if (selectedConversation && database) {
            const messagesRef = ref(database, `messages/${selectedConversation.id}`);
            const unsubscribe = onValue(messagesRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
                    list.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
                    setMessages(list);
                } else {
                    setMessages([
                        {
                            id: 'm1',
                            sender_id: selectedConversation.farmer_id,
                            content: 'Namaste! How can I assist you with your bulk grain requirement today?',
                            created_at: new Date(Date.now() - 3600000).toISOString()
                        }
                    ]);
                }
            });
            return () => unsubscribe();
        } else {
            setMessages([
                {
                    id: 'm1',
                    sender_id: 'demo-farmer',
                    content: 'Namaste! How can I assist you with your bulk grain requirement today?',
                    created_at: new Date(Date.now() - 3600000).toISOString()
                }
            ]);
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        setSending(true);
        const text = newMessage.trim();
        setNewMessage('');

        const newMsg = {
            conversation_id: selectedConversation.id,
            sender_id: user?.uid || user?.id || 'guest',
            content: text,
            created_at: new Date().toISOString()
        };

        try {
            if (database) {
                const messagesRef = ref(database, `messages/${selectedConversation.id}`);
                const newMsgRef = push(messagesRef);
                await set(newMsgRef, newMsg);
            } else {
                setMessages(prev => [...prev, { ...newMsg, id: `msg-${Date.now()}` }]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { ...newMsg, id: `msg-${Date.now()}` }]);
        } finally {
            setSending(false);
        }
    };

    const getOtherUser = (conversation) => {
        const uid = user?.uid || user?.id;
        return uid === conversation.buyer_id ? conversation.farmer : conversation.buyer;
    };

    if (loading) {
        return <div className="text-center py-10">Loading conversations...</div>;
    }

    return (
        <div className="flex h-[calc(100vh-12rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Conversations List */}
            <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${selectedConversation && 'hidden md:flex'}`}>
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
                            <p>No conversations yet</p>
                        </div>
                    ) : (
                        conversations.map(conv => {
                            const otherUser = getOtherUser(conv);
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => {
                                        setSelectedConversation(conv);
                                        navigate(`/chat/${conv.id}`);
                                    }}
                                    className={`w-full p-4 text-left hover:bg-gray-50 transition border-b border-gray-100 ${selectedConversation?.id === conv.id ? 'bg-green-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold flex-shrink-0">
                                            {otherUser?.full_name?.[0] || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {otherUser?.full_name || 'Unknown User'}
                                            </h3>
                                            {conv.product && (
                                                <p className="text-xs text-gray-500 truncate">
                                                    Re: {conv.product.name}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-600 truncate mt-1">
                                                {conv.last_message || 'No messages yet'}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Messages View */}
            <div className={`flex-1 flex flex-col ${!selectedConversation && 'hidden md:flex'}`}>
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setSelectedConversation(null);
                                    navigate('/chat');
                                }}
                                className="md:hidden text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                                {getOtherUser(selectedConversation)?.full_name?.[0] || 'U'}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {getOtherUser(selectedConversation)?.full_name || 'Unknown User'}
                                </h3>
                                {selectedConversation.product && (
                                    <p className="text-sm text-gray-500">
                                        Re: {selectedConversation.product.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map(message => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender_id === (user?.uid || user?.id) ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${message.sender_id === (user?.uid || user?.id)
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-200 text-gray-900'
                                            }`}
                                    >
                                        <p>{message.content}</p>
                                        <span className={`text-xs ${message.sender_id === (user?.uid || user?.id) ? 'text-green-100' : 'text-gray-500'}`}>
                                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    disabled={sending}
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !newMessage.trim()}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />
                            <p>Select a conversation to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
