import { WithContext as ReactTags } from 'react-tag-input';

interface TagInputProps {
  tags: { id: string; text: string }[];
  suggestions?: { id: string; text: string }[];
  onAddTag: (tag: { id: string; text: string }) => void;
  onDeleteTag: (i: number) => void;
  placeholder?: string;
}

export default function TagInput({
  tags,
  suggestions = [],
  onAddTag,
  onDeleteTag,
  placeholder = 'Add a tag...'
}: TagInputProps) {
  return (
    <ReactTags
      tags={tags}
      suggestions={suggestions}
      handleDelete={onDeleteTag}
      handleAddition={onAddTag}
      delimiters={[188, 13]} // comma and enter
      placeholder={placeholder}
      inputFieldPosition="bottom"
      classNames={{
        tags: 'flex flex-wrap gap-2',
        tagInput: 'mt-2',
        tagInputField: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
        selected: 'flex flex-wrap gap-2',
        tag: 'inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800',
        remove: 'ml-1 text-blue-400 hover:text-blue-500 cursor-pointer',
        suggestions: 'mt-2 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm',
        suggestionActive: 'bg-blue-50',
      }}
    />
  );
}