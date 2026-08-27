# Domain, DNS, TLS: đưa website ra Internet có tên và có ổ khóa

> Draft, nguyên liệu cho một bài viết. Giải thích cho người không rành mạng.
> Liên quan: bài CI/CD (ci-cd-vps-ghcr) đã đưa site lên VPS và ra Internet bằng một
> URL tạm trycloudflare.com. Bài này là lớp tiếp theo: cho site một cái tên riêng
> (domain) và một ổ khóa HTTPS ổn định. Không phải nguồn render của site.

## 0. Vấn đề

Ở bài CI/CD, site đã chạy thật nhưng địa chỉ là một chuỗi ngẫu nhiên kiểu
`abc-xyz.trycloudflare.com`, đổi mỗi lần khởi động lại. Muốn có địa chỉ đẹp và cố
định như `blog.tenban.com`, kèm ổ khóa HTTPS, cần hiểu ba thứ: domain (cái tên), DNS
(bản đồ tên tới máy chủ), và TLS (ổ khóa mã hóa). Bài này đi qua từng cái, rồi ghép
lại thành cách làm với Cloudflare.

## 1. Domain là gì, mua ở đâu

Máy tính trên Internet tìm nhau bằng địa chỉ số gọi là IP, ví dụ 45.128.222.24. Địa
chỉ số khó nhớ, nên có domain: một cái tên dễ đọc đại diện cho địa chỉ đó.

Domain không mua đứt mà thuê theo năm, từ một nơi gọi là nhà đăng ký (registrar). Vài
chỗ phổ biến: Cloudflare Registrar, Namecheap, Porkbun, GoDaddy, Squarespace. Giá tùy
phần đuôi (gọi là TLD): .com thường rẻ và quen, .dev .io .app đắt hơn. Mua ở đâu cũng
được, vì domain là một thứ chuẩn chung, không khóa vào nhà bán. Nhớ bật gia hạn để
khỏi mất tên khi hết hạn.

## 2. DNS và nameserver: tấm bản đồ tên tới địa chỉ

DNS là hệ thống danh bạ của Internet, dịch từ tên (blog.tenban.com) ra địa chỉ hoặc
đích thực sự. Khi trình duyệt cần mở một tên, nó hỏi DNS trước để biết đi đâu.

Danh bạ của một domain nằm trên các máy chủ gọi là nameserver. Ai giữ nameserver thì
người đó nắm quyền khai báo các bản ghi DNS cho domain. Mặc định khi mua, nhà đăng ký
giữ nameserver, tức DNS do họ quản. Muốn Cloudflare quản DNS thì phải đổi nameserver
của domain sang Cloudflare. Đây chính là bước chuyển nhà cung cấp nameserver, nói kỹ
ở mục 5.

Vài loại bản ghi DNS hay gặp:
- A: trỏ một tên tới một địa chỉ IP.
- CNAME: trỏ một tên tới một tên khác.
- TXT: ghi chú dạng chữ, thường để xác minh quyền sở hữu.

## 3. TLS là gì, HTTPS, chứng chỉ

TLS là giao thức mã hóa đường truyền giữa trình duyệt và máy chủ (tên cũ là SSL, nên
hay nghe gộp là SSL/TLS). HTTPS đơn giản là HTTP chạy bên trong TLS. Cái ổ khóa nhỏ
trên thanh địa chỉ là dấu hiệu đường truyền đã được TLS bảo vệ, ai chặn giữa đường
cũng chỉ thấy dữ liệu đã mã hóa.

Để bật được TLS, máy chủ cần một chứng chỉ TLS. Chứng chỉ là một tờ giấy chứng nhận do
một tổ chức tin cậy gọi là CA (Certificate Authority) ký, xác nhận rằng bên đang phục
vụ đúng là chủ của tenban.com. Trình duyệt kiểm tờ giấy này, thấy do một CA nó tin ký,
thì mới bật ổ khóa. Chứng chỉ có hạn và phải gia hạn định kỳ.

Điểm hay nhầm: mua domain và có HTTPS là hai việc khác nhau. Mua domain chỉ cho cái
tên. HTTPS cần thêm một chứng chỉ, vốn gắn với máy chủ phục vụ site chứ không gắn với
việc bán tên. Vì thế nhà bán domain thường không kèm sẵn HTTPS. Ngày xưa còn phải mua
chứng chỉ riêng, khá phiền. Nay có hai đường miễn phí: Let's Encrypt (một CA miễn phí,
tự cấp và gia hạn), và các nền tảng như Cloudflare cấp tự động.

## 4. Vì sao Cloudflare có sẵn TLS

Cloudflare đứng làm lớp trung gian trước site, gọi là edge hoặc reverse proxy. Trình
duyệt không nối thẳng vào máy chủ của bạn, mà nối vào Cloudflare; Cloudflare mới
chuyển tiếp vào máy chủ.

Vì mọi kết nối vào đi qua Cloudflare, Cloudflare tự xin và tự gia hạn chứng chỉ cho
domain của bạn, rồi bật TLS ngay tại lớp edge của nó. Bạn không phải mua, không phải
cài, không phải nhớ gia hạn. Đó là lý do nghe như Cloudflare có sẵn TLS: thực ra nó
đứng ra lo toàn bộ khâu chứng chỉ thay bạn.

Có một điều kiện để làm được: domain phải do Cloudflare quản DNS. Đó là vì sao phải
đổi nameserver sang Cloudflare. Khi Cloudflare vừa quản tên vừa đứng làm edge, nó mới
gắn chứng chỉ vào tên đó được.

Ghép với bài CI/CD: ở đó site ra Internet bằng một đường ống Cloudflare Tunnel. Khi có
domain đặt trên Cloudflare, ta đổi từ quick tunnel (URL ngẫu nhiên) sang named tunnel
gắn hostname cố định. Cloudflare tự tạo bản ghi DNS trỏ hostname vào tunnel và tự cấp
HTTPS. Máy chủ vẫn không mở cổng, không tự lo chứng chỉ, và địa chỉ site trở nên ổn
định.

## 5. Đổi nameserver sang Cloudflare: các bước

1. Tạo tài khoản Cloudflare, chọn Add a site, nhập domain của bạn.
2. Cloudflare quét các bản ghi DNS hiện có và cấp cho bạn hai nameserver riêng, dạng
   tên-gì-đó.ns.cloudflare.com.
3. Đăng nhập vào nhà đăng ký nơi mua domain, tìm mục Nameservers, xóa nameserver mặc
   định và điền hai nameserver Cloudflare vừa cấp.
4. Chờ lan truyền (gọi là propagation), thường vài phút tới vài giờ. Xong, Cloudflare
   quản DNS cho domain và có thể cấp TLS tự động.

Sau bước này, việc gắn domain vào tunnel làm trong bảng điều khiển Cloudflare, không
đụng gì tới máy chủ.

## 6. Bảng thuật ngữ nhanh

- Domain: tên dễ đọc đại diện cho một địa chỉ trên Internet.
- TLD: phần đuôi của domain, ví dụ .com .dev .io.
- Registrar (nhà đăng ký): nơi thuê domain.
- IP: địa chỉ số của một máy trên mạng.
- DNS: hệ thống dịch tên thành địa chỉ hoặc đích.
- Nameserver: máy chủ giữ danh bạ DNS cho một domain, ai giữ thì quản DNS.
- Bản ghi DNS: từng dòng khai báo trong danh bạ, ví dụ A, CNAME, TXT.
- TLS (SSL): giao thức mã hóa đường truyền.
- HTTPS: HTTP chạy trong TLS, có ổ khóa.
- Chứng chỉ TLS: giấy chứng nhận chủ quyền tên miền, do CA ký.
- CA (Certificate Authority): tổ chức tin cậy đứng ra ký chứng chỉ.
- Let's Encrypt: một CA miễn phí, cấp và gia hạn tự động.
- Reverse proxy / edge: lớp trung gian đứng trước máy chủ, nhận kết nối thay.
- Propagation: thời gian thay đổi DNS lan ra toàn cầu.
- Tunnel: đường ống riêng nối máy chủ ra Cloudflare mà không mở cổng.

## 7. Liên quan

Bài này nối tiếp bài CI/CD (đưa site lên VPS qua GitHub Actions và GHCR). Ở đó là hạ
tầng chạy và cách ra Internet bằng URL tạm; bài này là lớp tên miền và ổ khóa đặt lên
trên, để có địa chỉ cố định và HTTPS. Trong đồ thị tri thức sau này, hai bài nên nối
với nhau qua chủ đề hạ tầng và triển khai.
