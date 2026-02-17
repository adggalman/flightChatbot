import { useState } from 'react';
import { StyleSheet, View, TextInput, FlatList, Text, TouchableOpacity } from 'react-native';

export default function ChatScreen() {
  const [messages, setMessages] = useState<{ id: string; text: string; sender: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);


  const sendMessage = async () => {
    if (!input.trim()) return;
    const currentInput = input;
    const userMessage = { id: Date.now().toString(), text: currentInput, sender: 'user' };
    setLoading(true);

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    try {
      const response = await fetch('http://10.0.2.2:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, history: messages }),
      });

      const data = await response.json();

      const botMessage = { id: (Date.now() + 1).toString(), text: data.reply, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    }
    catch (e: any) {
      const errorMessage = { id: (Date.now() + 1).toString(), text: 'Something went wrong.', sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);

    } finally {

      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.messageList}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  messageList: { padding: 16, paddingBottom: 8 },
  bubble: { padding: 12, borderRadius: 16, marginBottom: 8, maxWidth: '80%' },
  userBubble: { backgroundColor: '#007AFF', alignSelf: 'flex-end' },
  botBubble: { backgroundColor: '#E5E5EA', alignSelf: 'flex-start' },
  bubbleText: { color: '#000', fontSize: 16 },
  inputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: '#ddd' },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    fontSize: 16
  },
  sendButton: {
    marginLeft: 8, backgroundColor: '#007AFF', borderRadius: 20, paddingHorizontal: 16, justifyContent:
      'center'
  },
  sendText: { color: '#fff', fontWeight: 'bold' },
});