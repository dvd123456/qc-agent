import * as React from "react";
interface TypingMessageProps {
  html: string;
  speed: number;
  onComplete?: () => void;
}

export function TypingEffect({ html, speed, onComplete }: TypingMessageProps) {
  const [displayedText, setDisplayedText] = React.useState("");
  const [isComplete, setIsComplete] = React.useState(false);
  const messageRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [chunks, setChunks] = React.useState<string[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = React.useState(0);

  React.useEffect(() => {
    if (html && chunks.length === 0) {
      const parsedChunks = parseHtmlIntoChunks(html);
      setChunks(parsedChunks);
    }
  }, [html, chunks.length]);

  const scrollToBottom = React.useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  const parseHtmlIntoChunks = (htmlString: string): string[] => {
    const result: string[] = [];
    let currentChunk = "";
    let inTag = false;

    for (let i = 0; i < htmlString.length; i++) {
      const char = htmlString[i];

      if (char === "<") {
        inTag = true;
        if (currentChunk.trim() && !inTag) {
          result.push(currentChunk);
          currentChunk = "";
        }
      }

      currentChunk += char;

      if (char === ">") {
        inTag = false;

        result.push(currentChunk);
        currentChunk = "";
      }

      if (!inTag && currentChunk.length > 10 && char === " ") {
        result.push(currentChunk);
        currentChunk = "";
      }
    }

    if (currentChunk) {
      result.push(currentChunk);
    }

    return result;
  };

  React.useEffect(() => {
    if (chunks.length > 0 && currentChunkIndex < chunks.length) {
      const chunk = chunks[currentChunkIndex];

      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + chunk);
        setCurrentChunkIndex(currentChunkIndex + 1);

        if (containerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } =
            containerRef.current;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
          if (isNearBottom) {
            scrollToBottom();
          }
        }
      }, speed);

      return () => clearTimeout(timer);
    } else if (
      chunks.length > 0 &&
      currentChunkIndex >= chunks.length &&
      !isComplete
    ) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [chunks, currentChunkIndex, isComplete, onComplete, scrollToBottom]);

  return (
    <div
      ref={messageRef}
      className="text-[14px] leading-[19.6px] font-normal font-[Arial] text-gray-700"
      dangerouslySetInnerHTML={{ __html: displayedText }}
    />
  );
}
