import { memo, useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  supportsFiles,
  mergeFileConfig,
  isAssistantsEndpoint,
  fileConfig as defaultFileConfig,
} from 'librechat-data-provider';
import {
  useChatContext,
  useChatFormContext,
  useAddedChatContext,
  useAssistantsMapContext,
} from '~/Providers';
import {
  useTextarea,
  useAutoSave,
  useRequiresKey,
  useHandleKeyUp,
  useQueryParams,
  useSubmitMessage,
} from '~/hooks';
import { cn, removeFocusRings, checkIfScrollable } from '~/utils';
import { TextareaAutosize } from '~/components/ui';
import { mainTextareaId } from '~/common';
import useCustomBackendRequest from '~/data-provider/useCustomBackendRequest';
import store from '~/store';

const ChatForm = ({ index = 0 }) => {
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  useQueryParams({ textAreaRef });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  const SpeechToText = useRecoilValue(store.speechToText);
  const TextToSpeech = useRecoilValue(store.textToSpeech);
  const automaticPlayback = useRecoilValue(store.automaticPlayback);
  const maximizeChatSpace = useRecoilValue(store.maximizeChatSpace);
  const [isTemporaryChat, setIsTemporaryChat] = useRecoilState<boolean>(store.isTemporary);

  const isSearching = useRecoilValue(store.isSearching);
  const [showStopButton, setShowStopButton] = useRecoilState(store.showStopButtonByIndex(index));
  const [showPlusPopover, setShowPlusPopover] = useRecoilState(store.showPlusPopoverFamily(index));
  const [showMentionPopover, setShowMentionPopover] = useRecoilState(
    store.showMentionPopoverFamily(index),
  );

  const chatDirection = useRecoilValue(store.chatDirection).toLowerCase();
  const isRTL = chatDirection === 'rtl';

  const { requiresKey } = useRequiresKey();
  const handleKeyUp = useHandleKeyUp({
    index,
    textAreaRef,
    setShowPlusPopover,
    setShowMentionPopover,
  });
  const { handlePaste, handleKeyDown, handleCompositionStart, handleCompositionEnd } = useTextarea({
    submitButtonRef,
    textAreaRef,
    handleKeyUp,
    showPlusPopover,
    setShowPlusPopover,
    showMentionPopover,
    setShowMentionPopover,
  });

  // 使用自定义后端请求
  const customBackend = useCustomBackendRequest();
  const { submitRequest, stopGenerating, isSubmitting: customIsSubmitting } = customBackend;
  
  const [conversation] = useRecoilState(store.conversation);

  useEffect(() => {
    setShowStopButton(customIsSubmitting);
  }, [customIsSubmitting, setShowStopButton]);

  const { getValues, setValue, watch, reset, handleSubmit } = useChatFormContext();
  const text = watch('text') || '';

  const onSubmit = async (data) => {
    const { text } = data;
    if (!text || customIsSubmitting) return;
    
    // 重置表单
    reset();
    textAreaRef.current?.focus();
    
    // 提交到自定义后端
    submitRequest(text);
  };

  const handleStopGenerating = (e) => {
    e.preventDefault();
    stopGenerating();
  }

  // 监控文本区域的滚动状态
  useEffect(() => {
    if (!textAreaRef.current) {
      return;
    }

    const checkScrollable = () => {
      if (textAreaRef.current) {
        setIsScrollable(checkIfScrollable(textAreaRef.current));
      }
    };

    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => {
      window.removeEventListener('resize', checkScrollable);
    };
  }, [text]);

  const saveAutoValue = useCallback(() => {
    localStorage.setItem(`chat-${conversation?.conversationId || 'new'}-draft`, text);
  }, [conversation?.conversationId, text]);

  useEffect(() => {
    // 从本地存储读取草稿
    if (conversation?.conversationId) {
      const savedDraft = localStorage.getItem(`chat-${conversation.conversationId}-draft`);
      if (savedDraft) {
        setValue('text', savedDraft);
      }
    }
    
    // 保存草稿的间隔
    const interval = setInterval(saveAutoValue, 3000);
    return () => clearInterval(interval);
  }, [setValue, conversation?.conversationId, saveAutoValue]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
    }
  }, [isCollapsed]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative flex flex-1 flex-col items-stretch">
      <div
        className={cn(
          'relative flex flex-1 flex-col items-stretch md:rounded-xl',
          isCollapsed ? 'h-12' : 'h-auto',
        )}
      >
        <TextareaAutosize
          tabIndex={0}
          id={mainTextareaId}
          ref={textAreaRef}
          disabled={customIsSubmitting}
          name="text"
          autoFocus
          style={{
            width: '100%',
            resize: 'none',
            margin: 0,
            border: 0,
          }}
          className={cn(
            'bg-token-main-surface-primary disabled:bg-token-dark-8 rounded-xl dark:bg-token-dark-1',
            'focus:ring-0 focus-visible:ring-0 focus:outline-none',
            'pt-6 pr-10 pl-10 pb-5 md:pt-7 md:pr-12 md:pb-5 md:pl-12',
            'scrollbar',
            isRTL ? 'text-right pl-4' : '',
            removeFocusRings
          )}
          placeholder="发送消息"
          value={text}
          onPaste={handlePaste}
          onKeyUp={handleKeyUp}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          maxRows={maximizeChatSpace ? 6 : 12}
          onChange={(e) => {
            setValue('text', e.target.value);
          }}
        />
        <div className="absolute bottom-3 right-3 rounded-lg">
          {customIsSubmitting ? (
            <button
              type="button"
              className="text-token-text-secondary rounded-lg border border-token-border-light px-2 py-1 hover:bg-token-main-surface-secondary"
              onClick={handleStopGenerating}
            >
              停止生成
            </button>
          ) : (
            <button
              ref={submitButtonRef}
              disabled={!text.trim() || customIsSubmitting}
              className={`${
                text.trim()
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'text-gray-400 bg-gray-200'
              } rounded-lg px-3 py-1 transition-colors`}
              type="submit"
            >
              发送
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default memo(ChatForm);
