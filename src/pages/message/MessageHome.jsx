
import React, { useEffect, useMemo, useState } from "react";
import styles from '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, Sidebar, Search, ConversationList, Conversation, Avatar, ConversationHeader, TypingIndicator, MessageSeparator, VoiceCallButton, VideoCallButton, EllipsisButton } from '@chatscope/chat-ui-kit-react';
import { fetchData, createData } from "../../utils/dataProvider";
import { socket } from "../../socket";
import { formatTimeMessage } from "../../utils/transform";
// import "./message.css";
const MessageHome = () => {
    const info = localStorage.getItem("authToken");
    const { user } = JSON.parse(info);
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const fetchConversations = async () => {
        try {
            const res = await fetchData("messages");
            setConversations(res);
            if (currentChat) {
                const newChat = res.find(chat => chat.message_id === currentChat?.message_id);
                setCurrentChat(newChat);
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchConversations();
        socket.on(`new_message`, (data) => {
            fetchConversations();
        });
        socket.on('receive_messages_to_all', (data) => {
            updateMessages(data)
        });

        return () => {
            socket.off(`new_message`);
            socket.off('receive_messages_to_all');
        }
    }, []);

    const updateMessages = (data) => {
        const new_message = {
            message: data.message,
            sender: data.user,
            sender_id: data.user_id,
            time: data.time
        }
        setMessages((oldMessages) => [...oldMessages, new_message]);
    }

    useEffect(() => {
        if (conversations.length > 0) {
            conversations.map((c) => {
                socket.emit("join_chat", {
                    message_id: c.message_id,
                    user_id: user.user_id,
                    user: user
                });
            })
        }
    }, [conversations])


    const handleSendMessage = async (data) => {
        try {
            const res = await createData(`messages/send/${currentChat.message_id}`, {
                method: "POST",
                body: {
                    message: data
                }
            });
            fetchConversations();
        } catch (err) {
            console.log(err);
        }
    }

    const handleSendMessageToAll = async (data) => {
        try {
            socket.emit("send_message_to_all", {
                message: data,
                user_id: user.user_id,
                user: user,
                time: new Date()
            });
        } catch (err) {
            console.log(err);
        }
    }

    const renderChatContainer = useMemo(() => {
        if (currentChat) {
            const receiver = currentChat.users.find(u => user.user_id !== u.user_id)
            return (<ChatContainer>
                <ConversationHeader>
                    <ConversationHeader.Back />
                    <Avatar
                        name={receiver?.name}
                        src={receiver?.meta_data.avatar ? receiver?.meta_data.avatar : "/default_avatar.png"}
                    />
                    <ConversationHeader.Content
                        userName={receiver?.name}
                        info="Đang hoạt động"
                    />
                    <ConversationHeader.Actions>
                        <VoiceCallButton />
                        <VideoCallButton />
                        <EllipsisButton orientation="vertical" />
                    </ConversationHeader.Actions>
                </ConversationHeader>
                <MessageList >
                    {
                        currentChat.messages.map((message, index) => {
                            const time = formatTimeMessage(message.send_at)
                            console.log("MESSAGE", message)
                            return (
                                <Message
                                    key={index}
                                    model={{
                                        direction: user.user_id === message.user_id ? 'outgoing' : 'incoming',
                                        message: message.message,
                                        position: 'single',
                                        sender: user.user_id === message.user_id ? user.name : receiver?.name,
                                        sentTime: time
                                    }}
                                >
                                    <Message.Footer
                                        sentTime={time}
                                    />
                                </Message>
                            )
                        })
                    }

                </MessageList>
                <MessageInput placeholder="Nhập tin nhắn vào đây" onSend={handleSendMessage} />
            </ChatContainer>)
        } else {
            return <></>
        }
    }, [currentChat, conversations]);

    return (
        <MainContainer
            responsive
            style={{
                height: '700px'
            }}
        >
            <Sidebar
                position="left"
                scrollable


            >
                <Search placeholder="Search..." />
                <Conversation
                    name="Phòng chat chung"
                    onClick={() => {
                        setCurrentChat(null)
                    }}
                    active={currentChat === null}
                >
                    <Avatar
                        name="Together"
                        src="/home.png"
                        status="available"
                    />
                </Conversation>
                <ConversationList>
                    {
                        conversations.map((conversation, index) => {

                            const lastMessage = conversation.messages[conversation.messages.length - 1]
                            const lastUser = conversation.users.find(user => user.user_id === lastMessage.user_id)
                            return (
                                <Conversation
                                    key={index}
                                    info={lastMessage.message}
                                    lastSenderName={lastUser.name}
                                    name={lastUser.name}
                                    active={currentChat === conversation}
                                    onClick={() => {
                                        if (currentChat === conversation) {
                                            setCurrentChat(null)
                                        } else {
                                            setCurrentChat(conversation)
                                        }
                                    }}
                                >
                                    <Avatar
                                        name={lastUser.name}
                                        src={lastUser.meta_data.avatar ? lastUser.meta_data.avatar : "/default_avatar.png"}
                                        status="available"
                                    />
                                </Conversation>
                            );
                        })
                    }

                </ConversationList>
            </Sidebar>
            {currentChat ?
                <>
                    {renderChatContainer}
                </>
                : (
                    <ChatContainer>
                        <ConversationHeader>
                            <ConversationHeader.Content
                                userName="Phòng chat chung"
                                info="Đang hoạt động"
                            />
                            <ConversationHeader.Actions>
                                <VoiceCallButton />
                                <VideoCallButton />
                                <EllipsisButton orientation="vertical" />
                            </ConversationHeader.Actions>
                        </ConversationHeader>
                        <MessageList >
                            {
                                messages.map((message, index) => {
                                    const time = formatTimeMessage(message.time)
                                    return (
                                        <Message
                                            key={index}
                                            model={{
                                                direction: user.user_id === message.sender_id ? 'outgoing' : 'incoming',
                                                message: message.message,
                                                position: 'single',
                                                sender: message.sender.name,
                                                sentTime: time
                                            }}
                                        >
                                            <Message.Footer
                                                sender={message.sender.name}
                                                sentTime={time}
                                            />
                                            <Avatar
                                                name={message.sender.name}
                                                src={message.sender?.meta_data?.avatar
                                                    || "/default_avatar.png"
                                                }
                                            />
                                        </Message>

                                    )
                                })
                            }

                        </MessageList>
                        <MessageInput placeholder="Nhập tin nhắn vào đây" onSend={handleSendMessageToAll} />
                    </ChatContainer>

                )}
        </MainContainer>
    );
}

export default MessageHome;