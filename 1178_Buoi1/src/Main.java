import java.util.*;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<Book> listBook = new ArrayList<>();
        Scanner x = new Scanner(System.in);
        String msg = """
                \n--- Chương trình quản lý sách ---
                1. Thêm 1 cuốn sách
                2. Xóa 1 cuốn sách
                3. Thay đổi sách
                4. Xuất thông tin
                5. Tìm sách Lập trình
                6. Lấy sách tối đa theo giá (kèm số lượng)
                7. Tìm kiếm theo tác giả (sử dụng Set)
                0. Thoát
                Chọn chức năng: """;

        int chon = 0;
        do {
            System.out.print(msg);
            try {
                chon = Integer.parseInt(x.nextLine());
            } catch (NumberFormatException e) {
                System.out.println("Lỗi: Vui lòng nhập số!");
                continue;
            }

            switch (chon) {
                case 1 -> {
                    Book newBook = new Book();
                    newBook.input();
                    listBook.add(newBook);
                }
                case 2 -> {
                    System.out.print("Nhập vào mã sách cần xóa: ");
                    int bookid = Integer.parseInt(x.nextLine());
                    try {
                        Book find = listBook.stream()
                                .filter(p -> p.getId() == bookid)
                                .findFirst()
                                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy mã sách này!"));
                        listBook.remove(find);
                        System.out.println("Đã xóa sách thành công");
                    } catch (Exception e) {
                        System.out.println("Lỗi: " + e.getMessage());
                    }
                }
                case 3 -> {
                    System.out.print("Nhập vào mã sách cần điều chỉnh: ");
                    int bookid = Integer.parseInt(x.nextLine());
                    try {
                        Book find = listBook.stream()
                                .filter(p -> p.getId() == bookid)
                                .findFirst()
                                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy mã sách này!"));
                        System.out.println("Đang chỉnh sửa sách: " + find.getTitle());
                        find.input(); // Gọi lại hàm nhập để cập nhật thông tin
                        System.out.println("Cập nhật thành công!");
                    } catch (Exception e) {
                        System.out.println("Lỗi: " + e.getMessage());
                    }
                }
                case 4 -> {
                    System.out.println("\n--- Xuất thông tin danh sách ---");
                    listBook.forEach(p -> p.output());
                }
                case 5 -> {
                    List<Book> list5 = listBook.stream()
                            .filter(u -> u.getTitle().toLowerCase().contains("lập trình"))
                            .toList();
                    list5.forEach(Book::output);
                }
                case 6 -> {
                    System.out.print("Nhập giá tối đa:");
                    long gia = Long.parseLong(x.nextLine());
                    listBook.stream()
                            .filter(p -> p.getPrice() <= gia)
                            .limit(5)
                            .forEach(Book::output);
                }
                case 7 -> {
                    System.out.print("Nhập danh sách tác giả cần tìm (cách nhau bởi dấu phẩy):");
                    String input = x.nextLine();
                    // Bước 1: Tập hợp tác giả cần tìm kiếm sẽ chuyển sang tập Set
                    Set<String> setTacGia = Arrays.stream(input.split(","))
                            .map(String::trim)
                            .map(String::toLowerCase)
                            .collect(Collectors.toSet());
                    
                    // Bước 2: filter tác giả mà nằm trong tập Set
                    listBook.stream()
                            .filter(p -> setTacGia.contains(p.getAuthor().toLowerCase()))
                            .forEach(Book::output);
                }
                case 0 -> System.out.println("Ứng dụng đã thoát.");
                default -> System.out.println("Chức năng không hợp lệ, vui lòng chọn lại!");
            }
        } while (chon != 0);
    }
}