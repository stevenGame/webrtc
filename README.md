# WebRTC demo

> vue

## Build Setup


``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```
## Run servers
There are two micro services serve chat audio message or real time
call
* audio record server
* WebRTC p2p server
### run audio record server

```bash
# run chat audio/video file server
$ npm run server
```

### Run WebRTC p2p server
setup Web RTC server
```bash
$ cd p2p_server
$ npm install
$ node server.js
```
after runed p2p server change vue P2P componets `src/components/P2P.vue`
```js
var P2P_SERVER_URL = http://your-p2p-server:port
```
### How to Package to PC app
Test only windows 64-bit environment read

```bash
# disbutie all platform
$ cd pcapp
$ npm insall
$ npm run prod
```

## TODO
- [ ] combine to webrtc record server and p2p server use express
- [x] copy p2p server code to project root folder
- [ ] rewrite javascript version to vue version disable javascript hooks
- [ ] install and deploy instraction/document
- [x] windows NW.js integration
- [ ] change NW.js build script merge it can be run on
      source root folder


> For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
