import api from './api';

const chatService = {
  sendMessage: async (message, history = []) => {
    const response = await api.post('/chat', {
      message,
      history,
    });
    return response.data;
  },
};

export default chatService;
