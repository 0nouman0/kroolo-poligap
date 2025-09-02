import type { GenericToolProps, SearchQueryProps, SourceProps, ThoughtProps, ToolCallsProps } from "@/types/agent";
import { memo } from "react";

import { useAgentStore } from "./../../../store/agent-store";
import Icon from "./../../../ui/icon";
import { getDomainName, getFaviconUrl } from "./../../../utils/utils";

const SearchQuery = memo(({ query }: SearchQueryProps) => {
  return (
    <div className='flex transform items-center gap-1 rounded-2xl border border-[var(--card-border-color)] bg-[var(--agent-background-color)] px-1.5 py-0.5 transition-transform duration-200'>
      <Icon type='search' size='xs' className='flex-shrink-0 text-[var(--secondary-text-color)]' />
      <span className='truncate text-xs text-[var(--text-color)]'>{query}</span>
    </div>
  );
});

const Thought = memo(({ thought, title }: ThoughtProps) => {
  return (
    <div className='flex max-w-xs min-w-20 transform items-start gap-2 rounded-2xl border border-[var(--card-border-color)] bg-[var(--agent-background-color)] px-2 py-1.5 transition-all duration-300'>
      <Icon type='brain' size='xs' className='mt-0.5 flex-shrink-0 text-[var(--secondary-text-color)]' />
      <div className='flex min-w-0 flex-col'>
        {title && <span className='truncate text-xs font-medium text-[var(--text-color)]'>{title}</span>}
        <span className='line-clamp-2 text-xs text-[var(--secondary-text-color)]'>{thought}</span>
      </div>
    </div>
  );
});

const Source = memo(({ url }: SourceProps) => {
  const domain = getDomainName(url);
  const faviconUrl = getFaviconUrl(url);

  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className='flex transform cursor-pointer items-center gap-1.5 rounded-2xl border border-[var(--card-border-color)] bg-[var(--agent-background-color)] px-2 py-1 transition-all duration-200 '>
      {faviconUrl ? (
        <img
          src={faviconUrl}
          alt={`${domain} favicon`}
          className='h-3.5 w-3.5 flex-shrink-0 rounded-sm'
          onError={e => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className='flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-sm bg-gray-300'>
          <span className='text-[8px]'>🌐</span>
        </div>
      )}
      <span className='truncate text-xs text-[var(--text-color)]'>{domain}</span>
    </a>
  );
});

const GenericTool = memo(({ toolName, toolLabel, task }: GenericToolProps) => {
  const displayText = task ?? toolLabel ?? toolName;

  return (
    <div className='flex w-fit max-w-xs min-w-20 transform items-start gap-2 rounded-2xl border border-[var(--card-border-color)] bg-[var(--agent-background-color)] px-2 py-1.5 transition-all duration-300'>
      <Icon type='brain' size='xs' className='mt-0.5 flex-shrink-0 text-[var(--secondary-text-color)]' />
      <div className='flex min-w-0 flex-col'>
        {(toolLabel ?? toolName) && task && (
          <span className='truncate text-xs font-medium text-[var(--text-color)]'>{toolLabel ?? toolName}</span>
        )}
        <span className='line-clamp-2 text-xs text-[var(--secondary-text-color)]'>{displayText}</span>
      </div>
    </div>
  );
});

const ToolCalls = memo(({ toolCalls, message }: ToolCallsProps) => {
  const { isStreaming } = useAgentStore();
  const runningTools = toolCalls.filter(tool => !tool.tool_call_error && !tool.metrics?.time);
  const finishedTools = toolCalls.filter(tool => !tool.tool_call_error && tool.metrics?.time);
  const errorTools = toolCalls.filter(tool => tool.tool_call_error);

  const searchQueries: string[] = [];
  const thoughts: { thought: string; title?: string }[] = [];
  const allReferences: { url: string; title: string }[] = [];
  const genericTools: { toolName: string; toolLabel?: string; task?: string }[] = [];

  const isSearchTool = (toolName: string) => {
    return (
      toolName === "web_search_using_tavily" ||
      toolName === "search_user_files" ||
      toolName === "search_kroolo_help_centre"
    );
  };

  const isThinkTool = (toolName: string) => {
    return toolName === "think";
  };

  toolCalls.forEach(tool => {
    if (isSearchTool(tool.tool_name) && tool.tool_args.query) {
      searchQueries.push(tool.tool_args.query);
    } else if (isThinkTool(tool.tool_name) && tool.tool_args.thought) {
      thoughts.push({
        thought: tool.tool_args.thought,
        title: tool.tool_args.title,
      });
    } else if (!isSearchTool(tool.tool_name) && !isThinkTool(tool.tool_name)) {
      const existingTool = genericTools.find(gt => gt.toolName === tool.tool_name);
      if (!existingTool) {
        genericTools.push({
          toolName: tool.tool_name,
          toolLabel: tool.tool_label,
          task: tool.tool_args.task ?? tool.tool_args.query,
        });
      }
    }

    tool.tool_references.forEach(refData => {
      refData.references.forEach(ref => {
        if (!allReferences.some(existing => existing.url === ref.url)) {
          allReferences.push(ref);
        }
      });
    });
  });

  const getMainTitle = () => {
    const runningSearchTools = runningTools.filter(tool => isSearchTool(tool.tool_name));
    const runningThinkTools = runningTools.filter(tool => isThinkTool(tool.tool_name));
    const runningGenericTools = runningTools.filter(
      tool => !isSearchTool(tool.tool_name) && !isThinkTool(tool.tool_name),
    );

    const activeSections = [];
    if (runningSearchTools.length > 0) activeSections.push("Searching");
    if (runningThinkTools.length > 0) activeSections.push("Reasoning");
    if (runningGenericTools.length > 0) activeSections.push("Processing");

    if (activeSections.length > 1) {
      return activeSections.join(" & ");
    }
    if (runningSearchTools.length > 0) {
      return runningSearchTools.length === 1 ? "Searching" : `Searching (${runningSearchTools.length})`;
    }
    if (runningThinkTools.length > 0) {
      return runningThinkTools.length === 1 ? "Reasoning" : `Reasoning (${runningThinkTools.length})`;
    }
    if (runningGenericTools.length > 0) {
      return runningGenericTools.length === 1 ? "Processing" : `Processing (${runningGenericTools.length})`;
    }
    return "Processing tasks";
  };

  return (
    <div className='flex flex-col gap-3'>
      {(runningTools.length > 0 || searchQueries.length > 0 || thoughts.length > 0 || genericTools.length > 0) && (
        <div className='flex transform flex-col gap-2.5 transition-all duration-500'>
          <div className='flex items-center gap-2'>
            <div className='flex h-5 w-5 items-center justify-center'>
              {isStreaming === message.id ? (
              <Icon type='tool-loader' size='xs' className='text-inherit' />
              ) : (
                <div className='h-2 w-2 -translate-y-px transform animate-pulse rounded-full bg-blue-500'></div>
              )}
            </div>
            <h4 className='text-[13px] text-[var(--secondary-text-color)]'>{getMainTitle()}</h4>
          </div>

          {searchQueries.length > 0 && (
            <div className='slide-in-from-left ml-7 flex transform flex-col gap-3 transition-all duration-300'>
              <p className='text-xs text-[var(--secondary-text-color)]'>
                Searching {searchQueries.length > 1 ? `(${searchQueries.length})` : ""}
              </p>
              <div className='flex flex-wrap gap-2'>
                {searchQueries.map((query, index) => (
                  <div
                    key={`query-${index}`}
                    className='transform transition-all duration-200'
                    style={{ animationDelay: `${index * 100}ms` }}>
                    <SearchQuery query={query} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {thoughts.length > 0 && (
            <div className='slide-in-from-left ml-7 flex transform flex-col gap-3 transition-all duration-300'>
              <p className='text-xs text-[var(--secondary-text-color)]'>
                Reasoning {thoughts.length > 1 ? `(${thoughts.length})` : ""}
              </p>
              <div className='flex flex-wrap gap-2'>
                {thoughts.map((thoughtData, index) => (
                  <div
                    key={`thought-${index}`}
                    className='transform transition-all duration-300'
                    style={{ animationDelay: `${index * 150}ms` }}>
                    <Thought thought={thoughtData.thought} title={thoughtData.title} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {genericTools.length > 0 && (
            <div className='slide-in-from-left ml-7 flex transform flex-col gap-3 transition-all duration-300'>
              <p className='text-xs text-[var(--secondary-text-color)]'>
                Processing {genericTools.length > 1 ? `(${genericTools.length})` : ""}
              </p>
              <div className='flex flex-wrap gap-2'>
                {genericTools.map((tool, index) => (
                  <div
                    key={`generic-${index}`}
                    className='transform transition-all duration-300'
                    style={{ animationDelay: `${index * 120}ms` }}>
                    <GenericTool toolName={tool.toolName} toolLabel={tool.toolLabel} task={tool.task} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {allReferences.length > 0 && (
            <div className='slide-in-from-left ml-7 flex transform flex-col gap-3 transition-all duration-300'>
              <p className='text-xs text-[var(--secondary-text-color)]'>Reading</p>
              <div className='flex flex-wrap gap-2'>
                {allReferences.map((reference, index) => (
                  <div
                    key={`source-${index}`}
                    className='transform transition-all duration-200'
                    style={{ animationDelay: `${index * 80}ms` }}>
                    <Source url={reference.url} title={reference.title} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {finishedTools.length > 0 && (
        <div className='slide-in-from-bottom flex transform flex-col gap-3 transition-all duration-500'>
          <div className='flex items-center gap-2'>
            <div className='flex h-5 w-5 items-center justify-center'>
              <div className='h-2 w-2 -translate-y-px transform rounded-full bg-green-500'></div>
            </div>
            <h4 className='text-[13px] text-[var(--secondary-text-color)]'>
              {isStreaming === message.id ? "Analysing" : "Finished"}
            </h4>
          </div>
        </div>
      )}

      {errorTools.length > 0 && (
        <div className='slide-in-from-right flex transform flex-col gap-3 transition-all duration-500'>
          <div className='flex items-center gap-2'>
            <div className='flex h-5 w-5 items-center justify-center'>
              <div className='h-2 w-2 -translate-y-px transform animate-pulse rounded-full bg-red-500'></div>
            </div>
            <h4 className='text-[13px] text-[var(--secondary-text-color)]'>Failed</h4>
          </div>
          <div className='ml-7'>
            <div className='flex flex-wrap gap-2'>
              {errorTools.map((toolCall, index) => (
                <div
                  key={`error-${toolCall.tool_call_id}-${index}`}
                  className='transform rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 transition-all duration-300'>
                  {toolCall.tool_label || toolCall.tool_name} failed
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

SearchQuery.displayName = "SearchQuery";
Thought.displayName = "Thought";
Source.displayName = "Source";
GenericTool.displayName = "GenericTool";
ToolCalls.displayName = "ToolCalls";

export default ToolCalls;
