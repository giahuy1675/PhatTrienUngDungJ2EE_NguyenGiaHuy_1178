package com.example.be_bangiay.controller;

import com.example.be_bangiay.dto.ChatRequest;
import com.example.be_bangiay.dto.ChatResponse;
import com.example.be_bangiay.service.AIChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final AIChatService aiChatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String reply = aiChatService.chat(request.getMessage(), request.getHistory());
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}
