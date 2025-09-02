"use client";

import type { FC } from "react";

import type {
  AnchorLinkProps,
  BlockquoteProps,
  BoldTextProps,
  DeletedTextProps,
  EmphasizedTextProps,
  HeadingProps,
  HorizontalRuleProps,
  ImgProps,
  ItalicTextProps,
  OrderedListProps,
  ParagraphProps,
  PreparedTextProps,
  StrongTextProps,
  TableBodyProps,
  TableCellProps,
  TableHeaderCellProps,
  TableHeaderProps,
  TableProps,
  TableRowProps,
  UnderlinedTextProps,
  UnorderedListProps,
} from "./types";
import { cn } from "../../../utils/utils";
import { HEADING_SIZES } from "../Heading/constants";
import { PARAGRAPH_SIZES } from "../Paragraph/constants";

const filterProps = (props: object) => {
  const newProps = { ...props };

  if ("node" in newProps) {
    delete newProps.node;
  }

  return newProps;
};

const UnorderedList = ({ className, ...props }: UnorderedListProps) => (
  <ul className={cn(className, PARAGRAPH_SIZES.body, "flex list-disc flex-col pl-10")} {...filterProps(props)} />
);

const OrderedList = ({ className, ...props }: OrderedListProps) => (
  <ol className={cn(className, PARAGRAPH_SIZES.body, "flex list-decimal flex-col pl-10")} {...filterProps(props)} />
);

const Paragraph = ({ className, ...props }: ParagraphProps) => (
  <p className={cn(className, PARAGRAPH_SIZES.body)} {...filterProps(props)} />
);

const EmphasizedText = ({ className, ...props }: EmphasizedTextProps) => (
  <em className={cn(className, "text-sm font-semibold")} {...filterProps(props)} />
);

const ItalicText = ({ className, ...props }: ItalicTextProps) => (
  <i className={cn(className, "italic", PARAGRAPH_SIZES.body)} {...filterProps(props)} />
);

const StrongText = ({ className, ...props }: StrongTextProps) => (
  <strong className={cn(className, "text-sm font-semibold")} {...filterProps(props)} />
);

const BoldText = ({ className, ...props }: BoldTextProps) => (
  <b className={cn(className, "text-sm font-semibold")} {...filterProps(props)} />
);

const UnderlinedText = ({ className, ...props }: UnderlinedTextProps) => (
  <u className={cn(className, "underline", PARAGRAPH_SIZES.body)} {...filterProps(props)} />
);

const DeletedText = ({ className, ...props }: DeletedTextProps) => (
  <del className={cn(className, "text-muted line-through", PARAGRAPH_SIZES.body)} {...filterProps(props)} />
);

const HorizontalRule = ({ className, ...props }: HorizontalRuleProps) => (
  <hr className={cn(className, "hidden")} {...filterProps(props)} />
);

const InlineCode: FC<PreparedTextProps> = ({ children }) => {
  return (
    <div className='relative my-4 rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-900'>
      <div className='flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-700 dark:bg-gray-800'>
        <div className='flex space-x-2'>
          <div className='h-3 w-3 rounded-full bg-red-400'></div>
          <div className='h-3 w-3 rounded-full bg-yellow-400'></div>
          <div className='h-3 w-3 rounded-full bg-green-400'></div>
        </div>
        <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>Code</span>
      </div>
      <pre className='m-0 overflow-x-auto rounded-b-lg bg-[#282c34] p-4 text-white'>
        <code className='font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-gray-100'>{children}</code>
      </pre>
    </div>
  );
};

const Blockquote = ({ className, ...props }: BlockquoteProps) => (
  <blockquote className={cn(className, "italic", PARAGRAPH_SIZES.body)} {...filterProps(props)} />
);

const AnchorLink = ({ className, ...props }: AnchorLinkProps) => (
  <a
    className={cn(className, "cursor-pointer text-xs underline")}
    target='_blank'
    rel='noopener noreferrer'
    {...filterProps(props)}
  />
);

const Heading1 = ({ className, ...props }: HeadingProps) => (
  <h1 className={cn(className, HEADING_SIZES[4])} {...filterProps(props)} />
);

const Heading2 = ({ className, ...props }: HeadingProps) => (
  <h2 className={cn(className, HEADING_SIZES[4])} {...filterProps(props)} />
);

const Heading3 = ({ className, ...props }: HeadingProps) => (
  <h3 className={cn(className, PARAGRAPH_SIZES.title)} {...filterProps(props)} />
);

const Heading4 = ({ className, ...props }: HeadingProps) => (
  <h4 className={cn(className, PARAGRAPH_SIZES.title)} {...filterProps(props)} />
);

const Heading5 = ({ className, ...props }: HeadingProps) => (
  <h5 className={cn(className, PARAGRAPH_SIZES.mono)} {...filterProps(props)} />
);

const Heading6 = ({ className, ...props }: HeadingProps) => (
  <h6 className={cn(className, PARAGRAPH_SIZES.mono)} {...filterProps(props)} />
);

const Img = ({ src, alt }: ImgProps) => {
  return (
    <div className='w-full max-w-xl'>
      <img
        src={src}
        width={96}
        height={56}
        alt={alt ?? "Rendered image"}
        className='size-full rounded-md object-cover'
      />
    </div>
  );
};

const Table = ({ className, ...props }: TableProps) => (
  <div className='border-border w-full max-w-fit overflow-hidden rounded-md border'>
    <div className='w-full overflow-x-auto'>
      <table className={cn(className, "w-full")} {...filterProps(props)} />
    </div>
  </div>
);

const TableHead = ({ className, ...props }: TableHeaderProps) => (
  <thead
    className={cn(className, "border-border rounded-md border-b bg-transparent p-2 text-left text-sm font-[600]")}
    {...filterProps(props)}
  />
);

const TableHeadCell = ({ className, ...props }: TableHeaderCellProps) => (
  <th className={cn(className, "p-2 text-sm font-[600]")} {...filterProps(props)} />
);

const TableBody = ({ className, ...props }: TableBodyProps) => (
  <tbody className={cn(className, "text-xs")} {...filterProps(props)} />
);

const TableRow = ({ className, ...props }: TableRowProps) => (
  <tr className={cn(className, "border-border border-b last:border-b-0")} {...filterProps(props)} />
);

const TableCell = ({ className, ...props }: TableCellProps) => (
  <td className={cn(className, "p-2 font-[400] whitespace-nowrap")} {...filterProps(props)} />
);

export const components = {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6,
  ul: UnorderedList,
  ol: OrderedList,
  em: EmphasizedText,
  i: ItalicText,
  strong: StrongText,
  b: BoldText,
  u: UnderlinedText,
  del: DeletedText,
  hr: HorizontalRule,
  blockquote: Blockquote,
  code: InlineCode,
  a: AnchorLink,
  img: Img,
  p: Paragraph,
  table: Table,
  thead: TableHead,
  th: TableHeadCell,
  tbody: TableBody,
  tr: TableRow,
  td: TableCell,
};
