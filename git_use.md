# git操作命令

- 配置 Git 关联 GitHub 账号  
> git config --global user.name xytengc  
> git config --global user.email 1300529055@qq.com  

- 执行克隆命令
> git clone https://github.com/xytengc/xytengc.github.io.git
- 本地修改文件  
- 回到 Git Bash（确保当前目录是仓库文件夹）  
- 第一步：把所有修改加入暂存区:   
> git add .  
- 第二步：提交修改（写备注，方便后续追溯）:  
> git commit -m "修改了博客标题和头像"  
- 第三步：推送到 GitHub：  
> git push origin main  (仓库默认分支是 master，就把 main 换成 master)  


- 输入以下命令，查看哪些文件被修改 / 新增 / 删除，确保是你预期的内容：
> git status
终端会显示红色 / 绿色的文件列表（红色 = 待提交，绿色 = 已暂存），比如：
- 将所有修改的文件加入 Git 暂存区（准备提交）：
> git add .
- 将暂存的修改提交到本地 Git 仓库，必须添加 “提交信息”（描述这次修改的内容）：
> git commit -m "清理他人内容，替换为个人博客信息，准备发布"
- 将本地提交的代码推送到 GitHub 远程仓库（核心步骤，完成后 GitHub 会自动部署）：
> git push origin main


- 本地修改后想撤销：  
如果还没执行 git add：直接删除修改的文件，或恢复到原来的内容；  
如果已经 git add 但没 commit：执行 git reset 撤销暂存；  
如果已经 commit 但没 push：执行 git reset --hard HEAD^ 撤销最后一次提交。  
- GitHub 仓库有更新，本地想同步：
> git pull origin main



### 注意
Git 全新仓库在「首次提交前」不会自动创建分支（包括 main/master），必须先通过 git checkout -b main 创建分支，再完成提交，最后推送。
#### 1. 进入你的博客项目目录（替换为实际路径，比如桌面的xytengc.github.io）
cd C:\Users\你的用户名\Desktop\xytengc.github.io

#### 2. 初始化 Git 仓库（如果还没初始化，必须执行这一步）
git init

#### 3. 创建并切换到 main 分支（关键：手动创建分支，解决git branch为空的问题）
git checkout -b main

#### 4. 暂存所有修改的文件（包括你的_config.yml、_posts、_includes等）
git add .

#### 5. 提交修改（必须填提交信息，不能为空）
git commit -m "初始化个人博客，提交所有配置和文章内容"

#### 6. 关联远程仓库（替换为你正确的GitHub仓库地址）
git remote add origin https://github.com/xytengc/xytengc.github.io.git

#### 7. 首次推送main分支到远程（-u 绑定上游分支，后续推送可直接git push）
git push -u origin main