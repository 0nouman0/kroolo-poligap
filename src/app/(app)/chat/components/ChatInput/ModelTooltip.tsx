import React, { useMemo } from 'react';

interface ModelDetail {
  model: string;
  bestAt: string;
  strengths: string;
  weaknesses: string;
}

interface ModelSpecificationTooltipProps {
  modelName: string;
}


export const AI_MODEL_DETAILS_LIST: ModelDetail[] = [
  {
    model: "Anthropic Claude 3.5 Sonnet",
    bestAt: "Reasoning, analysis, long documents",
    strengths: "Safe, coherent, deep reasoning, large context window",
    weaknesses: "Slower and costlier than smaller models",
  },
  {
    model: "Anthropic Claude 3.5 Haiku",
    bestAt: "Fast responses, light tasks",
    strengths: "Very fast, efficient, solid for summaries and chat",
    weaknesses: "Weaker on complex reasoning or technical content",
  },
  {
    model: "Anthropic Claude 3.7",
    bestAt: "Advanced reasoning, complex analysis, research",
    strengths: "Enhanced reasoning capabilities, improved context understanding, robust safety",
    weaknesses: "Higher cost, may be slower for simple tasks",
  },
  {
    model: "GPT-4o",
    bestAt: "General purpose, coding, math, multimodal",
    strengths: "High accuracy, creative writing, vision + audio support (when enabled)",
    weaknesses: "Expensive and slower under heavy load",
  },
  {
    model: "GPT-4o-mini",
    bestAt: "Real-time tasks, chatbots",
    strengths: "Lightweight, fast, cost-effective",
    weaknesses: "Limited reasoning, not ideal for technical content",
  },
  {
    model: "GPT-4.1",
    bestAt: "Enhanced general purpose, improved reasoning",
    strengths: "Better accuracy than GPT-4o, improved instruction following, multimodal",
    weaknesses: "Higher latency and cost compared to smaller models",
  },
  {
    model: "GPT-4.1-nano",
    bestAt: "Ultra-fast responses, embedded applications",
    strengths: "Extremely lightweight, very fast inference, cost-effective",
    weaknesses: "Limited capabilities, not suitable for complex tasks",
  },
  {
    model: "GPT-4.1-mini",
    bestAt: "Balanced speed and capability, chatbots",
    strengths: "Good balance of speed and intelligence, affordable",
    weaknesses: "Reduced reasoning compared to full models",
  },
  {
    model: "Deepseek R1",
    bestAt: "Code generation, math-heavy tasks",
    strengths: "Great at coding, solid open-source option",
    weaknesses: "Conversationally weaker, not tuned for natural language nuance",
  },
  {
    model: "Deepseek V3",
    bestAt: "Code generation, mathematical reasoning",
    strengths: "Strong coding abilities, good at logic and math, open-source",
    weaknesses: "Less polished for conversational use, limited multimodal support",
  },
  {
    model: "Gemini 2.0",
    bestAt: "Research, multimodal applications",
    strengths: "Excellent factual grounding, image + text support, Google integration",
    weaknesses: "Can be dry or robotic, less flexible in tone",
  },
  {
    model: "Gemini 2.5 Flash",
    bestAt: "Fast inference, light AI tasks, real-time use",
    strengths: "Extremely fast, low-latency, cost-efficient",
    weaknesses: "Not ideal for complex tasks or deep reasoning",
  },
  {
    model: "Gemini 2.5 Pro",
    bestAt: "Enterprise AI, advanced multimodal tasks",
    strengths: "High accuracy, longer context, better reasoning and vision capabilities",
    weaknesses: "Higher latency, more compute-heavy than Flash version",
  },
  {
    model: "Llama 3.3",
    bestAt: "Custom apps, research",
    strengths: "Open-source, tunable, efficient",
    weaknesses: "Varies by tuning, may lack safety and polish compared to closed models",
  },
  {
    model: "Llama 4 maverick",
    bestAt: "Experimental capabilities, research applications",
    strengths: "Latest Meta architecture, open-source, efficient inference",
    weaknesses: "Experimental nature, may lack stability and safety tuning",
  },
  {
    model: "Claude Sonnet 4",
    bestAt: "Reasoning, analysis, long documents",
    strengths: "Safe, coherent, deep reasoning, large context window",
    weaknesses: "Slower and costlier than smaller models",
  },
];


export const ModelSpecificationTooltip: React.FC<ModelSpecificationTooltipProps> = ({ modelName }) => {
  const selectedModelDetail = useMemo(
    () => AI_MODEL_DETAILS_LIST.find((model) => model.model === modelName),
    [modelName],
  );

  return (
    <div className="model-tooltip flex flex-col gap-2" style={{ width: '280px' }}>
      <div className="flex flex-col">
        <div className="truncate text-xs font-medium">
          {selectedModelDetail?.model}
        </div>

        <div 
          className="my-1 opacity-40" 
          style={{ borderBottom: '1px solid var(--card-border)' }}
        />
        
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <div className="truncate text-xs font-medium">
              Best At
            </div>
            <div className="opacity-80 text-xs">
              {selectedModelDetail?.bestAt}
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="truncate text-xs font-medium">
              Strengths
            </div>
            <div className="opacity-80 text-xs">
              {selectedModelDetail?.strengths}
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="truncate text-xs font-medium">
              Weaknesses
            </div>
            <div className="opacity-80 text-xs">
              {selectedModelDetail?.weaknesses}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};