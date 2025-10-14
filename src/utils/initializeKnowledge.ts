import { supabase } from '../lib/supabase';
import { generateKnowledgeBase } from '../data/chatbotKnowledge';

export const initializeKnowledgeBase = async () => {
  try {
    const { data: existing } = await supabase
      .from('chatbot_knowledge_base')
      .select('key')
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('Knowledge base already initialized');
      return;
    }

    const knowledge = generateKnowledgeBase();

    const { error } = await supabase
      .from('chatbot_knowledge_base')
      .insert(
        knowledge.map(k => ({
          category: k.category,
          key: k.key,
          title: k.title,
          content: k.content,
          metadata: k.metadata || {}
        }))
      );

    if (error) {
      console.error('Error initializing knowledge base:', error);
    } else {
      console.log('✅ Knowledge base initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing knowledge base:', error);
  }
};
