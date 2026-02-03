package com.example.nguyengiahuy_buoi2.controller;
import com.example.nguyengiahuy_buoi2.model.Book;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;

@Controller
public class HomeController {
    @GetMapping("/home")
    public String Index(){
        return "index";
    }
}
