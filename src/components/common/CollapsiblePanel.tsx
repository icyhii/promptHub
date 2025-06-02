import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  previewText?: string;
  panelKey: string;
  isExpandedProp?: boolean;
  className?: string;
}

export default function CollapsiblePanel({
  title,
  children,
  previewText,
  panelKey,
  isExpandedProp,
  className
}: CollapsiblePanelProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem(`panel-${panelKey}`);
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    if (isExpandedProp !== undefined) {
      setIsExpanded(isExpandedProp);
    }
  }, [isExpandedProp]);

  useEffect(() => {
    localStorage.setItem(`panel-${panelKey}`, JSON.stringify(isExpanded));
  }, [isExpanded, panelKey]);

  return (
    <div className={cn("border border-gray-200 rounded-lg", className)}>
      <button
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronDown size={20} className="mr-2 text-gray-500" />
          ) : (
            <ChevronRight size={20} className="mr-2 text-gray-500" />
          )}
          <span className="font-medium">{title}</span>
        </div>
      </button>

      <div
        className={cn(
          "transition-all duration-300 overflow-hidden",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 border-t border-gray-200">
          {isExpanded ? children : previewText}
        </div>
      </div>
    </div>
  );
}