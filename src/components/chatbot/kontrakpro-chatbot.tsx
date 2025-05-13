"use client"

import React, { useState, FormEvent, useEffect, useRef } from "react"
import { Send, Bot, Paperclip, Mic, CornerDownLeft, MessageCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble"
import { ChatInput } from "@/components/ui/chat-input"
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat"
import { ChatMessageList } from "@/components/ui/chat-message-list"
import { kontrakProChat, type KontrakProChatFlowInput } from "@/ai/flows/chatbot-flow"
import { useAuth } from "@/hooks/use-auth-context"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface DisplayMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export function KontrakProChatbot() {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: crypto.randomUUID(),
      content: "Hello! I'm KontrakPro AI. How can I assist you with your contracts today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const lastActivityRef = useRef<Date>(new Date());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const TEN_MINUTES_MS = 10 * 60 * 1000;

  // Load chat messages from Supabase when component mounts or user changes
  useEffect(() => {
    if (!user) return;

    const loadChatMessages = async () => {
      try {
        // Check if there's an active chat session
        const { data: session, error: sessionError } = await supabase
          .from('chat_sessions')
          .select('id, last_updated_at')
          .eq('user_id', user.id)
          .single();

        if (sessionError && sessionError.code !== 'PGRST116') {
          console.error('Error fetching chat session:', sessionError);
          return;
        }

        if (session) {
          const lastUpdated = new Date(session.last_updated_at).getTime();

          // If session is still active (less than 10 minutes old)
          if (Date.now() - lastUpdated < TEN_MINUTES_MS) {
            // Load messages for this session
            const { data: messagesData, error: messagesError } = await supabase
              .from('chat_messages')
              .select('*')
              .eq('session_id', session.id)
              .order('created_at', { ascending: true });

            if (messagesError) {
              console.error('Error fetching chat messages:', messagesError);
              return;
            }

            if (messagesData && messagesData.length > 0) {
              const formattedMessages: DisplayMessage[] = messagesData.map(msg => ({
                id: msg.id.toString(),
                content: msg.content,
                sender: msg.sender as "user" | "ai",
                timestamp: new Date(msg.created_at),
              }));

              setMessages(formattedMessages);
              lastActivityRef.current = new Date();
            }
          } else {
            // Session is stale, delete it and start fresh
            await supabase.from('chat_sessions').delete().eq('user_id', user.id);
            setMessages([
              {
                id: crypto.randomUUID(),
                content: "Hello! I'm KontrakPro AI. How can I assist you with your contracts today?",
                sender: "ai",
                timestamp: new Date(),
              },
            ]);
          }
        }
      } catch (error) {
        console.error('Error loading chat messages:', error);
      }
    };

    loadChatMessages();
  }, [user]);

  // Set up inactivity timeout
  useEffect(() => {
    if (!isExpanded) return;

    const checkInactivity = () => {
      const now = new Date();
      const timeSinceLastActivity = now.getTime() - lastActivityRef.current.getTime();

      if (timeSinceLastActivity >= TEN_MINUTES_MS) {
        // Reset chat if inactive for 10 minutes
        setMessages([
          {
            id: crypto.randomUUID(),
            content: "Our conversation has been reset due to inactivity. How can I help you today?",
            sender: "ai",
            timestamp: new Date(),
          },
        ]);

        // Delete the session from Supabase
        if (user) {
          supabase.from('chat_sessions').delete().eq('user_id', user.id)
            .then(() => console.log('Chat session deleted due to inactivity'))
            .catch(error => console.error('Error deleting chat session:', error));
        }
      }
    };

    // Check every minute
    timeoutRef.current = setInterval(checkInactivity, 60 * 1000);

    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [isExpanded, user]);

  // Update last activity time when user interacts with chat
  const updateLastActivity = () => {
    lastActivityRef.current = new Date();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    updateLastActivity();

    const currentUserMessageContent = input;
    const userMessage: DisplayMessage = {
      id: crypto.randomUUID(),
      content: currentUserMessageContent,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Get or create chat session
      let sessionId: number;
      const { data: existingSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (sessionError && sessionError.code !== 'PGRST116') {
        console.error('Error fetching chat session:', sessionError);
        throw new Error('Failed to get chat session');
      }

      if (existingSession) {
        sessionId = existingSession.id;

        // Update last_updated_at
        await supabase
          .from('chat_sessions')
          .update({ last_updated_at: new Date().toISOString() })
          .eq('id', sessionId);
      } else {
        // Create new session
        const { data: newSession, error: createError } = await supabase
          .from('chat_sessions')
          .insert({ user_id: user.id })
          .select('id')
          .single();

        if (createError || !newSession) {
          console.error('Error creating chat session:', createError);
          throw new Error('Failed to create chat session');
        }

        sessionId = newSession.id;
      }

      // Save user message to Supabase
      const { error: userMsgError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          content: currentUserMessageContent,
          sender: 'user',
        });

      if (userMsgError) {
        console.error('Error saving user message:', userMsgError);
      }

      // Call AI service
      const flowInput: KontrakProChatFlowInput = {
        userId: user.id,
        userMessage: currentUserMessageContent,
      };
      const response = await kontrakProChat(flowInput);

      const aiMessage: DisplayMessage = {
        id: crypto.randomUUID(),
        content: response.aiResponse,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Save AI response to Supabase
      const { error: aiMsgError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          content: response.aiResponse,
          sender: 'ai',
        });

      if (aiMsgError) {
        console.error('Error saving AI message:', aiMsgError);
      }

    } catch (error) {
      console.error("Chatbot error:", error);
      toast({
        title: "Chatbot Error",
        description: "Sorry, I couldn't get a response. Please try again.",
        variant: "destructive",
      });

      const errorMessage: DisplayMessage = {
        id: crypto.randomUUID(),
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachFile = () => {
    toast({ title: "Feature Coming Soon", description: "File attachment is not yet implemented." });
  };

  const handleMicrophoneClick = () => {
     toast({ title: "Feature Coming Soon", description: "Voice input is not yet implemented." });
  };

  const userFallback = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

  // Add function to clear chat history
  const handleClearChat = async () => {
    if (!user) return;

    try {
      // Delete chat session from Supabase
      await supabase.from('chat_sessions').delete().eq('user_id', user.id);

      // Reset messages
      setMessages([
        {
          id: crypto.randomUUID(),
          content: "Chat history has been cleared. How can I help you today?",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);

      toast({
        title: "Chat Cleared",
        description: "Your chat history has been cleared.",
      });

      updateLastActivity();
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <ExpandableChat
      size="lg"
      position="bottom-right"
      triggerIcon={<Bot className="h-6 w-6" />}
      className="shadow-2xl border-border/40"
      onOpenChange={(open) => {
        setIsExpanded(open);
        if (open) {
          updateLastActivity();
        }
      }}
    >
      <ExpandableChatHeader className="flex-col text-center justify-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Bot className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">KontrakPro AI Assistant</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            className="text-muted-foreground hover:text-foreground"
            title="Clear chat history"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Ask me anything about your contracts or KontrakPro.
        </p>
      </ExpandableChatHeader>

      <ExpandableChatBody>
        <ChatMessageList>
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.sender === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                src={
                  message.sender === "user"
                    ? user?.avatarUrl || `https://picsum.photos/seed/${user?.id || 'userseed'}/64`
                    : `https://picsum.photos/seed/ai-kontrakpro/64`
                }
                alt={message.sender === "user" ? "User Avatar" : "AI Avatar"}
                data-ai-hint={message.sender === "user" ? "user profile" : "robot face"}
                fallback={message.sender === "user" ? userFallback : "AI"}
              />
              <ChatBubbleMessage
                variant={message.sender === "user" ? "sent" : "received"}
                isLoading={isLoading && message.sender === "ai" && messages[messages.length -1].id === message.id}
              >
                {message.content}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}
          {isLoading && messages[messages.length -1].sender === "user" && (
             <ChatBubble variant="received">
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src={`https://picsum.photos/seed/ai-kontrakpro-typing/64`}
                  data-ai-hint="robot thinking"
                  fallback="AI"
                />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
          )}
        </ChatMessageList>
      </ExpandableChatBody>

      <ExpandableChatFooter>
        <form
          onSubmit={handleSubmit}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1.5"
        >
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about contracts or features..."
            className="min-h-12 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleSubmit(e as unknown as FormEvent);
              }
            }}
            disabled={isLoading || !user}
          />
          <div className="flex items-center p-1 pt-1.5 justify-between">
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleAttachFile}
                disabled={isLoading || !user}
                aria-label="Attach file"
                className="text-muted-foreground hover:text-foreground"
              >
                <Paperclip className="size-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleMicrophoneClick}
                disabled={isLoading || !user}
                aria-label="Use microphone"
                className="text-muted-foreground hover:text-foreground"
              >
                <Mic className="size-4" />
              </Button>
            </div>
            <Button type="submit" size="sm" className="ml-auto gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || !input.trim() || !user}>
              {isLoading ? "Sending..." : "Send"}
              {!isLoading && <CornerDownLeft className="size-3.5" />}
            </Button>
          </div>
        </form>
      </ExpandableChatFooter>
    </ExpandableChat>
  )
}

