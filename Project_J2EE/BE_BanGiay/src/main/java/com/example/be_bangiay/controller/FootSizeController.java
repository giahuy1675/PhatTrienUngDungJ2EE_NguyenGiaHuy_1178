package com.example.be_bangiay.controller;

import com.example.be_bangiay.dto.FootSizeResult;
import com.example.be_bangiay.exception.BadRequestException;
import com.example.be_bangiay.service.FootSizeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/foot-size")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5500", "http://127.0.0.1:5173"})
@RequiredArgsConstructor
public class FootSizeController {

    private final FootSizeService footSizeService;

    // Các loại file cho phép
    private static final List<String> LOAI_FILE_HOP_LE = Arrays.asList(
        "image/jpeg", "image/png", "image/webp"
    );

    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5MB

    @PostMapping("/analyze")
    public ResponseEntity<FootSizeResult> phanTich(@RequestParam("file") MultipartFile file) {
        // Kiểm tra file rỗng
        if (file.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn ảnh bàn chân");
        }

        // Kiểm tra loại file
        String contentType = file.getContentType();
        if (contentType == null || !LOAI_FILE_HOP_LE.contains(contentType)) {
            throw new BadRequestException("Chỉ chấp nhận file JPG, PNG hoặc WebP");
        }

        // Kiểm tra kích thước
        if (file.getSize() > MAX_SIZE) {
            throw new BadRequestException("Ảnh quá lớn, tối đa 5MB");
        }

        try {
            byte[] imageBytes = file.getBytes();
            FootSizeResult ketQua = footSizeService.phanTichAnhChan(imageBytes, contentType);
            return ResponseEntity.ok(ketQua);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Có lỗi khi xử lý ảnh: " + e.getMessage());
        }
    }
}
