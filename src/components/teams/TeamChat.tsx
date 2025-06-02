import { useState, useEffect, useRef } from 'react';
import { useTeam } from '../../hooks/useTeam';
import { supabase } from '../../lib/supabase';
import { Send, Paperclip, Image as ImageIcon } from 'lucide-react';
import Button from '../common/Button';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  team_id: string;
  user_id: string;
  content: string;
  attachments?: string[];
  created_at: string;
  user: {
    email: string;
  };
}

interface TeamChatProps {
  teamId: string;
}

export default function TeamChat({ teamId }: TeamChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { team } = useTeam(teamId);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
  }, [teamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('team_messages')
        .select(`
          *,
          user:user_id(email)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel(`team_messages:${teamId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'team_messages',
        filter: `team_id=eq.${teamId}`
      }, (payload) => {
        setMessages(current => [...current, payload.new as Message]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('team_messages')
        .insert({
          team_id: teamId,
          user_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `team-attachments/${teamId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: messageError } = await supabase
        .from('team_messages')
        .insert({
          team_id: teamId,
          user_id: user.id,
          content: `Shared a file: ${file.name}`,
          attachments: [filePath]
        });

      if (messageError) throw messageError;
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {team?.name} Chat
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                  {message.user.email[0].toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {message.user.email}
                  </span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {message.content}
                </div>
                {message.attachments?.map((attachment, index) => (
                  <div key={index} className="mt-2">
                    <a
                      href={`${supabase.storage.from('attachments').getPublicUrl(attachment).data.publicUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                    >
                      <Paperclip size={14} className="mr-1" />
                      {attachment.split('/').pop()}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
          >
            <Paperclip size={20} />
          </Button>
          <Button onClick={handleSendMessage}>
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}