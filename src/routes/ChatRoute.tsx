import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { useParams } from 'react-router-dom';
import store from '~/store';
import ChatView from '~/components/Chat/ChatView';
import useCustomBackendRequest from '~/data-provider/useCustomBackendRequest';

// 极简的ChatRoute组件，仅用于测试
const ChatRoute = () => {
  const { conversationId } = useParams();
  // 使用主对话原子而不是按索引选择器
  const [conversation, setConversation] = useRecoilState(store.conversation);
  
  // 获取自定义后端请求处理器
  const customBackend = useCustomBackendRequest();
  
  useEffect(() => {
    // 将自定义后端请求处理器存储到全局状态
    window.customBackend = customBackend;
    
    console.log('初始化对话，ID:', conversationId || 'new');
    
    // 初始化对话设置
    setConversation({
      conversationId: conversationId || 'new',
      title: '新对话',
      endpoint: 'ollama',
      modelId: 'gemma',
      jailbreak: false,
      messages: []
    });
  }, [setConversation, customBackend, conversationId]);

  return (
    <div className="flex h-screen bg-white">
      <div className="flex flex-col w-full h-full overflow-hidden">
        <ChatView index={0} />
      </div>
    </div>
  );
};

export default ChatRoute;
