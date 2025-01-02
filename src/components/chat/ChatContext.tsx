import React, { createContext, ReactNode, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from 'axios';
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

type StreamResponse = {
  addMessages: () => void;
  message: string;  
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};

export const ChatContext = createContext<StreamResponse>({
  addMessages: () => {},
  message: "",
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {},
  isLoading: false,
});

interface Props {
  fileId: string;
  children: ReactNode;
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState<string>("");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const utils = trpc.useContext();
  const backupMessage = useRef('');

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await axios.post("/api/message", {
        fileId,
        message,
      });
    
      if (response.status !== 200) {
        throw new Error("Failed to send message");
      }

      return response.data;
    },

    onMutate: async ({ message }) => {
      setIsLoading(true)
      // Store the message in case we need to rollback
      backupMessage.current = message;
      
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await utils.getFileMessages.cancel();

      // Snapshot the previous value
      const previousMessages = utils.getFileMessages.getInfiniteData({
        fileId,
        limit: INFINITE_QUERY_LIMIT,
      });

      // Optimistically update the messages
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        (old) => {
          if (!old) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          const newPages = old.pages.map((page, index) => {
            // Only update the most recent page
            if (index === 0) {
              return {
                ...page,
                messages: [{
                  id: `temp-${Date.now()}`,
                  text: message,
                  isUserMessage: true,
                  createdAt: new Date().toISOString(),
                  fileId,
                }, ...page.messages],
              };
            }
            return page;
          });

          return {
            ...old,
            pages: newPages,
          };
        }
      );

     
      setMessage("");

      // Return the previous messages for rollback if needed
      return { previousMessages };
    },

    onSuccess: async (response) => {
      // Update the messages with the real response
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        (old) => {
          if (!old) return { pages: [], pageParams: [] };

          const newPages = old.pages.map((page, index) => {
            // Only update the most recent page
            if (index === 0) {
              return {
                ...page,
                messages: page.messages.map((msg) => {
                  // Replace the temporary message with the real one
                  if (msg.id.startsWith('temp-')) {
                    return {
                      ...msg,
                      id: response.id,
                      text: response.text,
                    };
                  }
                  return msg;
                }),
              };
            }
            return page;
          });

          return { ...old, pages: newPages };
        }
      );

      setIsLoading(false);
    },

    onError: (_, __, context) => {
      // Rollback to the previous state
      if (context?.previousMessages) {
        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INFINITE_QUERY_LIMIT },
          context.previousMessages
        );
      }

      // Restore the input message
      setMessage(backupMessage.current);
      setIsLoading(false);

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },

    onSettled: () => {
      // Invalidate the query to ensure we're in sync with the server
      utils.getFileMessages.invalidate({ fileId });
    },
  });

  const addMessages = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    sendMessage({ message: trimmedMessage });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <ChatContext.Provider
      value={{
        addMessages,
        message,
        handleInputChange,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};