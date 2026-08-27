# CI/CD: đưa website lên VPS qua GitHub Actions và GHCR

> Draft cho bài viết thứ 2. Ghi lại hành trình dựng pipeline deploy, kèm những
> câu hỏi và nhận định của mình trong lúc làm (cả đúng lẫn sai) và lời giải thích.
> Không phải nguồn render của site. Viết sao cho người chưa đọc code repo vẫn hiểu.

## 0. Bối cảnh

Website này là một blog cá nhân, chạy bằng ba mảnh gói trong Docker: một web
(Next.js render tĩnh từ file bài viết), một api (FastAPI) và một database
(PostgreSQL). Trên máy dev, chỉ cần `docker compose up` là cả ba khởi động.

Câu hỏi của phần này: làm sao để mỗi lần mình push code lên GitHub, website chạy
thật trên máy chủ (VPS) tự cập nhật theo, mà mình không phải SSH vào gõ tay từng
lệnh? Đó là việc của CI/CD.

Bối cảnh hạ tầng cụ thể của mình:
- Máy chủ: một VPS Ubuntu đã cài sẵn Docker.
- Ra Internet: dùng Cloudflare Tunnel (cloudflared), không mở cổng công khai.
- Nơi chứa image: GitHub Container Registry (GHCR), để chế độ private.

## 1. CI khác CD ở đâu

CI (Continuous Integration) là bước kiểm tra đúng sai nhanh: code có build được,
có import được không. Nó chạy trên máy ảo tạm của GitHub rồi vứt đi, không đụng
tới máy chủ. Repo này đã có CI từ trước.

CD (Continuous Delivery/Deployment) là bước tạo ra sản phẩm giao hàng thật và làm
cho nó chạy trên VPS. Đây là phần mình dựng mới.

Một điểm dễ nhầm: CI đã build code rồi, sao CD còn build lại? Vì hai lần build
phục vụ hai mục đích khác nhau. CI build kiểu native (chạy trực tiếp uv, npm) chỉ
để trả lời "code có ổn không" cho nhanh. CD build ra một Docker image, tức bản
đóng gói đem đi chạy ở nơi khác được. Không phải làm thừa, mà là hai vai khác nhau.

## 2. Build once, run anywhere và vai trò của registry

Nguyên tắc cốt lõi của CD: build đúng một lần, chạy ở đâu cũng vậy.

Docker image là một ảnh chụp đóng băng: hệ điều hành nền, thư viện, mã nguồn đã
build, nội dung bài viết, tất cả gói kín trong một khối. Khối này build một lần
trong pipeline. Thứ được kiểm thử chính là thứ được đem chạy, giống hệt từng byte.
Đây là cách xóa sổ câu "máy tôi chạy được mà".

Registry là kho chứa image, đánh địa chỉ bằng tên và tag, ví dụ:

    ghcr.io/<chu-so-huu>/aie-blog-web:<git-sha>

Luồng đi: CI build image, đẩy (push) lên GHCR. VPS chỉ kéo (pull) về. VPS không
bao giờ tự build, nên không tốn CPU/RAM của máy chủ cho việc build.

Vì sao gắn tag bằng git SHA: mỗi commit cho ra một tag bất biến, truy được ngược
về đúng commit đã sinh ra image đó. Nhờ vậy rollback rất gọn: chỉ cần trỏ VPS về
tag SHA cũ, không phải sửa lại gì. Kèm thêm tag `latest` cho tiện gọi "bản mới nhất".

## 3. compose.prod.yml khác file compose thường ở chỗ nào

File compose lúc dev tối ưu cho việc mình ngồi code. File compose lúc chạy thật
(prod) tối ưu cho một máy chủ không có ai ngồi cạnh. Cùng khai báo dịch vụ, khác
năm điểm:

1. Nguồn image: dev ghi `build: ./frontend` (dựng từ mã nguồn tại chỗ). Prod ghi
   `image: ghcr.io/.../aie-blog-web:<tag>` (dùng image đã dựng sẵn trên GHCR). VPS
   không cần mã nguồn.
2. Cổng: dev mở cổng ra host để mình vào localhost xem. Prod bỏ gần hết cổng. Các
   dịch vụ cùng compose tự thấy nhau qua tên (api gọi db, cloudflared gọi web)
   trong mạng nội bộ, không cần thò ra ngoài. Đặc biệt database tuyệt đối không mở
   cổng ra Internet.
3. Tự khởi động lại: prod ghi `restart: unless-stopped` để container tự dậy khi
   crash hoặc khi VPS reboot lúc nửa đêm. Dev không cần.
4. Chờ phụ thuộc thật sự sẵn sàng: prod dùng healthcheck để api chỉ khởi động sau
   khi database thực sự nhận kết nối, tránh vòng lặp crash lúc mới bật.
5. Thêm dịch vụ cloudflared để nối ra Internet. Chỉ có ở prod.

Một câu để nhớ: dev là "dựng từ mã nguồn, mở cổng cho tôi xem", prod là "chạy
image đóng băng, không hở cổng nào, tự hồi phục, ra Internet qua một cửa duy nhất".

## 4. Cloudflare Tunnel: ra Internet mà không mở cổng

Cách truyền thống: VPS mở cổng 80/443, trỏ tên miền về IP máy chủ, và một reverse
proxy (như Caddy) lo chứng chỉ HTTPS.

Cách dùng Cloudflare Tunnel: một tiến trình cloudflared chạy ngay trên VPS, tự mở
một kết nối đi ra tới hệ thống edge của Cloudflare. Hệ quả:
- Không mở cổng vào nào, không phơi IP máy chủ ra ngoài. Kín hơn.
- Cloudflare lo HTTPS ở phía ngoài, rồi đẩy yêu cầu xuôi qua đường ống vào một
  cổng nội bộ (ví dụ web:3000).
- Không cần Caddy để lo chứng chỉ nữa. Việc "tên miền nào tới dịch vụ nào" cấu
  hình trên dashboard của Cloudflare.

## 5. Chìa khóa deploy: SSH key riêng, tách khỏi key cá nhân

Sau khi image nằm trên GHCR, pipeline cần ra lệnh cho VPS cập nhật. Cách chuẩn là
CI mở một phiên SSH vào VPS rồi chạy vài lệnh: kéo image mới về và dựng lại
container.

Điểm mấu chốt về bảo mật: không dùng chính key cá nhân của mình cho việc này.
Mình tạo một cặp key deploy riêng, chỉ để pipeline vào VPS. Cặp key gồm hai nửa:
- Nửa công khai (public key): đặt trên VPS, để VPS biết "ai cầm nửa còn lại thì
  cho vào".
- Nửa bí mật (private key): cất trong kho secret của GitHub, để pipeline dùng.

Nếu key deploy lộ, mình chỉ cần thu hồi đúng nó, không ảnh hưởng key cá nhân.

### Bức tranh ba máy

Chỗ này lúc đầu mình hiểu nhầm, nên tách riêng ra cho rõ. Có ba máy, ba vai:

- Máy của mình (nơi gõ lệnh quản trị).
- Server của GitHub (giữ mã nguồn, giữ secret, và chạy pipeline).
- VPS (nơi website chạy thật).

Ba mảnh gặp nhau thế này:
- Public key được đặt vào file `authorized_keys` trên VPS. VPS giờ tin key deploy.
- Private key và thông tin VPS (địa chỉ, user, cổng) được đưa lên kho secret của
  GitHub.
- Khi mình push code, một máy ảo của GitHub (không phải máy mình) đọc secret, cầm
  private key SSH vào VPS. VPS thấy khớp public key nên cho vào, rồi chạy lệnh deploy.

## 6. Những chỗ mình từng hiểu nhầm hoặc thắc mắc

Phần này giữ lại nguyên các câu hỏi và nhận định của mình trong lúc làm, kèm lời
giải, vì chính chúng là chỗ dễ vấp của người mới.

### "Thêm public key vào VPS thì có ghi đè key cũ không?"

Cảnh giác này đúng, nên hỏi trước khi chạy. Câu trả lời: không ghi đè, vì lệnh
dùng dấu `>>` (nối thêm vào cuối file), không phải dấu `>` (xóa sạch rồi ghi lại).
File `authorized_keys` là file nhiều dòng, mỗi dòng một key, và VPS chấp nhận đăng
nhập nếu khớp bất kỳ dòng nào. Sau khi thêm, file có hai dòng: key cá nhân cũ và
key deploy mới, cả hai cùng dùng được, độc lập nhau.

### "Chạy gh secret set trên máy local thì liên quan gì tới GitHub CI và VPS? Nhìn giống như set biến môi trường cho máy local."

Đây là chỗ mình hiểu nhầm nhất, và nó quan trọng. `gh` là công cụ dòng lệnh của
GitHub, đã đăng nhập vào tài khoản GitHub của mình. Lệnh `gh secret set` không lưu
gì ở máy local. Nó gửi giá trị qua mạng lên server GitHub, cất mã hóa trong mục
Secrets của repo. Máy local chỉ là bàn điều khiển để ra lệnh, giống cái điều khiển
từ xa, chứ không giữ biến nào cả.

Đối lập cho dễ phân biệt: `export FOO=bar` mới là biến môi trường local, nằm ở máy
mình và GitHub không bao giờ thấy. Còn secret thì nằm trên GitHub, và chỉ được giải
mã bên trong lúc pipeline chạy, để máy ảo của GitHub dùng.

Lý do phải chủ động đẩy private key lên secret của GitHub: pipeline chạy trên máy
của GitHub, nó không với tới được file key nằm trong máy local của mình. Muốn nó có
key mà dùng thì phải cất key vào kho của GitHub trước.

### "Vì sao CD phải build lại image trong khi CI đã build rồi?"

Đã trả lời ở mục 1. Tóm lại: CI build native để kiểm tra nhanh, CD build image để
tạo bản đóng gói đem chạy nơi khác. Khác mục đích, không phải làm thừa.

## 7. Các quyết định đã chốt

- Đẩy image qua registry GHCR (không build trên VPS, không copy file tar thủ công).
- Deploy cho lần đầu gồm đủ bốn dịch vụ: web, api, db, cloudflared. api và db hiện
  nằm im (site render tĩnh từ file bài viết) nhưng dựng sẵn để dành cho việc đồng
  bộ dữ liệu về database sau này.
- GHCR để private, nên VPS cần một token chỉ-đọc để đăng nhập trước khi kéo image.
- Bỏ Caddy khỏi stack prod vì Cloudflare Tunnel đã lo phần HTTPS và định tuyến.

## 8. Trạng thái và việc còn lại

Đã xong: file compose cho prod, workflow build và đẩy image lên GHCR, tạo cặp key
deploy, đưa private key và thông tin VPS vào secret của GitHub, xác nhận key deploy
SSH vào VPS được.

Còn lại: tạo token đọc GHCR cho VPS đăng nhập, viết bước deploy trong pipeline
(SSH vào VPS chạy pull và up), cấu hình đường ống cloudflared trỏ tên miền vào web.
