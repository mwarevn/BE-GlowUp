# deploy.sh
source ~/.bashrc
rm -rf be-datn-nestjs
git clone git@gitlab.com:mwarevn/be-datn-nestjs.git
cd be-datn-nestjs
ls -a
npm -v
node -v
git checkout develop
rm -rf node_modules
git pull
npm install
cat example.env > .env
npx prisma db push
kill $(lsof -t -i :3000) # kill old process
npm run dev > /dev/null 2>&1
