package com.example.be_bangiay.service;

import com.example.be_bangiay.dto.AddToCartRequest;
import com.example.be_bangiay.dto.CartItemResponse;
import com.example.be_bangiay.entity.CartItem;
import com.example.be_bangiay.entity.Product;
import com.example.be_bangiay.entity.User;
import com.example.be_bangiay.exception.BadRequestException;
import com.example.be_bangiay.exception.ResourceNotFoundException;
import com.example.be_bangiay.repository.CartItemRepository;
import com.example.be_bangiay.repository.ProductRepository;
import com.example.be_bangiay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {
    
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
    public List<CartItemResponse> getCartByUserId(Long userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        System.out.println("🛒 Getting cart for user " + userId + ", found " + cartItems.size() + " items");
        List<CartItemResponse> responses = cartItems.stream()
                .map(item -> {
                    CartItemResponse response = mapToResponse(item);
                    System.out.println("  - Item: " + response.getProductName() + 
                                     ", Color: " + response.getSelectedColor() + 
                                     ", Has selectedImage: " + (response.getSelectedImage() != null));
                    return response;
                })
                .collect(Collectors.toList());
        return responses;
    }
    
    @Transactional
    public CartItemResponse addToCart(Long userId, AddToCartRequest request) {
        System.out.println("📥 Add to cart request - User: " + userId + 
                         ", Product: " + request.getProductId() + 
                         ", Size: " + request.getSelectedSize() + 
                         ", Color: " + request.getSelectedColor() + 
                         ", Has selectedImage: " + (request.getSelectedImage() != null));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));
        
        // Check stock
        if (product.getStockQuantity() < request.getQuantity()) {
            throw new BadRequestException("Sản phẩm không đủ số lượng trong kho");
        }
        
        // Use the new method that checks size and color
        CartItem cartItem = cartItemRepository.findByUserIdAndProductIdAndSizeAndColor(
                userId, 
                request.getProductId(),
                request.getSelectedSize(),
                request.getSelectedColor()
        ).orElse(null);
        
        if (cartItem != null) {
            // Update existing item
            int newQuantity = cartItem.getQuantity() + request.getQuantity();
            if (newQuantity > product.getStockQuantity()) {
                throw new BadRequestException("Số lượng vượt quá tồn kho");
            }
            if (newQuantity > 999) {
                throw new BadRequestException("Số lượng không được vượt quá 999");
            }
            cartItem.setQuantity(newQuantity);
            // Update selected image if provided
            if (request.getSelectedImage() != null) {
                cartItem.setSelectedImage(request.getSelectedImage());
            }
        } else {
            // Create new item
            cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
            cartItem.setSelectedSize(request.getSelectedSize());
            cartItem.setSelectedColor(request.getSelectedColor());
            cartItem.setSelectedImage(request.getSelectedImage());
        }
        
        cartItem = cartItemRepository.save(cartItem);
        System.out.println("💾 Saved cart item - ID: " + cartItem.getId() + 
                         ", Quantity: " + cartItem.getQuantity() + 
                         ", Has selectedImage after save: " + (cartItem.getSelectedImage() != null));
        return mapToResponse(cartItem);
    }
    
    @Transactional
    public CartItemResponse updateCartItem(Long id, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", id));
        
        if (quantity < 1 || quantity > 999) {
            throw new BadRequestException("Số lượng phải từ 1 đến 999");
        }
        
        if (quantity > cartItem.getProduct().getStockQuantity()) {
            throw new BadRequestException("Số lượng vượt quá tồn kho");
        }
        
        cartItem.setQuantity(quantity);
        cartItem = cartItemRepository.save(cartItem);
        return mapToResponse(cartItem);
    }
    
    @Transactional
    public void removeCartItem(Long id) {
        if (!cartItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("CartItem", "id", id);
        }
        cartItemRepository.deleteById(id);
    }
    
    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }
    
    private CartItemResponse mapToResponse(CartItem cartItem) {
        return new CartItemResponse(
                cartItem.getId(),
                cartItem.getProduct().getId(),
                cartItem.getProduct().getName(),
                cartItem.getProduct().getImage(),
                cartItem.getProduct().getPrice(),
                cartItem.getSelectedSize(),
                cartItem.getSelectedColor(),
                cartItem.getSelectedImage(),
                cartItem.getQuantity()
        );
    }
}
