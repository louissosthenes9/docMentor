/* eslint no-use-before-define: 2 */
import React, { useContext, useRef } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Send, Loader2 } from "lucide-react";
import { ChatContext } from "./ChatContext";

interface Props {
  isDisabled?: boolean;
}

const ChatInput = ({ isDisabled = false }: Props) => {
  const { addMessages, message, handleInputChange, isLoading } = useContext(ChatContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    addMessages();
    textareaRef.current?.focus();
  };

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="relative"
      >
        <div className="flex items-center">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            placeholder="Type a message..."
            disabled={isLoading || isDisabled}
            className="w-full pr-10"
          />
          <Button
            disabled={isLoading || isDisabled || !message.trim()}
            className="absolute bottom-1.5 right-[9px]"
            aria-label="send message"
            type="button"
            onClick={handleSendMessage}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
