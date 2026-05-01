import React from 'react';

interface HtmlContentProps {
  html: string;
  className?: string;
}

/**
 * Safely renders HTML content from rich text editors
 * Applies prose styling for proper formatting
 */
export const HtmlContent: React.FC<HtmlContentProps> = ({ html, className = '' }) => {
  if (!html || typeof html !== 'string') {
    return null;
  }

  return (
    <div
      className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default HtmlContent;
