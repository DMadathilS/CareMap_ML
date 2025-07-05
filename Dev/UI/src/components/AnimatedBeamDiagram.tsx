// Imports
import React, { forwardRef, useRef } from "react";
import { AnimatedBeam } from "../components/magicui/animated-beam";
import { cn } from "../lib/utils";
import {
  FiUser,
  FiCpu,
  FiSearch,
  FiDatabase,
  FiFileText,
  FiRefreshCw,
  FiSend,
  FiHome,
  FiUserCheck,
} from "react-icons/fi";
import { FaFlaskVial } from "react-icons/fa6";
import { SiPostgresql } from "react-icons/si";
import { SiOllama } from "react-icons/si";

interface NodeProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const Node = forwardRef<HTMLDivElement, NodeProps>(
  ({ label, icon: Icon, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center space-x-2 rounded-2xl border px-4 py-2 shadow-md bg-white",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{label}</span>
    </div>
  )
);
Node.displayName = "Node";

export default function AnimatedBeamDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const llmRef = useRef<HTMLDivElement>(null);
  const retrieverRef = useRef<HTMLDivElement>(null);
  const realtimeAPIRef = useRef<HTMLDivElement>(null);
  const vectorDBRef = useRef<HTMLDivElement>(null);
  const documentsRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const labRef = useRef<HTMLDivElement>(null);
  const clinicRef = useRef<HTMLDivElement>(null);
  const providerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative w-full py-10 flex flex-col items-center gap-12 overflow-visible"
    >
      {/* Top Row */}
      <div className="flex items-center justify-center gap-16">
        <Node
          ref={userRef}
          icon={FiUser}
          label="User Query"
          className="bg-yellow-100 border-yellow-400"
        />
        <Node
          ref={llmRef}
          icon={SiOllama}
          label="LLM"
          className="bg-green-100 border-green-400"
        />
        <Node
          ref={answerRef}
          icon={FiSend}
          label="Answer to User"
          className="bg-purple-100 border-purple-400"
        />
      </div>

      {/* Middle Row */}
      <div className="flex items-center justify-center gap-20">
        <Node
          ref={retrieverRef}
          icon={FiSearch}
          label="Retriever"
          className="bg-blue-100 border-blue-400"
        />
        <Node
          ref={realtimeAPIRef}
          icon={FiRefreshCw}
          label="Real-time API"
          className="bg-pink-100 border-pink-400"
        />
      </div>

      {/* Lower Row */}
      <div className="flex items-center justify-center gap-20">
        <Node
          ref={vectorDBRef}
          icon={SiPostgresql} //FiDatabase
          label="Vector DB"
          className="bg-blue-50 border-blue-400"
        />
        <Node
          ref={documentsRef}
          icon={FiFileText}
          label="Documents"
          className="bg-slate-100 border-slate-400"
        />
      </div>

      {/* Data Sources */}
      <div className="flex items-center justify-center gap-16">
        <Node ref={labRef} label="Lab Data" icon={FaFlaskVial} />
        <Node ref={clinicRef} label="Clinics/Hospitals" icon={FiHome} />
        <Node ref={providerRef} label="Provider Data" icon={FiUserCheck} />
      </div>

      {/* Animated Beams */}
      <AnimatedBeam containerRef={containerRef} fromRef={userRef} toRef={llmRef} />
      <AnimatedBeam containerRef={containerRef} fromRef={llmRef} toRef={answerRef} />

      <AnimatedBeam containerRef={containerRef} fromRef={llmRef} toRef={retrieverRef} />
      <AnimatedBeam containerRef={containerRef} fromRef={llmRef} toRef={realtimeAPIRef} />

      <AnimatedBeam containerRef={containerRef} fromRef={retrieverRef} toRef={vectorDBRef} />
      <AnimatedBeam containerRef={containerRef} fromRef={documentsRef} toRef={retrieverRef}reverse />

      <AnimatedBeam containerRef={containerRef} fromRef={retrieverRef} toRef={llmRef} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={realtimeAPIRef} toRef={llmRef} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={vectorDBRef} toRef={documentsRef}  />

      <AnimatedBeam containerRef={containerRef} fromRef={labRef} toRef={vectorDBRef} />
      <AnimatedBeam containerRef={containerRef} fromRef={clinicRef} toRef={vectorDBRef} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={providerRef} toRef={vectorDBRef} reverse/>
    </div>
  );
}