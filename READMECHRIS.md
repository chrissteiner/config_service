v1.0 ***********************************************************************
[INTERNAL]: config_service added
[FEATURE]: API getConfigForDevice added
[FEATURE]: APIsub getIntervall added
[FEATURE]: APIsub setKonfig added but not testet
*****************************************************************************

zum Starten im Terminal einfach "nodemon app.js" schreiben.


**********
git -> how to

1. git status
2. git add [File]
3. git commit -m 'Kommentar'
4. git tag -a v1.4 -m "my Comment for version 1.4"
5. git push NAS_backend master --tags
//NAS: git push ssh://sshd@192.168.0.189/shares/Websites/git/microservices.git/config_service master --tags
//GITHUB: git push ssh://git@github.com:chrissteiner/smarthome.git --tags
//shortcut: git remote add NAS_backend ssh://sshd@192.168.0.189/shares/Websites/git/backend.git master --tags

Annotation	Description	Example git commit
[INTERNAL]	used for internal stuff:    git commit -m “[INTERNAL] my internal change”
[FIX]		contains a bugfix:          git commit -m “[FIX] my fix change”
[FEATURE]	contains a new feature:     git commit -m “[FEATURE] my new feature”
[DOC]		contains documentation:     git commit -m “[DOC] my documentation change”

1. git clone ssh://sshd@192.168.0.189/shares/Websites/git/microservices.git/config_service
2. git pull ssh://sshd@192.168.0.189/shares/Websites/git/microservices.git/config_service
3. navigate in VS Code into folder and write "npm install"
4. run in terminal-folder "nodemon app.js"

ERROR Handling:
1. Wenn eine Fehlermeldung kommt, dass ein Port bereits verwendet wird!
    *   sudo lsof -i :5443
    *   sudo kill -9 PID

*********
config git server:
in einem leeren Ordner:
git init --bare
git config --bool core.bare true

show git tag comments (Releasenotes):
git tag -n9 //shows maximum 9 lines each version
git tag -n9 v3.* //shows 9 lines of commit where the version is grater than 3

*********
GITHUB:
…or create a new repository on the command line
echo "# smarthome" >> README.md
git init
git add README.md
git commit -m "first commit"
git remote add origin https://github.com/chrissteiner/smarthome.git
git push -u origin master
ODER: 
git push -u --force https://github.com/chrissteiner/smarthome.git master

***************
deploy to elastic beanstock using eb cli
#eb init
#eb create

