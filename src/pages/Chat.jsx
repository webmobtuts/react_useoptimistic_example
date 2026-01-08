import React, {useOptimistic, useState, useTransition} from "react";
import {timeAgo} from "../helpers.js";

async function sendMessage(message) {
    await new Promise((res) => setTimeout(res, 1000));
    return message;

    // return new Promise((resolve, reject) => setTimeout(() => {
    //     reject(new Error('Something went wrong'));
    // }, 1000));
}

const Chat = () => {

    const [messages, setMessages] = useState([]);

    const [isLoading, startTransition] = useTransition();

    const [optimisticMessages, addOptimisticMessage] = useOptimistic(messages, (state, newMessage) => {
        return [
            ...state,
            {
                text: newMessage,
                time: new Date(),
                status: 'sending'
            },
        ]
    });

    function handleSubmit(e) {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        const message = formData.get("message");

        if(!message) return;

        startTransition(async () => {
            addOptimisticMessage(message);

            try {
                await sendMessage(message);
                setMessages([...messages, {
                    text: message,
                    time: new Date()
                }]);

                // Reset form
                form.reset();
            } catch (error) {
                setMessages([...messages, {
                    text: message,
                    time: new Date(),
                    status: 'error'
                }]);
            }
        });
    }

    function retrySend(e, message, index) {
        e.preventDefault();

        startTransition(async () => {
           try {
               await sendMessage(message);
               setMessages(prevState => {
                   const next = [...prevState];
                   delete next[index].status;
                   return next;
               });
           } catch (error) {
               setMessages(prevState => {
                   const next = [...prevState];
                   next[index].status = 'error';
                   return next;
               });
           }
        });
    }

    const messageClass = (message, index) => {
        return (index%2===0 ? 'sender':'receiver')+ ' ' + (message.status === 'sending' || message.status === 'error' ? ' fade ':'');
    }

    function authorName (index) {
        return (index%2===0 ? 'Me':'You')
    }

    return (
        <div id="chat-panel">
            <h3 className="chat-header">Chat</h3>
            <div className="chat-messages">
                <ul>
                    {
                        optimisticMessages.length > 0 ?
                        optimisticMessages.map((message, index) => {
                            return (
                                <li key={index} className={messageClass(message, index)}>
                                    <span className="body">
                                        <span className="author">{authorName(index)}</span>
                                        <span className="content">{message.text} </span>
                                        {
                                            message.status === 'sending' ? <small>sending...</small> :
                                                message.status === 'error' ? <a href="#" className="retry" onClick={(e) => retrySend(e, message, index)}>Retry</a> : null
                                        }
                                    </span>
                                    <time>{timeAgo(message.time)}</time>
                                </li>
                            )
                        }) : <span style={{display: "flex", justifyContent: "center", fontSize: "13px", color: "rgb(105 105 105)"}}>Send your first message</span>
                    }
                </ul>
            </div>
            <form onSubmit={handleSubmit}>
                <input type="text" name="message" />
                <button type="submit" disabled={isLoading}>Send</button>
            </form>
        </div>
    )
}

export default Chat;
