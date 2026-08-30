# Dựng Cloudflare R2 và upload bằng rclone: hiểu từng cái khóa

> Draft, nguyên liệu cho một bài viết. Giải thích cho người không rành hạ tầng.
> Liên quan: bài object-storage-minio-vs-r2 đã chọn R2 và giải thích vì sao (kèm
> ADR-0005). Bài này là phần THỰC HÀNH: tạo bucket, gắn custom domain, tạo khóa,
> cấu hình rclone, upload và kiểm chứng. Trọng tâm là hiểu rõ từng loại khóa,
> vì chỗ này rất hay gây rối. Không phải nguồn render của site.

## 0. Mục tiêu

Sau bài này, ảnh của blog nằm trên R2, đọc công khai qua
`https://media.aiengineerblog.com/...`, và tác giả upload bằng một lệnh rclone
từ máy dev. Không mở cổng nào trên VPS, không đặt khóa ghi lên VPS.

## 1. rclone là cái gì

rclone là một công cụ dòng lệnh để copy và đồng bộ file giữa máy mình và kho lưu
trữ đám mây, quen gọi là "rsync cho cloud". Nó biết nói chuyện với rất nhiều loại
kho (Google Drive, S3, R2, ...). Với mỗi kho, mình khai một "remote" trong file
cấu hình, đặt tên tùy ý (ở đây là `r2`), rồi mọi lệnh trỏ tới remote đó bằng
`tên:` phía trước đường dẫn, ví dụ `r2:aie-blog-media/...`.

Điểm cần nắm: R2 không có giao thức riêng, nó "nói tiếng S3". Nên trong cấu hình
rclone mình khai `type = s3` (dùng bộ luật S3) và `provider = Cloudflare` (giọng
S3 của Cloudflare, để rclone biết vài chỗ Cloudflare làm khác Amazon). Cùng bộ
cấu hình đó, đổi endpoint và khóa là trỏ được sang MinIO hay AWS, đó là lợi ích
của "S3-compatible" đã nói ở bài trước.

## 2. Mô hình khóa của S3: vì sao có HAI mảnh

Nhiều API đơn giản chỉ đưa một chuỗi khóa, mình dán vào header
`Authorization: Bearer <khóa>` là xong. S3 KHÔNG làm vậy. S3 dùng mô hình ký
request, gồm hai mảnh:

- Access Key ID: danh tính CÔNG KHAI, như tên đăng nhập. Nó nói "request này là
  của ai". Lộ ra cũng không nguy hiểm lắm vì nó không mở được gì một mình.
- Secret Access Key: phần BÍ MẬT, như mật khẩu. Nhưng khác mật khẩu ở chỗ nó
  KHÔNG được gửi lên server bao giờ.

Vậy secret dùng làm gì nếu không gửi đi? Nó dùng để KÝ. Mỗi lần rclone gọi R2,
nó lấy các thành phần của request (phương thức, đường dẫn, thời gian, vài header)
gộp thành một chuỗi chuẩn, rồi dùng secret để tính một mã băm HMAC-SHA256 của
chuỗi đó. Cái mã băm ấy gọi là chữ ký (signature). rclone gửi lên: Access Key ID
cộng chữ ký, KHÔNG gửi secret. Phía R2 tra secret theo Access Key ID (nó có bản
của secret), tự tính lại chữ ký, so khớp thì chấp nhận. Cơ chế này tên là AWS
Signature Version 4 (SigV4).

Lợi ích của kiểu hai-mảnh-có-ký so với bearer token đơn:

- Secret không bao giờ nằm trên đường truyền, nên nghe lén cũng không bắt được.
- Chữ ký gắn với nội dung request và thời gian, nên không thể lấy lại một request
  cũ để phát lại (chống replay), và không sửa được request giữa đường.

Đây là lý do bạn thấy R2 (và mọi thứ S3) đưa hai giá trị chứ không phải một.

## 3. Vậy còn "Token value" mà Cloudflare hiện ra là gì

Khi tạo một R2 API token, Cloudflare cho tới BA giá trị cho cùng một quyền. Đừng
để rối, chúng là ba cách biểu diễn của cùng một token:

- Token value: đây là token kiểu Cloudflare (một chuỗi bearer). Nó dùng cho API
  GỐC của Cloudflare (giao thức riêng của R2, không phải S3), hoặc các công cụ
  xác thực kiểu `Bearer`.
- Access Key ID: bản "giọng S3" của danh tính token.
- Secret Access Key: bản "giọng S3" của phần bí mật. Trên thực tế nó chính là mã
  băm SHA-256 của Token value; Cloudflare sinh ra nó để các công cụ S3 dùng.

Quy tắc chọn cho khỏi nhầm: dùng công cụ S3 (rclone, aws-cli, boto3) thì lấy cặp
Access Key ID + Secret Access Key. Chỉ đụng tới Token value khi gọi API gốc của
Cloudflare, việc mà bài này không cần. Nói gọn: bài này bỏ qua Token value, chỉ
dùng hai khóa S3 cộng endpoint.

## 4. Endpoint (để ghi) khác custom domain (để đọc)

Hai địa chỉ, hai vai, rất hay lẫn:

- Endpoint S3: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`. Đây là cửa để
  công cụ như rclone GHI và quản object, có ký SigV4. Nó gắn với tài khoản, không
  phải nơi cho người đọc.
- Custom domain: `https://media.aiengineerblog.com`. Đây là cửa công khai để
  người ĐỌC xem ảnh, đi qua CDN edge, chỉ cho GET, không cần khóa.

Cùng một object, hai lối vào: tác giả đẩy lên qua endpoint (có khóa), người đọc
lấy về qua custom domain (không khóa, được cache). Tách vai này chính là điều làm
khóa ghi không phải lộ ra công khai.

## 5. Cấu hình rclone, đọc từng dòng

File `~/.config/rclone/rclone.conf`:

```ini
[r2]
type = s3
provider = Cloudflare
access_key_id = <ACCESS_KEY_ID>
secret_access_key = <SECRET_ACCESS_KEY>
endpoint = https://<ACCOUNT_ID>.r2.cloudflarestorage.com
acl = private
```

- `[r2]`: tên remote, tự đặt. Sau này gọi `r2:bucket/...`.
- `type = s3`: dùng bộ luật S3.
- `provider = Cloudflare`: giọng S3 của Cloudflare.
- `access_key_id`, `secret_access_key`: cặp khóa ở mục 2.
- `endpoint`: cửa ghi ở mục 4.
- `acl = private`: object tạo ra không tự bật public; việc cho đọc công khai là
  do custom domain lo, không phải do ACL từng object.

Nhớ tạo thư mục cha trước (`mkdir -p ~/.config/rclone`), và siết quyền file
(`chmod 600`) vì nó chứa secret. Kiểm tra bằng `rclone lsd r2:` (liệt kê bucket).

## 6. Các lệnh rclone hay dùng

- Liệt kê bucket: `rclone lsd r2:`
- Liệt kê object trong một bucket: `rclone ls r2:aie-blog-media`
- Upload đặt đúng tên đích, kèm cache dài:
  `rclone copyto ./cover.webp r2:aie-blog-media/posts/<slug>/cover.webp --header-upload "Cache-Control: public, max-age=31536000, immutable" --s3-no-check-bucket`
- Upload cả thư mục (giữ nguyên cấu trúc): `rclone copy ./img r2:aie-blog-media/posts/<slug>/`
- Xóa một object: `rclone deletefile r2:aie-blog-media/posts/<slug>/cu.webp`

Giải thích vài cờ:

- `copyto` đặt tên đích chính xác một-một; `copy` copy vào một thư mục đích.
- `--header-upload "Cache-Control: ..."` gắn header cho object, để CDN và trình
  duyệt cache lâu. Kết hợp mẹo băm-trong-tên-file thì cache được vĩnh viễn.
- `--s3-no-check-bucket` bảo rclone đừng thử tạo bucket (bucket đã có, và token
  scope hẹp không có quyền tạo bucket).

## 7. Kiểm chứng: nhìn header để biết đã chạy

```bash
curl -I https://media.aiengineerblog.com/posts/<slug>/cover.webp
```

- `HTTP/2 200`: đọc công khai được, và HTTP/2 nghĩa là có TLS (ổ khóa do
  Cloudflare cấp cho custom domain).
- `content-type: image/webp`: đúng loại file.
- `cache-control`: đúng chuỗi mình gắn lúc upload.
- `cf-cache-status`: lần đầu thường `MISS` (edge về R2 lấy), lần sau `HIT` (trả
  từ cache edge, không chạm R2). Đây là bằng chứng CDN đang làm việc.

## 8. Giữ khóa cho an toàn

- Khóa chỉ nằm trong `~/.config/rclone/rclone.conf` trên máy dev. KHÔNG vào git,
  KHÔNG lên VPS, KHÔNG vào image Docker.
- Token scope hẹp: Object Read & Write, chỉ đúng bucket `aie-blog-media`. Không
  dùng Admin để tránh trao quyền quản lý bucket không cần thiết.
- Lộ khóa thì xoay: vào R2, xóa token cũ, tạo token mới, dán lại vào
  `rclone.conf`. Không cần đổi gì khác vì object và custom domain không phụ thuộc
  vào token cụ thể.
- Không chụp màn hình phần secret. Access Key ID lộ một phần thì ít rủi ro, nhưng
  Secret Access Key thì phải kín.

## 9. Lỗi hay gặp khi dựng (ghi từ lần làm thật)

- Thiếu dòng `[r2]` ở đầu rclone.conf: rclone báo `didn't find section in config
  file`. Dòng section header chính là tên remote, bắt buộc phải có.
- Thư mục cấu hình chưa tồn tại: ghi file báo `No such file or directory`. Chạy
  `mkdir -p ~/.config/rclone` trước khi ghi.
- `rclone lsd r2:` trả `403 AccessDenied`: BÌNH THƯỜNG với token scope hẹp, vì
  liệt kê mọi bucket cần quyền cấp tài khoản. Kiểm bằng `rclone ls r2:<bucket>`
  (liệt kê trong bucket) thay vì `lsd`.
- Upload báo `501 NotImplemented` ở lần thử đầu rồi lần sau thành công: quirk
  lành tính giữa rclone bản cũ và R2 (rclone thử cập nhật modtime bằng một thao
  tác R2 không cài đặt). File vẫn lên đủ; nâng cấp rclone thì hết dòng đỏ.
- `could not resolve host` khi curl custom domain: custom domain chưa gắn hoặc
  DNS chưa lan. Nhớ dùng custom domain, KHÔNG dùng public r2.dev URL.

## 10. Bảng thuật ngữ nhanh

- rclone: công cụ dòng lệnh đồng bộ file với cloud, "rsync cho cloud".
- remote (rclone): một kho đã khai trong cấu hình, gọi bằng `tên:`.
- S3-compatible: nói được tiếng S3, nên dùng chung công cụ và code.
- Access Key ID: danh tính công khai của khóa, "tôi là ai".
- Secret Access Key: phần bí mật, dùng để KÝ request, không bao giờ gửi đi.
- SigV4: thuật toán ký request của S3, tạo chữ ký HMAC từ secret.
- Chữ ký (signature): mã băm của request, gửi thay cho secret để chứng minh.
- Bearer token: kiểu khóa một-mảnh gửi thẳng trong header Authorization.
- Token value (R2): token kiểu Cloudflare cho API gốc; S3 tool không dùng.
- Endpoint (S3): cửa GHI có ký, dạng <account>.r2.cloudflarestorage.com.
- Custom domain: cửa ĐỌC công khai qua CDN, dạng media.tenban.com.
- ACL: nhãn quyền trên object; ở đây để private, cho đọc là do custom domain.
- Cache-Control: header dặn cache giữ bản sao bao lâu.
- cf-cache-status: header báo edge trả từ cache (HIT) hay về origin (MISS).

## 11. Liên quan

Bài này nối thẳng sau object-storage-minio-vs-r2 (chọn R2, giải thích khái niệm)
và hiện thực hóa ADR-0005. Nó mượn nền từ domain-dns-tls (DNS, TLS ai cấp) và
cloudflare-dashboard-named-tunnel (edge lo TLS, cache, cf-cache-status). Trong đồ
thị tri thức, ba bài R2/so-sánh/tunnel nên cùng nhóm chủ đề hạ tầng Cloudflare;
bài này là mắt xích "làm thật" của nhánh media.
