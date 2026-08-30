# Object storage cho ảnh: MinIO tự host và Cloudflare R2, chọn cái nào

> Draft, nguyên liệu cho một bài viết. Giải thích cho người không rành hạ tầng.
> Liên quan: bài docker-co-ban-cho-python-dev cho nền Docker (image, container,
> volume, network). Bài domain-dns-tls giải thích domain, DNS, TLS. Bài
> cloudflare-dashboard-named-tunnel giải thích tunnel đi ra, public hostname,
> reverse proxy, edge lo TLS. Bài này ghép mấy thứ đó vào một bài toán mới: lưu
> ẢNH của blog ở đâu. Quyết định gọn nằm ở ADR-0005; bài này là phần giải thích
> dài để hiểu vì sao. Không phải nguồn render của site.

## 0. Vấn đề: ảnh không hợp Git

Blog này để thân bài dạng file MDX trong repo, Git là nguồn sự thật (ADR-0004).
Text thì Git lo tốt: nó lưu theo dòng, so sánh được, gộp được. Ảnh thì ngược
lại. Git lưu TOÀN BỘ lịch sử của mọi file nhị phân, và ảnh là nhị phân: sửa một
lần là đẻ ra một khối blob mới nằm lại vĩnh viễn trong thư mục `.git`, không dồn
gọn như text. Vài chục tấm là repo bắt đầu phình, `git clone` chậm, CI (mỗi lần
build lại tải cả repo) chậm theo, mà muốn xóa hẳn một tấm lỡ commit thì phải
viết lại lịch sử, rất phiền.

Nên ảnh cần ra ở một nơi khác, rồi bài viết chỉ trỏ tới bằng một đường link ổn
định. Cái "nơi khác" đó tên là object storage, và để ảnh tải nhanh khắp nơi thì
đặt thêm một CDN phía trước. Câu hỏi của bài này: tự dựng object storage (MinIO)
hay mượn dịch vụ có sẵn (Cloudflare R2).

## 1. Object storage là gì, khác gì ổ đĩa và khác gì database

Ba cách lưu dữ liệu, ba hình dung khác nhau:

- File system (ổ đĩa thường): dữ liệu xếp trong cây thư mục lồng nhau. Truy cập
  bằng đường dẫn, sửa được từng khúc trong file, hợp cho máy đơn.
- Database quan hệ (Postgres của mình): dữ liệu là các hàng có cấu trúc trong
  bảng, mạnh ở truy vấn và quan hệ. Không hợp để nhét file ảnh nặng vào.
- Object storage: mỗi file là một "object", gồm phần dữ liệu thô cộng ít metadata
  (kiểu nội dung, thời gian). Mỗi object có một "key" (giống đường dẫn nhưng thực
  ra chỉ là một chuỗi tên), nằm trong một "bucket" (cái thùng chứa). Không sửa
  nửa file, chỉ ghi đè cả object. Đổi lại nó rẻ, phình vô tư, và truy cập được
  bằng HTTP từ mọi nơi.

Ảnh blog hợp y hệt mô hình object storage: mỗi tấm là một object, ghi một lần
đọc nhiều lần, lấy về bằng một URL. Đó là lý do cả thế giới để ảnh và file tĩnh
trên object storage chứ không nhét vào DB hay vào Git.

## 2. S3 API: vì sao "S3-compatible" là từ khóa vàng

Amazon S3 (Simple Storage Service) là dịch vụ object storage ra đời sớm và phổ
biến tới mức "cách nói chuyện với nó", tức bộ lệnh HTTP để tạo bucket, PUT một
object lên, GET nó về, xóa, liệt kê, trở thành một chuẩn không chính thức của cả
ngành. Bộ lệnh đó gọi là S3 API.

"S3-compatible" nghĩa là một sản phẩm khác nói đúng thứ tiếng đó. Cả MinIO lẫn
Cloudflare R2 đều S3-compatible. Hệ quả rất thực tế: cùng một công cụ và cùng
một đoạn code chạy được với cả hai, chỉ đổi địa chỉ endpoint và cặp khóa. Các
công cụ chuẩn:

- `aws-cli`: dòng lệnh chính chủ của Amazon, trỏ endpoint khác là dùng cho MinIO
  hay R2 được.
- `rclone`: như rsync cho cloud, đồng bộ thư mục lên bucket, rất tiện để upload
  và để di cư.
- `mc` (MinIO Client): dòng lệnh của MinIO, cũng nói S3 nên chỉ tới R2 được.
- `boto3`: thư viện Python, code upload trong app dùng cái này.

Đây là điểm cốt lõi khi chọn: học S3 ở đâu cũng được, kỹ năng mang đi chỗ khác
nguyên vẹn, và di cư giữa các nhà cung cấp chỉ là đổi cấu hình chứ không viết
lại. Chọn MinIO hay R2 vì thế không phải là cưới một đằng bỏ một đằng.

## 3. Hai triết lý: tự host (MinIO) và managed ở edge (R2)

- MinIO là một phần mềm object storage mã nguồn mở, một file binary gọn, mình tự
  chạy trên máy của mình (ở đây là VPS, trong Docker). Mình làm chủ hoàn toàn:
  dữ liệu nằm trên ổ của mình, không phụ thuộc ai. Đổi lại mình gánh mọi việc
  vận hành: chạy nó, cấp ổ đĩa, sao lưu, vá lỗi, canh bảo mật.
- Cloudflare R2 là object storage nằm sẵn trong hạ tầng Cloudflare. Mình không
  chạy gì cả, chỉ tạo bucket và gọi API. Cloudflare lo phần cứng, độ bền, nhân
  bản, và nó nằm sát lớp edge/CDN nên phục vụ nhanh. Đổi lại dữ liệu nằm trên hạ
  tầng của họ.

Phần còn lại của bài soi hai triết lý này qua bốn ống kính quen thuộc từ các bài
trước: Docker, DNS, TLS, CDN. Rồi tới bảo mật, backup, chi phí, di cư.

## 4. Qua ống kính Docker: MinIO thêm gì, R2 thêm gì

Nhắc lại từ bài Docker: một service trong `compose.prod.yml` là một container;
container không giữ dữ liệu bền, nên trạng thái cần sống lâu phải gắn vào một
volume; các service trong cùng compose nằm chung một mạng Docker riêng và gọi
nhau bằng TÊN service qua DNS nội bộ của Docker (địa chỉ 127.0.0.11).

MinIO thêm hẳn một mảnh vào stack:

- Một service mới, ví dụ `minio`, chạy image `minio/minio`, mở cổng nội bộ 9000
  (API) và 9001 (console). Cổng này chỉ trong mạng Docker, không ra host, đúng
  nguyên tắc không mở cổng public.
- Một volume mới, ví dụ `minio_data`, để ảnh sống qua các lần restart. Đây là
  volume STATEFUL THỨ HAI của hệ thống, bên cạnh `db_data` của Postgres. Nhớ điều
  này, nó quay lại ở phần backup.
- Một biến bí mật: cặp root user/password của MinIO, phải đặt trong `.env.prod`
  trên VPS.

R2 thì KHÔNG thêm gì vào Docker cả. Không service, không volume, không biến trên
VPS. R2 sống ngoài VPS hoàn toàn. Đây là khác biệt lớn nhất về vận hành: với
MinIO, "ảnh" trở thành một phần của cái stack mình phải nuôi; với R2, ảnh là
việc của Cloudflare.

## 5. Qua ống kính DNS: hai cách cho ảnh một địa chỉ

Muốn người đọc lấy ảnh bằng `media.aiengineerblog.com`, phải có một bản ghi DNS
cho cái tên đó. Hai phương án trỏ nó đi hai nơi khác nhau.

MinIO đi qua tunnel, y hệt cách site chính đang chạy (bài named tunnel):

1. Thêm một public hostname trong dashboard tunnel: `media.aiengineerblog.com`
   Type HTTP, URL `http://minio:9000`. Cái tên `minio` ở đây là DNS nội bộ Docker,
   chỉ `cloudflared` (đứng chung mạng) hiểu được; người ngoài Internet không bao
   giờ phân giải được nó.
2. Cloudflare tự tạo một bản ghi CNAME proxied trỏ `media` vào
   `<tunnel-id>.cfargotunnel.com`, tức "đi vào tunnel này".
3. Người đọc gõ `media.aiengineerblog.com`, DNS trả IP của Cloudflare edge (không
   phải IP VPS), request chui qua tunnel về `minio:9000`, MinIO trả ảnh ngược ra.
   Không cổng nào mở trên VPS, đúng tinh thần tunnel là cửa duy nhất.

R2 dùng "custom domain" của R2, một cơ chế riêng, KHÔNG qua tunnel:

1. Trong trang R2 của bucket, gắn `media.aiengineerblog.com` làm custom domain.
2. Cloudflare tự tạo bản ghi DNS proxied trỏ tên đó thẳng vào bucket R2 ở edge.
3. Người đọc gõ tên, request đi `người đọc -> Cloudflare edge -> R2`. VPS và
   tunnel KHÔNG tham gia. Đây là lý do R2 không cần VPS còn sống mới phục vụ được
   ảnh.

Điểm chung cả hai: người ngoài luôn chỉ thấy IP Cloudflare, không thấy IP gốc.
Điểm khác: MinIO có một chặng "về VPS" nữa, R2 thì dừng ở edge.

## 6. Qua ống kính TLS: ai cấp ổ khóa, kết thúc ở đâu

Nhắc lại từ bài domain-dns-tls và bài tunnel: TLS là lớp mã hóa của HTTPS, và
"terminate TLS" nghĩa là phiên mã hóa công khai được GIẢI MÃ ở đâu. Trong kiến
trúc Cloudflare, TLS terminate ở EDGE: trình duyệt bắt tay mã hóa với Cloudflare
bằng chứng chỉ Cloudflare cấp cho domain, Cloudflare giải mã, xử lý, rồi mới đẩy
tiếp về sau.

Tin vui: cả hai phương án đều giống nhau ở tầng này, và cả hai đều KHÔNG bắt máy
chủ gốc giữ chứng chỉ.

- MinIO: cloudflared nói HTTP trần với `minio:9000` trong mạng Docker (an toàn vì
  không ra Internet), Cloudflare lo ổ khóa ở edge. Giống hệt lý do public
  hostname của site chính để Type HTTP chứ không HTTPS.
- R2: Cloudflare vừa là edge vừa là chủ bucket, nên nó tự lo chứng chỉ cho
  `media.aiengineerblog.com` luôn, tự gia hạn, mình không chạm vào.

Nói cách khác, dù chọn đường nào thì ổ khóa HTTPS cho ảnh cũng do Cloudflare tự
cấp và tự gia hạn, VPS không giữ cert nào.

## 7. Qua ống kính CDN: cache mới là thứ làm ảnh nhanh

CDN (Content Delivery Network) là mạng máy chủ đặt gần người dùng, giữ sẵn bản
sao của file tĩnh để trả ngay mà không phải chạy về tận origin. Vì mọi thứ đi
qua Cloudflare (tunnel hoặc custom domain) đều nằm sau edge Cloudflare, cả hai
phương án đều được CDN, nhưng cần hiểu đúng vài điểm hay nhầm.

Thứ nhất, "sau edge" khác "được cache". Edge tự động lo TLS và chống DDoS cho mọi
thứ đi qua, nhưng CACHE thì có chọn lọc: Cloudflare mặc định chỉ cache file tĩnh
(ảnh, css, js), còn HTML động và JSON từ API thì không cache. Ảnh rơi đúng vào ô
"tĩnh, nên cache", nên đây là ca lý tưởng của CDN.

Thứ hai, điều khiển cache bằng hai núm:

- Header `Cache-Control` đặt trên chính object (R2 cho đặt theo từng object lúc
  upload; MinIO cũng đặt được). Ví dụ `public, max-age=31536000, immutable` bảo
  trình duyệt và CDN giữ một năm và coi như không đổi.
- Cache Rules trên dashboard Cloudflare, đặt theo hostname hoặc đường dẫn.

Thứ ba, mẹo "immutable" cho ảnh có thể đổi: nhét một chuỗi băm nội dung ngắn vào
tên file, kiểu `diagram.a1b2c3.webp`. Nội dung đổi thì băm đổi, tên đổi, URL đổi.
Nhờ vậy có thể cache một URL vĩnh viễn mà không bao giờ sợ người đọc thấy bản cũ:
muốn thay ảnh thì trỏ sang tên mới, không phải đi xóa cache. Đây đúng mẹo mà
Next.js dùng cho các file trong `/_next/static` (đã nhắc ở bài tunnel).

Thứ tư, cách kiểm chứng cache có ăn không: xem header phản hồi `cf-cache-status`.
`MISS` là lần đầu, edge phải về origin lấy; `HIT` là lần sau, edge trả từ bộ nhớ
gần người dùng. Một tấm ảnh cache tốt thì lần thứ hai trở đi luôn HIT, và khi đó
request thậm chí không chạm tới MinIO hay R2 nữa, nên tải rất nhanh và giảm tải
cho origin (kể cả giảm việc chống DDoS phải làm).

Về CDN, hai phương án gần như ngang nhau vì cùng nằm sau Cloudflare. Khác biệt
tinh tế: R2 nằm sát edge và Cloudflare tối ưu đường R2-tới-edge cho chính họ, còn
MinIO những lần cache MISS phải chạy ngược về VPS qua tunnel, xa hơn một chặng.

## 8. Qua ống kính bảo mật: khóa nằm ở đâu quyết định rủi ro

Tách bạch hai chuyện hay bị gộp:

- Đọc ảnh là công khai: ai cũng xem được, vì đó là nội dung blog. Không đặt auth
  cho việc đọc. Chống lạm dụng (DDoS) là việc của edge Cloudflare, tự động, cộng
  thêm cache làm đa số request không chạm origin. Mình không phải tự xây gì để
  chống DDoS.
- Ghi/upload là riêng tư: chỉ tác giả. Việc này bảo vệ bằng một cặp khóa bí mật
  kiểu S3 (access key id cộng secret). Ai giữ khóa thì ghi được. Đây là "auth" duy
  nhất cần quan tâm.

Khác biệt an ninh giữa hai phương án nằm ở CHỖ ĐẶT KHÓA:

- MinIO: root credential và các access key sống trên VPS (trong `.env.prod` và
  trong chính MinIO). Nếu VPS bị chiếm, kẻ tấn công với tới luôn quyền ghi/xóa
  ảnh. Console MinIO cũng là một bề mặt nữa phải canh, tuyệt đối không hở ra
  Internet.
- R2: có thể tạo API token scope hẹp (chỉ đọc-ghi đúng một bucket, không quyền
  admin), và token này CHỈ cần nằm trên máy dev của mình để upload, KHÔNG cần đặt
  trên VPS, KHÔNG nhét vào image web/api. Site chỉ tham chiếu URL public read.
  Hệ quả đẹp: VPS bị chiếm cũng không kéo theo quyền ghi media, vì khóa ghi không
  ở đó.

Với một người tự vận hành, ít bề mặt để canh là một lợi thế thật, không phải chi
tiết nhỏ.

## 9. Qua ống kính backup và vận hành: ai chịu trách nhiệm khi hỏng

- MinIO: dữ liệu nằm trên volume `minio_data` của VPS. Muốn an toàn phải tự backup
  volume đó (ví dụ `mc mirror` sang nơi khác, hoặc restic định kỳ), tự lo ổ đầy,
  tự vá lỗi MinIO, tự canh nó còn sống. Đây là volume stateful thứ hai phải lo,
  bên cạnh Postgres. Nhiều việc hơn, nhưng cũng là nơi HỌC vận hành object storage
  thật sự.
- R2: Cloudflare lo độ bền và nhân bản nhiều nơi. Mình không backup ổ đĩa. Nếu vẫn
  muốn một bản sao cho yên tâm thì `rclone sync` R2 về máy hoặc sang bucket khác
  theo lịch. Gần như không có việc vận hành thường ngày.

Một lưu ý về MinIO đáng biết: dự án gần đây đã cắt bớt nhiều tính năng ở console
bản cộng đồng và license là AGPLv3. Không chặn dùng cá nhân, nhưng nên biết trước
để không bỡ ngỡ khi giao diện khác tài liệu cũ.

## 10. Qua ống kính chi phí

- MinIO: phần mềm miễn phí, nhưng "chi phí" là tài nguyên VPS (RAM, CPU, ổ đĩa)
  và thời gian vận hành của mình. Với vài tấm ảnh thì tài nguyên không đáng kể,
  cái tốn là công.
- R2: có bậc miễn phí rộng, khoảng 10 GB lưu trữ, hàng triệu lượt thao tác mỗi
  tháng, và quan trọng nhất là băng thông đi ra (egress) MIỄN PHÍ. Nhiều dịch vụ
  đối thủ tính tiền egress rất nặng khi ảnh được xem nhiều; R2 không, nên hóa đơn
  gần như luôn bằng 0 ở quy mô blog. Với "ảnh rất ít", R2 thực tế là free vô hạn.

## 11. Qua ống kính di cư: có bị khóa vào một nhà không

Không, và đây là điểm yên tâm nhất. Vì cả hai đều S3-compatible, chuyển nhà chỉ
là một lệnh đồng bộ, ví dụ `mc mirror r2remote/bucket minio/bucket` hoặc
`rclone sync`. Nếu giữ nguyên custom domain `media.aiengineerblog.com` và chỉ đổi
nơi nó trỏ tới, thì các URL trong bài viết KHÔNG đổi, người đọc không thấy khác
biệt. Nói cách khác: chọn R2 bây giờ không khóa mình khỏi MinIO sau này, và ngược
lại. Chính vì thế đây là quyết định rẻ để đảo.

## 12. Bảng so sánh nhanh

| Tiêu chí | MinIO (tự host trên VPS) | Cloudflare R2 (managed) |
|---|---|---|
| Bản chất | Server mình tự chạy trong Docker | Object storage ở hạ tầng Cloudflare |
| API | S3-compatible | S3-compatible |
| Thêm vào Docker | 1 service + 1 volume + creds trên VPS | Không thêm gì |
| DNS cho ảnh | Public hostname qua tunnel vào minio:9000 | Custom domain R2 trỏ thẳng bucket |
| Đường phục vụ | user -> edge -> tunnel -> minio | user -> edge -> R2 (không qua VPS) |
| TLS | Cloudflare lo ở edge | Cloudflare lo ở edge |
| CDN/cache | Có (MISS phải về VPS) | Có (R2 sát edge) |
| Khóa ghi nằm ở | Trên VPS | Chỉ trên máy dev, không cần trên VPS |
| Backup | Tự backup volume | Cloudflare lo độ bền; muốn thì tự sync thêm |
| Chi phí | Free phần mềm, tốn tài nguyên và công | Free tier rộng, egress = 0 |
| Vận hành | Cao | Thấp nhất |
| Học được gì | Vận hành object storage đầu-cuối | S3 API và cache rules, ít ops |
| Di cư | Dễ (S3) | Dễ (S3) |

## 13. Kết luận: chọn gì cho blog này

Cho nhu cầu hiện tại (ảnh rất ít, một người vận hành, ưu tiên free và không
over-engineer), R2 thắng rõ: free đủ dùng, egress 0, không thêm container hay
volume hay backup trên VPS, khóa ghi không nằm trên VPS nên an toàn hơn, mà vẫn
học đúng S3 API chuẩn công nghiệp. Đó là quyết định ở ADR-0005.

MinIO không thua về kỹ thuật, nó chỉ dư so với nhu cầu lúc này. Nhưng nó là một
bài học vận hành quý: tự dựng một object storage, tự lo volume, backup, bucket
policy, versioning. Nên MinIO để dành làm một buổi riêng, dựng thử trong Docker
như một chủ đề học (và chính là chất liệu cho một bài viết khác), rồi `mc mirror`
từ R2 sang cho thấy di cư dễ thế nào. Vì S3-compatible, học MinIO lúc đó không
phí một chút kiến thức R2 nào.

Quy tắc rút ra, dùng lại được cho nhiều quyết định hạ tầng sau này: chọn managed
khi việc chính là làm ra sản phẩm và mình muốn ít bề mặt để canh; chọn tự host
khi bản thân việc vận hành là thứ mình muốn học hoặc muốn làm chủ tuyệt đối. Ở
đây mình chọn managed để chạy, và tự host để học, tách làm hai lần.

## 14. Bảng thuật ngữ nhanh

- Object storage: kho lưu file dạng "object" trong "bucket", truy cập bằng key và
  HTTP, hợp cho ảnh và file tĩnh.
- Bucket: cái thùng chứa object, đơn vị lớn nhất để phân quyền và đặt tên.
- Object: một file cộng chút metadata; đơn vị ghi/đọc, không sửa nửa chừng.
- Key: chuỗi tên định danh object trong bucket, trông như đường dẫn.
- S3 API: bộ lệnh HTTP chuẩn của Amazon S3 để thao tác object; thành chuẩn ngành.
- S3-compatible: sản phẩm nói được tiếng S3, nên dùng chung công cụ và code.
- MinIO: phần mềm object storage mã nguồn mở, tự host, S3-compatible.
- Cloudflare R2: object storage managed của Cloudflare, S3-compatible, egress free.
- Egress: băng thông dữ liệu đi RA khỏi kho tới người dùng; nơi hay bị tính tiền.
- CDN: mạng máy chủ gần người dùng, giữ bản sao file tĩnh để trả nhanh.
- Edge: lớp máy chủ Cloudflare đứng trước, nơi terminate TLS và làm CDN.
- Cache-Control: header dặn trình duyệt và CDN giữ bản sao bao lâu.
- immutable: đánh dấu một URL không bao giờ đổi nội dung, để cache vĩnh viễn.
- cf-cache-status: header cho biết edge trả từ cache (HIT) hay phải về origin (MISS).
- Custom domain (R2): gắn tên miền riêng thẳng vào bucket, phục vụ qua edge.
- Access key / secret: cặp khóa kiểu S3 để xác thực quyền ghi; giữ bí mật.
- API token (Cloudflare): chứng chỉ quyền hạn chế theo phạm vi, ở đây để ghi R2.
- Volume (Docker): nơi lưu dữ liệu bền của container, sống qua restart.
- mc / rclone: công cụ dòng lệnh nói S3, dùng để upload và di cư giữa các kho.

## 15. Liên quan

Bài này là một nhánh mới của mạch hạ tầng, xoay quanh câu hỏi "để dữ liệu tĩnh ở
đâu". Nó tựa lên bốn bài trước: docker-co-ban-cho-python-dev (container, volume,
network, DNS nội bộ Docker), domain-dns-tls (DNS, TLS, ai cấp chứng chỉ),
cloudflare-dashboard-named-tunnel (tunnel đi ra, public hostname, edge lo TLS,
reverse proxy, cache), và ci-cd-vps-ghcr (stack chạy trên VPS). Quyết định gọn
nằm ở ADR-0005 (media lưu ở R2, tách khỏi Git). Trong đồ thị tri thức sau này,
bài này nên nối với bài Docker và bài tunnel qua chủ đề hạ tầng, và nối với bài
MDX (article-rendering) qua chủ đề "ảnh trong bài viết trỏ đi đâu".
