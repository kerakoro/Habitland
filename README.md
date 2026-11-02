# Where Habit Take Root — 7.30 Netlify 部署包

7.30 修改 Scroll down：关闭首图进入主页后立即出现；切到其他页面时隐藏，回主页仍保留；只有在主页下滑到底部后才消失，本次打开期间不再重新出现。刷新后重新提示。移除原5秒定时器、切页重置与其他页面触底误消失的旧逻辑。保留7.29的导航SVG和Film正文。

- 以现有1512宽设计版心等比缩放，影片宽度按SVG的1080/1512比例呈现，保持16:9；文字与影片左对齐，内容顶部留白75、文字与影片间距50。
- 中文使用思源黑体Regular（400），英文使用Quicksand Medium（500），文字字号与Story一致，为CSS 18px，行距1.2。新增字体为按页面文字制作的嵌入子集，原有字体和授权文件保留。
- 影片仅在首次进入Film时加载，切走后发送暂停指令；支持YouTube播放器全屏及“Watch on YouTube”外链。在线视频需要网络，播放器的实际可用性也取决于YouTube及影片的嵌入设置。
- 原有Garden、Single、Story、发布和展示页面继续共用整页缩放，窗口尺寸或屏幕方向变化时更新比例。拖拽浮层改为使用稳定的整页缩放值，避免隐藏画布尺寸为0时产生无效坐标；切换页面时结束浇水操作。
- 保留现有土陶盆、土陶罐、烧水壶生成规则及GPT-6.1 Terra识别后端。线上已有OPENAI_MODEL环境变量时，仍需确保它为gpt-6.1-terra。

检查覆盖Film导航、延迟加载、切页暂停、重复进入、多个屏幕宽度的缩放逻辑、零宽度回退、字体字重与中文字形覆盖、既有浇水及历史等交互。播放器实际播放未在此环境中完成浏览器验证。


## 一、先上传到 GitHub

1. 解压 `Where_Habit_Take_Root_7.30_Netlify.zip`。
2. 打开解压后的 `Where_Habit_Take_Root` 文件夹。应看到 `dist`、`netlify`、`lib` 三个文件夹，以及 `netlify.toml`、`package.json`、`server.mjs`、`README.md` 四个文件。
3. 在 GitHub 点击仓库名 `Habitland`，回到仓库文件列表，不要停留在 `Game website` 文件查看页。
4. 点击 `Add file` → `Upload files`。
5. 将上面三个文件夹和四个文件一起拖到上传区域。保留它们内部的文件层级，不要只拖 ZIP，也不要把最外层 `Where_Habit_Take_Root` 文件夹套在仓库里面。
6. 点击 `Commit changes` 完成提交。

上传后，仓库根目录应直接看到：

| 名称 | 用途 |
|---|---|
| dist/ | 网页、Canvas 代码、字体、照片与矢量素材 |
| netlify/ | Netlify 的 AI 函数入口 |
| lib/ | AI 调用、结果校验与坐标转换逻辑 |
| netlify.toml | Netlify 自动读取的部署配置 |
| package.json | Node.js 项目配置 |
| server.mjs | 本地运行用的服务器；Netlify 不需要运行此文件 |
| README.md | 本说明 |

你此前上传的约 10MB 单文件 HTML 无法在线预览，不代表上传失败。它内嵌了字体和照片，适合直接打开，不是这次的部署入口。可以暂时保留原来的 `Game website` 文件；本配置只发布 dist/，它不会影响网站。

本包已排除单文件 HTML 和压缩包自身。个别 SVG 数据 JSON 或照片可能也无法在 GitHub 在线预览，但仍可正常部署。不要为了在线预览把素材拆成不完整的文件。

## 二、把已有 Netlify 网站连接到这个仓库

1. 打开已有 Netlify 网站项目，进入项目配置，找到 Repository / Continuous deployment 的仓库连接设置。
2. 连接 GitHub，选择 `Habitland` 仓库和 `main` 分支。
3. Base directory 留空，Publish directory 为 `dist`，Functions directory 为 `netlify/functions`，Build command 留空。根目录 `netlify.toml` 已提供这些路径。
4. 使用这个已有项目继续部署，保留原有网站域名；无需为了更新再创建一个项目。

不要只把 dist/ 拖进 Netlify Drop：那只会发布网页，不能完成本包的 AI 函数部署。通过连接 GitHub 的构建部署来安装函数。

## 三、配置 OpenAI 密钥

在 Netlify 项目的 Environment variables 中添加：

| Key | Value |
|---|---|
| OPENAI_API_KEY | 你在 OpenAI 开发者平台创建的密钥 |
| OPENAI_MODEL | gpt-6.1-terra（可不填，代码默认就是这个模型） |

如果账户提供作用范围选择，必须包含 Functions；没有此选项时使用默认可用范围。不要把密钥写进 HTML、JavaScript、README 或 GitHub 仓库，也不要发给聊天助手。添加或修改后重新部署。

OpenAI 项目需要有可用 API 额度和模型权限。配置密钥不等于已验证额度；缺少密钥、权限或额度时，Generate 会显示清楚的错误，不再悄悄使用低质量的本地识别结果。

## 四、检查是否部署正确

1. 访问你的网站 `/api/analyse` 路径，例如在域名后加 `/api/analyse`。
2. 应返回 JSON，包含 `configured: true` 和 `model: "gpt-6.1-terra"`。此 GET 检查不调用 AI、不产生识别费用；它只说明环境变量已被函数读到，并不代表密钥和额度已经验证成功。
3. 回到 Upload My Container，上传一张背景较清晰的照片，点击 Generate。
4. 成功后显示 AI contour and attributes extracted，并出现可编辑预览；确认后点击 Add to my collection。
5. 若报错，可在 Netlify 的 Functions 日志中查看函数状态。代码不会主动记录照片和密钥，也不会把原始提供商错误或密钥返回网页。

## 五、费用与缓存

- 真正调用 OpenAI 的识别会产生 API 费用，具体依据账户的模型价格和实际输入输出用量。
- 同一页面重复 Generate 同一张照片会复用结果。服务器函数也提供短期缓存，但不同函数实例或重新部署不会共享缓存，不能把它当作持久化免费识别承诺。
- 调整颜色、宽高、边缘，拖动容器，浇水，植物生长，均不调用 OpenAI。
- 本版限制照片上传大小、输出长度和等待时间，没有实现全站统一的每日硬性费用上限；公开大量使用前，应按需要进一步配置调用限额或登录验证。

## 六、使用边界

AI 根据照片估计轮廓、顶部开口、颜色、材质和磨损，再由网页画成速写。它不是照片逐像素描摹工具；复杂背景、植物遮挡和不清晰的开口可能使轮廓不准。最好使用包含完整容器、开口可见、背景简单的照片。

Netlify 的 Featured Displays 目前保存在各自浏览器中；本次只接入 AI 函数，没有增加共享作品数据库。独立 Node 服务器仍保留原来的共享发布存储。

## 七、之后如何更新

以后按相同路径替换我提供的文件并提交到 GitHub，Netlify 会重新部署。保持根目录的 netlify.toml、netlify/、lib/ 和 dist/ 一起更新。

本版完成函数的模拟请求测试，以及网页启动、上传结果处理、重复识别缓存与错误提示检查。未使用真实 API Key 发起付费请求，也未替你发布到 GitHub 或 Netlify；模型实际识别效果需要你配置后用照片确认。

## 字体和素材

固定手写标题和图标使用用户原始 SVG 转曲路径。Quicksand 与思源黑体 Normal 子集已包含在 dist/assets 中，附字体许可。无需额外安装字体。
