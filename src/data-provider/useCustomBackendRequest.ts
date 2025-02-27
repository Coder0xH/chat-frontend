import { useState, useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { EModelEndpoint } from 'librechat-data-provider';
import type { TMessage } from 'librechat-data-provider';
import store from '~/store';

// 拦截消息请求并处理SSE响应
export default function useCustomBackendRequest() {
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const setMessages = useSetRecoilState(store.messagesAtom);
  const [isSubmitting, setIsSubmitting] = useRecoilState(store.isSubmitting);
  const [conversation, setConversation] = useRecoilState(store.conversation);
  
  // 消息请求处理
  const submitRequest = async (message: string) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // 创建用户消息
      const userMessage: TMessage = {
        messageId: uuidv4(),
        conversationId: conversation?.conversationId || 'new',
        parentMessageId: null,
        sender: 'User',
        text: message,
        isCreatedByUser: true,
        error: false,
        content: [{ type: 'text', text: { value: message } }],
        role: 'user',
        timestamp: new Date().toISOString(),
      };
      
      // 更新消息列表
      setMessages((prev) => [...prev, userMessage]);
      
      // 创建新的abort controller
      const controller = new AbortController();
      setAbortController(controller);
      
      // 准备URL和参数
      const encodedMessage = encodeURIComponent(message);
      const sseUrl = `http://127.0.0.1:8012/ai/ollama/stream-chat?message=${encodedMessage}&role=customer_service`;
      
      // 创建SSE连接
      const eventSource = new EventSource(sseUrl);
      let fullResponse = '';
      const assistantMsgId = uuidv4();
      
      const assistantMessage: TMessage = {
        messageId: assistantMsgId,
        conversationId: conversation?.conversationId || 'new',
        parentMessageId: userMessage.messageId,
        sender: 'Assistant',
        text: '',
        isCreatedByUser: false,
        error: false,
        content: [{ type: 'text', text: { value: '' } }],
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };
      
      // 立即添加空的回复
      setMessages((prev) => [...prev, assistantMessage]);
      
      const completeMessage = () => {
        if (eventSource.readyState !== 2) {
          eventSource.close();
        }
        setIsSubmitting(false);
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.text) {
            fullResponse += data.text;
            
            // 更新助手消息
            setMessages((prev) => {
              const newMessages = [...prev];
              const index = newMessages.findIndex((msg) => msg.messageId === assistantMsgId);
              
              if (index !== -1) {
                newMessages[index] = {
                  ...newMessages[index],
                  text: fullResponse,
                  content: [{ type: 'text', text: { value: fullResponse } }],
                };
              }
              
              return newMessages;
            });
          }
        } catch (error) {
          console.error('SSE消息解析错误:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('SSE连接错误:', error);
        completeMessage();
        
        if (!fullResponse) {
          setMessages((prev) => {
            const newMessages = [...prev];
            const index = newMessages.findIndex((msg) => msg.messageId === assistantMsgId);
            
            if (index !== -1) {
              newMessages[index] = {
                ...newMessages[index],
                text: '对不起，连接出现了问题。请稍后再试。',
                error: true,
                content: [{ type: 'text', text: { value: '对不起，连接出现了问题。请稍后再试。' } }],
              };
            }
            
            return newMessages;
          });
        }
      };
      
      eventSource.addEventListener('done', () => {
        completeMessage();
      });
      
      // 超时处理
      setTimeout(() => {
        if (eventSource.readyState !== 2) {
          completeMessage();
        }
      }, 60000);
      
      // 中断处理
      controller.signal.addEventListener('abort', () => {
        completeMessage();
      });
      
    } catch (error) {
      console.error('请求处理错误:', error);
      setIsSubmitting(false);
    }
  };
  
  // 中止生成
  const stopGenerating = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsSubmitting(false);
    }
  };
  
  return {
    submitRequest,
    stopGenerating,
    isSubmitting
  };
}
