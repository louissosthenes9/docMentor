import React, { createContext, ReactNode, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
type StreamResponse = {
  addMessages: () => void;
  message: "";
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};
export const ChatContext = createContext({
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
  const [isLoading,setIsLoading] = useState<boolean>(false)

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch("ap/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.body;
    },
  });

  const addMessages = () =>
    sendMessage({
      message,
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
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
 