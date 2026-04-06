package com.example.be_bangiay.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FootSizeResult {

    private boolean thanhCong;
    private String sizeEU;
    private String sizeUS;
    private String sizeUK;
    private String sizeVN;
    private String chieuDaiCm;
    private String chieuRongCm;
    private String loaiChan;
    private String lyDo;
    private String loiKhuyen;
    private String loi; // thông báo lỗi nếu thất bại
}
