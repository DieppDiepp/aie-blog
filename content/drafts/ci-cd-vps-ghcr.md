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
- Không cần Caddy để lo chứng chỉ nữa.

Tunnel có hai kiểu. Named tunnel gắn một hostname cố định như blog.tencuaban.com,
dùng một token và cần tài khoản đã có domain, URL ổn định, hợp chạy lâu dài. Quick
tunnel không cần domain và không cần token: Cloudflare cấp một URL ngẫu nhiên đuôi
trycloudflare.com, in ra trong log của cloudflared, nhưng URL đổi mỗi lần khởi động
lại nên chỉ hợp thử nghiệm. Ở giai đoạn này mình chọn quick tunnel cho nhanh, lệnh
chạy là `cloudflared tunnel --url http://web:3000`, sau này muốn ổn định thì đổi sang
named tunnel gắn domain.

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

### "Mỗi image có hai tag latest và một chuỗi dài, nghĩa là gì?"

Tag là cái nhãn dán lên một phiên bản image, và một image dán được nhiều nhãn.
`latest` là nhãn di động, luôn chỉ về bản build mới nhất. Chuỗi dài là git SHA, nhãn
bất biến gắn cứng vào đúng một commit, không bao giờ đổi. Hiện cả hai chỉ về cùng
một image, nhưng lần build sau `latest` nhảy sang image mới còn nhãn SHA cũ đứng yên.
Nhờ vậy muốn quay về bản cũ chỉ cần gọi đúng nhãn SHA của nó.

Nơi định nghĩa: trong `cd.yml`, khối `tags:` liệt kê hai dòng, trong đó
`${{ github.sha }}` là biến GitHub tự điền bằng SHA của commit đang build.

### "Trong log CD có mấy bước Post Build, Post Log in... là gì?"

Nhiều GitHub Action có hai phần: phần chính (làm việc) và phần Post (dọn dẹp). Phần
Post tự chạy ở cuối job theo thứ tự ngược, để dọn thứ action đã dựng lên: đăng nhập
xong thì đăng xuất, dựng builder xong thì tháo, build xong thì chốt cache. Đây là
bước tự động và lành mạnh, mình không viết ra. Runner là máy dùng một lần rồi vứt,
nên dọn credential trước khi vứt là tốt.

### "Token báo thiếu scope read:packages là sao?"

Mỗi token GitHub có một danh sách scope, tức quyền được làm gì. Token của gh CLI trên
máy mình không có quyền đọc packages, nên khi gọi API liệt kê package thì bị từ chối.
Đây không phải lỗi: image vẫn đẩy lên được vì token trong pipeline có quyền ghi
packages, một quyền khác. Điểm nối quan trọng: VPS cũng cần đúng quyền đọc packages
này để kéo image private về, nên đó là token phải tạo ở bước deploy.

### "VPS kéo image về được định nghĩa ở đâu? Có cần thêm một file CI/CD nữa không?"

Hiện chưa định nghĩa ở đâu cả. File CD mới dừng ở bước đẩy image lên registry, chưa
có gì bảo VPS kéo về. Và không cần file mới: chỉ thêm một job thứ hai vào chính file
CD đó, tên là deploy, chạy sau job build, nội dung là SSH vào VPS chạy lệnh kéo image
và dựng lại container. VPS không tự chạy CI/CD; lệnh kéo nằm trong job deploy, mà job
đó chạy trên máy ảo của GitHub rồi SSH vào VPS thực thi từ xa.

### "GHCR mà sao toàn lệnh docker?"

Vì docker là client vạn năng cho mọi registry theo chuẩn OCI/Docker Registry, không
riêng Docker Hub. GHCR, Docker Hub, AWS ECR, Google GCR đều nói cùng một giao thức
registry, nên cùng bộ lệnh docker login, docker pull, docker push chạy được với bất
kỳ cái nào, chỉ đổi phần hostname ở đầu (docker.io là Docker Hub, ghcr.io là GitHub
Container Registry). Chữ docker ở đây là công cụ và giao thức, không phải công ty.

### "Push lần nữa thì stack cũ có bị tắt không, hay chạy chồng đống lên?"

docker compose khai báo theo trạng thái mong muốn. Mỗi lần chạy up, nó so image và
cấu hình mới với những gì đang chạy, chỉ thay container nào thực sự đổi. web và api
có image tag SHA mới nên bị thay (container cũ dừng và bị xóa, container mới lên). db
và cloudflared không đổi nên để nguyên. Luôn chỉ có đúng một bộ container, không chồng
đống nhiều bản.

### "Vậy image cũ có dồn lại làm đầy đĩa không?"

Có nguy cơ, vì mỗi lần deploy kéo một image tag SHA mới, image SHA cũ thành không còn
container nào dùng. Nên bước deploy chạy `docker image prune -a -f` để xóa các image
không dùng sau mỗi lần deploy. Lưu ý phải dùng cờ -a: image cũ vẫn còn tag SHA nên
không phải dangling, bản prune thường chỉ dọn dangling sẽ bỏ sót chúng.

### "Mỗi lần đổi thì URL cloudflared có khác không? Tự lấy URL ở đâu?"

URL chỉ đổi khi container cloudflared khởi động lại, ví dụ VPS reboot hoặc cloudflared
bị dựng lại. Deploy chỉ đổi web và api thường không đụng cloudflared nên URL hay giữ
nguyên, nhưng không có gì đảm bảo, cứ coi như tạm thời. Lấy URL bằng một trong hai
cách: đọc log job deploy trên GitHub Actions (dòng sau chữ Quick tunnel URL), hoặc
trên VPS chạy `docker compose -f compose.prod.yml logs cloudflared` rồi tìm dòng
trycloudflare.com.

### "Domain mua ở đâu, trỏ về cloudflared kiểu gì, mua domain là chưa có HTTPS?"

Domain là cái tên dễ đọc thuê theo năm từ một nhà đăng ký bất kỳ. Mua domain chỉ cho
cái tên, chưa có HTTPS, vì HTTPS cần một chứng chỉ TLS. Với Cloudflare cách nối là:
thêm domain vào tài khoản Cloudflare (đổi nameserver của domain sang Cloudflare, làm
một lần ở nhà đăng ký), rồi tạo một named tunnel. Cloudflare tự tạo bản ghi DNS trỏ
hostname của bạn vào tunnel, và tự cấp chứng chỉ HTTPS miễn phí ở phía ngoài. Nhờ vậy
có https://blog.tencuaban.com hợp lệ mà không phải tự lo chứng chỉ. Cách này không
trỏ thẳng vào IP máy chủ nên IP vẫn kín.

## 7. Các quyết định đã chốt

- Đẩy image qua registry GHCR (không build trên VPS, không copy file tar thủ công).
- Deploy cho lần đầu gồm đủ bốn dịch vụ: web, api, db, cloudflared. api và db hiện
  nằm im (site render tĩnh từ file bài viết) nhưng dựng sẵn để dành cho việc đồng
  bộ dữ liệu về database sau này.
- GHCR để private, nên VPS cần một token chỉ-đọc để đăng nhập trước khi kéo image.
- Bỏ Caddy khỏi stack prod vì Cloudflare Tunnel đã lo phần HTTPS và định tuyến.

## 8. Kết quả và việc còn lại

Pipeline đã chạy thông từ đầu đến cuối. Một lần push lên main giờ sẽ: kiểm đúng sai
(CI), build hai image và đẩy lên GHCR, rồi job deploy SSH vào VPS kéo đúng image của
commit đó và dựng lại stack. Bốn container lên đúng thứ tự (db chờ tới khi khỏe rồi
mới tới api, cùng web và cloudflared), và site hiện ra ngoài Internet qua một URL
quick tunnel đuôi trycloudflare.com. Đã kiểm chứng mở URL thấy trang chủ render đúng.

Điều rút ra: từ giờ chỉ cần push, website tự cập nhật, và máy chủ không hề build gì,
chỉ kéo đúng bản đã được kiểm thử.

Còn lại cho sau này:
- Khi mua domain: đổi từ quick tunnel sang named tunnel gắn domain để có URL ổn định
  và HTTPS theo tên miền riêng.
- Tùy chọn: thêm bộ lọc đường dẫn cho workflow để commit chỉ sửa tài liệu không phải
  build lại image.

## 9. Phụ lục: các lệnh tái dùng

Chép lại các lệnh đã dùng để dựng pipeline, dạng có thể tái dùng. Thay các chỗ viết
hoa (OWNER, REPO, USER, VPS_HOST, PORT, PASTE_TOKEN) bằng giá trị thật của bạn.
Không bao giờ chép token hay key thật vào file này.

Tạo cặp key deploy riêng (chạy ở máy mình):

    ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/aie_blog_deploy -N ""

Gắn public key lên VPS (dùng >> để nối thêm, không ghi đè):

    ssh USER@VPS_HOST 'mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo "NOI_DUNG_PUBLIC_KEY" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'

Đưa key và thông tin VPS lên GitHub Secrets (gh gửi lên server GitHub, không lưu local):

    gh secret set VPS_SSH_KEY  --repo OWNER/REPO < ~/.ssh/aie_blog_deploy
    gh secret set VPS_HOST     --repo OWNER/REPO --body "VPS_HOST"
    gh secret set VPS_USER     --repo OWNER/REPO --body "USER"
    gh secret set VPS_SSH_PORT --repo OWNER/REPO --body "PORT"

Test key deploy vào được VPS không:

    ssh -i ~/.ssh/aie_blog_deploy -p PORT -o IdentitiesOnly=yes USER@VPS_HOST "echo ok && docker --version"

Đăng nhập GHCR trên VPS bằng PAT chỉ có scope read:packages (tạo PAT trên web trước):

    echo "PASTE_TOKEN" | docker login ghcr.io -u OWNER --password-stdin

Test kéo image private về VPS:

    docker pull ghcr.io/OWNER/aie-blog-web:latest

Tạo file secret cho prod trên VPS (từ mẫu, rồi điền giá trị thật):

    mkdir -p ~/aie-blog && cd ~/aie-blog
    # tạo .env.prod theo .env.prod.example trong repo, điền mật khẩu DB mạnh và token tunnel

Deploy thủ công trên VPS khi cần (pipeline làm y hệt các lệnh này):

    cd ~/aie-blog
    export IMAGE_TAG=latest   # hoặc một git SHA cụ thể để chạy đúng bản đó
    docker compose -f compose.prod.yml --env-file .env.prod pull
    docker compose -f compose.prod.yml --env-file .env.prod up -d
