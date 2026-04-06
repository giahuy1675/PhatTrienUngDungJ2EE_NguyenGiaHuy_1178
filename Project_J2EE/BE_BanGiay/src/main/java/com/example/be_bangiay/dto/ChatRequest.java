package com.example.be_bangiay.dto;

import java.util.ArrayList;
import java.util.List;

public class ChatRequest {

    private String message;
    private List<ChatMessageDTO> history = new ArrayList<>();

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<ChatMessageDTO> getHistory() {
        return history;
    }

    public void setHistory(List<ChatMessageDTO> history) {
        this.history = history;
    }
}
