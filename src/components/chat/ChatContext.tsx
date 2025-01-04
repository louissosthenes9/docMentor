
import React, { createContext, ReactNode, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from 'axios';
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

type StreamResponse = {
  addMessages: () => Promise<void>;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  loadingMessageId: string | null;
  isLoading: boolean;
};

export const ChatContext = createContext<StreamResponse>({
  addMessages: async () => {},
  message: "",
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {},
  loadingMessageId: null,
  isLoading: false,
});

interface Props {
  fileId: string;
  children: ReactNode;
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState<string>("");
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const backupMessage = useRef('');
  const utils = trpc.useContext();

  const { mutate: sendMessage, isLoading: isMutationLoading } = useMutation({
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
      setIsLoading(true);
      backupMessage.current = message;
      await utils.getFileMessages.cancel();

      const previousMessages = utils.getFileMessages.getInfiniteData({
        fileId,
        limit: INFINITE_QUERY_LIMIT,
      });

      const tempId = `temp-${Date.now()}`;
      setLoadingMessageId(tempId);

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
            if (index === 0) {
              return {
                ...page,
                messages: [{
                  id: tempId,
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
      return { previousMessages, tempId };
    },

    onSuccess: async (response, _, context) => {
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        (old) => {
          if (!old) return { pages: [], pageParams: [] };

          const newPages = old.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                messages: page.messages.map((msg) => {
                  if (msg.id === context?.tempId) {
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

      setLoadingMessageId(null);
      setIsLoading(false);
    },

    onError: (_, __, context) => {
      if (context?.previousMessages) {
        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INFINITE_QUERY_LIMIT },
          context.previousMessages
        );
      }

      setMessage(backupMessage.current);
      setLoadingMessageId(null);
      setIsLoading(false);

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },

    onSettled: () => {
      utils.getFileMessages.invalidate({ fileId });
    },
  });

  const addMessages = async () => {
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
        loadingMessageId,
        isLoading: isLoading || isMutationLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
