setup:
	npm install
	npm run build-prd

run:
  	npm run build-prd

run-webpack:
  	npm run build-webpack

zip-deploy:
	pnpm run build
	cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
	mkdir build-front
	cp .next build-front/
	zip -r build-front.zip build-front/
# 	gh release create v0.0.1 build-front.zip