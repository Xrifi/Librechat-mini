import { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { replaceSpecialVars, EModelEndpoint, Tools, Constants } from 'librechat-data-provider';
import { useChatContext, useChatFormContext, useAddedChatContext } from '~/Providers';
import { useAuthContext } from '~/hooks/AuthContext';
import store, { ephemeralAgentByConvoId } from '~/store';

export default function useSubmitMessage() {
  const { user } = useAuthContext();
  const methods = useChatFormContext();
  const { conversation: addedConvo } = useAddedChatContext();
  const { ask, index, getMessages, setMessages, latestMessage, conversation } = useChatContext();

  const autoSendPrompts = useRecoilValue(store.autoSendPrompts);
  const setActivePrompt = useSetRecoilState(store.activePromptByIndex(index));

  const conversationId = conversation?.conversationId ?? Constants.NEW_CONVO;
  const setEphemeralAgent = useSetRecoilState(ephemeralAgentByConvoId(conversationId));

  const submitMessage = useCallback(
    (data?: { text: string }) => {
      if (!data) {
        return console.warn('No data provided to submitMessage');
      }
      const rootMessages = getMessages();
      const isLatestInRootMessages = rootMessages?.some(
        (message) => message.messageId === latestMessage?.messageId,
      );
      if (!isLatestInRootMessages && latestMessage) {
        setMessages([...(rootMessages || []), latestMessage]);
      }

      ask(
        {
          text: data.text,
        },
        {
          addedConvo: addedConvo ?? undefined,
        },
      );

      /* Auto-uncheck Google Search after use */
      try {
        const activeEndpoint = conversation?.endpoint;
        const isGoogle =
          (activeEndpoint as string) === EModelEndpoint.google ||
          (activeEndpoint as string) === 'google' ||
          (activeEndpoint as string) === 'vertexai' ||
          (activeEndpoint && typeof activeEndpoint === 'string' && activeEndpoint.toLowerCase().includes('google'));

        if (isGoogle) {
          setEphemeralAgent((prev) => ({
            ...(prev || {}),
            [Tools.web_search]: false,
          }));
        }
      } catch (e) {
        // ignore
      }

      methods.reset();
    },
    [ask, methods, addedConvo, setMessages, getMessages, latestMessage, conversation, setEphemeralAgent],
  );

  const submitPrompt = useCallback(
    (text: string) => {
      const parsedText = replaceSpecialVars({ text, user });
      if (autoSendPrompts) {
        submitMessage({ text: parsedText });
        return;
      }

      const currentText = methods.getValues('text');
      const newText = currentText.trim().length > 1 ? `\n${parsedText} ` : parsedText;
      setActivePrompt(newText);
    },
    [autoSendPrompts, submitMessage, setActivePrompt, methods, user],
  );

  return { submitMessage, submitPrompt };
}
