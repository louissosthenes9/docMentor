import React, { createContext, ReactNode, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from 'axios';
type StreamResponse = {
  addMessages: () => void;
  message: string;  // Changed from empty string to string type
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

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      try {
        const response = await axios.post("http://localhost:3000/api/message", {
          fileId,
          message,
        });
      
        if (response.status != 200) {
          throw new Error("Failed to send message");
        }
  
        return response.data;
        console.log(response.data);
      } catch (error) {
        console.error("Error sending message:", error);
      }

     
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: () => {
      setMessage(""); 
      setIsLoading(false);
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addMessages = () => {
    if (!message.trim()) return; // Prevent sending empty messages
    sendMessage({ message });
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