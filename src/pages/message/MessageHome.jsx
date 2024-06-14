
import React, { useEffect, useMemo, useState } from "react";
import styles from '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, Sidebar, Search, ConversationList, Conversation, Avatar, ConversationHeader, TypingIndicator, MessageSeparator, VoiceCallButton, VideoCallButton, EllipsisButton } from '@chatscope/chat-ui-kit-react';
import { fetchData, createData } from "../../utils/dataProvider";
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
            const newChat = res.find(chat => chat.message_id === currentChat?.message_id);
            setCurrentChat(newChat);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

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

    const renderChatContainer = useMemo(() => {
        if (currentChat) {
            console.log("currentChat", currentChat)
            const receiver = currentChat.users.find(u => user.user_id !== u.user_id)
            console.log("receiver", receiver)
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
                            return (
                                <Message
                                    key={index}
                                    model={{
                                        direction: user.user_id === message.user_id ? 'outgoing' : 'incoming',
                                        message: message.message,
                                        position: 'single',
                                        sender: user.user_id === message.user_id ? user.name : receiver?.name,
                                        sentTime: '15 mins ago'
                                    }}
                                >

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
                            {/* <MessageSeparator content="Saturday, 30 November 2019" /> */}
                            <Message
                                model={{
                                    direction: 'incoming',
                                    message: 'Hello my friend',
                                    position: 'single',
                                    sender: 'Zoe',
                                    sentTime: '15 mins ago'
                                }}
                            >

                            </Message>

                        </MessageList>
                        <MessageInput placeholder="Nhập tin nhắn vào đây" onSend={handleSendMessage} />
                    </ChatContainer>

                )}
        </MainContainer>
    );
}

export default MessageHome;