android_iphone
==============

git一般的工作过程是：

git pull（将远程仓库合并到本地仓库,很重要，因为今天可能别人修改了远程仓库） *
git commit -m “修改的注释” （将修改提交仓库）
git push （将本地仓库合并到远程仓库）  *



常用命令
==============
git pull(将远程分支与本地分支合并)
git log（查看其他成员的更改）
git branch (建一个本地分支）
git checkout（进入本地分支）
在该本地分支上进行修改
git checkout（回到主分支）
git merge （将分支上所做的工作合并到主分支）
git branch -d （删除今天创建的分支）
git push （将本地仓库合并到远程仓库）


常见问题
==============

这里的常见问题只是基于我的使用经历，如果有错或者有更好的想法，留言通知我~

什么时候提交更改记录（ commit ）？
这个问题其实很随意，新增一个特性或者破坏了原有结构，甚至每一次改动都可以作为提交更改记录的依据。

什么时候推送更新（ push ）？
一般来说，更改了项目的结构（包括文件、目录），就应该尽快推送更新，以通知其他协作者跟进这个更新。对于其它细微的修改，没有破坏到别人的工作的，可以随自己的想法更新（如果是提交了某些激动人心的特性，就赶紧推送给别人分享吧~ ）
不过切记，更改了目录结构、文件结构等一定要在commit中写清楚，否则别人可能还是一头雾水。

什么时候和远程同步（ pull ）？
每次开始工作前都应该同步一下，以免自己的修改和别人冲突或者别人做了结构性的调整和自己的修改不协调了。

分支（ branch ）的使用？
至于远程分支的使用，可以参考 github 的推荐方法功能划分方法，来自，就是说，每一个功能设定一个分支，当修改完成以后再合并到 master ，保证 master 分支是可用的。
对于本地分支（就是本地代码库的分支了，这两个是不同的概念哦，记得 git 是分布式的，每个代码库有关联但又互相独立），使用就比较随便了。主要是方便自己开发即可。

怎么解决冲突（ conflict ）？
在团队开发中，同时对某一个文件进行改写是常见的事，但是我们应该尽可能避免。每个模块之间应该进行良好的隔离。但一旦遇到冲突，git也有很好的解决方法。
在同步代码的过程中，git会自动检查冲突，并尝试进行**自动合并**。最好的情况应该是大家同时修改一个文件，但是大家修改的地方不同了。在这样的情况下，git会进行非冲突合并，这时，在调用 git pull 的时候，git会尝试进行非冲突合并。
而在合并过程中有冲突的时候， git 会把修改记录直接保存在文件中，让开发者判断文件如何解决合并。例如，在一个描述文件中同时修改了一句话，在合并的时候，git会这么做：
<<<<<<< HEAD
It's not a project cool enough for you to enjoy the code but a mix of my thoughts in the year 2012~2013. I didn't know where the project leads to. Hope it will became useful after practice.
=======
It's not a project cool enough for you to enjoy the code but it's a mix of my thoughts in the year 2012~2013. I didn't know where the project leads to. Hope it will became useful after practice.
>>>>>>> 2b41083cf969979d8e4a1eedc987976af544d129
即把两个更改都写在文件上，但是用=======来区别发生冲突的位置，在=======以上是 HEAD，即本地的代码；而=======以下则是来自远程的更改了。这个时候，你可以选择保留远程或本地的修改或者都不要（简单地说，把不需要的内容删除即可）。

怎样恢复到历史版本（ reset ）？
使用 git log 查看更改记录，记住其中的 commit 版本号，然后，运行 git reset <log> --hard 即可（ <log> 即 commit 版本号）。另外， git reset HEAD 可以恢复到上一个 commit 版本。
如果只是想把更改状态切换到某一个历史记录，那么，可以 git reset <log> 这样，文件不会恢复到历史版本，但是，在这个记录后修改的文件会被标记为已修改，但未添加修改记录里。
