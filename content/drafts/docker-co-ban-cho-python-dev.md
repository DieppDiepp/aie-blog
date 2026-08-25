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

## 11. Mạng nội bộ Docker: các service tìm và gọi nhau thế nào

Compose tạo MỘT mạng riêng nội bộ (không mô phỏng cả Internet). Mỗi container như
một máy riêng trong mạng đó. Docker cấp DNS: tên service chính là hostname.

- Trong mạng: `web -> api:8000 -> db:5432`, dùng TÊN SERVICE, không dùng localhost.
- Docker DNS phân giải `api`, `db` tới đúng container. Container bị tạo lại, IP đổi,
  gọi bằng tên vẫn đúng. Đó là lợi ích của gọi theo tên thay vì IP cứng.

Hai phạm vi mạng khác nhau:

```
Từ máy thật vào container:  qua port mapping "3000:3000" (host:container)
                            dùng localhost:3000, localhost:8000
Giữa các container:         dùng tên service (api:8000, db:5432)
```

Không dùng localhost giữa các container, vì bên trong một container `localhost` nghĩa
là chính container đó. `web` gọi `localhost:8000` là tự tìm cổng 8000 trong chính
`web`, không phải tới `api`.

Luồng đầy đủ một request:

```
Browser -> localhost:3000/brain -> web (Next.js server)
web -> api:8000/posts -> api (FastAPI)
api -> db:5432 (SQL) -> db (PostgreSQL)
db trả rows -> api trả JSON -> web render HTML -> Browser
```

Vì `brain/page.tsx` là Server Component async, chính SERVER Next.js trong container
`web` gọi `api`. Trình duyệt KHÔNG gọi `api:8000` (hostname đó chỉ tồn tại trong mạng
Docker, máy người dùng không biết).

Backend không gọi ngược lên frontend. Nó trả response trên chính connection mà `web`
đã mở. Giao tiếp hai chiều diễn ra trên cùng một connection HTTP.

Ba vai trò tách biệt, đừng gộp làm một:

```
Environment variable  = tấm bản đồ địa chỉ (API_URL, DATABASE_URL)
fetch / SQLAlchemy     = phương tiện thực sự thực hiện cuộc gọi
Docker network + DNS   = cho phép service tìm thấy nhau bằng tên
```

Biến môi trường chỉ nói "gọi tới địa chỉ nào", nó không tự tạo connection.
Chính `fetch()` (frontend) và SQLAlchemy/psycopg (backend) mới mở kết nối thật.

`depends_on` chỉ định thứ tự KHỞI ĐỘNG (`db` trước `api` trước `web`), nhưng KHÔNG
đảm bảo service đã sẵn sàng nhận request. Postgres có thể đã start nhưng còn đang khởi
tạo. Hệ thống lớn hơn cần thêm `healthcheck` và điều kiện chờ healthy.

FRONTEND_ORIGIN và CORS: trong dự án này `main.py` CÓ dùng `frontend_origin` để cấu
hình `CORSMiddleware` (`allow_origins=[settings.frontend_origin]`), nên biến này có
tác dụng thật. Nuance quan trọng: luồng hiện tại fetch phía server (`web` gọi `api`)
nên CORS KHÔNG bị kích hoạt cho call đó, vì CORS là cơ chế của TRÌNH DUYỆT. CORS chỉ
có ý nghĩa khi trình duyệt gọi thẳng `api` (vd sau này thêm fetch phía client tới
`localhost:8000`).

Bảng tổng kết vai trò:

```
API_URL         web dùng để biết địa chỉ api
DATABASE_URL    api dùng để biết địa chỉ db
FRONTEND_ORIGIN api dùng để cấu hình CORS (cho trình duyệt gọi thẳng api)
ports           cho máy thật / bên ngoài truy cập container
service name    cho các container gọi nhau trong mạng Docker
```

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
