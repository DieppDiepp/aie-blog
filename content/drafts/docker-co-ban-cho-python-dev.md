# (Draft) Docker cơ bản cho người code Python

Trạng thái: nháp, chưa viết hoàn chỉnh. Nguồn: buổi giải thích ngày 2026-08-24.
Góc tiếp cận: bám các khái niệm Python quen thuộc (venv, uv, class/instance) làm anchor.

## 1. Anchor nền: image và container

| Docker | Python | Ý nghĩa |
|---|---|---|
| image | class | Bản thiết kế, khuôn. Nằm im trên đĩa. |
| container | instance (obj = MyClass()) | Một bản đang chạy, đúc ra từ khuôn. |
| docker run image | MyClass() | Lấy khuôn tạo ra một vật thể sống. |

Quan hệ: 1 image tạo ra nhiều container (như 1 class tạo nhiều object).
Không có chuyện 1 container chứa nhiều image.

## 2. Phân cấp đúng (kèm số lượng)

```
docker-compose.yml           1 file duy nhất (đỉnh, mô tả cả hệ thống)
  └─ services                n service (vd 3: db, api, web)
       │                     mỗi service = 1 bản mô tả cách chạy
       └─ container           1 service -> 1..n container (replica)
            └─ image          1 container chạy từ đúng 1 image
                              chiều ngược lại: 1 image -> 0..n container
```

## 3. Ba file và cổng: Dockerfile, docker-compose.yml, .env, port

- Dockerfile: công thức build ra MỘT image (một service).
- docker-compose.yml: nhạc trưởng, mô tả nhiều service chạy cùng nhau và cách nối mạng.
- .env: nơi để giá trị cấu hình, Compose tự đọc.
- port: cửa để bên ngoài vào container, và để container gọi nhau.

`docker compose up --build` chỉ build lại các service CÓ khai báo `build:`.
Service `db` dùng `image: postgres:16` có sẵn trên Docker Hub nên chỉ cần pull, không build.

## 4. Build context: thư mục frontend TRỞ THÀNH /app

`web: build: ./frontend` đặt thư mục `frontend` làm build context.
Nên `COPY . .` copy NỘI DUNG bên trong `frontend/` vào thẳng `/app`,
không tạo `/app/frontend/`. Cái tên `frontend` biến mất ở ranh giới context.

Cạm bẫy: đừng tưởng có lớp thư mục `frontend` bên trong container.

## 5. Multi-stage build: build ở nơi bừa bộn, ship ở nơi gọn gàng

Frontend Dockerfile có 2 stage:

- Stage builder (node:20-slim): cài node_modules, chạy `npm run build`, sinh ra
  `.next/standalone` và `.next/static`. Đây là stage TẠM, xong thì bỏ.
- Stage runner (node:20-slim): chỉ `COPY --from=builder` những thứ cần để chạy.
  Đây mới là image cuối cùng được ship.

Mấu chốt: chỉ image runner được giữ. Stage builder bị bỏ tự động, KHÔNG cần xoá tay.
Muốn dọn build cache lâu ngày thì tuỳ chọn: `docker builder prune`.

Anchor Python: giống dùng một venv dev đầy đủ để đóng gói ra wheel, rồi chỉ ship
wheel vào môi trường production tối giản. Không ai ship cả venv dev.

Ghi chú: `WORKDIR /app` nên `./` trong lệnh COPY chính là `/app`.

## 6. Vì sao JS cần build, còn Python chạy thẳng

Python chạy thẳng file .py. Next.js (TypeScript + JSX) cần một bước build để dịch
TS sang JS, gộp và tối ưu file, dựng sẵn trang. Nên image chỉ cần copy THÀNH PHẨM
(`.next/standalone`), không cần mã nguồn gốc. Đó là lý do có 2 stage.

## 7. .env có hai cơ chế khác nhau (điểm hay nhầm)

```
.env (cùng thư mục docker-compose.yml)
  Compose TỰ ĐỘNG đọc, không cần khai báo lệnh load.
  -> thay thế các ${POSTGRES_USER}, ${API_URL} trong chính file compose (compose-time)

environment:        cơ chế thứ hai, khác hẳn
  API_URL: ${API_URL}   set biến môi trường BÊN TRONG container lúc chạy
```

Không có "lệnh load .env" vì đó là convention của Compose.

## 8. Cạm bẫy kinh điển: trình duyệt KHÔNG nằm trong mạng Docker

Hai chiều gọi khác nhau:

```
Chiều vào  (ai đó mở web): trình duyệt -> localhost:3000 -> container web
Chiều ra   (web gọi api):  server web trong container -> http://api:8000 -> container api
```

- `http://api:8000` dùng được vì `api` là TÊN SERVICE, Docker network biến nó thành
  hostname nội bộ (như DNS mini). Chỉ các container trong cùng mạng mới phân giải được.
- Trình duyệt chạy trên máy thật, KHÔNG ở trong mạng Docker, nên nó không hiểu `api`.
  Fetch phía trình duyệt phải dùng địa chỉ máy thật thấy được, vd `localhost:8000`.

Quy tắc nhớ: fetch phía server dùng tên service, fetch phía trình duyệt dùng localhost.

## 9. Volume: dữ liệu bền, sống ngoài vòng đời container

Hệ thống file trong container là phù du: `docker compose down` là mất sạch.
Named volume `db_data` gắn vào thư mục dữ liệu của Postgres để dữ liệu sống độc lập:
xoá container dựng lại vẫn còn. Chỉ `docker compose down -v` mới xoá luôn volume.

Anchor Python: để dữ liệu ở thư mục cố định, thay vì nhét trong .venv (thứ xoá dựng thoải mái).

## 10. Ý tưởng visual cho bài

- Khối code cây thư mục monorepo hiện tại (annotated).
- Sơ đồ quan hệ Dockerfile / compose / .env / port.
- Sơ đồ multi-stage (builder bỏ đi, runner ship).
- (Sau) diagram kiến trúc tương tác, xây khi làm hệ render case study.

---

## Phụ lục A: bản nháp lập luận gốc của tác giả (giữ nguyên, làm nguyên liệu bài tập)

TODO: SAU khi web build xong, viết lại đoạn này thành một bài tập "tìm chỗ sai"
có cấu trúc dễ đọc, dẫn dắt để người đọc tự phát hiện lỗi. Dưới đây là bản thô.

> Mình hiện đang hiểu docker compose là file cho lệnh docker compose up --build, nó
> sẽ nạp các image (hiện là 3), 3 con này sẽ chung 1 máy ảo docker. Lệnh build trong
> --build sẽ trigger các service có chữ build (api và web). Service db không có build
> vì có sẵn image trên docker hub. web build: ./frontend nghĩa là vô folder frontend
> tìm dockerfile để build.
>
> Vô dockerfile frontend: pull node:20-slim, set workdir /app, copy package.json,
> chạy npm install (RUN là chạy script), lúc này /app chỉ có node_modules và
> package.json. Sau đó COPY . . copy các folder từ local vô, máy ảo có thêm
> /app/frontend/... Rồi npm run build tạo ra folder .next.
>
> Image thứ 2 pull image light, set NODE_ENV=production. Copy --from=builder, vậy
> các image này độc lập trong các máy ảo khác nhau, 1 dockerfile có 2 image thì nó ở
> 2 máy ảo docker. Đích là ./ chắc do đã set workdir app.
>
> Expose 3000, ports 3000:3000. Image runner hay container runner, một container thì
> có nhiều image bên trong đúng chứ? Phân cấp: compose -> container -> service ->
> images. web nhận API_URL=http://api:8000 nhưng listen 3000.
>
> (bổ sung) service là cấp dưới compose, 1 service quản lý nhiều compose, mỗi compose
> tạo từ 1 image. 1 image -> n compose, service quản lý container, quản được nhiều.

## Phụ lục B: đáp án (các lỗi trong lập luận gốc)

1. "1 container có nhiều image bên trong": sai. 1 container = 1 instance của đúng 1 image.
2. Phân cấp "compose -> container -> service -> images": sai thứ tự. Đúng:
   compose -> services -> containers, và mỗi container dựa trên 1 image.
3. "COPY . . -> /app/frontend/...": sai. Vào thẳng /app vì context là ./frontend.
4. "2 image thì ở 2 máy ảo chạy song song": builder là stage TẠM, chỉ runner được ship.
5. "1 service quản lý nhiều compose" / "compose tạo từ image": nhầm từ compose với container.
   Đúng: 1 image -> n container, service quản lý nhiều container.
6. "3 con chung 1 máy ảo": container không phải máy ảo, nó nhẹ hơn, chia sẻ nhân Linux
   của host; điểm chung thật sự là cùng Docker Engine và cùng một mạng Docker.
7. "/app trên máy chủ docker": /app nằm TRONG container, không phải trên host.

Các điểm đã đúng: --build chỉ build service có build; db pull sẵn; build context;
RUN chạy lúc build; nội dung /app sau npm install; npm run build sinh .next;
./ = /app do WORKDIR; expose và ports; ý tưởng API_URL là để web gọi api.
