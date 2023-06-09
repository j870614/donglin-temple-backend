# 寺務系統後端 server
## 開始使用
### 安裝所需套件
```js
npm i
```  
### 程式碼編輯完成後輸入指令  
```js
npm run start
```  
會自動執行 ```tsc -w -p tsconfig.json``` 與 ```nodemon dist/src/index.js```

以下兩個指令則會執行並加入環境變數 ```NODE_ENV=dev``` 與 ```NODE_ENV=prod```
```js
npm run start:dev
```  
```js
npm run start:prod
```  
以下指令會進行測試並顯示覆蓋率
```js
npm run test
```  

## 資料夾說明
* src - TypeScript 程式碼放置處
* dist - 編譯過後的 JavaScript 程式碼
> changelog.config.js - 這個是 git cz 中文化設定檔，方便統一 git commit message  
> 如果要使用的話需要先安裝 git cz 套件
> ```js
> npm install -g git-cz
> ```
> 詳細 git cz 安裝及設定教學可參考 Ray 助教寫的教學文章：  
> https://israynotarray.com/git/20221115/721294310/
