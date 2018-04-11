# WebRTC demo

> vue

## Build Setup

```bash
# run chat audio/video file server
$ npm run server
```
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
### Run WebRTC p2p server
WebRTC server use easyRTC as server need be config in
```config/index.js``` proxy table if need comminute with other
machine
```json
{
    '/rtc': {
        target: 'http://your-webtrc-p2p-server:8080',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
            '^/rtc': ''
        }
     },
    '/socket.io': {
        target: 'http://your-webtrc-p2p-server:8080/socket.io',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
            '^/socket.io': ''
        }
    }
}

```
```bash
$ cd p2pserver
$ node server.js
```
## TODO
- [ ] combine to webrtc record server and p2p server
- [x] copy p2p server code to project root folder
      name server_example to p2pserver
- [ ] deploy document
> For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
