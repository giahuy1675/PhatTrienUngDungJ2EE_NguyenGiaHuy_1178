package com.example.quanlysanpham_j2ee.model;

import lombok.*;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.Length;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    private int id;
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;
    @Length(max = 200, message = "Tên hình ảnh không quá 200 kí tự")
    private String image;
    @NotNull(message = "Giá sản phẩm không được để trống và cho phép nhập từ 1 - 9999999")
    @Min(value = 1, message = "Giá sản phẩm không được nhỏ hơn 1")
    @Max(value = 9999999, message = "Giá sản phẩm không được lớn hơn 9999999")
    private long price;
    private Category category;
}
