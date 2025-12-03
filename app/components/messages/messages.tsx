import {useMessageHook} from "@/hooks/MessageHooks";
import {Id} from "@/convex/_generated/dataModel";
import {useEffect} from "react";

interface MessageProps {
    convoId: Id<"conversations"> | undefined;
    userMessage: string | undefined;
}

export const Message = ({convoId, userMessage}: MessageProps) => {
    const { messages, addMessage, isLoading } = useMessageHook(convoId);

    useEffect(() => {
        if(convoId && userMessage) {
            addMessage({
                conversationId: convoId,
                message: userMessage,
                whoSaid: "user"
            });
        }
    }, [addMessage, convoId, userMessage]);

    if (isLoading) {
        return <div>Loading messages...</div>;
    }

    if (!messages.data || messages.data.length === 0) {
        return <div>No messages yet</div>;
    }

    return (
        <div className="space-y-4">
            {messages.data.map((message, index) => (
                <div key={`${message.conversationId}-${index}`} className={message.whoSaid === "user" ? "text-right" : "text-left"}>
                    <div className={`inline-block p-3 rounded-lg ${
                        message.whoSaid === "user"
                            ? "bg-cyan-500/20 text-cyan-300"
                            : "bg-gray-800 text-gray-200"
                    }`}>
                        {message.message}
                    </div>
                </div>
            ))}
        </div>
    );
};