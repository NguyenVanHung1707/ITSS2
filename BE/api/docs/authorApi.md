# Faculty API

## Lấy danh sách Khoa | Viện | Trường
- **GET** `/api/faculties`

## Lấy chi tiết Khoa | Viện | Trường
- **GET** `/api/faculties/:id`

## Tạo Khoa | Viện | Trường mới
- **POST** `/api/faculties`
```json
{
  "name": "Tên Khoa | Viện | Trường",
  "code": "Mã"
}
```

## Sửa Khoa | Viện | Trường
- **PUT** `/api/faculties/:id`
```json
{
  "name": "Tên Khoa | Viện | Trường",
  "code": "Mã"
}
```

## Xóa Khoa | Viện | Trường
- **DELETE** `/api/faculties/:id`
