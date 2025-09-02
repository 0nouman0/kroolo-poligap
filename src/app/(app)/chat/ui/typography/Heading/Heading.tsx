'use client'

import type {FC, JSX} from 'react';
import { HEADING_SIZES } from './constants'
import type {HeadingProps} from './types';
import { cn } from './../../../utils/utils'

const Heading: FC<HeadingProps> = ({ children, size, fontSize, className }) => {
  const Tag = `h${size}` as keyof JSX.IntrinsicElements

  return (
    <Tag
      className={cn(
        'flex items-center gap-x-3 font-semibold',
        fontSize ? HEADING_SIZES[fontSize] : HEADING_SIZES[size],
        className
      )}
    >
      {children}
    </Tag>
  )
}

export default Heading
