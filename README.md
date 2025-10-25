# timmerdorp-web-app
Web version of the Timmerdorp app

- `npm i`
- `npm run dev`


## when codespace in vscode (localhost works)
- `npm run dashboard`


- `npm ci`
- `export NODE_OPTIONS=--max-old-space-size=4096` node more memory
- `npm run test-build` or `DEBUG=vite:* ./node_modules/.bin/vite build --mode staging`

- `docker run -it -v $PWD:/e2e -w /e2e cypress/included` run cypress in codespace (change url in home.cy.js to container ip:80)