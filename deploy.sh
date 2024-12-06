# deploy.sh
source ~/.bashrc
rm -rf be-datn-nestjs
git clone git@gitlab.com:mwarevn/be-datn-nestjs.git
cd be-datn-nestjs
ls -a
npm -v
node -v
rm -rf node_modules
git checkout develop
git pull
npm install
npx prisma db push
npm run dev
