import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Call {
  id: string;
  tenant_id: string;
  caller_phone: string;
  duration: number;
  status: string;
  intent: string | null;
  confidence_score: number;
  transcript: string | null;
  created_at: string;
}

interface CallTranscript {
  id: string;
  call_id: string;
  speaker: string;
  message: string;
  timestamp: string;
  confidence: number;
}

export const useRealTimeUpdates = () => {
  const { profile } = useAuth();
  const [activeCalls, setActiveCalls] = useState<Call[]>([]);
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [transcripts, setTranscripts] = useState<Record<string, CallTranscript[]>>({});

  useEffect(() => {
    if (!profile?.tenant_id) return;

    // Set up real-time subscription for calls
    const callsChannel = supabase
      .channel('calls-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls',
          filter: `tenant_id=eq.${profile.tenant_id}`
        },
        (payload) => {
          console.log('Call update:', payload);
          const call = payload.new as Call;
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (call.status === 'active' || call.status === 'incoming') {
              setActiveCalls(prev => {
                const existing = prev.find(c => c.id === call.id);
                if (existing) {
                  return prev.map(c => c.id === call.id ? call : c);
                }
                return [...prev, call];
              });
            } else {
              setActiveCalls(prev => prev.filter(c => c.id !== call.id));
              setRecentCalls(prev => {
                const filtered = prev.filter(c => c.id !== call.id);
                return [call, ...filtered].slice(0, 10);
              });
            }
          }
        }
      )
      .subscribe();

    // Set up real-time subscription for transcripts
    const transcriptsChannel = supabase
      .channel('transcripts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_transcripts'
        },
        (payload) => {
          console.log('Transcript update:', payload);
          const transcript = payload.new as CallTranscript;
          
          setTranscripts(prev => ({
            ...prev,
            [transcript.call_id]: [
              ...(prev[transcript.call_id] || []),
              transcript
            ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          }));
        }
      )
      .subscribe();

    // Load initial data
    const loadInitialData = async () => {
      const { data: callsData } = await supabase
        .from('calls')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (callsData) {
        const active = callsData.filter(call => call.status === 'active' || call.status === 'incoming');
        const recent = callsData.filter(call => call.status === 'completed' || call.status === 'failed').slice(0, 10);
        
        setActiveCalls(active);
        setRecentCalls(recent);
      }
    };

    loadInitialData();

    return () => {
      supabase.removeChannel(callsChannel);
      supabase.removeChannel(transcriptsChannel);
    };
  }, [profile?.tenant_id]);

  return {
    activeCalls,
    recentCalls,
    transcripts
  };
};