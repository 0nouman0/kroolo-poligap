import { memo } from "react";
import { motion } from "framer-motion";
import type { Reference, ReferenceCardsProps } from "./../../../types/agent";
import { getDomainName, getFaviconUrl } from "./../../../utils/utils";

const ReferenceCard = memo(({ reference }: { reference: Reference }) => {
  const faviconUrl = getFaviconUrl(reference.url);
  const domain = getDomainName(reference.url);

  return (
    <motion.a
      href={reference.url}
      target='_blank'
      rel='noopener noreferrer'
      className='group relative flex min-h-[80px] cursor-pointer flex-col justify-between overflow-hidden rounded-[8px] border border-[var(--card-border-color)] bg-[var(--agent-background-color)] p-2.5'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ 
        scale: 1.02, 
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        boxShadow: "0 0 0 rgba(0,0,0,0)"
      }}
    >
      <motion.div 
        className='absolute inset-0 rounded-[8px] shadow-md opacity-0'
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          background: "var(--agent-background-color)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}
      />
      
      <div className='relative z-10 flex items-start gap-3'>
        <motion.div 
          className='mt-0.5 flex-shrink-0'
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt={`${domain} favicon`}
              className='h-4 w-4 rounded-sm'
              onError={e => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className='flex h-4 w-4 items-center justify-center rounded-xl bg-gray-300'>
              <span className='text-[8px] text-gray-600'>🌐</span>
            </div>
          )}
        </motion.div>
        
        <div className='min-w-0 flex-1'>
          <motion.p
            style={{
              textTransform: "capitalize",
            }}
            className='line-clamp-1 overflow-ellipsis text-[13px] leading-tight font-medium text-[var(--secondary-text-color)] transition-colors'
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.2 }}
          >
            {domain}
          </motion.p>
        </div>
      </div>
      
      <motion.div 
        className='relative z-10 mt-2 flex items-center gap-1'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.2 }}
      >
        <span className='text-xs overflow-ellipsis font-medium text-[var(--text-color)] line-clamp-2'>
          {reference.title}
        </span>
      </motion.div>
    </motion.a>
  );
});

const ReferenceCards = memo(({ references }: ReferenceCardsProps) => {
  if (references.length === 0) {
    return (
      <motion.p 
        className='text-muted'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        No references available
      </motion.p>
    );
  }

  return (
    <motion.div 
      className='flex flex-col gap-6'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {references.map((referenceData, index) => (
        <motion.div 
          key={`${referenceData.query}-${index}`} 
          className='flex flex-col gap-3'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: index * 0.1,
            duration: 0.4,
            ease: "easeOut"
          }}
        >
          {referenceData.query && references.length > 1 && (
            <motion.h2
              className='text-[var(--secondary-text-color)] mb-1 text-[13px] font-medium'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: index * 0.1 + 0.1,
                duration: 0.3
              }}
            >
              {referenceData.query}
            </motion.h2>
          )}

          <motion.div 
            className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              delay: index * 0.1 + 0.2,
              duration: 0.3
            }}
          >
            {referenceData.references.map((reference, refIndex) => (
              <motion.div
                key={`${reference.title}-${refIndex}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: index * 0.1 + refIndex * 0.05 + 0.3,
                  duration: 0.3,
                  ease: "easeOut"
                }}
              >
                <ReferenceCard reference={reference} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
});

ReferenceCard.displayName = "ReferenceCard";
ReferenceCards.displayName = "ReferenceCards";

export default ReferenceCards;