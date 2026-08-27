# Cloudflare dashboard và named tunnel: cho website một địa chỉ cố định

> Draft, nguyên liệu cho một bài viết. Giải thích cho người không rành mạng.
> Liên quan: bài CI/CD (ci-cd-vps-ghcr) đã đưa site lên VPS và ra Internet bằng một
> URL tạm trycloudflare.com (quick tunnel). Bài domain-dns-tls giải thích domain, DNS,
> nameserver, TLS. Bài này ghép hai thứ đó lại trong thực hành: đứng trên bảng điều
> khiển Cloudflare đổi quick tunnel thành named tunnel gắn domain thật, để site có
> địa chỉ cố định aiengineerblog.com và ổ khóa HTTPS. Không phải nguồn render của site.

## 0. Vấn đề

Sau bài CI/CD, site chạy thật trên VPS nhưng ra Internet bằng một URL ngẫu nhiên đuôi
`trycloudflare.com`, đổi mỗi lần cloudflared khởi động lại. Bài domain-dns-tls đã lo
xong phần lý thuyết và phần mua tên: domain `aiengineerblog.com` mua qua Cloudflare
Registrar nên đã nằm sẵn trong tài khoản, đã dùng nameserver Cloudflare, không phải
đổi gì. Việc còn lại của bài này là phần thực hành trên dashboard: biến cái URL tạm
thành địa chỉ cố định có tên và có ổ khóa, mà vẫn không mở cổng nào trên VPS.

## 1. Quick tunnel và named tunnel khác nhau ở đâu

Cả hai đều là Cloudflare Tunnel: một tiến trình `cloudflared` chạy trên VPS, tự quay
số RA NGOÀI tới Cloudflare và giữ sẵn một đường ống, để lưu lượng từ Internet đi ngược
qua ống đó vào máy chủ. Nhờ đi ra chứ không mở cổng vào, VPS không phải hé cổng nào ra
Internet. Khác nhau nằm ở chỗ có danh tính hay không:

- Quick tunnel: cloudflared bắt tay ẩn danh, Cloudflare quăng lại một URL rác
  `*.trycloudflare.com`. Không tên, không lưu cấu hình ở đâu. Restart là mất URL. Hợp
  thử nghiệm, lệnh chạy là `tunnel --url http://web:3000`.
- Named tunnel: mình tạo trước một đường ống CÓ TÊN trên tài khoản Cloudflare. Nó có
  một ID cố định và một token (giấy tờ tùy thân của đường ống). cloudflared cầm token
  để chứng minh "tôi là đường ống này", rồi Cloudflare tra bảng cấu hình đã lưu sẵn:
  ai gõ `aiengineerblog.com` thì đẩy vào ống này, ra `web:3000`.

Điểm mấu chốt để không bị rối: với named tunnel, cấu hình định tuyến nằm TRÊN
Cloudflare chứ không nằm trong lệnh nữa. Lệnh cloudflared rút gọn còn `tunnel run` cộng
token. Muốn đổi hostname trỏ đi đâu thì sửa trên dashboard, không đụng VPS.

## 2. Zero Trust là cái tên khu, đừng sợ

Tunnels nằm trong khu tên là Zero Trust trên dashboard Cloudflare (vào từ menu trái,
hoặc thẳng one.dash.cloudflare.com). Nghe "Zero Trust" tưởng bảo mật cao siêu, nhưng ở
đây chỉ là cái tên khu: Cloudflare gom nhiều công cụ mạng doanh nghiệp vào đó, mình chỉ
mượn đúng phần Tunnels. Lần đầu vào nó bắt đặt một team name tùy ý và chọn plan, cứ
chọn Free (0đ). Đường đi: Zero Trust > Networks > Tunnels.

## 3. Tạo named tunnel và lấy token

Create a tunnel > chọn loại connector Cloudflared (không phải WARP, vì mình có sẵn một
tiến trình cloudflared chạy trong Docker) > đặt tên, ví dụ `aie-blog-prod` (tên chỉ để
mình nhận ra, không ảnh hưởng URL) > Save.

Sau khi save, dashboard hiện trang hướng dẫn cài đặt với các tab Windows, macOS,
Docker... và một câu lệnh mẫu dài. Điểm hay hiểu nhầm: KHÔNG chạy lệnh này, vì
cloudflared đã chạy sẵn trong Docker trên VPS rồi. Mình chỉ lấy đúng cái token trong
lệnh đó. Bấm tab Docker, lệnh mẫu dạng
`docker run cloudflare/cloudflared:latest tunnel --no-autoupdate run --token eyJh...`;
token là chuỗi rất dài sau `--token`, bắt đầu bằng `eyJ`, vài trăm ký tự. Copy nó.

Token này là bí mật: ai có nó là dựng được đường ống mạo danh site. Nó chỉ được nằm
trong file `.env.prod` trên VPS, tuyệt đối không dán vào git. Bản thân token là một
chuỗi base64 gói sẵn account tag, tunnel ID và một secret.

## 4. Public hostname: apex hay www, và vì sao Type là HTTP

Bước tiếp theo là khai báo public hostname, tức bảng "ai gõ tên nào thì đẩy đi đâu".
Các ô và giá trị:

- Subdomain: để trống thì được apex, tức `aiengineerblog.com` trần. Gõ `www` thì được
  `www.aiengineerblog.com`. Dòng Full hostname bên dưới hiện tên cuối cùng để mình
  kiểm lại.
- Domain: chọn `aiengineerblog.com` từ dropdown (nó hiện ra vì domain đã nằm trong
  tài khoản).
- Path: để trống để phục vụ mọi đường dẫn. Ô này dùng regex, để trống là khớp tất.
- Type: HTTP. URL: `web:3000`.

Vì sao Type là HTTP chứ không HTTPS, dù ngoài kia là HTTPS: cloudflared và container
`web` nằm chung một mạng Docker riêng trong VPS, nói với nhau bằng HTTP trần cũng an
toàn vì không ra Internet. TLS và ổ khóa được Cloudflare lo ở vòng ngoài, giữa trình
duyệt và edge của Cloudflare. Nếu chọn HTTPS ở đây, cloudflared sẽ đòi `web:3000` phải
có sẵn chứng chỉ, mà nó không có, nên sẽ lỗi. Đây đúng ý "reverse proxy/edge lo TLS"
đã nói ở bài domain-dns-tls: máy chủ phía trong không tự lo chứng chỉ.

Bấm Save. Cloudflare tự tạo một bản ghi DNS CNAME (proxied, biểu tượng đám mây cam)
trỏ hostname vào `<tunnel-id>.cfargotunnel.com`. Mình không phải đụng tay vào DNS, nó
tự làm, đúng như bài domain-dns-tls mô tả.

Về apex hay www: một lựa chọn gọn là lấy apex `aiengineerblog.com` làm địa chỉ chính
(ngắn, đúng thương hiệu), rồi tùy ý thêm `www` như một public hostname thứ hai trỏ
cùng `web:3000` để ai gõ `www.` cũng không lỗi. Lưu ý wizard lúc tạo tunnel chỉ cho
khai một hostname; muốn thêm `www` thì vào lại tunnel, tab Public Hostnames, Add a
public hostname. Nếu không thêm, `www.aiengineerblog.com` sẽ không resolve (trình
duyệt báo không tìm thấy máy chủ), còn apex vẫn chạy bình thường.

## 5. Ba tab dễ nhầm: Published applications, Hostname routes, CIDR routes

Trang Route Traffic có ba tab, và với một blog public chỉ dùng đúng tab đầu:

- Published applications (public hostname): cửa cho người ngoài Internet gõ tên miền
  vào xem site. Đây là tab duy nhất blog cần điền.
- Hostname routes: hostname nội bộ, chỉ máy nào cài Cloudflare One Client (WARP) mới
  vào được. Dùng cho truy cập mạng riêng có kiểm soát, không phải web công khai.
- CIDR routes: định tuyến cả một dải IP nội bộ (kiểu 10.0.0.0/8) qua WARP để chui vào
  mạng riêng. Cũng không phải của blog.

Dấu hiệu nhận biết hai tab sau: cả hai đều có dòng cảnh báo "requires traffic to pass
via Cloudflare Gateway... Cloudflare One Client", nghĩa là người dùng phải cài client
mới vào được. Blog thì ngược lại, ai cũng gõ được từ trình duyệt bất kỳ, không bắt cài
gì, nên là Published applications.

## 6. Token chảy từ file vào cloudflared thế nào

Token không nằm trong code repo. Nó đi qua ba chặng để tới được binary cloudflared:

1. `.env.prod` trên VPS chứa giá trị thật `TUNNEL_TOKEN=eyJ...`. File này git-ignored,
   không bao giờ vào repo.
2. Lệnh deploy chạy `docker compose --env-file .env.prod ...`. Cờ `--env-file` là cầu
   nối: nó nạp các biến trong file đó để compose dùng.
3. Trong `compose.prod.yml`, service cloudflared khai báo
   `environment: { TUNNEL_TOKEN: ${TUNNEL_TOKEN} }`. Compose thay `${TUNNEL_TOKEN}`
   bằng giá trị lấy từ env-file, rồi đặt biến `TUNNEL_TOKEN` vào bên trong container.

Lệnh của service rút gọn còn `tunnel --no-autoupdate run`, KHÔNG kèm `--token`. Vì sao
vẫn chạy được: binary cloudflared tự đọc biến môi trường `TUNNEL_TOKEN` khi không thấy
cờ token. Cố ý truyền qua env thay vì gõ `--token <chuỗi>` trên dòng lệnh để token
không lộ ra trong `docker ps` hay danh sách tiến trình.

Vậy có ba chỗ "định nghĩa" khác vai: mapping tên biến vào container nằm ở khối
`environment` trong compose; giá trị thật nằm ở `.env.prod` trên VPS; việc đọc biến
rồi quay số ra edge nằm trong chính binary cloudflared, không phải code mình viết.

Cầm token, cloudflared quay số ra edge Cloudflare (cổng 443 và 7844, đi ra), trình
token để chứng minh mình là tunnel `aie-blog-prod`. Cloudflare nhận ra, trả về bảng
route đã lưu (hostname trỏ vào `web:3000`). Vì là kết nối đi ra, VPS không mở cổng vào
nào, đúng tinh thần tunnel là cửa duy nhất mở từ trong ra.

## 7. Vì sao phải đổi FRONTEND_ORIGIN

Cùng lúc chuyển tunnel, có một biến nữa phải sửa trong `.env.prod`: `FRONTEND_ORIGIN`,
đổi từ URL trycloudflare tạm sang `https://aiengineerblog.com`. Biến này là danh sách
origin được phép trong luật CORS của backend. Trong code, chuỗi đi thế này: `.env.prod`
nạp vào `Settings.frontend_origin` (backend/app/core/config.py), rồi vào CORS
middleware (backend/app/main.py): `allow_origins=[settings.frontend_origin]`.

CORS là luật an toàn của trình duyệt: khi JavaScript trên trang gọi sang API, trình
duyệt gắn header Origin bằng địa chỉ trang, rồi bắt API xác nhận có cho phép origin đó
không. API chỉ chấp nhận origin nằm trong danh sách. Nếu giá trị còn là URL cũ mà trang
lại là domain mới thì không khớp, trình duyệt chặn phản hồi. Nên phải khớp đúng địa chỉ
thật. Vài điểm nhớ: origin là scheme cộng host (`https://aiengineerblog.com`), không
kèm path, không dấu gạch chéo cuối; `www` bị coi là origin khác apex. Hiện site còn
tĩnh, trình duyệt chưa gọi API, nên đổi biến này chưa phải sống còn hôm nay, nhưng giữ
đúng ngay để sau bật tính năng động không dính lỗi CORS khó mò.

## 8. Thứ tự deploy an toàn: token lên VPS trước, push sau

Trong dự án này, VPS lấy `compose.prod.yml` bản mới bằng cách CI copy file đó lên mỗi
khi push nhánh main, còn `.env.prod` nằm sẵn trên VPS và không vào git. Điều đó quyết
định thứ tự:

1. Trên VPS, sửa `.env.prod` trước: thêm `TUNNEL_TOKEN`, đổi `FRONTEND_ORIGIN`. Lúc
   này compose cũ vẫn là quick tunnel, thêm biến thừa không ảnh hưởng gì.
2. Rồi mới push compose mới. Pipeline copy compose lên VPS và chạy `up -d`, cloudflared
   khởi động với lệnh named tunnel và tìm thấy `TUNNEL_TOKEN` đã có sẵn.

Nếu làm ngược, push compose đòi token trước khi token có trong `.env.prod`, thì lần
deploy đó cloudflared khởi động thiếu token, tunnel chết, site tắt. Một mẹo nhỏ khi
đặt token vào file: đọc token vào một biến tạm bằng `read -s` cho khỏi hiện lên màn
hình và khỏi lưu vào lịch sử lệnh, rồi `printf` xuống cuối file, xong `unset` biến đó.

## 9. Kiểm chứng: nhìn vào đâu để biết đã xong

- `curl -I https://aiengineerblog.com` trả `HTTP/2 200`. Chi tiết HTTP/2 đáng chú ý:
  trình duyệt chỉ chạy HTTP/2 trên TLS, nên thấy HTTP/2 là biết đang có mã hóa, tức
  ổ khóa thật.
- Xem chứng chỉ bằng `openssl s_client -connect aiengineerblog.com:443` rồi đọc issuer
  và subject: subject là `aiengineerblog.com`, issuer là một CA được tin cậy (ở lần
  làm này là Google Trust Services), hạn khoảng 90 ngày và Cloudflare tự gia hạn. Vì
  do CA tin cậy ký nên trình duyệt bật ổ khóa, không cảnh báo.
- Trên VPS, `docker compose logs cloudflared` có các dòng QUIC và HTTP/2 connectivity
  PASS tới các region argotunnel, nghĩa là connector đã đăng ký đường ống với edge.

## 10. Hai việc siết thêm sau khi site đã lên

- Ép HTTP sang HTTPS: mặc định, gõ `http://aiengineerblog.com` có thể vẫn phục vụ qua
  HTTP trần thay vì đẩy sang HTTPS. Bật ở dashboard CHÍNH (không phải Zero Trust): chọn
  domain, vào SSL/TLS > Edge Certificates > bật Always Use HTTPS. Một công tắc, không
  đụng VPS.
- Thêm `www`: nếu muốn `www.aiengineerblog.com` cũng vào được, thêm nó như một public
  hostname thứ hai (mục 4). Không thêm thì apex vẫn chạy, chỉ là gõ www sẽ báo không
  tìm thấy máy chủ.

Cả hai đều làm trên dashboard, không đụng repo hay VPS, nên có thể để lại làm sau khi
site chính đã chạy.

## 11. Bảng thuật ngữ nhanh

- Cloudflare Tunnel: đường ống nối máy chủ ra edge Cloudflare bằng kết nối đi ra, không
  mở cổng vào.
- cloudflared: tiến trình chạy đường ống ở phía máy chủ.
- Quick tunnel: tunnel ẩn danh, URL ngẫu nhiên trycloudflare.com, đổi mỗi lần restart.
- Named tunnel: tunnel có tên và ID cố định, xác thực bằng token, hostname ổn định.
- Token (TUNNEL_TOKEN): chuỗi bí mật để cloudflared chứng minh mình là tunnel nào.
- Zero Trust: khu công cụ mạng trên dashboard, nơi chứa mục Tunnels.
- Public hostname: khai báo tên miền công khai trỏ vào một service nội bộ.
- cfargotunnel.com: đích ẩn mà bản ghi CNAME của hostname trỏ vào, đại diện cho tunnel.
- Edge: lớp máy chủ Cloudflare đứng trước site, nơi kết thúc TLS và cấp chứng chỉ.
- CORS: luật trình duyệt kiểm soát trang nào được gọi API nào; điều khiển qua origin.
- Origin: scheme cộng host của một trang, ví dụ https://aiengineerblog.com.
- Always Use HTTPS: cài đặt Cloudflare tự đẩy mọi truy cập http sang https.

## 12. Liên quan

Bài này là mắt xích thứ ba của mạch triển khai. Bài CI/CD (ci-cd-vps-ghcr) dựng hạ
tầng chạy và cách ra Internet bằng URL tạm. Bài domain-dns-tls giải thích domain, DNS,
nameserver, TLS, và vì sao Cloudflare có sẵn HTTPS khi nó vừa quản DNS vừa làm edge.
Bài này là phần thực hành đứng trên dashboard ghép hai thứ đó: đổi quick tunnel thành
named tunnel gắn domain thật, cấu hình public hostname, nối token vào cloudflared, và
kiểm chứng ổ khóa. Trong đồ thị tri thức sau này, ba bài nên nối với nhau qua chủ đề
hạ tầng và triển khai, với bài này nằm giữa bài lý thuyết domain-dns-tls và bài hạ
tầng ci-cd-vps-ghcr.
