import { IconType } from "./icon";

export interface ToolCall {
  role: "user" | "tool" | "system" | "assistant";
  content?: string | null;
  tool_call_id: string;
  tool_name: string;
  result?: string;
  tool_args: Record<string, string>;
  tool_call_error?: boolean;
  tool_label: string;
  tool_references: ReferenceData[];
  metrics?: {
    time: number;
  };
  created_at?: number;
}
export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface SearchResponse {
  query: string | undefined;
  answer: string | null;
  results: SearchResult[];
}

type SearchAnswer = string | null;

export interface StrictSearchResponse {
  query: string;
  answer: SearchAnswer;
  results: SearchResult[];
}

export interface ToollabelMapProps {
  tool_name: string;
}
export interface ReasoningSteps {
  title: string;
  action?: string;
  result: string;
  reasoning: string;
  confidence?: number;
  next_action?: string;
}
export interface AgnoRequestDataType {
  user_id: string | null;
  organization_id: string | null;
  agent_id: string;
  user_query: string;
  session_id?: string;
  provider?: string;
  model?: string;
  language?: string;
  web_search?: boolean;
  reasoning?: boolean;
  search_depth?: string;
  max_tokens?: number;
}
export interface ReasoningStepProps {
  index: number;
  stepTitle: string;
}
export interface ReasoningProps {
  reasoning: ReasoningSteps[];
}

export interface ToolCallProps {
  tools: ToolCall;
}
interface ModelMessage {
  content: string | null;
  context?: MessageContext[];
  created_at: number;
  metrics?: {
    time: number;
    prompt_tokens: number;
    input_tokens: number;
    completion_tokens: number;
    output_tokens: number;
  };
  name: string | null;
  role: string;
  tool_args?: unknown;
  tool_call_id: string | null;
  tool_calls:
    | {
        function: {
          arguments: string;
          name: string;
        };
        id: string;
        type: string;
      }[]
    | null;
}

export interface Model {
  name: string;
  model: string;
  provider: string;
}

export interface Agent {
  agent_id: string;
  name: string;
  description: string;
  model: Model;
  storage?: boolean;
}

interface MessageContext {
  query: string;
  docs?: Record<string, object>[];
  time?: number;
}

export enum RunEvent {
  RunStarted = "RunStarted",
  RunResponseContent = "RunResponseContent",
  RunCompleted = "RunCompleted",
  ToolCallStarted = "ToolCallStarted",
  ToolCallCompleted = "ToolCallCompleted",
  UpdatingMemory = "UpdatingMemory",
  ReasoningStarted = "ReasoningStarted",
  ReasoningStep = "ReasoningStep",
  ReasoningCompleted = "ReasoningCompleted",
  RunError = "RunError",
}
export interface ResponseAudio {
  id?: string;
  content?: string;
  transcript?: string;
  channels?: number;
  sample_rate?: number;
}
export interface RunResponse {
  content?: string | object;
  content_type: string;
  context?: MessageContext[];
  event: RunEvent;
  event_data?: object;
  messages?: ModelMessage[];
  metrics?: object;
  model?: string;
  run_id?: string;
  agent_id?: string;
  session_id?: string;
  created_at?: number;
  tools?: ToolCall[];
  tool?: ToolCall;
  extra_data?: PlaygroundAgentExtraData;
  images?: ImageData[];
  videos?: VideoData[];
  audio?: AudioData[];
  response_audio?: ResponseAudio;
}

export interface AgentExtraData {
  reasoning_steps?: ReasoningSteps[];
  reasoning_messages?: ReasoningMessage[];
  references?: ReferenceData[];
}

export interface ToolCallsProps {
  toolCalls: ToolCall[];
  message: PlaygroundChatMessage;
}

export interface SearchQueryProps {
  query: string;
}

export interface ThoughtProps {
  thought: string;
  title?: string;
}

export interface SourceProps {
  url: string;
  title: string;
}

export interface GenericToolProps {
  toolName: string;
  toolLabel?: string;
  task?: string;
}

export interface MessageProps {
  message: PlaygroundChatMessage;
  handleCreateProject?: (content: PlaygroundChatMessage) => void;
  handleCreateDoc?: (content: PlaygroundChatMessage) => Promise<void>;
  exportReactComponentAsPDF?: (
    component: React.ReactElement,
    options: {
      title: string;
      fileName: string;
      fileFormat: string;
    }
  ) => Promise<void>;
}

export interface MessageListProps {
  messages: PlaygroundChatMessage[];
  isGlobalAgent: boolean;
  handleCreateProject?: (content: PlaygroundChatMessage) => void;
  handleCreateDoc?: (content: PlaygroundChatMessage) => Promise<void>;
  exportReactComponentAsPDF?: (
    component: React.ReactElement,
    options: {
      title: string;
      fileName: string;
      fileFormat: string;
    }
  ) => Promise<void>;
}

export interface MessageWrapperProps {
  message: PlaygroundChatMessage;
  handleCreateProject?: (content: PlaygroundChatMessage) => void;
  handleCreateDoc?: (content: PlaygroundChatMessage) => Promise<void>;
  isLastMessage: boolean;
  exportReactComponentAsPDF?: (
    component: React.ReactElement,
    options: {
      title: string;
      fileName: string;
      fileFormat: string;
    }
  ) => Promise<void>;
}

export type TabType =
  | "content"
  | "references"
  | "videos"
  | "images"
  | "audio"
  | "tasks";

export interface TabData {
  id: TabType;
  label: string;
  icon: IconType;
  count?: number;
}

export interface ExportOptionProps {
  id: number;
  title: string;
  icon: IconType;
}

export interface PlaygroundAgentExtraData extends AgentExtraData {
  reasoning_messages?: ReasoningMessage[];
  references?: ReferenceData[];
}

export interface ReasoningMessage {
  content?: string | null;
  tool_call_id?: string;
  tool_name?: string;
  tool_args?: Record<string, string>;
  tool_call_error?: boolean;
  metrics?: {
    time: number;
  };
  references?: ReferenceData[];
  created_at?: number;
}

export interface PlaygroundChatMessage {
  id: string;
  user_query: string;
  conversation_id?: string;
  content?: string;
  streamingError?: boolean;
  created_at: number;
  tool_calls?: ToolCall[];
  extra_data?: {
    reasoning_steps?: ReasoningSteps[];
    reasoning_messages?: ReasoningMessage[];
    references?: ReferenceData[];
  };
  images?: ImageData[];
  videos?: VideoData[];
  audio?: AudioData[];
  response_audio?: ResponseAudio;
}
export interface ReferenceData {
  query: string;
  references: Reference[];
  time?: number;
  tool_call_id?: string;
}

export interface ReferenceCardsProps {
  references: ReferenceData[];
}
export interface ImageData {
  revised_prompt: string;
  url: string;
}

export interface VideoData {
  id: number;
  eta: number;
  url: string;
}

export interface AudioData {
  base64_audio?: string;
  mime_type?: string;
  url?: string;
  id?: string;
  content?: string;
  channels?: number;
  sample_rate?: number;
}

export interface ReferenceData {
  query: string;
  references: Reference[];
  time?: number;
  tool_call_id?: string;
}

export interface Reference {
  url: string;
  title: string;
}

export interface MultiSelectOption {
  id: string;
  label: string;
  enabled: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  onChange: (options: MultiSelectOption[]) => void;
  placeholder?: string;
  disabled?: boolean;
}
export interface UploadMediaResponse {
  status: string;
  data: MediaTypeProps;
  message?: string;
}
export interface UploadMediaParams {
  file: FormData;
}
export interface ExtractMediaParams {
  file_id: string;
}
export interface SessionEntry {
  session_id: string;
  title: string;
  created_at: number;
}
export interface SelectedLanguageType {
  code: string;
  name: string;
}
export interface SelectedLanguageTypeProps {
  value: SelectedLanguageType | undefined;
  disabled?: boolean;
  onSelect: (type: SelectedLanguageType) => void;
}
export interface SelectedLlmType {
  modelName: string;
  modelId: string;
  shortName: string;
  modelIcon: IconType;
  provider: string;
}
export interface ChatActionsType {
  setMessages: (
    messages:
      | PlaygroundChatMessage[]
      | ((prevMessages: PlaygroundChatMessage[]) => PlaygroundChatMessage[])
  ) => void;
}
export interface SelectedLlmTypeProps {
  value: SelectedLlmType | undefined;
  disabled?: boolean;
  onSelect: (type: SelectedLlmType) => void;
}
export interface AgentType {
  agent_id: string;
  user_description?: string;
  user_instructions?: string;
  agno_id?: string;
  enabledKnowledge?: boolean;
  isPublic?: boolean;
  agent_name?: string;
  inputMessage: string;
  setOpenGlobalModal?: () => void;
  setInputMessage: (inputMessage: string) => void;
  isTrained: boolean;
  messages: PlaygroundChatMessage[];
  setMessages: (
    messages:
      | PlaygroundChatMessage[]
      | ((prevMessages: PlaygroundChatMessage[]) => PlaygroundChatMessage[])
  ) => void;
  selectedModel?: string;
  setSelectedModel?: (model: string) => void;
  setSelectedLanguage?: (language: SelectedLanguageType) => void;
  handleCreateConversation?: (
    agentId: string
  ) => Promise<AgentSelectedChatType>;
  exportReactComponentAsPDF?: (
    component: React.ReactElement,
    options: {
      title: string;
      fileName: string;
      fileFormat: string;
    }
  ) => Promise<void>;
  selectedConversation?: AgentSelectedChatType;
  selectedLanguage?: {
    code: string;
    name: string;
  };
  medias?: MediaTypeProps[];
  generateTitle?: (input: string) => void;
  isGlobalAgent?: boolean;
  handleCreateProject?: (content: PlaygroundChatMessage) => void;
  handleCreateDoc?: (content: PlaygroundChatMessage) => Promise<void>;
  publicCompanyId?: string;
  publicUserId?: string;
}

export interface companyPropTypes {
  companyId: string;
}

export interface AgentSelectedChatType {
  _id: string;
  chatName: string;
  createdAt: string;
}

export interface UseStreamHandlerProps {
  agent_id: string;
  agent_name?: string;
  isGlobalAgent?: boolean;
  messages: PlaygroundChatMessage[];
  enabledKnowledge?: boolean;
  setMessages: (
    messages:
      | PlaygroundChatMessage[]
      | ((prevMessages: PlaygroundChatMessage[]) => PlaygroundChatMessage[])
  ) => void;
  agno_id?: string;
  selectedModel?: string;
  selectedMedia: MediaTypeProps[];
  publicCompanyId?: string;
  publicUserId?: string;
  inputMessage: string;
  medias?: MediaTypeProps[];
  setInputMessage: (inputMessage: string) => void;
  selectedOptions: MultiSelectOption[];
  isTrained: boolean;
  selectedLanguage: {
    code: string;
    name: string;
  };
  isPublic?: boolean;
  handleCreateConversation?: (
    agentId: string
  ) => Promise<AgentSelectedChatType>;
  selectedConversation?: AgentSelectedChatType;
  user_description?: string;
  user_instructions?: string;
}

export interface AddMediaButtonProps {
  agent_id?: string;
  disabled?: boolean;
}
export interface MediaTypeProps {
  _id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  companyId: string;
  createdBy: string;
  status?: string;
  projectId?: string;
  projectColor?: string;
  fileSize?: string;
  documentId?: string;
}

export interface FileCardProps {
  file: MediaTypeProps;
  onClose?: (file: MediaTypeProps) => void;
  onClick?: (file: MediaTypeProps) => void;
  className?: string;
}
