package com.example.nguyengiahuybuoi_8.controller;

import com.example.nguyengiahuybuoi_8.model.CartItem;
import com.example.nguyengiahuybuoi_8.model.Category;
import com.example.nguyengiahuybuoi_8.model.Product;
import com.example.nguyengiahuybuoi_8.service.CategoryService;
import com.example.nguyengiahuybuoi_8.service.ProductService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Controller
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    @GetMapping("/")
    public String home(@RequestParam(value = "keyword", required = false) String keyword,
                      @RequestParam(value = "category", required = false) Long categoryId,
                      @RequestParam(value = "sort", required = false) String sort,
                      @RequestParam(value = "page", defaultValue = "0") int page,
                      Model model) {
        Page<Product> productPage = productService.getProducts(keyword, categoryId, sort, page, 5);
        List<Category> categories = categoryService.getAllCategories();

        model.addAttribute("products", productPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", productPage.getTotalPages());
        model.addAttribute("keyword", keyword);
        model.addAttribute("categoryId", categoryId);
        model.addAttribute("sort", sort);
        model.addAttribute("categories", categories);

        return "index";
    }

    @PostMapping("/cart/add")
    public String addToCart(@RequestParam Long productId,
                           @RequestParam(defaultValue = "1") int quantity,
                           HttpSession session) {
        Product product = productService.getProductById(productId);
        if (product == null) {
            return "redirect:/";
        }

        List<CartItem> cart = (List<CartItem>) session.getAttribute("cart");
        if (cart == null) {
            cart = new ArrayList<>();
        }

        boolean found = false;
        for (CartItem item : cart) {
            if (item.getProductId().equals(productId)) {
                item.setQuantity(item.getQuantity() + quantity);
                item.updateTotal();
                found = true;
                break;
            }
        }

        if (!found) {
            CartItem newItem = new CartItem(productId, product.getName(), product.getPrice(), quantity);
            cart.add(newItem);
        }

        session.setAttribute("cart", cart);
        return "redirect:/cart";
    }

    @GetMapping("/cart")
    public String viewCart(HttpSession session, Model model) {
        List<CartItem> cart = (List<CartItem>) session.getAttribute("cart");
        if (cart == null) {
            cart = new ArrayList<>();
        }

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : cart) {
            total = total.add(item.getTotal());
        }

        model.addAttribute("cart", cart);
        model.addAttribute("total", total);
        return "cart";
    }

    @PostMapping("/cart/update")
    public String updateCart(@RequestParam Long productId,
                            @RequestParam int quantity,
                            HttpSession session) {
        List<CartItem> cart = (List<CartItem>) session.getAttribute("cart");
        if (cart != null) {
            for (CartItem item : cart) {
                if (item.getProductId().equals(productId)) {
                    if (quantity <= 0) {
                        cart.remove(item);
                    } else {
                        item.setQuantity(quantity);
                        item.updateTotal();
                    }
                    break;
                }
            }
            session.setAttribute("cart", cart);
        }
        return "redirect:/cart";
    }

    @PostMapping("/cart/remove")
    public String removeFromCart(@RequestParam Long productId, HttpSession session) {
        List<CartItem> cart = (List<CartItem>) session.getAttribute("cart");
        if (cart != null) {
            cart.removeIf(item -> item.getProductId().equals(productId));
            session.setAttribute("cart", cart);
        }
        return "redirect:/cart";
    }
}