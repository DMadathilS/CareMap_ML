import React from "react";

function speak(text: string) {
  window.speechSynthesis.cancel();
  if (text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }
}

export const SpeakOnHover = ({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => speak(text)} aria-label={text}>
      {children}
    </div>
  );
};
