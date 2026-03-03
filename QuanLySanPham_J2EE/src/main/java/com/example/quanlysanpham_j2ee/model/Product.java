package com.example.quanlysanpham_j2ee.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.validator.constraints.Length;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Column(nullable = false, length = 200)
    private String name;

    @Length(max = 200, message = "Tên hình ảnh không quá 200 kí tự")
    @Column(length = 200)
    private String image;

    @NotNull(message = "Giá sản phẩm không được để trống và cho phép nhập từ 1 - 9999999")
    @Min(value = 1, message = "Giá sản phẩm không được nhỏ hơn 1")
    @Max(value = 9999999, message = "Giá sản phẩm không được lớn hơn 9999999")
    @Column(nullable = false)
    private long price;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
}
